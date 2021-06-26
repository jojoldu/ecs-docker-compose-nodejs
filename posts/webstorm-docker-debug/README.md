# Docker Compose 실행시 Webstorm으로 Debugging 하기

```bash
docker run -it --rm -p 3000:3000 --link docker-db -e DB_HOST=docker-db -v $(pwd):/app/ ts-sample local
```
