---
title: Docker로 ROS 개발 환경 구축하기
categories: Docker
tag: [Docker,ROS2,humble,개발환경 구축]
image: /assets/img/docker_logo.png
tyora-root-url: ../../
---



## ROS Image Download

------

Docker Hub에서 ROS Image를 찾아 다운 받을 수 있다. 

여러 ROS 버전 중 ROS2의 Humble을 사용하고자 하기에 해당 버전의 image를 pull을 통해 다운받았다. 

```bash
$ docker pull osrf/ros:humble-desktop-full
```

뿐만 아니라 ROS1의 noetic이나 melodic image를 다운 받고 싶다면 humble-desktop-full에서 humble대신 원하는 버전을 입력하면 된다. 

<br>

## Docker Container 생성

------

Docker Hub에서 원하는 버전의 ros Image를 다운 받았다면 이번에는 해당 이미지를 기반으로 container를 생성할 것이다. 

우선, 내가 원하는 개발환경에 맞는 Container를 생성하기 위해서 아래와 같이 docker run 명령어를 사용하되 몇가지 옵션을 추가할 것이다.

*(이중에는 사용하지 않을 옵션들이 있지만 이런 것도 있구나해서 이것저것 추가한 것이다.)*

```bash
$ docker run -it \
	--rm \
	--privileged \
	--env DISPLAY=$DISPLAY \
	-v /tmp/.X11-unix:/tmp/.X11-unix:rw \
	--device=/dev/video0:/dev/video0 \
	--ipc=host\
	-v humble_ws:/root/ros_ws/ \
	-w /root/ros_ws\
	--name humble_ws \
	osrf/ros:humble-desktop-full
```

위에서 사용한 여러 옵션에 대해 정리하면 아래와 같다. 



> [!NOTE]
>
> - **-it:** 해당 옵션은 -i와 -t가 합쳐진 옵션이다.
>
>   - -i (--interative): 연결되어 있지 않아도 STDIN을 열린 상태로 유지하여 외부 host에서도 컨테이너와 상호작용할 수 있게한다. 
>   - -t (--tty): pseudo TTY를 할당한다. 이를 통해 컨테이너 내에서 대화형 셀을 사용할 수 있다. 
>
> - **--rm:** 도커 컨테이너가 종료될 때 자동으로 컨테이너를 제거한다. 이를 통해 임시 컨테이너를 정리하고 시스템에 남아 있는 컨테이너가 쌓이는 것을 방지하는 데 좋다. 
>
> - **--privileged:** 컨테이너에 호스트 시스템에 대한 확장된 권한을 부여한다. 이는 컨테이너에 호스트의 루트 사용자에게만 일반적으로 허용되는 거의 모든 기능을 부여하기에 잠재적으로 보안에 취약할 수 있다. 
>
> - **--env DISPLAY=$DISPLAY**: 컨테이너 내부에 DISPLAY 환경 변수를 호스트의 DISPLAY환경 변수 값으로 설정한다. 이를 통해 ROS의 RVIZ나 rqt와 같은 GUI 도구를 시각적으로 화면에 출력할 수 있게 한다. 
>
> - **-v /tmp/.X11-unix:/tmp/.X11-unix:rw**: 
>
>   - **-v (--volume) [호스트에서의 DIR]:[컨테이너 내에서의 DIR] :** 호스트 filesystem에서의 파일을 도커 컨테이너 안에서도 사용할 수 있게 해당 경로를 마운트한다. 
>
>   -  여기서 **/tmp/.X11-unix**는 로컬 그래픽 연결을 위해 X 서버가 사용하는 유닉스 도메인 소켓을 포함한다.
>
>   - **rw**: 설정한 dir의 volume이 읽기/쓰기 권한으로 마운트되어 컨테이너와 호스트 간 서로 상호작용할 수 있도록 한다. 해당 옵션에서 rw를 추가한 이유는 --env DISPLAY와 함께 GUI (X11) 포워딩을 가능하게 할 수 있기 때문이다. 
>
>     *(GUI 포워딩은 도커 컨테이너 안에서 실행한 GUI 애플리케이션의 화면을 호스트에서 볼 수 있도록 하는 기술, 도커는 기본적으로 CLI(커맨드라인 인터페이스)에 최적화되어 있기 때문에, GUI를 띄우기 위해선 별도 설정이 필요)*
>
> - **--device:** 호스트의 특정 장치를 연결할 수 있도록 도커 컨테이너 안으로 매핑한다.
>
> - **--ipc=host**: IPC 네임스페이스를 호스트의 IPC 네임스페이스를 사용하도록 구성한다. 도커 컨테이너 내부의 프로세스가 공유 메모리, 세마포어, 메세지 큐를 사용하여 호스트의 프로세스와 통신할 수 있다.
>
>   (특히 성능이나 프로세스 간 통신을 위해 공유 메모리를에 의존하는 애플리케이션에 필요할 수 있다.)
>
> -  **-w** **[컨테이너 시작 dir]:**  컨테이너 내부의 **작업 디렉토리**를 `/root/ros_ws`로 설정한다. 
>
> - **--name** **[컨테이너 이름]:** 도커 컨테이너의 이름을 할당한다. 
>
> - **osrf/ros:humble-desktop-full**: 컨테이너를 생성하는 데 사용될 도커 image를 설정한다. 



## Dockerfile을 활용한 Custom Image 생성
