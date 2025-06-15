---
title: docker-compose로 복잡한 docker run 옵션 관리하기
categories: Docker
tag: [Docker, Docker-Compose] 
image: /assets/img/docker_compose_logo.jpeg
typora-root-url: ../../
---

----



> **[기존의 구축한 docker 개발 환경에 대한 불만]**
>
> "기존의 dockerfile을 통해 필요한 package들을 자동으로 설치할 수 있어서 매우 편했지만, 한 가지 불편함이 존재하였다. 
>
> 그것은 docker run 명령어의 복잡한 옵션들을 매번 작성해야한다는 것이다. 
>
> 물론, 어딘가에 복잡한 옵션들이 포함된 docker run 명령어를 따로 적어두고 이미지 생성이 필요할 때마다 복사 붙여넣기하면 되지만, 이것도 매우 귀찮다.. docker-compose가 이 귀찮음을 해결해 줄 수 있다."

----



<br>

### **Docker Compose란..?**

---

본래 docker-compose는 여러 docker container를 한 번에 정의하고 실행하며 관리하는 도구이다. 

하지만 docker-compose.yaml을 작성함을 통해 복잡한 docker run의 옵션을 정의할 수 있다.

따라서, 사용자가 편하게 간단한 명령어로 해당 docker image를 기반으로 하는 docker container를 생성할 수 있다.   

<br>

**[핵심 개념]**

- **서비스(Services):** 애플리케이션의 각 컨테이너를 의미한다. (예: `web`, `db`, `redis`)
- **네트워크(Networks):** 컨테이너 간 통신을 위한 가상 네트워크를 정의한다.
- **볼륨(Volumes):** 컨테이너와 호스트 간 또는 컨테이너 간 데이터 영속성을 위한 저장소를 정의한다.



<br>

### **docker_compose.yaml 작성**

---

Docker Compose는 `docker-compose.yaml` (또는 `docker-compose.yml`)이라는 YAML 파일을 기반으로 동작한다. 이 파일 안에 애플리케이션의 모든 구성 요소들을 명시한다.

<br>

> **[주요 필드 설명]**
>
> 
>
> - **`version`**: Docker Compose 파일의 버전을 명시한다. 최신 버전(예: `'3.8'`)을 사용하는 것이 좋다.
>
>   
>
> - **`services`**:
>
>   - 애플리케이션을 구성하는 핵심 부분이다. 각 서비스는 독립적인 컨테이너로 실행된다.
>
>   - **`build`**: 현재 디렉토리의 Dockerfile을 사용하여 이미지를 빌드한다. (예: `build: .`)
>
>   - **`image`**: Docker Hub 등에서 이미 존재하는 이미지를 사용할 때 지정한다. (예: `image: postgres:13`)
>
>   - **`ports`**: 호스트와 컨테이너 간 포트 포워딩을 설정한다. `"[호스트 포트]:[컨테이너 포트]"` 형식이다.
>
>   - **`volumes`**: 데이터 영속성을 위해 볼륨을 마운트한다.
>
>     - `[호스트 경로]:[컨테이너 경로]` (바인드 마운트)
>     - `[볼륨 이름]:[컨테이너 경로]` (명명된 볼륨)
>
>   - **`environment`**: 컨테이너 내부에 설정할 환경 변수를 정의한다.
>
>   - **`depends_on`**: 서비스 간 의존성을 정의한다. 나열된 서비스들이 먼저 시작된 후에 해당 서비스가 시작된다. (시작 순서만 보장하며, 서비스가 '준비'되었음을 보장하지는 않는다.)
>
>   - **`networks`**: 특정 **네트워크에 서비스를 연결**한다.
>
>   - **`restart`**: 컨테이너 **종료 시 재시작 정책을 정의**한다. (예: `always`, `on-failure`, `no`)
>
>   - **`working_dir`**: 컨테이너가 시작될 때 **기본적으로 작업할 디렉토리**를 설정한다.
>
>   - **`previleged`**: 컨테이너에 **호스트 시스템의 모든 장치에 대한 접근 권한**을 부여한다.
>
>   - **`networkmode`**: 컨테이너가 **호스트의 네트워크 스택을 직접 사용**하도록 설정한다.
>
>   - **`ipc`**: 컨테이너가 **호스트의 IPC(Inter-Process Communication) 네임스페이스를 공유**하도록 설정
>
>   - **`environment`**: 컨테이너 내부에서 사용할 **환경 변수**들을 정의한다.
>
>   - **`command`**: 컨테이너가 시작될 때 실행될 **기본 명령**을 정의한다. 이는 Dockerfile의 `CMD` 명령을 오버라이드한다.
>
>     
>
> - **`volumes`**: Docker Compose가 관리할 명명된 볼륨(Named Volumes)을 정의한다. 컨테이너가 삭제되어도 데이터는 보존된다.
>
>   
>
> - **`networks`**: 사용자 정의 네트워크를 정의한다. 명시하지 않으면 기본적으로 프로젝트 이름으로 된 브릿지 네트워크가 생성되어 모든 서비스가 연결된다.

