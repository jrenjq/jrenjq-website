# Backend
## Important:
This is the PROD part of a DEV -> PROD deploy pipeline.
DEV repo uses a script to mirror to this repo and push, so server can receive via `git pull`.
No changes should be made to this repo directly.

Please refer to DEV repo: https://github.com/jrenjq-dev/jrenjq-website

## Set Up:
`python3 -m venv venv`

`./venv/bin/pip install -r requirements.txt`
