---
title: 코드 복사 붙여 넣기 후 공백 제거::Highlight trailing white spaces
image: /assets/img/vscode_logo.jpeg
categories: VSCode
tag: [Extension, VSCode, trailing white spaces]
typora-root-url: ../../
---

----

> **[발생한 문제]**
>
> build된 docker image를 기반으로 docker run 명령어로 docker container를 생성할 때 dockerfile에 해당 명령어를 복사 붙여넣기 했었다. 
>
> ```bash
> $ docker run -it --rm \
> 	--privileged \
> 	--env DISPLAY=$DISPLAY \ 
> 	--network host \
> 	-v /tmp/.X11-unix:/tmp/.X11-unix:rw \
> 	--ipc=host \
> 	-v humble_ws:/root/ros_ws/ \
> 	-w /root/ros_ws \
> 	--name humble_ws \
> 	osrf/ros:humble-desktop-full
> ```
>
> 위의 코드를 그대로 복사 붙여넣기 하면 문제가 발생할 것이다.
>
> 이번 포스팅에서는 발생한 문제의 원인을 알아보고 이러한 원인을 없애주는 VSCode의 편리한 툴을 알아볼 것이다.
>
> 물론 docker-compose를 사용하면 편리하고 좋지만, 언제 같은 이유로 에러가 발생할 수도 있으니 편리한 툴을 저장해두겠다. 

----

<br>

## **발생한 문제**

----



![image-20250630225554408](/assets/images/2025-06-30-TrailingWhiteSpaces/image-20250630225554408.png)

위와 같이 내가 작성한 docker run명령어가 모두 입력되지 않는다는 점이다. 

<br>

## **문제 원인:: 공백 문자**

----

```
--env DISPLAY=$DISPLAY \ 
```

여기에 제일 끝에 공백문자가 들어있는 것을 볼 수 있다. 

이 때문에 모든 docker run 옵션이 입력되지 않았던 문제가 발생한 것이다. 

<br>

## VSCode :: Trailing White Spaces

크게 문제될 상황이 발생하지 않을 수도 있지만 이렇게 갑자기 뜬금없이 이러한 이유로 평소에 돌아가던 것이 작동되지 않으면 큰 스트레스를 받는다. 

이러한 공백문자를 찾아서 제거해주는 편리한 툴이 VSCode Extensions에 존재한다. 

`Highlight trailing white spaces`를 설치하자

![image-20250630230140855](/assets/images/2025-06-30-TrailingWhiteSpaces/image-20250630230140855.png)

<br>

### **사용  방법**

----

파일에 공백문자를 제거하기 위해  `Highlight trailing white spaces`를 사용하는 방법을 알아보자

우선, `Highlight trailing white spaces`를 설치했다면 아래 화면과 같이 공백문자가 존재한다면 빨간색으로 표시된다. 

![image-20250630230658940](/assets/images/2025-06-30-TrailingWhiteSpaces/image-20250630230658940.png)

이를 제거하기 위해서 `F1`키를 눌러 `Trim Trailing Whitespace`를 선택하면 빨갛게 표시되었던 공백문자들이 제거된다. 

![image-20250630230732066](/assets/images/2025-06-30-TrailingWhiteSpaces/image-20250630230732066.png)