<br>

위의 주요 필드를 사용하여 docker-compose.yaml 파일을 작성하면 아래와 같다.

```yaml
version: '3.8'

services:
  humble_ws:
    image: ros2-cuda-humble:latest
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



> **[Docker Compose 사용 명령어]**
>
> - **`docker-compose up -d`**: 모든 서비스를 백그라운드(`-d`)로 시작하고, 필요한 이미지가 없으면 빌드하거나 다운로드한다.
> - **`docker-compose down`**: 모든 서비스를 중지하고 컨테이너, 네트워크, 볼륨(명명된 볼륨은 기본적으로 삭제되지 않음)을 제거한다.
> - **`docker-compose ps`**: 현재 실행 중인 서비스들의 상태를 확인한다.
> - **`docker-compose logs [서비스명]`**: 특정 서비스의 로그를 확인한다.
> - **`docker-compose build`**: `build` 지시자가 있는 서비스의 이미지를 다시 빌드한다.



### **Docker Compose가 실행되었을 때 container에 접속**

---

```bash
$ docker-compose up
```

위 명령어를 입력했을 때, 아래와 같이 docker compose.yaml파일에 작성한 docker 서비스가 실행되는 것을 볼 수 있다. 

![image-20250615183004122](/assets/images/2025-06-13-DockerCompose/image-20250615183004122.png)

이때, 각 서비스의 bash 셀로 접속하고 싶다면 아래 명령어를 입력한다. 

```bash
$ docker exec -it humble_ws bash
```

<br>

#### **[Trouble Shooting: docker container is not running error ]**

만약, 작성한 docker-compose.yaml을 바탕으로 `docker-compoase up -d` 명령어를 통해 docker container를 실행할 때, 정상적으로 `Container humble_ws Started` 문구와 함께 실행됨을 확인할 수 있지만, 막상 docker exec 명령어로 실행한 docker container에 bash 셸로 접속하려고 하면 아래 에러가 발생한다.

```bash
Error response from daemon: container 906912b62dedd3328049abbdf485efa249195a65b76d6f62462dd2f5484050ef is not running
```

이는 작성한 docker-compose.yaml 파일의 작성에서 문제가 있다. 해당 문제의 해결책은 아래 포스트에 정리하였다. 

{%include link_card.html post_path= "Docker/2025-06-15-DockerComposeTS.md" %}

<br>

### **Docker Compose 사용의 이점**

---

Docker Compose를 사용하면 다중 컨테이너 애플리케이션 관리의 복잡성을 크게 줄이고, 개발 및 배포 워크플로우를 효율적으로 만들 수 있다.

1. **단일 명령어로 다중 컨테이너 관리:**
   - 여러 개의 컨테이너를 개별적으로 `docker run` 명령으로 실행하고 연결하는 대신, `docker-compose up`이라는 단일 명령어로 전체 애플리케이션 스택을 한 번에 시작할 수 있다. 이는 개발자의 생산성을 크게 향상시킨다.
2. **환경 설정의 코드화 (Infrastructure as Code):**
   - 애플리케이션의 모든 서비스, 네트워크, 볼륨 설정이 `docker-compose.yaml`이라는 하나의 파일에 정의된다. 이를 통해 환경 설정의 재현성을 보장하고, 버전 관리가 용이해지며, 팀원 간에 동일한 개발 환경을 쉽게 공유할 수 있다.
3. **개발 환경 구축의 간소화:**
   - 새로운 개발자가 프로젝트에 합류했을 때, 복잡한 개발 환경을 수동으로 세팅할 필요 없이 `docker-compose up` 명령 하나로 필요한 모든 서비스와 의존성을 갖춘 개발 환경을 즉시 구축할 수 있다.
4. **확장성과 유연성:**
   - `docker-compose.yaml` 파일을 수정하는 것만으로 서비스의 포트, 볼륨, 환경 변수 등을 쉽게 변경하거나 새로운 서비스를 추가할 수 있다. 이는 애플리케이션의 확장 및 변경에 유연하게 대응할 수 있게 한다.
5. **테스트 환경 구축 용이:**
   - 통합 테스트나 시스템 테스트를 위해 실제 서비스와 유사한 환경을 빠르게 구축하고 해체할 수 있다. 이는 테스트의 반복성과 신뢰성을 높이는 데 기여한다.

<br>

### Reference

---

- [dockerdocs Reference: Compose file reference](https://docs.docker.com/reference/compose-file/)