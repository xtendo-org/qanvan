from flask.ext.sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class CardList(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True)

    def __init__(self, name=""):
        self.name = name

    def __repr__(self):
        return '<CardList #%d: %s>' % (self.id, self.name)
