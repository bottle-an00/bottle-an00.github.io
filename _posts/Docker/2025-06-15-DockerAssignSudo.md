---
title: Docker에 Sudo 권한 부여
categories: Docker
tag: [Docker,sudo] 
image: /assets/img/docker_logo.jpeg
typora-root-url: ../../
---

----

> **[이 포스팅을 작성하는 이유]**
>
> "이전 포스팅 중 Docker container에 Local GPU를 연결하는 도중 에러가 발생하여 docker를 재설치 하였다. 
>
> 하지만, 이 과정에서 docker관련된 내용을 전부 삭제되어 sudo 권한 부여에 대한 것도 삭제되었다.  
>
> 이렇게 docker를 사용하면서 에러가 발생하였을 때 해결할 수 있으면 정말 다행이겠지만, 피치못할 사정으로 인해 docker를 삭제해야한다면 다시 설치해야겠지..? 
>
> 따라서, 이번 기회에 해당 내용을 정리해두어 필요할 때 사용하도록 하겠다."

----



<br>

### **Docker를 설치할 때 왜 명령어 앞에 sudo를 붙여야 할까?**

----

Docker는 기본적으로 **데몬(daemon)** 방식으로 작동한다. 데몬은 백그라운드에서 실행되며 시스템 작업을 처리하는 프로그램이다. Docker 데몬은 컨테이너 생성, 실행, 관리 등 모든 핵심 작업을 담당한다.

문제는 이 Docker 데몬이 **루트(root) 권한**으로 실행된다는 점이다. 일반 사용자가 Docker 데몬에 직접 명령을 내리려면, 해당 명령어를 실행할 때도 루트 권한이 필요하다. `sudo` 명령어는 일반 사용자에게 일시적으로 루트 권한을 부여하는 역할을 하므로, `sudo docker ...`와 같이 사용해야만 Docker 데몬과 통신하여 명령을 수행할 수 있게 된다.

이는 시스템 보안을 위한 조치이기도 하다. Docker를 통해 컨테이너를 실행하면 호스트 시스템의 자원에 접근할 수 있는 강력한 권한을 가질 수 있기 때문에, 아무나 Docker를 실행하지 못하도록 기본적으로 루트 권한을 요구하는 것이다.

<br>

### **sudo 없이 Docker 명령어 사용하는 방법 **

----

<br>

#### 1. docker 그룹 확인 및 생성

대부분의 경우 Docker를 설치하면 `docker` 그룹이 자동으로 생성된다. 혹시 모르니 확인해 본다.

```bash
$ grep docker /etc/group
```

만약 아무것도 출력되지 않는다면, 다음 명령어로 `docker` 그룹을 수동으로 생성한다.

```bash
$ sudo groupadd docker
```

<br>

#### **2. 현재 사용자를 `docker` 그룹에 추가**

이제 현재 로그인된 사용자를 `docker` 그룹에 추가한다. `[사용자명]` 부분에는 본인의 사용자 이름을 입력해야 한다. 현재 사용자 이름은 `whoami` 명령어로 확인할 수 있다.

```bash
$ sudo usermod -aG docker [사용자명]
```

위의 결과 docker가 잘 추가 되었는지 확인하라면 아래 명령어를 입력한다. 

```bash
$ groups [사용자명]
```

![image-20250615202156777](/assets/images/2025-06-15-DockerAssignSudo/image-20250615202156777.png)

위의 그림과 같이 jba(사용자명)에 docker가 포함되어 있으면 잘 추가된 것이다. 

<br>

#### **3. 세션 재시작**

그룹 변경 사항은 현재 로그인된 세션에 바로 적용되지 않는다. 

변경 사항을 적용하려면 **로그아웃했다가 다시 로그인하거나, 시스템을 재부팅**해야 한다. 

<br>

### **Reference**

----

- [[Manage Docker as a non-root user](https://docs.docker.com/engine/install/linux-postinstall/#manage-docker-as-a-non-root-user)](https://docs.docker.com/engine/install/linux-postinstall/)

