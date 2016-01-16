from flask import Flask
from qanvan.models import db

app = Flask(__name__)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)


@app.route("/")
def hello():
    return "Hello World!"
