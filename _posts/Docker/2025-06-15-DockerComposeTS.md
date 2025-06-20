---
title: docker-compose.yaml으로 container 실행 시 Error...is not running 문제
categories: Docker
tag: [docker,docker-compose,trouble shooting]
image: /assets/img/docker_compose_logo.jpeg
typora-root-url: ../../
---

----

<br>

### **발생한 문제** : "docker-compose로 생성한 container가 not running.."

----

다음과 같이 docker-compose를 작성하였다. 

```yaml
services:
  humble_ws:
    image: humble-ros-env:latest
    container_name: humble_ws
    
    privileged: true
    network_mode: host
    ipc: host
    environment:
      - DISPLAY=${DISPLAY}
    volumes:
      - /tmp/.X11-unix:/tmp/.X11-unix:rw
      - /dev/video0:/dev/video0
    working_dir: /root/ros_ws
    
    # 컨테이너가 시작될 때 자동으로 실행할 명령 (Dockerfile CMD를 오버라이드)
    # `docker run`의 `--entrypoint` 또는 CMD와 유사
    command: ["bash"] 

# 명명된 볼륨 정의 (컨테이너 간 데이터 공유 또는 영구 저장용)
volumes:
  humble_ws:
    # driver: local # 로컬 파일 시스템 드라이버 (기본값)
    # name: custom_humble_ws_volume # 볼륨 이름 명시 (선택 사항)
```

위와 같이 작성한 docker-compose.yaml을 아래 명령어를 통해 실행  

```bash
$ docker-compose up -d
```

![image-20250615194631545](/assets/images/2025-06-15-DockerComposeTS/image-20250615194631545.png)

터미널에 위와 같이 정상적으로 docker-compose.yaml파일에 작성한 container가 Started되었다는 것으 확인할 수 있다. 

<br>

하지만, 해당 container의 bash 셸에 접속하면 다음과 같은 에러가 발생한다. 

```bash
$ docker exec -it humble_ws /bin/bash
```

```
Error response from daemon: container 906912b62dedd3328049abbdf485efa249195a65b76d6f62462dd2f5484050ef is not running
```

<br>

### 발생한 문제 원인: docker-compose.yaml 파일 내의 코드

```yaml
services:
...
command: ["bash"] # <- 이 부분이 문제가 된다. 
```

docker run 명령어의 옵션으로 주었던 내용이라 저렇게 명시하는 것이 당연하다고 생각했다.

하지만,  `command: ["bash"]`로 설정했을 때 컨테이너가 바로 중단되는 것은 **`bash` 셸이 시작된 후 더 이상 실행할 명령이 없어서** 그렇다. 

`bash` 셸은 대화형으로 사용자가 명령을 입력하기를 기다리는데, Docker Compose는 자동으로 입력을 주지 않으므로 `bash`는 "할 일 다 했다"고 생각하고 바로 종료돼 버린다.

<br>

### 해결 방안: `컨테이너 실행 유지 명령 추가`

문제가 되었던 부분을 다음과 같이 수정한다. 

```yaml
command: ["/bin/bash", "-c", "tail -f /dev/null"]
```

<br>

전체 yaml 파일은 아래와 같다. 

```yaml
services:
  humble_ws:
    image: humble-ros-env:latest
    container_name: humble_ws
    
    privileged: true
    network_mode: host
    ipc: host
    environment:
      - DISPLAY=${DISPLAY}
    volumes:
      - /tmp/.X11-unix:/tmp/.X11-unix:rw
      - /dev/video0:/dev/video0
    working_dir: /root/ros_ws
    
    # 컨테이너가 시작될 때 자동으로 실행할 명령 (Dockerfile CMD를 오버라이드)
    # `docker run`의 `--entrypoint` 또는 CMD와 유사
    command: ["/bin/bash", "-c", "source /opt/ros/humble/setup.bash && tail -f /dev/null"]


# 명명된 볼륨 정의 (컨테이너 간 데이터 공유 또는 영구 저장용)
volumes:
  humble_ws:
    # driver: local # 로컬 파일 시스템 드라이버 (기본값)
    # name: custom_humble_ws_volume # 볼륨 이름 명시 (선택 사항)
```

<br>

`tail -f /dev/null`: 이 명령은 `/dev/null`이라는 특수 파일의 끝을 계속 "따라간다". `/dev/null`은 아무것도 출력하지 않는 파일이므로, 이 명령은 CPU 자원을 거의 사용하지 않으면서 컨테이너가 종료되지 않고 계속 실행되도록 유지한다.



`"-c"`는 다음 인자로 주어지는 문자열을 명령어로 실행하고 셸을 종료한다"**는 의미이다. 

만약, `"-c"`가 없다면 Docker는 이 전체 문자열을 하나의 실행 파일 이름으로 간주하려고 할 것이다. 

<br>위와 같이 docker-compose.yaml파일을 수정하였다면, 생성된 docker container의 bash셸에 문제 없이 접속할 수 있을 것이다. 



