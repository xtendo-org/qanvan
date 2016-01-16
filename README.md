## 테스트 환경

- 3.4.3
- 3.5.1

## 안내

먼저 저장소를 클론합니다.

```sh
git clone https://github.com/kinoru/qanvan
cd qanvan
```

### 자바스크립트 설정

TODO

[Flow], [Babel], [React], [Webpack]을 씁니다.

[Flow]: http://flowtype.org/
[Babel]: https://babeljs.io/
[React]: https://facebook.github.io/react/
[Webpack]: https://webpack.github.io/

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

이제 `./static/build/_bundle.js`가 발생했을 것입니다.

### 파이선 설정

[pyenv](https://github.com/yyuu/pyenv)를 기준으로 설명하겠습니다. (그냥 virtualenv를 쓰셔도 되기는 똑같이 될 겁니다.)

새로운 virtualenv를 만들고 활성화합니다.

```sh
pyenv virtualenv 3.5.1 web-3.5.1
pyenv activate web-3.5.1
```

종속성 패키지를 설치합니다.

```sh
pip install -r requirements.txt
```

### 데이터베이스 설정

TODO

`config.toml`을 적절히 수정합니다.

### 실행

```sh
python run.py
```
