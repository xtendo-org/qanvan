import toml
from flask import Flask
from qanvan import blueprint, db

if __name__ == '__main__':
    with open('config.toml', 'r') as conff:
        conf = toml.load(conff)
    # TODO: 예외 처리. 설정 파일 안 열릴 때, 필수 필드 없을 때 등등
    app = Flask(__name__)
    app.register_blueprint(blueprint)
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SQLALCHEMY_DATABASE_URI'] = conf['database']
    db.init_app(app)
    # TODO: 디버그/프로덕션 구분하기. WSGI로 포장하기
    with app.app_context():
        db.create_all()
    app.config['DEBUG'] = True
    app.run(host='0.0.0.0')
