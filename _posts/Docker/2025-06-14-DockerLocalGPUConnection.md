---
title: Docker Container에 Local GPU 연결하기
categories: Docker
tag: [Docker, Docker-Compose] 
image: /assets/img/docker_logo.jpeg
typora-root-url: ../../
---

----

> **[Docker container와 Local GPU 연결하기]**
>
> docker container와 local GPU를 연결함을 통해 docker container에서 생성한 개발 환경에서도 GPU 자원을 사용할 수 있도록 한다.

----

<br>

### **NVIDIA-Container-Toolkit 설치**

----

```bash
# NVIDIA 패키지 repository 및 GPG key 설정
$ distribution=$(. /etc/os-release;echo $ID$VERSION_ID) \ # 호스트 리눅스 배포판의 정보를 읽어 vesion 설정
      && curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg \
      && curl -s -L https://nvidia.github.io/libnvidia-container/$distribution/libnvidia-container.list | \
            sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
            sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list


# nvidia-docker2 설치
$ sudo apt-get update
$ sudo apt-get install -y nvidia-docker2

# 설치한 내용 적용을 위한 docker 재시작
$ sudo systemctl restart docker
```

<br>

<br>

### **정상 작동 확인**

----

docker run 명령어를 통해 docker container를 생성해보고 터미널에서 nvidia-smi를 입력하여 Local GPU에 연결되었는 지 확인해보도록 한다.



```
$ docker run -it \
	--rm \
	--privileged \
	--env DISPLAY=$DISPLAY \
	--network host \
	--gpus all \
	-v /tmp/.X11-unix:/tmp/.X11-unix:rw \
	--device=/dev/video0:/dev/video0 \
	--ipc=host \
	-v humble_ws:/root/ros_ws/ \
	-w /root/ros_ws \
	--name humble_ws \
	osrf/ros:humble-desktop-full
```

여기에 사용된 docker image와 docker run 명령어의 옵션에 대한 내용은 이전 포스팅을 보면 알 수 있다.

{% include link_card.html post_path="Docker/2025-06-11-DockerRos2Setting.md" %}

위의 명령어를 입력하여 docker container를 생성되는지 확인하자.

![image-20250614223000206](/assets/images/2025-06-14-DockerLocalGPUConnection/image-20250614223000206.png)

성공적으로 docker container에 접속할 수 있다면 아래 명령어를 입력하여 Nvidia GPU에 대한 정보가 나타나는지 확인하자.

![image-20250614223107733](/assets/images/2025-06-14-DockerLocalGPUConnection/image-20250614223107733.png)

위와 같이 출력된다면 성공적으로 local GPU와 docker container가 연결되었음을 알 수 있다.

<br>

### **Trouble Shooting**

---

만약, docker run 명령어를 통해 container를 생성해보았을 때 아래와 같은 에러 메세지가 출력된다면 docker를 지웠다가 다시 설치하는 것을 권한다. 

```
docker: Error response from daemon: failed to create shim task: OCI runtime create failed: runc create failed: unable to start container process: error during container init: error running hook #0: error running hook: exit status 1, stdout: , stderr: Auto-detected mode as 'legacy'
nvidia-container-cli: initialization error: load library failed: libnvidia-ml.so.1: cannot open shared object file: no such file or directory: unknown.
```

<br>

**[Docker 재설치]**

```bash
# 설치된 docker 제거
$ sudo apt-get purge -y docker-engine docker docker.io docker-ce docker-ce-cli
$ sudo apt-get autoremove -y --purge docker-engine docker docker.io docker-ce

# docker 관련 컨테이너, 이미지, 파일 삭제
$ sudo rm -rf /var/lib/docker /etc/docker
$ sudo rm /etc/apparmor.d/docker
$ sudo groupdel docker
$ sudo rm -rf /var/run/docker.sock

# 재설치 
$ sudo apt-get install docker-ce docker-ce-cli containerd.io
$ sudo apt-get install --reinstall docker-ce
```

