# 2. Docker Compose로 Nodejs 개발/배포환경 구성하기 - Docker Compose로 개선하기

[앞서 진행된 과정](https://jojoldu.tistory.com/584) 을 통해 **Docker를 통한 독립적인 환경의 장점**은 알게 되었지만, 반면에 직접 하나하나 CLI를 입력하여 Docker를 수행하는것의 불편함도 알게 되었습니다.  
  
이런 불편함을 겪은건 비단 저희만 그런것은 아니겠죠?  
이미 이런 불편함을 해결 하기 위해 [도커 컴포즈](https://docs.docker.com/compose/)가 출시 되었습니다.  
  
도커 컴포즈는 여러 Docker 애플리케이션을 정의하고 실행하기 위한 도구입니다.  
이를 활용하면 그동안 저희가 수행했던 CLI 명령어 옵션이나 컨테이너 간 실행 순서등을 파일로서 관리할 수 있게 됩니다.  
  
이 파일로 관리한다는 점이 가지는 또 하나의 장점은, 바로 **버전 관리**가 된다는 것인데요.  
도커 컴포즈를 구성하는 `docker-compose.yml` 파일에 작성된 내용은 프로젝트 Git으로 관리되고 있어, 언제든 이전 내용으로 롤백이나, 변경 내역등을 확인해볼 수 있습니다.  
  
CLI 방식에 비해 월등하게 장점이 많기 때문에 사용하지 않을 이유가 전혀 없습니다.  
  
자 그럼 이제 한번 본격적으로 도커 컴포즈를 사용해보겠습니다.

> 이후의 과정을 따라하려면, 도커 엔진의 버전이 1.13.1 이상이어야 하고, 도커 컴포즈의 버전은 1.6.0 이상이어야 합니다.  
> 최근 (2021.07.19) 도커를 설치했다면 큰 문제가 없습니다.

## 1. docker-compose.yml 생성하기

프로젝트 root에서 docker-compose.yml 파일을 생성합니다.

![yml](./images/yml.png)

작성할 내용은 다음과 같습니다.

```yml
version: '3.8'

services:
  db:
    image: postgres
    environment:
      - POSTGRES_DB=test
      - POSTGRES_USER=test
      - POSTGRES_PASSWORD=test
      - POSTGRES_INITDB_ARGS=--encoding=UTF-8

  app:
    build:
      context: .
      dockerfile: ./Dockerfile
    environment:
      - DB_HOST=db
      - DB_PORT=5432
      - DB_NAME=test
      - DB_USERNAME=test
      - DB_PASSWORD=test
    depends_on:
      - db
    ports:
      - "3000:3000"
    command:
      - local
    volumes:
      - ./:/app/
```

* `version: 3.8`
  * compose 파일 버전을 명시합니다.
    * 저는 3버전대의 최신인 3.8을 사용했습니다.
  * `3`으로 작성하게 되면 **3.0**으로 해석하게 됩니다.
    * 과거에는 `3`으로 작성하면 3 버전대의 최신버전을 자동으로 매핑해주었지만, 이제는 메이저버전만 명시할 경우 [자동으로 마이너 버저닝은](https://docs.docker.com/compose/compose-file/compose-versioning/#version-3) `0` 이 됩니다.
  * 좀 더 자세한 내용은 [공식 문서](https://docs.docker.com/compose/compose-file/compose-versioning/)를 참고하시면 됩니다.
* `services`
  * 컴포즈로 관리할 컨테이너들을 명시합니다.
  * 지칭하는 용어만 다릅니다 (컴포즈에서는 컨테이너 대신 서비스라고 합니다.)
  * `services:db`, `services:app`
    * 각 서비스 (컨테이너)의 별칭을 나타냅니다.
    * **명시한 순서대로 실행**됩니다.
    * 즉, `db`가 실행되고 이후에 `app`이 실행되어 `db`에 대한 `app` 실행 순서를 지킬 수 있습니다.

각 Service (`db`, `app`)의 옵션은 다음과 같습니다.

### 1-1. db 서비스 설정

* `image`
  * 서비스에서 사용할 도커 이미지를 선택합니다.
  * `postgres` 는 [도커 공식 PostgreSQL 이미지](https://hub.docker.com/_/postgres/) 입니다.
* `environment`
  * `docker run` 실행시 -e 옵션에 적었던 환경변수들입니다.  
  * 마지막의 POSTGRES_INITDB_ARGS 부분이 추가되었는데, 데이터베이스 서버의 인코딩을 UTF-8로 설정하기 위함입니다.

### 1-2. app 서비스 설정

* `build`
  * DB와 같이 이미지를 사용하는 것이 아니기 때문에 `build`를 사용합니다.
  * `docker build` 명령어를 수행합니다.
  * `context`
    * `docker build` 를 실행할 디렉토리입니다.
    * `.`로 했기 때문에 현재 위치가 됩니다.
  * `dockerfile`
    * 빌드에 사용될 Dockerfile을 선택합니다.
* `depends_on`
  * 특정 서비스에 대한 의존도를 나타냅니다.
    * 지정된 서비스가 먼저 시작되도록 합니다.
  * `depends_on`에는 큰 이슈가 하나 있습니다. 
    * PostgreSQL가 완전히 실행되고 준비될때까지 `app`이 기다려야하는데, **PostgreSQL 실행 명령어만 수행되면 바로** `app` **이 수행**되기 때문에 종종 DB를 찾을 수 없다는 메세지가 발생하게 됩니다.
    * 때문에 [wait-for-it](https://github.com/vishnubob/wait-for-it/)등을 통해 [특정 서버의 특정 포트로 접근할 수 있을 때까지 기다린 뒤](https://docs.docker.com/compose/startup-order/)에 `app`이 수행되어야만 합니다.
    * 아래에서 좀 더 자세하게 설정 방법을 소개 드립니다. 
* `ports`
  * 외부 포트와 컨테이너내 포트를 연결합니다.
  * `docker run` 명령어의 `-p` 옵션과 동일합니다.
* `command`
  * `docker run` 의 마지막 명령어와 동일합니다.
  * 여기서는 마지막에 입력된 `local`를 등록합니다.
* `volumes`
  * 로컬 PC의 디렉토리와 컨테이너 안의 디렉토리를 연결합니다.
  * [이전 시간](https://jojoldu.tistory.com/584)에 진행된 실시간 코드 반영하기에서 사용된 `-v` (`--volume`) 옵션과 동일합니다. 


### 1-3. depends_on 완전 실행 대기

위에서도 언급했지만, (**로컬 개발환경에 한해서**) Node 애플리케이션이 실행되기 전에 DB가 완전히 실행완료 되어야하는 것에 대해 보장이 필요합니다.

* [depends_on 공식문서](https://docs.docker.com/compose/compose-file/compose-file-v3/#depends_on)
* [](https://docs.docker.com/compose/startup-order/)

이를 해결하는 가장 보편적인 방법은 [wait-for-it.sh](https://github.com/vishnubob/wait-for-it) 스크립트를 사용하는 것입니다.  
이름이 알려주듯 특정 서버의 특정 포트로 접근할 수 있을 때까지 기다려주는 스크립트입니다.  
이 스크립트를 도커 이미지 안에 넣고, 이미지 실행 명령 앞에 붙여주면 됩니다.

(1) Dockerfile 파일 하단에 다음 내용을 추가합니다.

```bash
ADD    https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh /
```

(2) docker-compose.yml 의 `command` 를 아래와 같이 수정합니다.

```yml
command: ["./wait-for-it.sh", "db:5432", "--", "local"]
```

## 2. 실행

### 2-1. 도커 컴포즈 명령어

**실행**

```bash
docker-compose up
```

```bash
docker-compose up -d
```

만약 **Dockerfile도 변경되어서 빌드부터 다시해아한다면** `--build`를 사용하면 됩니다.

```bash
docker-compose up -d --build
```

**상태 확인**

```bash
docker-compose ps
```

```bash
docker-compose stop
docker-compose start
```

**서비스 초기화**

```bash
docker-compose down
```

* `--volume`
  * 위 옵션을 추가하면 볼륨까지 삭제합니다.
  * 

### 2-2. app은 어떻게 db를 찾는거지?

그런데… 앱 서비스에서 db 서비스를 어떻게 찾았지?
사실 docker-compose.yml에는 docker run에서 사용하던 옵션 중 하나가 보이지 않습니다.  
바로 --link 옵션인데요. 도커 컴포즈 파일 버전이 2일 때는 다음과 같은 항목으로 연결할 서비스를 명시하곤 했습니다.

도커 컴포즈 파일 버전 3으로 와서는 links 항목을 사용하지 않더라도 한 네트워크 안에 있는 서비스끼리 서로 통신을 할 수 있기 때문에, 이 항목을 사용하지 않았습니다. 
(관련 문서인 Links topic in Networking in Compose도 참고하세요.) 
한 네트워크로 선언한 적이 없다고요? 
한 docker-compose.yml 안에 있는 서비스들은 별도로 지정하지 않으면 하나의 네트워크에 속합니다. 
(네트워크와 관련된 더 자세한 내용은 Networking in Compose를 참고하세요.)



