# Backend

Flask API that serves the site's content from MongoDB Atlas. It is read-only: it returns the project, article and benefactor lists as JSON, and the card icons as image bytes. Gunicorn runs it behind nginx on the droplet.

For server setup, deployment and nginx, see the [main README](../README.md).

**Contents**

- [Structure](#structure)
- [Routes](#routes)
- Techniques used
  - [1. MongoDB with GridFS](#1-mongodb-with-gridfs)
  - [2. Serialization](#2-serialization)
  - [3. Seeding](#3-seeding)
  - [4. Caching](#4-caching)
  - [5. Configuration](#5-configuration)
- [Run locally](#run-locally)
- [Run in production](#run-in-production)

## Structure
```
backend/
├── app.py               # Flask routes
├── seed.py              # one-off: fills MongoDB from the lists in this file (not deployed)
├── seed_assets/         # icon images used by seed.py (not deployed)
├── requirements.txt
├── .env                 # MONGO_URI (git-ignored, created by hand on each machine)
└── venv/                # git-ignored
```
`seed.py`, `seed_assets/`, `.env`, `venv/` and `__pycache__/` are excluded by the `rsync` line in the deploy script, so none of them reach the droplet through git.

## Routes

| Route | Returns |
|---|---|
| `GET /api/projects` | list of projects, sorted by `order` |
| `GET /api/articles` | list of articles, sorted by `order` |
| `GET /api/benefactors` | list of benefactors, sorted by `order` |
| `GET /api/images/<image_id>` | the image bytes from GridFS, or `404` |

```python
@app.get("/api/projects")
def projects():
    return jsonify([serialize(d) for d in db.projects.find().sort("order", 1)])

@app.get("/api/images/<image_id>")
def image(image_id):
    try:
        f = fs.get(ObjectId(image_id))
        data, ctype = f.read(), f.content_type
    except Exception:
        abort(404)

    resp = send_file(io.BytesIO(data), mimetype=ctype)
    resp.headers["Cache-Control"] = "public, max-age=31536000, immutable"
    return resp
```
There are no write routes. Content changes go through `seed.py` or the Atlas web UI.

---

## 1. MongoDB with GridFS

**What it is:** MongoDB stores JSON-like documents in collections. GridFS is MongoDB's way of storing files: it splits a file into chunks and saves them in two collections (`fs.files` for the metadata, `fs.chunks` for the data).

**Problem it solves:** the project and article cards each have an icon. Keeping the images in the frontend bundle means editing the code and redeploying whenever one changes, and the list and its images live in different places. With GridFS, a card and its icon live in the same database, and adding a card needs no frontend change. The icons are small, so a database is a fine place for them. (For many or large images, a CDN or object storage is the usual choice.)

**How it works:** all content lives in one database, `portfolio`.
```
portfolio
├── projects        title, subtitle, tags, type, repo, icon_id, order
├── articles        title, subtitle, tags, type, link, icon_id, order
├── benefactors     name, organisation, type, order
├── fs.files        GridFS: image metadata
└── fs.chunks       GridFS: image data
```
```python
db = MongoClient(os.environ["MONGO_URI"])["portfolio"]
fs = gridfs.GridFS(db)
```
`"portfolio"` is the database name. Atlas creates it the first time something is written. `seed.py` and `app.py` must use the same name and the same URI, otherwise the seed fills one database and the API reads another, which returns `[]`.

When an image is uploaded to GridFS, MongoDB generates a unique `ObjectId`. The card stores that id as `icon_id`, which links the card to its image.

---

## 2. Serialization

**What it is:** converting database documents into plain data that can be sent as JSON.

**Problem it solves:** MongoDB documents can't be sent as they are. The `_id` field is an `ObjectId`, which isn't JSON-serializable, and the frontend needs a URL it can put in an `<img src>`, not a raw database id.

**How it works:** `serialize()` renames `_id` to `id` (as a string) and turns `icon_id` into an image URL.
```python
def serialize(doc):
    doc["id"] = str(doc.pop("_id"))
    icon_id = doc.pop("icon_id", None)
    doc["icon"] = f"/api/images/{icon_id}" if icon_id else None
    return doc
```
A project then arrives in the frontend like this:
```json
{
  "id": "66f1a2b3c4d5e6f7a8b9c0d1",
  "title": "Snake Game Clone",
  "tags": ["C++", "Java"],
  "subtitle": "Snake game cloned in both C++ and Java: from a team assignment in uni.",
  "type": "project",
  "repo": "https://github.com/jrenjq/Snake-Game-Clone",
  "order": 3,
  "icon": "/api/images/66f1a2b3c4d5e6f7a8b9c0d2"
}
```
Benefactors have no `icon_id`, so their `icon` is `null`, which the carousel ignores. The URL is relative, so it works in any environment: through nginx in production, and through the Vite proxy locally.

---

## 3. Seeding

**What it is:** a one-off script that fills the database from data written in the code.

**Problem it solves:** a fresh database is empty, and entering cards and uploading images by hand is slow and error-prone. A script makes the content reproducible: running it rebuilds the database from the same lists and image files.

**How it works:** `seed.py` holds the projects, articles and benefactors as Python lists, with an `icon_file` naming an image in `seed_assets/`. For each entry it uploads the image, stores its id, and saves the document with an `order` number that keeps the display order.
```python
def upload(filename):
    path = os.path.join("seed_assets", filename)
    ctype = mimetypes.guess_type(path)[0] or "application/octet-stream"
    with open(path, "rb") as f:
        return fs.put(f, filename=filename, content_type=ctype)    # returns the new ObjectId


def insert(collection, docs, has_icon):
    collection.delete_many({})                                    # safe to re-run
    for order, d in enumerate(docs):
        if has_icon:
            d["icon_id"] = upload(d.pop("icon_file"))
        d["order"] = order                                        # list position = display order
        collection.insert_one(d)


db.drop_collection("fs.files")                                    # clear old images too,
db.drop_collection("fs.chunks")                                   # so reruns leave no orphans

insert(db.projects, projects, has_icon=True)
insert(db.articles, articles, has_icon=True)
insert(db.benefactors, benefactors, has_icon=False)
```
```
cd backend && source venv/bin/activate
python seed.py        # prints "done"
```

Things to know:
- **It wipes first.** Every run deletes and refills the collections and all GridFS images. Don't run it after you start editing data directly in Atlas.
- **Ids change.** A reseed creates new image ids, so the lists point to new URLs. nginx can serve the old list for up to a minute (see the caching section below).
- **It is not deployed.** `seed.py` and `seed_assets/` are excluded from the PROD sync. Run it from the dev machine, with `.env` pointing at Atlas.
- **To add an entry,** add it to the list in `seed.py` (and put its image in `seed_assets/`), then reseed.

---

## 4. Caching

**What it is:** reusing a response instead of building it again.

**Problem it solves:** every icon is a request to Flask, which reads it from MongoDB. A page with 10 icons makes 10 requests, and with only 2 Gunicorn workers on a 1 vCPU droplet, they queue up on a first visit. Most of the content also almost never changes, so doing the work again for every visitor is wasteful.

**Layer 1, the browser:** the image route sends a one-year `immutable` header, so a visitor downloads each icon once.
```python
resp.headers["Cache-Control"] = "public, max-age=31536000, immutable"
```
This is safe, because an image's URL contains its id, and a reseed gives it a new id and therefore a new URL. A cached copy can never be out of date, because the URL it belongs to is never reused.

**Layer 2, nginx:** on top of that, nginx keeps a copy of the images (7 days) and the JSON lists (1 minute) on disk. On a cache hit, nginx answers directly and the request never reaches Gunicorn or Flask. Only a miss continues to the backend.
```nginx
location /api/images/ {
    proxy_pass http://127.0.0.1:8000;
    proxy_cache apicache;
    proxy_cache_valid 200 7d;
    add_header X-Cache-Status $upstream_cache_status always;    # HIT or MISS, for debugging
}
```
The full configuration, with every line explained, is in section I of the [main README](../README.md). The lists are cached for only 1 minute, so edits made in Atlas show up quickly.

Check that it works by running this twice. The first response should say `MISS` and the second `HIT`:
```
curl -sI https://jrenjq.com/api/projects | grep -i x-cache-status
```

Redis isn't used. nginx covers the images and lists, and the data is small.

---

## 5. Configuration

**What it is:** settings that differ per machine, such as database credentials, kept outside the code in an environment file.

**Problem it solves:** the connection string contains the database password. If it were written into `app.py`, it would be committed to git. Keeping it in a git-ignored `.env` file means the code is the same everywhere, and each machine supplies its own secret.

**How it works:** `python-dotenv` loads `.env` into the environment at startup, and the app reads the value from there.
```
# backend/.env
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>/?retryWrites=true&w=majority
```
```python
from dotenv import load_dotenv
load_dotenv()                                        # reads backend/.env

db = MongoClient(os.environ["MONGO_URI"])["portfolio"]
```
`os.environ["MONGO_URI"]` raises a `KeyError` if the variable is missing, so a machine without the file fails immediately and loudly, not later with a confusing database error.

Things to know:
- **`.env` never arrives with `git pull`.** It is git-ignored and excluded from the deploy sync, so create it by hand on the droplet.
- **File permissions matter.** The Gunicorn service runs as `www-data`, so that user has to be able to read the file. Keep it private to that user:
```
chown www-data:www-data /opt/myapp/backend/.env
chmod 600 /opt/myapp/backend/.env
```
- **A missing or unreadable `.env` shows up as a 502.** Gunicorn crashes at startup with `KeyError: 'MONGO_URI'`, and nginx has nothing to forward to. Check `journalctl -u myapp -n 50 --no-pager`.
- **Don't commit or paste the URI.** If it is ever committed, rotate the database password.
- **Atlas must allow the droplet's IP** under Network Access, or requests time out.

---

## Run locally
```
cd backend
python3 -m venv venv
source venv/bin/activate
python -m pip install -r requirements.txt        # "python -m pip", not bare "pip"
```
Create `.env` with `MONGO_URI`, then:
```
python seed.py        # first time only, or after changing the data
python app.py         # Flask debug server on http://127.0.0.1:5000
```
Open `http://localhost:5000/api/projects` to check the JSON. The frontend's dev server proxies `/api` to this port.

## Run in production
The systemd service runs Gunicorn, and nginx forwards `/api/` to it:
```
ExecStart=/opt/myapp/backend/venv/bin/gunicorn --workers 2 --bind 127.0.0.1:8000 app:app
```
Gunicorn imports `app.py`, so the `app.run(debug=True)` block at the bottom is ignored there. After pulling new backend code, install any new dependencies and restart the service. Gunicorn doesn't reload code on its own:
```
# in dev environment
bash pushsync.sh    # pushes DEV code and sync with PROD repo

# in DigitalOcean droplet
cd /opt/myapp && git pull
cd backend && source venv/bin/activate
python -m pip install -r requirements.txt        # only if dependencies changed
sudo systemctl restart myapp
```
For the full server setup, see the [main README](../README.md).
