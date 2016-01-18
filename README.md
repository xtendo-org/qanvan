## 테스트 환경

- Python 3.5.1

## 안내

먼저 저장소를 클론합니다.

```sh
git clone https://github.com/kinoru/qanvan
cd qanvan
```

## 필요한 시스템 패키지

다음의 패키지들이 필요합니다.

- psycopg2를 돌리기 위한 시스템 라이브러리가 필요합니다. 보통 python-dev와 libpq-dev를 설치하면 됩니다.
    - `sudo apt-get install --no-install-recommends python3-dev libpq-dev`
- 물론 SQLite를 쓰면 필요없습니다. (SQLite로 잘 되는지는 테스트해보지 않았습니다만 아마 되지 않을까 싶습니다…)
    - `requirements.txt`를 열고 `psycopg2`를 지웁니다.
- Flow를 사용하기 위해서는 libelf-dev 설치가 필요합니다. 이건 없어도 진행 가능합니다.

### 프론트엔드 설정

(빌드 결과물을 저장소에 포함해 놓았으므로 이 부분은 넘어가셔도 됩니다.)

[Flow], [Babel], [React], [Webpack], [Stylus]를 씁니다.

[Flow]: http://flowtype.org/
[Babel]: https://babeljs.io/
[React]: https://facebook.github.io/react/
[Webpack]: https://webpack.github.io/
[Stylus]: http://stylus-lang.com/

먼저 종속성 패키지를 설치합니다.

```sh
npm install
```

테스트는

```sh
npm test
```

빌드는

```sh
npm run build
```

이제 `./static/build/_bundle.js`와 `./static/build/main.css`가 발생했을 것입니다.

### 파이선 설정

새로운 virtualenv를 만들고 활성화합니다.

<del>힘세고 강한</del> [pyenv](https://github.com/yyuu/pyenv)의 경우:

```sh
pyenv virtualenv 3.5.1 web-3.5.1
pyenv activate web-3.5.1
```

그냥 virtualenv의 경우:

```sh
virtualenv -p python3 --system-site-packages .venv
source .venv/bin/activate
```

종속성 패키지를 설치합니다.

```sh
pip install -r requirements.txt
```

### 데이터베이스 설정

`config.toml`을 적절히 수정해 줍니다. SQLAlchemy의 엔진 설정 문자열을 씁니다.

예시:

- `postgresql://scott:tiger@localhost:5432/mydatabase`
- `sqlite:////tmp/qanvan.db`

### 실행

```sh
python run.py
```

이제 <http://localhost:5000/>에서 칸반 보드를 사용합니다.
