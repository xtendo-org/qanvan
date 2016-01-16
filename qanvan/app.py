from flask import Flask, request, jsonify, abort
from qanvan.models import db, CardList

app = Flask(__name__)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)


@app.route('/')
def hello():
    return 'Hello World!'


@app.route('/list', methods=['POST'])
def list():
    if request.method == 'POST':
        # 새로운 카드리스트를 만듭니다.
        name = request.get_json()['name']
        # 'name'은 필수 필드
        if 'name' is None:
            abort(400)
        cardList = CardList(name)
        db.session.add(cardList)
        db.session.commit()
        return jsonify(result='ok')
    # TODO: request.method == 'GET'
