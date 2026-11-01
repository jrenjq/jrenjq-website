#!/bin/bash
set -e    # stop immediately if any step fails

SRC_DIR="$(cd "$(dirname "$0")" && pwd)"    # folder this script lives in (the source repo)
PROD_DIR="$SRC_DIR/../../jrenjq-website-PROD/backend"    # destination of sync files 

# 1. sync with prod repo
rsync -a --delete --exclude='venv' --exclude='__pycache__' --exclude='push2prodrepo.sh' . "$PROD_DIR"

# 2. commit and push DEV repo, but only if something actually chanced
git add -A
if git diff --cached --quiet; then
  echo "No changes to deploy."
else
  git commit -m "Deploy DEV backend files $(date '+%Y-%m-%d %H:%M:%S')"
  git push
fi

# 3. commit and push PROD repo, but only if something actually changed
cd "$PROD_DIR"
git add -A
if git diff --cached --quiet; then
  echo "No changes to deploy."
else
  git commit -m "Deploy PROD backend files $(date '+%Y-%m-%d %H:%M:%S')"
  git push
fi