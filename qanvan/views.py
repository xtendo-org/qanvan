from flask import Blueprint, request, jsonify, render_template
from werkzeug.exceptions import BadRequest
from qanvan.models import db, Board, CardList, Card


blueprint = Blueprint('views', __name__)


@blueprint.route('/')
def hello():
    return render_template('index.html')


@blueprint.route('/board', methods=['GET', 'POST'])
def boards():
    if request.method == 'POST':
        # 새로운 보드를 만듭니다.
        name = required_field(request.get_json(), 'name')
        b = Board(name)
        db.session.add(b)
        db.session.commit()
    # 모든 보드의 목록을 반환합니다.
    return jsonify(result=[
        dict(zip(row.keys(), row)) for row in
        db.session.query(
            Board.id,
            Board.name,
        )
    ])


@blueprint.route('/board/<board_id>', methods=['GET', 'POST'])
def card_lists(board_id):
    if request.method == 'POST':
        # 새로운 카드리스트를 만듭니다.
        name = required_field(request.get_json(), 'name')
        l = CardList(board_id, name)
        db.session.add(l)
        db.session.commit()
        # TODO: 없는 board_id에 대한 요청일 경우 적절한 안내가 필요할까?
    # 이 보드에 있는 모든 카드리스트의 목록을 반환합니다.
    return jsonify(result=[
        dict(zip(row.keys(), row)) for row in
        db.session.query(
            CardList.id,
            db.func.coalesce(CardList.priority, CardList.id)
            .label('priority'),
            CardList.name,
        )
        .filter_by(board_id=board_id)
        # 정렬 순서는 priority 값이 있으면 그것을 우선으로,
        # 없으면 primary key를 씁니다.
        .order_by(db.func.coalesce(CardList.priority, CardList.id))
    ])


@blueprint.route('/list/<list_id>', methods=['GET', 'POST'])
def cards(list_id):
    if request.method == 'POST':
        # 새로운 카드를 만듭니다.
        data = request.get_json()
        title = required_field(data, 'title')
        content = required_field(data, 'content')
        c = Card(list_id, title, content)
        db.session.add(c)
        db.session.commit()
        return jsonify(result='ok')
    # request.method == 'GET'
    return jsonify(result=[
        dict(zip(row.keys(), row)) for row in
        db.session.query(
            Card.id,
            db.func.coalesce(Card.priority, Card.id).label('priority'),
            Card.title,
            Card.content
        )
        .filter_by(card_list_id=list_id)
        # 정렬 순서는 priority 값이 있으면 그것을 우선으로,
        # 없으면 primary key를 씁니다.
        .order_by(db.func.coalesce(Card.priority, Card.id))
    ])


def required_field(d, key):
    r = d.get(key)
    if r is None:
        raise BadRequest('key "%s" is required' % key)
    return r
