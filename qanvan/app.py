from flask import Flask, request, jsonify, abort
from qanvan.models import db, Board, CardList

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


@app.route('/board/<board_id>', methods=['GET', 'POST'])
def board_item(board_id):
    if request.method == 'POST':
        # 새로운 카드리스트를 만듭니다.
        name = request.get_json()['name']
        # 'name'은 필수 필드
        if 'name' is None:
            abort(400)
        l = CardList(board_id, name)
        db.session.add(l)
        db.session.commit()
        # TODO: 없는 board_id에 대한 요청일 경우 적절한 안내가 필요할까?
        return jsonify(result='ok')
    # 이 보드에 있는 모든 카드리스트의 목록을 반환합니다.
    # request.method == 'GET'
    return jsonify(result=[
        row[0] for row in db.session.query(CardList.name)
        .filter_by(board_id=board_id)
        # 정렬 순서는 priority 값이 있으면 그것을 우선으로,
        # 없으면 primary key를 씁니다.
        .order_by(db.func.coalesce(CardList.priority, CardList.id))])
