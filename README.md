# jrenjq-website

## A. DigitalOcean Ubuntu Droplet First-time Setup
> Ubuntu 24.04 (LTS) x64

> Basic / 1 vCPU / 1 GB RAM / 25 GB Disk
### 1. Check RAM and Disk
```
free -h    # RAM (and swap, if enabled)
df -h /    # disk size
```
### 2. Upgrade dependencies
```
apt update && apt upgrade -y
```
### 3. Add Swap File
```
fallocate -l 1G /swapfile    # create a file called /swapfile and reserve 1 GB of disk space for it
chmod 600 /swapfile          # only root can read/write it (swap can hold sensitive data from RAM)
mkswap /swapfile             # format the file as swap space (writes a header the kernel recognizes)
swapon /swapfile             # tell the kernel to start using it as swap right now
echo '/swapfile none swap sw 0 0' >> /etc/fstab    # append a line to /etc/fstab so swap turns on automatically after reboots

free -h    # the Swap row should show about 1.0Gi
```
### 4. Install Nginx, Python PIP & Venv, and UFW
```
apt install -y nginx python3-venv python3-pip ufw
```
### 5. UFH Configuration
```
ufw allow OpenSSH          # open port 22 so you can still log in over SSH (do this BEFORE enabling the firewall, or you could lock yourself out)
ufw allow 'Nginx Full'     # open ports 80 (HTTP) and 443 (HTTPS) so people can reach your website
ufw --force enable         # turn the firewall on; --force skips the "this may disrupt SSH connections, proceed?" prompt

ufw status    # should list OpenSSH and Nginx Full as ALLOW
```
## B. Add Backend (Flask)
### 1. Install venv, flask, gunicorn
```
mkdir -p /opt/myapp/backend && cd /opt/myapp/backend
python3 -m venv venv
./venv/bin/pip install flask gunicorn
```
### 2. Create `app.py`:
```
cat > app.py << 'EOF'
from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/api/ping")
def ping():
    return jsonify(message="pong")
EOF
chown -R www-data:www-data /opt/myapp
```
### 3. Create the systemd service so it runs on boot and restarts if it crashes:
```
cat > /etc/systemd/system/myapp.service << 'EOF'
[Unit]
Description=Flask app (gunicorn)
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/opt/myapp/backend
ExecStart=/opt/myapp/backend/venv/bin/gunicorn --workers 2 --bind 127.0.0.1:8000 app:app
Restart=always

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now myapp
curl http://127.0.0.1:8000/api/ping    # should print {"message":"pong"}
```
To change number of workers later on (usual rule is (2 × CPU cores) + 1):
`sudo nano /etc/systemd/system/myapp.service`
Change the number of workers
```
sudo systemctl daemon-reload
sudo systemctl restart myapp
sudo systemctl status myapp
```
## C. Add Frontend (React)
### 1. (ON OWN COMPUTER) Scaffold React frontend with NPM
```
npm create vite@latest frontend -- --template react
cd frontend
npm install
```
### 2. Replace `src/App.jsx` with:
```jsx
import { useEffect, useState } from "react";

export default function App() {
  const [msg, setMsg] = useState("loading...");

  useEffect(() => {
    fetch("/api/test")
      .then((r) => r.json())
      .then((d) => setMsg(d.message))
      .catch(() => setMsg("error"));
  }, []);

  return (
    <div>
      <h1>Hello world</h1>
      <p>Backend says: {msg}</p>
    </div>
  );
}
```
### 3. Build and upload to DigitalOcean droplet:
```
npm run build
scp -r dist/* root@YOUR_DROPLET_IP:/var/www/myapp/frontend
```
## D. NGINX Configuration
### 1. Create configuration file
> ensure `root` is where the frontend build files are (`var/www/myapp/frontend`)
```
mkdir -p /var/www/myapp

cat > /etc/nginx/sites-available/myapp << 'EOF'
server {
    listen 80 default_server;
    server_name _;

    root /opt/myapp/frontend;
    index index.html;

    location / {
        try_files $uri /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF
```
### 2. Create symbolic link to actual config file location, and remove default NGINX page
```
ln -sf /etc/nginx/sites-available/myapp /etc/nginx/sites-enabled/myapp
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

## E. Add Domain Name (jrenjq.com) to Droplet
### 1. Point the domain at the droplet (Namecheap)

1. Log in to Namecheap, go to **Domain List**, and click **Manage** next to your domain.
2. Open the **Nameservers** setting and make sure it's **Namecheap BasicDNS** (the default). If you've changed it to something else, the records below won't take effect.
3. Go to the **Advanced DNS** tab and add these records (delete any default parking-page records first, like the `URL Redirect` or the `CNAME` for `www` pointing to `parkingpage.namecheap.com`):

| Type | Host | Value | TTL |
|---|---|---|---|
| A Record | `@` | `YOUR_DROPLET_IP` | Automatic |
| A Record | `www` | `YOUR_DROPLET_IP` | Automatic |

`@` means the bare domain (`example.com`), and `www` covers `www.example.com`.

### 2. Update nginx to use the domain

On the droplet, edit the `server_name` line.

```bash
sed -i 's/server_name _;/server_name jrenjq.com www.jrenjq.com;/' /etc/nginx/sites-available/myapp
nginx -t && systemctl reload nginx
```

Also change `listen 80 default_server;` to `listen 80;` if you want nginx to only answer for your domain (optional; leaving it means requests by raw IP still work too, which is handy for testing).

### 3. Add HTTPS (free, with Let's Encrypt)

Wait until the domain resolves to your droplet, then:

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d example.com -d www.example.com
```

