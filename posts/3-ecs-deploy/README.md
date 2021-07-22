# 3. Docker Compose로 Nodejs 개발/배포환경 구성하기 - Dockerfile을 ECS에 배포하기


* `CMD [ "npm", "run" "start"]`
  * `CMD`는 다른 command와 다르게 빌드할때 수행되지 않고, **이미지를 실행할때** 수행됩니다.
  * 즉, 위 Dockerfile로 만든 이미지를 `docker run` 할때 `CMD`가 수행되는데요.
  * `docker run`을 수행할때 `npm start start` 가 실행됩니다.