<br>

### Dockerfile 작성시

---

GPU를 사용하기 위해 아래의 내용을 Dockerfile에 추가한다.

```dockerfile
ENV NVIDIA_VISIBLE_DEVICES all
ENV NVIDIA_DRIVER_CAPABILITIES compute,utility
```

그리고, NVIDIA 공식 CUDA 이미지를 base로 사용하여 GPU 사용에 필요한 CUDA나 cuDNN을 사용하는 것을 권장한다.

나는 ROS2 환경에서 GPU를 사용하고 싶으니, nvidia/cuda:12.1.1-cudnn8-devel-ubuntu22.04를 base 이미지로 설정하고, RUN을 통해 ROS2를 따로 설치하도록 하겠다. (ROS2를 설치하는 것이 더욱 편하니깐..!)

<br>

이를 위한 dockerfile을 작성해보면 아래와 같다. 

#### [Nvidia CUDA & cuDNN & ROS2]

```dockerfile
# 1. 베이스 이미지 선택: NVIDIA CUDA 이미지 (CUDA, cuDNN 포함)
#    ROS2 Humble은 Ubuntu 22.04 기반이므로, 해당 Ubuntu 버전을 지원하는 CUDA 이미지를 선택합니다.
#    'devel' 태그는 개발 도구 (컴파일러 등)를 포함하여 빌드에 용이합니다.
FROM nvidia/cuda:12.1.1-cudnn8-devel-ubuntu22.04

# 2. 필요한 환경 변수 설정 (옵션이지만 권장)
#    이것은 컨테이너가 GPU를 인식하고 사용할 수 있도록 합니다.
#    NVIDIA CUDA 이미지에는 이미 설정되어 있을 수 있지만 명시적으로 넣어주는 것이 좋습니다.
ENV NVIDIA_VISIBLE_DEVICES all
ENV NVIDIA_DRIVER_CAPABILITIES compute,utility,graphics # 그래픽 관련 기능도 필요할 수 있으므로 추가

# 3. 시스템 업데이트 및 필수 패키지 설치
#    ROS2 설치에 필요한 기본 유틸리티 및 라이브러리 설치
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    locales \
    software-properties-common \
    curl \
    gnupg \
    lsb-release \
    libglvnd0 \
    libgl1 \
    libglx0 \
    libegl1 \
    libxext6 \
    libx11-6 \
    && rm -rf /var/lib/apt/lists/*

# 4. ROS2 저장소 및 GPG 키 추가 (Humble 기준)
RUN locale-gen en_US en_US.UTF-8 \
    && update-locale LC_ALL=en_US.UTF-8 LANG=en_US.UTF-8 \
    && export LANG=en_US.UTF-8

RUN curl -sSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.key -o /usr/share/keyrings/ros-archive-keyring.gpg
RUN echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/ros-archive-keyring.gpg] http://packages.ros.org/ros2/ubuntu $(. /etc/os-release && echo $UBUNTU_CODENAME) main" | tee /etc/apt/sources.list.d/ros2.list > /dev/null

# 5. ROS2 설치 

# ROS2 설치시 지역 설정 관련되 부분을 SKIP하기 위함
ENV DEBIAN_FRONTEND=noninteractive
RUN echo "en_US.UTF-8 UTF-8" > /etc/locale.gen && \
    locale-gen en_US.UTF-8 && \
    /usr/sbin/update-locale LANG=en_US.UTF-8

ENV LANG="en_US.UTF-8" \
    LC_ALL="en_US.UTF-8" \
    LANGUAGE="en_US.UTF-8"

# ROS2 설치 
RUN apt-get update && apt-get install -y --no-install-recommends \
    ros-humble-desktop \
    ros-dev-tools \
    && rm -rf /var/lib/apt/lists/*

# 6. ROS2 환경 설정 스크립트 소싱 (매번 수동으로 할 필요 없도록)
COPY bashrc_config.txt /tmp/bashrc_config_temp.txt

# 복사된 파일의 내용을 /root/.bashrc에 추가
# /root/.bashrc 파일이 이미 존재하는 경우, 내용을 덮어쓰지 않고 추가합니다 (>>).
RUN cat /tmp/bashrc_config_temp.txt >> /root/.bashrc && \
    rm /tmp/bashrc_config_temp.txt # 임시 파일 삭제
    
# 7. (선택 사항) 필요한 ROS2 패키지 및 사용자 코드 추가
WORKDIR /ros_ws
COPY . .
RUN apt-get update && rosdep install --from-paths src --ignore-src -r -y && rm -rf /var/lib/apt/lists/*
RUN . /opt/ros/humble/setup.bash && colcon build --symlink-install

# 8. 컨테이너 시작 시 기본 명령 설정 (선택 사항)
CMD ["bash"]
```

