# Backend
## Set Up:
Better:
`python3 -m venv venv`
`./venv/bin/pip install -r requirements.txt`

## Develop:
`python3 -m venv venv` (if `venv` doesn't exist)
`source venv/bin/activate` (on Ubuntu)
> should see (venv) on command line

## Save requirements:
`pip freeze > requirements.txt`
> then use Set Up to reinstall requirements

## VS Code when using venv
Press `Ctrl+Shift+P`, type Python: Select Interpreter, and press Enter.
Choose `./backend/venv/Scripts/python.exe`
(make sure you have WSL extension installed when using VS Code on WSL Ubuntu)