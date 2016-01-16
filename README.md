테스트 환경:

- 3.4.3
- 3.5.1

## 실행

[pyenv](https://github.com/yyuu/pyenv)를 기준으로 설명하겠습니다. (그냥 virtualenv를 쓰셔도 되기는 똑같이 될 겁니다.)

새로운 virtualenv를 만들고 활성화합니다.

```sh
pyenv virtualenv 3.5.1 web-3.5.1
pyenv activate web-3.5.1
```

저장소를 클론하고 종속성 패키지를 설치합니다.

```sh
git clone https://github.com/kinoru/qanvan
cd qanvan
pip install -r requirements.txt
```

TODO: 데이터베이스 설정 설명 넣기

`config.toml`을 적절히 수정합니다.

```sh
python run.py
```
