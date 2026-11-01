#!/bin/bash
set -e    # stop immediately if any step fails

SRC_DIR="$(cd "$(dirname "$0")" && pwd)"    # folder this script lives in (the source repo)
PROD_DIR="$SRC_DIR/../../jrenjq-website-PROD/frontend"    # destination of build files 

# 1. build
cd "$SRC_DIR"
npm run build

# 2. copy the build into the prod repo
rm -rf "$PROD_DIR/assets"    # remove old hashed JS/CSS
cp -r dist/. "$PROD_DIR/"    # copy the new build in

# 3. commit and push, but only if something actually changed
cd "$PROD_DIR"
git add -A
if git diff --cached --quiet; then
  echo "No changes to deploy."
else
  git commit -m "Deploy frontend build files $(date '+%Y-%m-%d %H:%M:%S')"
  git push
fi