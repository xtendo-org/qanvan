from flask.ext.sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class Board(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, index=True)

    def __init__(self, name=""):
        self.name = name

    def __repr__(self):
        return "<Board '%s'>" % self.name


class CardList(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    priority = db.Column(db.Integer, index=True)
    name = db.Column(db.String(80), unique=True, index=True)

    board_id = db.Column(db.Integer, db.ForeignKey('board.id'))

    def __init__(self, board_id, name=""):
        self.name = name
        self.priority = self.id

    def __repr__(self):
        return "<CardList #%d: '%s'>" % (self.id, self.name)


class Card(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    priority = db.Column(db.Integer, index=True)
    title = db.Column(db.String(80))
    content = db.Column(db.Text)

    card_list_id = db.Column(db.Integer, db.ForeignKey('card_list.id'))

    def __init__(self, title):
        self.title = title
        self.priority = self.id
        self.content = ''

    def __repr__(self):
        return "<Card #%d: '%s'>" % (self.id, self.title)
