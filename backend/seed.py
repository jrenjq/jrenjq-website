import mimetypes
import os

import gridfs
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()
db = MongoClient(os.environ["MONGO_URI"])["portfolio"]
fs = gridfs.GridFS(db)


def upload(filename):
    path = os.path.join("seed_assets", filename)
    ctype = mimetypes.guess_type(path)[0] or "application/octet-stream"
    with open(path, "rb") as f:
        return fs.put(f, filename=filename, content_type=ctype)


projects = [
    {
        "title": "Telegram Moderator Bot",
        "tags": ["Golang", "Claude"],
        "subtitle": "Bot that uses Claude API to evaluate & delete vulgar texts on uni telegram group.",
        "icon_file": "minisentry.png",
        "type": "project",
        "repo": "https://github.com/jrenjq/TelegramAutoModerator",
    },
    {
        "title": "Telegram Character Bot",
        "tags": ["Python", "Serverless", "AWS", "OpenAI"],
        "subtitle": "Bot that replies like a human on Telegram with configurable personality and profile info.",
        "icon_file": "bot.png",
        "type": "project",
        "repo": "https://github.com/jrenjq/Character-Roleplay-Automatic-Bots-Telegram",
    },
    {
        "title": "Dengue Season Predictor",
        "tags": ["Python", "Tkinter", "SciPy", "Data.Gov.Sg"],
        "subtitle": "Desktop app that forecasts upcoming dengue season via past rainfall & dengue data.",
        "icon_file": "stopdengue.jpg",
        "type": "project",
        "repo": "https://github.com/jrenjq/Dengue-Season-Predictor",
    },
    {
        "title": "Snake Game Clone",
        "tags": ["C++", "Java"],
        "subtitle": "Snake game cloned in both C++ and Java: from a team assignment in uni.",
        "icon_file": "snakegame.png",
        "type": "project",
        "repo": "https://github.com/jrenjq/Snake-Game-Clone",
    },
    {
        "title": "Morse Code Decoder",
        "tags": ["C"],
        "subtitle": "Translates morse code input (.-/) into english text: C struct, union, lib exercise.",
        "icon_file": "morse-code.png",
        "type": "project",
        "repo": "https://github.com/jrenjq/C-Morse-Code-Decoder",
    },
]

articles = [
    {
        "title": "SIT ICT 2024 Graduation",
        "tags": ["speech", "2024", "video"],
        "subtitle": "Farewell speech I delivered for my university graduation: SIT ICT Class of 2024.",
        "icon_file": "graduation.png",
        "type": "article",
        "link": "https://youtu.be/5FJ-h6TRjG0?t=4996",
    },
    {
        "title": "From the Harbour to the High Seas",
        "tags": ["blog", "2023", "article"],
        "subtitle": "Medium article written during my internship for GovTech publicity & outreach.",
        "icon_file": "govtech-intern.png",
        "type": "article",
        "link": "https://medium.com/@jrenjq/from-the-harbour-to-the-high-seas-776f8e6dc860",
    },
    {
        "title": "Sungei Road Forever",
        "tags": ["poetry", "2016", "PDF"],
        "subtitle": "Freeform poetry on Sungei Road Thieves Market closure. Published in VJC email list.",
        "icon_file": "sungei-road.jpg",
        "type": "article",
        "link": "https://drive.google.com/file/d/19xMk-GVRbCmrDy10ZIecfNpelRVdg6-J/view?usp=sharing",
    },
]

benefactors = [
    {"name": "Mohd. Noor Ariffin", "organisation": "SIT ICT mentor", "type": "people"},
    {"name": "Encik Sim", "organisation": "NS commander", "type": "people"},
    {"name": "Mr Edwin Low", "organisation": "Pri sch teacher", "type": "people"},
    {"name": "Mdm Norita Washil", "organisation": "Pri sch teacher", "type": "people"},
    {"name": "Dr Jeannie Lee", "organisation": "SIT uni professor", "type": "people"},
    {"name": "Dr David Baena", "organisation": "SIT uni professor", "type": "people"},
    {"name": "KKH Scholarship", "organisation": "Wilmar International", "type": "organisation"},
    {"name": "Work Study Degree", "organisation": "SIT & GovTech", "type": "organisation"},
]


def insert(collection, docs, has_icon):
    collection.delete_many({})  # safe to re-run
    for order, d in enumerate(docs):
        if has_icon:
            d["icon_id"] = upload(d.pop("icon_file"))
        d["order"] = order
        collection.insert_one(d)


# Clear old images so re-running doesn't leave orphans
db.drop_collection("fs.files")
db.drop_collection("fs.chunks")

insert(db.projects, projects, has_icon=True)
insert(db.articles, articles, has_icon=True)
insert(db.benefactors, benefactors, has_icon=False)
print("done")