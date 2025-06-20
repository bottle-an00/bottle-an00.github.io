---
title: dangling docker image 생성 원인과 삭제 방법
categories: Docker
tag: [Docker, dangling docker imag,trouble shooting] 
image: /assets/img/docker_logo.jpeg
typora-root-url: ../../
---

----



> **[발생한 문제]**
>
> docker로 이것저것 해보다 보니 아래와 같이 docker images 명령어를 입력했을 때
>
> ![image](/assets/images/2025-06-15-DanglingImages/image.png)
>
> 위의 그림과 같이 <none>:<none> image가 생긴것을 볼 수 있다. 
>
> 이번 포스트에서는 해당 이미지가 무엇인지, 왜 생기는지, 어떻게 삭제하는지를 정리할 것이다. 

----

<br>

### **`<none>:<none>` 이미지, 즉 Dangling Image란?**

----

`REPOSITORY`와 `TAG`가 모두 `<none>`으로 표시되는 이미지를 Docker에서는 **"Dangling Image" (매달려 있는 이미지)**라고 부른다. 이름 그대로 어디에도 "매달려 있지 않은", 즉 **어떤 컨테이너도 참조하고 있지 않으며, 현재 유효한 태그도 할당되어 있지 않은 이미지 레이어들**을 의미한다.

<br>



### **`<none>:<none>` 이미지(Dangling Image)가 생성되는 이유**

----

이러한 Dangling Image는 주로 다음의 경우에 생성된다.

1. **이미지 재빌드 또는 업데이트 **:

   이것이 Dangling Image가 생기는 가장 주된 원인이다. 

   만약 기존에 `my-app:latest`라는 태그를 가진 이미지가 있다고 가정해 보자. Dockerfile을 수정하고, 동일한 태그(`my-app:latest`)로 이미지를 다시 빌드하면, Docker는 새로운 Dockerfile 내용으로 새 이미지를 만들고 이 새 이미지에 `my-app:latest` 태그를 부여한다.

   이때, **이전의 `my-app:latest` 이미지는 더 이상 어떤 태그도 가지지 못하게 된다.** 이렇게 태그를 잃어버린 이미지가 바로 `<none>:<none>` 상태가 되는 것이다.

   <br>

2. **빌드 과정 중 실패한 중간 레이어:** Docker 이미지는 여러 겹의 레이어로 구성된다. Dockerfile의 각 `RUN`, `COPY`, `ADD` 명령은 새로운 레이어를 생성한다. 만약 이미지 빌드 도중에 오류가 발생하여 빌드가 완전히 완료되지 않으면, 그 시점까지 생성된 중간 레이어들은 최종 이미지에 연결되지 못한 채로 `<none>:<none>` (Dangling Image) 상태로 남아있을 수 있다.

   <br>

3. **명시적인 태그 삭제:** 드문 경우지만, `docker rmi my-image:old-tag`와 같이 특정 태그만 삭제하고 해당 이미지가 다른 태그를 가지고 있지 않다면, 그 이미지는 `<none>:<none>` 상태가 될 수 있다.

<br>

### **Dangling Image ( `<none>:<none>` 이미지) 삭제 방법**

----

Dangling Image는 실제로는 어떤 컨테이너나 다른 이미지에서도 참조되지 않는 **사용되지 않는 이미지 레이어**이다. 이들은 디스크 공간을 계속 차지하므로, 주기적으로 정리해 주는 것이 좋다.

삭제하는 올바른 방법은 다음과 같다.

1. **`docker image prune` 명령어 사용 :** 이 명령어가 바로 Dangling Image를 삭제하기 위해 만들어진 명령어이다. Docker가 자동으로 더 이상 사용되지 않는 모든 Dangling Image를 찾아 제거해 준다.

   Bash

   ```bash
   $ docker image prune
   ```

   이 명령어를 실행하면 삭제될 이미지 목록을 보여주고 삭제를 진행할지 물어볼 것이다. `y`를 입력하고 엔터를 누르면 삭제가 진행된다.

2. **특정 `<none>` 이미지의 ID로 삭제:** 만약 특정 `<none>` 이미지 하나만 선택적으로 삭제하고 싶다면, `docker images` 명령어로 해당 이미지의 **`IMAGE ID`**를 확인한 후, 그 ID를 사용하여 삭제할 수 있다.

   Bash

   ```bash
   $ docker images
   ```

   위 명령어로 출력된 목록에서 `REPOSITORY`와 `TAG`가 `<none>:<none>`인 이미지의 `IMAGE ID`를 찾는다. 예를 들어, `dd6a0b2444ff`라고 가정해 보자.

   Bash

   ```bash
   $ docker rmi dd6a0b2444ff
   ```

<br>

### **Reference**

- [Prune unused Docker objects](https://docs.docker.com/engine/manage-resources/pruning/)

- [docker image rm](https://docs.docker.com/reference/cli/docker/image/rm/)
