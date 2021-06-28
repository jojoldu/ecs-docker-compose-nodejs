# 1. Docker Compose로 Nodejs 개발/배포환경 구성하기 - Dockerfile로 구성하기 

NodeJS와 같은 스크립트 언어에서는 개발환경을 구성하고, 이를 팀으로 확대하는데 많은 어려움이 있는데요.  
일반적으로는 다음과 같은 문제점들이 있습니다.

* 로컬 PC의 Node버전을 매번 프로젝트 환경에 맞춰 변경해야한다. 
* 때때로 패키지 설치가 막힌다.
* 로컬 컴퓨터에 이미 존재하는 환경과 꼬였다.
* 막상 배포를 했더니 개발 환경과 서버 환경이 같지 않아서 문제가 발생했다.
* 프로젝트에 새로운 사람이 합류하면 그 사람의 개발 환경에 따른 문제점이 발생한다.

그래서 이런 문제점들을 Docker Compose를 통해 개선하고 실제 배포까지 한번 진행해보겠습니다.

## 1. 기본환경 구성

샘플로 진행할 프로젝트의 스택은 다음과 같이 구성됩니다.

* Typescript
* TypeORM
* Express
* PostgreSQL

### 1-1. 프로젝트 구성

위와 같은 환경을 가장 편하게 구성하는 방법은 `typeorm` CLI를 사용하는 것입니다.  

> 아직 `typeorm` CLI 설치가 안되어있으시면 `npm install -g typeorm` 으로 전역 설치를 진행하시면 됩니다.

```bash
typeorm init --name ecs-docker-compose-nodejs --database pg --express
```

설치 후 혹시나 `pg` 설치가 제대로 안된다면 다음과 같이 `pg`만 설치를 진행합니다.

```bash
npm install pg --save
```

그럼 아래와 같이 프로젝트가 구성 됩니다. 

```bash
📦 ecs-docker-compose-nodejs
├─ .gitignore
├─ ormconfig.json
├─ package-lock.json
├─ package.json
├─ src
│  ├─ controller
│  │  └─ UserController.ts
│  ├─ entity
│  │  └─ User.ts
│  ├─ index.ts
│  └─ routes.ts
└─ tsconfig.json
```

기본 프로젝트 구성이 끝났으니, 테스트로 연결해볼 DB를 실행해보겠습니다.

### 1-2. DB 실행

PostgreSQL DB를 Docker로 실행하기 위해 아래와 같이 명령어를 실행합니다.

```bash
docker run --rm \
--name docker-db \
-e POSTGRES_DB=test \
-e POSTGRES_USER=test \
-e POSTGRES_PASSWORD=test \
-p 5432:5432 \
postgres
```

* DB의 name은 `docker-db`
* 나머지 접속 정보(`DB`, `USER`, `PASSWORD`) 는 모두 `test`를 사용합니다.

이렇게 실행된 PostgreSQL DB와 1-1. 에서 만든 프로젝트를 연결해보겠습니다.  
먼저 `ormconfig.json` 에 아래의 내용을 추가합니다.

> 저는 `json` 보다는 `js`를 선호해서 `ormconfig.json`을 `ormconfig.js`로 전환해서 사용합니다.

```javascript
module.exports = {
   "type": "postgres",
   "host": test,
   "port": 5432,
   "username": "test",
   "password": "test",
   "database": "test",
   ...
}
```

해당 설정 후, 프로젝트를 실행하시면 다음과 같은 로그가 정상적으로 나와야 합니다.

```bash
Express server has started on port 3000. Open http://localhost:3000/users to see results
```
브라우저를 확인해보시면 다음과 같이 데이터를 볼 수 있습니다.

![start](./images/start.png)

여기까지는 일반적인 로컬 개발환경에 대한 내용입니다.  
로컬 PC에 직접 프로젝트를 구성하고, DB / Redis / Queue 등은 Docker를 통해 설치해서 개발환경을 구성하는 것이죠.  
  
하지만 도입부에서 언급했듯이 이럴 경우 다음과 같은 문제를 여전히 해결이 안됩니다.

* 로컬 PC의 Node버전을 매번 프로젝트 환경에 맞춰 변경해야한다. 
* 때때로 패키지 설치가 막힌다.
* 로컬 컴퓨터에 이미 존재하는 환경과 꼬였다.
* 막상 배포를 했더니 개발 환경과 서버 환경이 같지 않아서 문제가 발생했다.
* 프로젝트에 새로운 사람이 합류하면 그 사람의 개발 환경에 따른 문제점이 발생한다.

