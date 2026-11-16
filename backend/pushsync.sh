#!/bin/bash
set -e    # stop immediately if any step fails

SRC_DIR="$(cd "$(dirname "$0")" && pwd)"    # folder this script lives in (the source repo)
PROD_DIR="$SRC_DIR/../../jrenjq-website-PROD/backend"    # destination of sync files 

# 1. commit and push to DEV repo, but only if something actually changed
git add -A
if git diff --cached --quiet; then
  echo "No changes to push to DEV."
else
  git commit -m "Pushed DEV backend files $(date '+%Y-%m-%d %H:%M:%S')"
  git pull --rebase
  git push
fi

# 2. sync with prod repo, exclude things in DEV repo that don't need to be in PROD
rsync -a --delete --exclude='venv' --exclude='__pycache__' --exclude='pushsync.sh' --exclude='seed_assets' --exclude='seed.py' . "$PROD_DIR"

# 3. commit and push to PROD repo, but only if something actually changed
cd "$PROD_DIR"
git add -A
if git diff --cached --quiet; then
  echo "No changes to push to PROD."
else
  git commit -m "Pushed PROD backend files $(date '+%Y-%m-%d %H:%M:%S')"
  git pull --rebase
  git push
fi