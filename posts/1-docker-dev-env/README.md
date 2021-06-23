1. Docker Compose & AWS ECS로 Nodejs 개발/배포환경 구성하기

## 기본환경

```bash
typeorm init --name ecs-docker-compose-nodejs --database pg --express
```

```bash
npm install pg --save
```

## DB 실행

```bash

docker run --rm \
--name docker-db \
-e POSTGRES_DB=test \
-e POSTGRES_USER=test \
-e POSTGRES_PASSWORD=test \
-p 5432:5432 \
postgres
```

## Dockerfile

* [알파인 리눅스(Alpine Linux)](https://www.lesstif.com/docker/alpine-linux-35356819.html)