그래서 로컬 PC에 직접 구축한 프로젝트 역시 Docker로 전환해보겠습니다.

## 2. Docker로 개발환경 구성하기

### 2-1. Dockerfile

현재의 Node 프로젝트를 위한 Dockerfile은 다음과 같이 구성됩니다.

```dockerfile
FROM node:16-alpine3.11

# Korean Fonts
RUN apk --update add fontconfig
RUN mkdir -p /usr/share/fonts/nanumfont
RUN wget http://cdn.naver.com/naver/NanumFont/fontfiles/NanumFont_TTF_ALL.zip
RUN unzip NanumFont_TTF_ALL.zip -d /usr/share/fonts/nanumfont
RUN fc-cache -f && rm -rf /var/cache/*

# Language
ENV LANG=ko_KR.UTF-8 \
    LANGUAGE=ko_KR.UTF-8

# Set the timezone in docker
RUN apk --no-cache add tzdata && \
        cp /usr/share/zoneinfo/Asia/Seoul /etc/localtime && \
        echo "Asia/Seoul" > /etc/timezone

# Create Directory for the Container
WORKDIR /app

# Only copy the package.json file to work directory
COPY package.json .
RUN npm install

# Copy all other source code to work directory
COPY . .

# Docker Demon Port Mapping
EXPOSE 3000

# Node ENV
ENV NODE_ENV=production
CMD [ "npm", "start" ]
```

대부분의 command는 보시면 그대로 이해가 가능하실 것 같습니다.

* `FROM node:16-alpine3.11` 
  * Node 16버전이 설치된 [알파인 리눅스(Alpine Linux)](https://www.lesstif.com/docker/alpine-linux-35356819.html) 을 사용합니다.
  * 알파인 리눅스는 `apt` 혹은 `yum` 으로 패키지를 관리하지 않고 `apk`를 통해 관리합니다.
* `CMD [ "npm", "start" ]`
  * `CMD`는 다른 command와 다르게 

### 2-2. DB 연결

**ormconfig.js**

```javascript
module.exports = {
   ...
   "host": process.env.DB_HOST,
   ...
}
```

```bash
docker build -t ts-sample .
```

```bash
docker run -it --rm \
-p 3000:3000 \
--link docker-db \
-e DB_HOST=docker-db \
ts-sample
```

그럼 아래와 같이 


## 실시간 코드 반영

```bash
docker ps -a
```

![ps](./images/ps.png)

```bash
docker exec -it 21ae5f1d6d9c sh
```

```bash
ls -al
```

```bash 
drwxr-xr-x    1 root     root          4096 Jun 24 09:28 .
drwxr-xr-x    1 root     root          4096 Jun 23 09:44 ..
drwxr-xr-x    7 root     root          4096 Jun 24 09:28 .git
-rw-r--r--    1 root     root            47 Jun 21 11:35 .gitignore
drwxr-xr-x    2 root     root          4096 Jun 24 09:28 .idea
-rw-r--r--    1 root     root           843 Jun 23 09:47 Dockerfile
-rw-r--r--    1 root     root            37 Jun 22 09:31 README.md
-rw-r--r--    1 root     root           650 Jun 21 11:53 docker-compose.yml
drwxr-xr-x    1 root     root          4096 Jun 23 09:38 node_modules
-rw-r--r--    1 root     root           502 Jun 24 09:22 ormconfig.js
-rw-r--r--    1 root     root        120900 Jun 21 11:58 package-lock.json
-rw-r--r--    1 root     root           478 Jun 21 11:58 package.json
drwxr-xr-x    5 root     root          4096 Jun 23 09:38 posts
drwxr-xr-x    5 root     root          4096 Jun 23 09:38 src
-rw-r--r--    1 root     root           298 Jun 21 11:35 tsconfig.json
```

KST와 한글폰트도 잘 적용되었는지 확인해봅니다.

![kst](./images/kst.png)

### 자동 재실행

Nodemon 적용
```bash

```

```bash
docker run -it --rm \
-p 3000:3000 \
--link docker-db \
-e DB_HOST=docker-db \
-v $(pwd):/app/ \
ts-sample
```

* `-v`, `--volume`
    * host의 file system과 container의 파일 시스템이 연결됩니다
    * `/host/some/where:/container/some/where`

