import io
import os

import gridfs
from bson import ObjectId
from dotenv import load_dotenv
from flask import Flask, abort, jsonify, send_file
from flask_cors import CORS
from pymongo import MongoClient

load_dotenv()

app = Flask(__name__)
CORS(app)  # tighten to your frontend origin in production

db = MongoClient(os.environ["MONGO_URI"])["portfolio"]
fs = gridfs.GridFS(db)


def serialize(doc):
    doc["id"] = str(doc.pop("_id"))
    icon_id = doc.pop("icon_id", None)
    doc["icon"] = f"/api/images/{icon_id}" if icon_id else None
    return doc


@app.get("/api/projects")
def projects():
    return jsonify([serialize(d) for d in db.projects.find().sort("order", 1)])


@app.get("/api/articles")
def articles():
    return jsonify([serialize(d) for d in db.articles.find().sort("order", 1)])

@app.get("/api/benefactors")
def benefactors():
    return jsonify([serialize(d) for d in db.benefactors.find().sort("order", 1)])

@app.get("/api/images/<image_id>")
def image(image_id):
    try:
        f = fs.get(ObjectId(image_id))
    except Exception:
        abort(404)
    resp = send_file(io.BytesIO(f.read()), mimetype=f.content_type)
    resp.headers["Cache-Control"] = "public, max-age=31536000, immutable"
    return resp

@app.get("/api/debug")
def debug():
    return jsonify({
        "database": db.name,
        "collections": db.list_collection_names(),
        "projects": db.projects.count_documents({}),
        "articles": db.articles.count_documents({}),
        "benefactors": db.benefactors.count_documents({}),
    })

@app.route("/api/ping")
def ping():
    return jsonify(message="pong")

if __name__ == "__main__":
    app.run(debug=True)
