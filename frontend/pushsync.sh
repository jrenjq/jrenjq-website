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
  git pull --rebase
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
  git pull --rebase
  git push
fi