<br>

아래 명령어를 통해 dockerfile을 build한다.

```bash
# dockerfile이 존재하는 디렉토리에서 아래 명령어 입력
$ docker build -t ros2-cuda-humble:latest .
```



### docker_compose.yaml 작성시

---



docker run 명령어를 사용해도 되지만 ROS2를 사용하면서 여러 센서나 GPU, GUI 포워딩을 위한 여러 복잡한 옵션들을 설정해주어야 하기 때문에 간편하게 docker-compose를 활용하는 것이 좋다. 

<br>

GPU사용 옵션을 추가하기 위해 docker-compose.yaml은 아래와 같이 작성한다. 

```yaml
services:
  humble_ws:
    image: ros2-cuda-humble:latest
    container_name: humble_ws
    
    # GPU를 사용하는 경우 (NVIDIA GPU, nvidia-container-toolkit 설치 필요)
    # runtime: nvidia
    # environment:
    #   - NVIDIA_VISIBLE_DEVICES=all
    #   - NVIDIA_DRIVER_CAPABILITIES=all # compute,utility,graphics,video,display 등 필요한 기능 추가

    # `--gpus` 옵션은 Docker Compose v3.8 이상에서만 지원되며,
    # `runtime: nvidia`와 함께 사용하거나 단독으로 사용 가능합니다.
    # 단독 사용 시에는 Docker Compose 파일의 최상위 level에
    # `x-ndv: "gpu"`와 같이 서비스 정의 외부에 추가 설정이 필요할 수 있습니다.
    # 여기서는 `runtime: nvidia`를 사용하는 것이 더 일반적입니다.
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all # 모든 GPU 사용
              capabilities: [gpu, compute, utility, graphics] # 필요한 기능 명시

    privileged: true
    network_mode: host
    ipc: host
    environment:
      - DISPLAY=${DISPLAY}
    volumes:
      - /tmp/.X11-unix:/tmp/.X11-unix:rw
      - /dev/video0:/dev/video0
      - ~/humble_ws:/root/ros_ws/ 
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

<br>

docker-compose 사용하여 docker container 접속 방법

```bash
# 1. 터미널에서 docker-compose.yaml 파일이 있는 디렉토리로 이동 

# 2. docker container 시작
$ xhost +local:docker # GUI 포워딩을 위해 X서버 접근 권한 부여
$ docker compose up-d # 백그라운드에서 실행

# 3. 컨테이너에 접속 
$ docker exec -it  humble_ws 
```

<br>

컨테이너 사용 후 이를 중지하고 제거하기 위해 아래 명령어 입력

```bash
$ docker compose down
```

<br>

### Reference

-----



- [ML-Docker-환경에서-GPU-사용하기](https://velog.io/@codeinsights/ML-Docker-%ED%99%98%EA%B2%BD%EC%97%90%EC%84%9C-GPU-%EC%82%AC%EC%9A%A9%ED%95%98%EA%B8%B0)

- [libnvidia-ml.so.1: cannot open shared object file: no such file or directory: unknown. 해결책 제시](https://jseobyun.tistory.com/515)