Certbot will:
- ask for your email,
- ask you to accept the terms,
- obtain the certificate and edit your nginx config to use it,
- offer to redirect HTTP to HTTPS (choose yes).

Certificates renew automatically. You can test that with:

```bash
certbot renew --dry-run
```

Certbot will update the NGINX configuration in `/etc/nginx/sites-available/myapp` to:
```
server {
    server_name jrenjq.com www.jrenjq.com; # managed by Certbot

    root /opt/myapp/frontend;
    index index.html;

    location / {
        try_files $uri /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/jrenjq.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/jrenjq.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

server {
    if ($host = www.jrenjq.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    if ($host = jrenjq.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen 80;
    server_name jrenjq.com www.jrenjq.com;
    return 404; # managed by Certbot
}
```
## F. Add Simple CI/CD Shell Script
> See: https://github.com/jrenjq-dev/jrenjq-website-PROD

This repo is used to transfer Flask backend and React build files from development environment to production on digitalocean droplet.

### 1. Prerequisites

#### i. In the development environment (laptop):
You must have the development repo [jrenjq-website](https://github.com/jrenjq-dev/jrenjq-website) and [this repo](https://github.com/jrenjq-dev/jrenjq-website-PROD) side-by-side, named exactly:
```
|--- jrenjq-website
|--- jrenjq-website-PROD
```

#### ii. In the production environment (digitalocean droplet):
In the directory where the project files are kept, where NGINX points to `frontend` (e.g. `opt/myapp`, because NGINX point to frontend `opt/myapp/frontend`:
1. set up git (including SSH key)
2. point git upstream to this repo

### 2. Instructions:

#### i. Frontend
1. Go to the development repo `jrenjq-website/frontend` and run the script `pushsync.sh`
    - This runs `npm build`, copies over everything from `jrenjq-website/dist` (development repo) into `jrenjq-website-PROD/frontend` (production repo)
    - This pushes everything that's copied over into git
2. log into digitalocean and run `git pull` in the project files where this git repo is upstreamed (`/opt/myapp/frontend`)

#### ii. Backend
1. Go to the development repo `jrenjq-website/backend` and run the script `pushsync.sh`
2. log into digitalocean and run `git pull` in the project files where this git repo is upstreamed (`opt/myapp/backend`)

### 3. Shell script (Frontend) to build and push build files only
```sh
#!/bin/bash
set -e    # stop immediately if any step fails

SRC_DIR="$(cd "$(dirname "$0")" && pwd)"    # folder this script lives in (the source repo)
PROD_DIR="$SRC_DIR/../../jrenjq-website-PROD/frontend"    # destination of build files 

# 1. commit and push source files to DEV repo, but only if something actually chanced
git add -A
if git diff --cached --quiet; then
  echo "No changes to push to DEV."
else
  git commit -m "Pushed DEV frontend source files $(date '+%Y-%m-%d %H:%M:%S')"
  git push
fi

# 2. build
cd "$SRC_DIR"
npm run build

# 3. copy ONLY BUILD files into the prod repo
rm -rf "$PROD_DIR/assets"    # remove old hashed JS/CSS
cp -r dist/. "$PROD_DIR/"    # copy the new build in

# 4. commit and push build files to PROD repo, but only if something actually changed
cd "$PROD_DIR"
git add -A
if git diff --cached --quiet; then
  echo "No changes to push to PROD."
else
  git commit -m "Pushed PROD frontend build files $(date '+%Y-%m-%d %H:%M:%S')"
  git push
fi
```
### 4. Shell script (Backend) to sync and push both DEV and PROD code
```sh
#!/bin/bash
set -e    # stop immediately if any step fails

SRC_DIR="$(cd "$(dirname "$0")" && pwd)"    # folder this script lives in (the source repo)
PROD_DIR="$SRC_DIR/../../jrenjq-website-PROD/backend"    # destination of sync files 

# 1. commit and push to DEV repo, but only if something actually chanced
git add -A
if git diff --cached --quiet; then
  echo "No changes to push to DEV."
else
  git commit -m "Pushed DEV backend files $(date '+%Y-%m-%d %H:%M:%S')"
  git push
fi

# 2. sync with prod repo
rsync -a --delete --exclude='venv' --exclude='__pycache__' --exclude='pushsync.sh' . "$PROD_DIR"

# 3. commit and push to PROD repo, but only if something actually changed
cd "$PROD_DIR"
git add -A
if git diff --cached --quiet; then
  echo "No changes to push to PROD."
else
  git commit -m "Pushed PROD backend files $(date '+%Y-%m-%d %H:%M:%S')"
  git push
fi
```
## G. Frontend

## H. Backend

## I. Cache using NGINX
### 1. Set up cache directory
/etc/nginx/conf.d/api-cache.conf
```
proxy_cache_path /var/cache/nginx/api
                 levels=1:2
                 keys_zone=apicache:10m
                 max_size=100m
                 inactive=7d
                 use_temp_path=off;
```
### 2. Add cache logic to site’s server block, above your existing /api/ location:
```
location /api/images/ {
    proxy_pass http://127.0.0.1:8000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;

    proxy_cache apicache;
    proxy_cache_valid 200 7d;
    proxy_cache_valid 404 1m;
    proxy_cache_lock on;
    proxy_cache_use_stale error timeout updating;
    add_header X-Cache-Status $upstream_cache_status always;
}

location ~ ^/api/(projects|articles|benefactors)$ {
    proxy_pass http://127.0.0.1:8000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;

    proxy_cache apicache;
    proxy_cache_valid 200 1m;
    proxy_cache_lock on;
    proxy_cache_use_stale error timeout updating;
    add_header X-Cache-Status $upstream_cache_status always;
}
```
### 3. Apply NGINX changes
```
sudo nginx -t && sudo systemctl reload nginx
```
### 4. Test changes
```
curl -sI https://jrenjq.com/api/images/<id> | grep -i x-cache-status
curl -sI https://jrenjq.com/api/projects | grep -i x-cache-status
```
