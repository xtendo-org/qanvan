from flask import Flask, request, jsonify, abort
from qanvan.models import db, Board

app = Flask(__name__)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)


@app.route('/')
def hello():
    return 'Hello World!'


@app.route('/board', methods=['GET', 'POST'])
def board_index():
    if request.method == 'POST':
        # 새로운 보드를 만듭니다.
        name = request.get_json()['name']
        # 'name'은 필수 필드
        if 'name' is None:
            abort(400)
        b = Board(name)
        db.session.add(b)
        db.session.commit()
        return jsonify(result='ok')
    # 모든 보드의 목록을 반환합니다.
    # request.method == 'GET'
    return jsonify(result=[row[0] for row in db.session.query(Board.name)])
