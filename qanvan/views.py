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

        target = db.session.query(
            db.func.coalesce(CardList.priority, CardList.id) + 1
        ).filter(
            CardList.board_id == board_id
        ).order_by(
            -db.func.coalesce(CardList.priority, CardList.id)
        ).limit(1).subquery().as_scalar()

        db.session.execute(
            CardList.__table__.insert().values(
                board_id=board_id,
                name=name,
                priority=target,
            )
        )
        db.session.commit()
        # TODO: 없는 board_id에 대한 요청일 경우 적절한 안내가 필요할까?
    return list_of_cardlists(board_id)


def list_of_cardlists(board_id):
    # 이 보드에 있는 모든 카드리스트의 목록을 반환합니다.
    return jsonify(result=[
        dict(zip(row.keys(), row)) for row in
        db.session.query(
            CardList.id,
            db.func.coalesce(CardList.priority, CardList.id)
            .label('priority'),
            CardList.name,
        )
        .filter_by(board_id=board_id, is_deleted=False)
        # 정렬 순서는 priority 값이 있으면 그것을 우선으로,
        # 없으면 primary key를 씁니다.
        .order_by(db.func.coalesce(CardList.priority, CardList.id))
    ])


@blueprint.route('/board/<board_id>/swap/<source>/<target>', methods=['POST'])
def swap_list(board_id, source, target):
    if target == '0':  # 0은 맨 뒤에다 끼워넣으려는 경우입니다.
        target = db.session.query(
            db.func.coalesce(CardList.priority, CardList.id) + 1
        ).filter(
            CardList.board_id == board_id
        ).order_by(
            -db.func.coalesce(CardList.priority, CardList.id)
        ).limit(1).subquery().as_scalar()
    else:
        db.session.execute(
            CardList.__table__.update(
            ).where(
                db.func.coalesce(CardList.priority, CardList.id) >= target
            ).where(
                CardList.board_id == board_id
            ).values(
                priority=db.func.coalesce(CardList.priority, CardList.id) + 1
            )
        )
    db.session.execute(
        CardList.__table__.update(
        ).where(
            CardList.__table__.c.id == source
        ).values(priority=target)
    )
    db.session.commit()
    return list_of_cardlists(board_id)


@blueprint.route('/list/<list_id>', methods=['GET', 'POST', 'DELETE'])
def cards(list_id):
    if request.method == 'DELETE':
        db.session.execute(
            CardList.__table__.update(
            ).where(
                CardList.__table__.c.id == list_id
            ).values(is_deleted=True)
        )
        db.session.commit()
        return jsonify(result='ok')
    if request.method == 'POST':
        # 새로운 카드를 만듭니다.
        data = request.get_json()
        title = required_field(data, 'title')
        content = data.get('content', '')

        target = db.session.query(
            db.func.coalesce(Card.priority, Card.id) + 1
        ).filter(
            Card.card_list_id == list_id
        ).order_by(
            -db.func.coalesce(Card.priority, Card.id)
        ).limit(1).subquery().as_scalar()

        db.session.execute(
            Card.__table__.insert().values(
                card_list_id=list_id,
                title=title,
                content=content,
                priority=target,
            )
        )
        db.session.commit()

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


@blueprint.route('/card/<card_id>', methods=['PUT'])
def card(card_id):
    data = request.get_json()
    title = data.get('title')
    if title is not None:
        db.session.execute(
            Card.__table__.update().where(
                Card.__table__.c.id == card_id
            ).values(title=title)
        )
    else:
        content = data.get('content')
        if content is not None:
            db.session.execute(
                Card.__table__.update().where(
                    Card.__table__.c.id == card_id
                ).values(content=content)
            )
    db.session.commit()
    result = db.session.query(
        Card.id,
        db.func.coalesce(Card.priority, Card.id).label('priority'),
        Card.title,
        Card.content
    ).filter_by(id=card_id).limit(1)[0]
    return jsonify(result=dict(zip(result.keys(), result)))


@blueprint.route('/card/swap', methods=['POST'])
def swap_card():
    data = request.get_json()
    list_id = required_field(data, 'list_id')
    source = required_field(data, 'source')
    target = required_field(data, 'target')
    if target == 0:  # 0은 맨 뒤에다 끼워넣으려는 경우입니다.
        target = db.session.query(
            db.func.coalesce(Card.priority, Card.id) + 1
        ).filter(
            Card.card_list_id == list_id
        ).order_by(
            -db.func.coalesce(Card.priority, Card.id)
        ).limit(1).subquery().as_scalar()
    else:
        db.session.execute(
            Card.__table__.update(
            ).where(
                db.func.coalesce(Card.priority, Card.id) >= target
            ).where(
                Card.card_list_id == list_id
            ).values(
                priority=db.func.coalesce(Card.priority, Card.id) + 1
            )
        )
    db.session.execute(
        Card.__table__.update(
        ).where(
            Card.__table__.c.id == source
        ).values(priority=target, card_list_id=list_id)
    )
    db.session.commit()
    return jsonify(result='ok')


def required_field(d, key):
    r = d.get(key)
    if r is None:
        raise BadRequest('key "%s" is required' % key)
    return r
