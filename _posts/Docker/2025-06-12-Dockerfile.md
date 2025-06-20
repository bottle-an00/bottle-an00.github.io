---
title: docker file을 통해 편하게 필요한 환경 구축하기
categories: Docker
tag: [Docker, Dockerfile] 
image: /assets/img/docker_logo.jpeg
typora-root-url: ../../
---

----

> **[이전에 구축한 환경의 문제점]**
>
> Docker를 통해 컴퓨터에 설치된 Ubuntu를 밀지 않고 필요한 버전의 개발 환경을 구축할 수 있었다. 
>
> 하지만, docker image를 통해 docker container를 생성하더라도 필요한 package를 매번 다시 설치해야 하고, ~/.bahsrc의 내용도 매번 추가해야 하는 번거로움이 존재한다. 
>
> (물론, 이 부분은 내가 --rm 옵션을 줘서 더 자주 해야하는 것이 있지만, 만약 다른 컴퓨터에서도 작성한 애플리케이션을 구동하기 위한 환경을 구축하기 위해 다시 설치해야 하는 것은 마찬가지이다.)
>
> 이러한 귀찮음을 해결하기 위해 dockerfile을 사용한다. 

----

<br>

### **Dockerfile..?**

----

대회 준비랑 에피톤 과제 등을 수행해보면서 느낀 것은 내 노트북에서나 데스크탑에서는 돌아가던 것이 대회용 컴퓨터나 랩실 컴에서는 버전 차이 등의 문제로 돌아가지 않았다. 

이런 환경 불일치에 의해 생기는 문제들을 간편하게 해결해 줄 수 있는 것이 Docker이고 Docker로 만들 환경(컨테이너)의 설계도를 이미지라 한다. 

이때, docker image를 만들 메뉴얼을 dockerfile이라고 한다. 

![0_zrFckNL21UANLY6b](/assets/images/2025-06-12-Dockerfile/0_zrFckNL21UANLY6b.webp)



**[Docker file 핵심 개념]**

- **선언적(Declarative):** 무엇을 할 것인가를 명확하게 지시한다. 
- **재현성(Reproducibility):** 동일한 Dockerfile은 언제 어디서든 동일한 이미지를 생성한다.
- **자동화(Automation):** 수동 환경 설정의 번거로움을 없애고 빌드 과정을 자동화한다.

<br>

### Dockerfile 작성

---

Dockerfile에 사용되는 핵심 명령어가 존재한다. 해당 명령어들을 조합하여 구축하고 싶은 개발 환경에 대한 docker image file을 작성할 수 있다. 

<br>

> **[Dockerfile 핵심 명령어 정리]**
>
> ---
>
> 
>
> - **`FROM [기본 이미지 이름]:[태그]`**:
>
>   - 모든 Dockerfile은 `FROM` 명령어로 시작한다. 이는 어떤 **베이스 이미지(Base Image)**를 기반으로 시작할지를 지정한다. 
>   - **예시:** `FROM node:18-alpine` (Node.js 18이 설치된 Alpine Linux 이미지 사용)
>
> - **`WORKDIR /path/to/workdir`**:
>
>   - 컨테이너 내부에서 이후의 명령어들이 실행될 작업 디렉토리를 설정한다. 
>
>     이 명령어가 없으면 각 명령어마다 절대 경로를 지정해야 하는 번거로움이 있다.
>
>   - 이 디렉토리가 이미 존재하면 해당 디렉토리로 이동한다.
>
>     만약 이 디렉토리가 존재하지 않으면, Docker는 자동으로 **새로 생성한 후** 해당 디렉토리로 이동한다.
>
>   - **예시:** `WORKDIR /app`
>
> - **`COPY [호스트 경로] [컨테이너 경로]`**:
>
>   - Dockerfile이 있는 호스트 시스템의 파일이나 디렉토리를 빌드 중인 이미지 내부로 복사한다. 
>
>     애플리케이션 소스코드나 설정 파일 등을 이미지에 포함시킬 때 사용한다.
>
>   - **예시:** `COPY . .` (현재 디렉토리의 모든 파일을 `/app` 디렉토리로 복사)
>
>   - **예시:** `COPY package*.json ./` (Node.js 프로젝트의 의존성 파일을 먼저 복사)
>
> - **`RUN [실행할 명령어]`**:
>
>   - 이미지를 빌드하는 과정에서 실행될 셸 명령어를 지정한다. 
>
>     주로 패키지 설치, 라이브러리 컴파일 등 환경 설정을 위해 사용된다. 각 `RUN` 명령어는 새로운 이미지 레이어를 생성한다.
>
>   - **예시:** `RUN apt-get update && apt-get install -y git` (패키지 목록 업데이트 및 git 설치)
>
>   - **예시:** `RUN npm install` (Node.js 프로젝트의 의존성 설치)
>
> - **`EXPOSE [포트 번호]`**:
>
>   - 컨테이너가 특정 포트에서 요청을 수신할 것임을 Docker에게 알리는 역할을 한다. 
>
>     이는 문서화의 의미가 크며, 실제로 외부에서 접근하려면 `docker run` 명령어에서 포트 매핑을 해줘야 한다.
>
>   - **예시:** `EXPOSE 8080` (8080 포트 노출)
>
> - **`ENV [환경 변수명]=[값]`**:
>
>   - 이미지 내에서 사용할 환경 변수를 설정한다. 
>
>     애플리케이션이 실행될 때 필요한 설정 값(예: 데이터베이스 URL, API 키 등)을 지정할 수 있다.
>
>   - **예시:** `ENV NODE_ENV=production`
>
> - **`CMD ["실행 파일", "인자1", "인자2"]`**:
>
>   - 컨테이너가 시작될 때 실행될 기본 명령어를 지정한다. 
>
>     `docker run` 명령으로 다른 명령어가 주어지면 이 `CMD`는 덮어쓰여진다. 보통 애플리케이션 시작 명령에 사용된다.
>
>   - **예시:** `CMD ["npm", "start"]`
>
> - **`ENTRYPOINT ["실행 파일", "인자1"]`**:
>
>   - `CMD`와 유사하지만, 컨테이너가 시작될 때 항상 실행되는 명령어이다. 
>
>     `CMD`는 `ENTRYPOINT`의 인자로 사용될 수 있어, 더 유연한 명령어 구성을 가능하게 한다.
>
>   - **예시:** `ENTRYPOINT ["/usr/bin/supervisord"]`

