# 2. Docker Compose로 Nodejs 개발/배포환경 구성하기 - Docker Compose로 개선하기

[앞서 진행된 과정](https://jojoldu.tistory.com/584) 을 통해 **Docker를 통한 독립적인 환경의 장점**은 알게 되었지만, 반면에 직접 하나하나 CLI를 입력하여 Docker를 수행하는것의 불편함도 알게 되었습니다.  
  

### --link가 없는데?

그런데… 앱 서비스에서 db 서비스를 어떻게 찾았지?
사실 docker-compose.yml에는 docker run에서 사용하던 옵션 중 하나가 보이지 않습니다.  
바로 --link 옵션인데요. 도커 컴포즈 파일 버전이 2일 때는 다음과 같은 항목으로 연결할 서비스를 명시하곤 했습니다.

도커 컴포즈 파일 버전 3으로 와서는 links 항목을 사용하지 않더라도 한 네트워크 안에 있는 서비스끼리 서로 통신을 할 수 있기 때문에, 이 항목을 사용하지 않았습니다. 
(관련 문서인 Links topic in Networking in Compose도 참고하세요.) 
한 네트워크로 선언한 적이 없다고요? 
한 docker-compose.yml 안에 있는 서비스들은 별도로 지정하지 않으면 하나의 네트워크에 속합니다. 
(네트워크와 관련된 더 자세한 내용은 Networking in Compose를 참고하세요.)
