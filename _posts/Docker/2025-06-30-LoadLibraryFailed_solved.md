---
title: load library failed libnvidia-ml.so.1 문제 해결
categories: Docker
tag: [docker,trouble shooting]
image: /assets/img/docker_logo.jpeg
typora-root-url: ../../
---

---

> [발생한 문제]
>
> nvidia에서 제공한 이미지를 활용해 Local GPU를 도커 컨테이너에 연결하고자 하였으나 컨테이너를 실행하면 다음과 같은 에러가 발생하였다. 
>
> ![image (1)](/assets/images/2025-06-30-LoadLibraryFailed_solved/image (1).png)
>
> ```bash
> docker: Error response from daemon: failed to create shim task: OCI runtime create failed: runc create failed: unable to start container process: error during container init: error running hook #0: error running hook: exit status 1, stdout: , stderr: Auto-detected mode as 'legacy'
> nvidia-container-cli: initialization error: load library failed: libnvidia-ml.so.1: cannot open shared object file: no such file or directory: unknown.
> ```
>
> 이전 포스팅에서는 이러한 에러의 해결 방안으로 단순히 "도커 재설치"를 언급하였으나 적합한 해결책을 찾아 이를 정리하고자 한다. 

<br>

이전에 위의 에러가 발생한 상황

{% include link_card.html post_path="Docker/2025-06-14-DockerLocalGPUConnection.md" %}

## **문제 상황에 대한 추가적 설명**

----

다른 블로그들을 살펴보면 같은 에러가 발생하는 경우 주로 nvidia driver가 설치되지 않아 발생하던 문제였다. 

하지만, 나의 경우는 아래와 같이 Host PC에서 터미널에 nvidia-smi를 입력했을 때 CUDA version과 Local GPU에 대한 정보가 출력된 것을 보아 nvidia driver는 문제없이 설치되어있었다. 

![image-20250630215803187](/assets/images/2025-06-30-LoadLibraryFailed_solved/image-20250630215803187.png)

<br>

## **해결방안: "--runtime=nvidia 옵션"** 

----

docker run 명령어로 입력하는 경우 아래와 같이 옵션을 추가해주면 위의 에러 발생없이 Local GPU를 docker container에 연결할 수 있다.

```bash
--runtime=nvidia
```

docker-compose.yaml 파일은 아래와 같이 구성하면 에러를 해결할 수 있다. 

```yaml
services:
  humble_ws:
    image: humble-gpu-env:latest
    container_name: humble_ws
    
    runtime: nvidia
    environment:
      - DISPLAY=${DISPLAY}
      - NVIDIA_VISIBLE_DEVICES=all
      - NVIDIA_DRIVER_CAPABILITIES=all # compute,utility,graphics,video,display 등 필요한 기능 추가

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
    volumes:
      - /tmp/.X11-unix:/tmp/.X11-unix:rw
      - /dev/video0:/dev/video0
      - .:/root/ros_ws
    working_dir: /root/ros_ws
    
    # 컨테이너가 시작될 때 자동으로 실행할 명령 (Dockerfile CMD를 오버라이드)
    # `docker run`의 `--entrypoint` 또는 CMD와 유사
    command: ["/bin/bash", "-c", "tail -f /dev/null"] 

# 명명된 볼륨 정의 (컨테이너 간 데이터 공유 또는 영구 저장용)
volumes:
  humble_ws:
    # driver: local # 로컬 파일 시스템 드라이버 (기본값)
    # name: custom_humble_ws_volume # 볼륨 이름 명시 (선택 사항)
```

<br>

## **Reference**

----

[Error occuring in release 1.14.4: load library failed: libnvidia-ml.so.1: cannot open shared object file](https://github.com/NVIDIA/nvidia-container-toolkit/issues/305)