위의 명령어들로 내가 구축하고자 하는 ROS2 Humble 개발 환경에 대한 dockerfile을 작성해보면 아래와 같다. 

```dockerfile
FROM osrf/ros:humble-desktop-full

WORKDIR /root/ros_ws

# COPY src /root/ros_ws/src/

RUN apt update && \
    apt install -y ros-humble-tiago-gazebo &&\
    rm -rf /var/lib/apt/lists/*

COPY bashrc_config.txt /tmp/bashrc_config_temp.txt

# 복사된 파일의 내용을 /root/.bashrc에 추가
# /root/.bashrc 파일이 이미 존재하는 경우, 내용을 덮어쓰지 않고 추가합니다 (>>).
RUN cat /tmp/bashrc_config_temp.txt >> /root/.bashrc && \
    rm /tmp/bashrc_config_temp.txt # 임시 파일 삭제

CMD ["/bin/bash"]

#------------------------------[Usage]-----------------------------------
# [BUILD]
# docker build -t humble-ros-env .

# [RUN Docker Container]
# docker run -it --rm --privileged --env DISPLAY=$DISPLAY --network host -v /tmp/.X11-unix:/tmp/.X11-unix:rw --ipc=host -v humble_ws:/root/ros_ws/ -w /root/ros_ws --name humble_ws osrf/ros:humble-desktop-full
```

osrf/ros:humble-desktop-full를 base image로 사용하고 WORKDIR을 /root/ros_ws로 설정하였다. 

그리고 필요한 package를 RUN 명령어를 통해 설치하고,  COPY 명령어를 통해 ~/.bashrc에 적용할 내용이 적힌 txt파일을 호스트에서 docker container로 옮긴다. 

RUN 명령어를 통해 옮겨 둔 bashrc에 적용할 내용을 추가로 작성한다. 

해당 내용은 이전 포스팅에서 확인할 수 있다. 

{% include link_card.html post_path="Docker/2025-06-11-DockerRos2Setting.md" %}

<br>

#### **[Dockerfile build]**

작성한 Dockerfile에 존재하는 디렉토리에서 아래 명령어를 통해 build하면 이미지를 생성할 수 있다.

```bash
$ docker build -t humble-ros-env .
```

<br>

#### **[생성한 이미지 기반 docker container 생성]**

아래 명령어를 통해 생성한 docker image 기반 docker container를 생성할 수 있다. 

```
docker run -it --rm \
	--privileged \
	--env DISPLAY=$DISPLAY \
	--network host \
	-v /tmp/.X11-unix:/tmp/.X11-unix:rw \
	--ipc=host \
	-v humble_ws:/root/ros_ws/ \
	-w /root/ros_ws \
	--name humble_ws \
	osrf/ros:humble-desktop-full
```

<br>

### **Dockerfile 사용의 이점**

---

Dockerfile을 사용하는 것은 단순히 번거로움을 줄이는 것을 넘어, 개발 및 배포 워크플로우에 혁신적인 변화를 가져다준다.

1. **환경 일관성 및 재현성 보장:**
   - "내 컴퓨터에서는 잘 되는데..."라는 고질적인 문제를 해결해 준다. Dockerfile이 있으면 개발, 테스트, 운영 환경 모두에서 **정확히 동일한 환경**을 구축할 수 있어, 환경 불일치로 인한 버그 발생 가능성을 대폭 줄여준다.
2. **빌드 프로세스 자동화:**
   - 이미지 생성에 필요한 모든 단계를 Dockerfile에 정의하므로, 한 번 작성하면 명령어 하나로 복잡한 환경 설정 및 애플리케이션 빌드 과정을 자동화할 수 있다. 이는 CI/CD 파이프라인 구축에 필수적인 요소이다.
3. **버전 관리 용이:**
   - Dockerfile 자체는 텍스트 파일이므로 Git과 같은 버전 관리 시스템으로 쉽게 관리할 수 있다. 이미지 빌드 과정의 변경 이력을 추적하고, 필요한 경우 특정 시점의 환경으로 롤백하는 것이 매우 용이하다.
4. **애플리케이션 배포 단순화:**
   - Dockerfile로 만들어진 Docker 이미지는 모든 종속성을 포함하므로, 어떤 서버든 Docker만 설치되어 있다면 이미지를 가져와 바로 컨테이너를 실행할 수 있다. 이는 배포 과정을 극적으로 단순화시키고, 배포 실패 위험을 줄여준다.
5. **협업 효율 증대:**
   - 팀원 간에 개발 환경을 공유할 때 Dockerfile 하나만 있으면 된다. 각자 환경을 수동으로 맞출 필요 없이, Dockerfile을 통해 동일한 개발 환경을 빠르게 구성할 수 있어 협업 효율이 크게 향상된다.

------



### **Reference**

---

- [Dockerfile overview](https://docs.docker.com/build/concepts/dockerfile/)

- [Dockerfile reference](https://docs.docker.com/reference/dockerfile/)

