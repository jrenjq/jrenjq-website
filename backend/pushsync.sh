#!/bin/bash
set -e    # stop immediately if any step fails

SRC_DIR="$(cd "$(dirname "$0")" && pwd)"    # folder this script lives in (the source repo)
PROD_DIR="$SRC_DIR/../../jrenjq-website-PROD/backend"    # destination of sync files 

# 1. commit and push to DEV repo, but only if something actually chanced
git add -A
if git diff --cached --quiet; then
  echo "No changes to deploy to DEV."
  exit 0    # stop the script here with a success status, since no changes.
else
  git commit -m "Deploy DEV backend files $(date '+%Y-%m-%d %H:%M:%S')"
  git push
fi

# 2. sync with prod repo
rsync -a --delete --exclude='venv' --exclude='__pycache__' --exclude='push2prodrepo.sh' . "$PROD_DIR"

# 3. commit and push to PROD repo, but only if something actually changed
cd "$PROD_DIR"
git add -A
if git diff --cached --quiet; then
  echo "No changes to deploy to PROD."
else
  git commit -m "Deploy PROD backend files $(date '+%Y-%m-%d %H:%M:%S')"
  git push
fi