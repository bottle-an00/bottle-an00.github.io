---
title: ROS1 bagfile을 ROS2 bagfile로 전환
image: /assets/img/ROS2_logo.png
categories: ROS2/tools
tag: [ROS2, bagfile_convertor]
typora-root-url: ../../../
---

---

> ROS 1과 ROS2에서의 bagfile의 형식이 다르다. 
>
> 따라서 만약 이전에 Inoiq 5에서 취득한 ROS1 bagfile을 ROS2에서도 사용하고 싶으면 형식이 다르기 때문에 적절히 변환해주는 작업이 필요하다. 
>
> 이때 활용해 볼 수 있는 것이  Rosbag Convertor Tool이다. 

# [Rosbags](https://ternaris.gitlab.io/rosbags/#rosbags)

### ROS 1과 ROS 2 Bagfile 형식의 주요 차이점 



| 특징                        | ROS 1 (rosbag)                       | ROS 2 (rosbag2)                                              |
| --------------------------- | ------------------------------------ | ------------------------------------------------------------ |
| **도구**                    | `rosbag` 명령줄 도구 및 `rqt_bag`    | `ros2 bag` 명령줄 도구                                       |
| **파일 구조**               | `.bag` 확장자의 단일 파일            | 디렉토리 (내부에 `.db3`, `.mcap` 파일 및 `metadata.yaml` 포함) |
| **기본 저장 형식**          | 커스텀 이진 형식                     | SQLite3 (이전), MCAP (ROS 2 Iron부터 기본)                   |
| **메시지 시리얼라이제이션** | ROS 1 자체 형식                      | CDR (Common Data Representation)                             |
| **데이터 접근**             | 순차적 접근, 인덱싱 효율 제한        | 인덱싱 효율 개선, 빠른 탐색 지원 (특히 MCAP)                 |
| **파일 크기 관리**          | 단일 파일, 대용량 시 비효율적        | 파일 분할 기록 지원, 디렉토리 기반 관리                      |
| **확장성**                  | 제한적                               | 플러그인 기반 아키텍처로 다양한 저장 백엔드 지원             |
| **호환성**                  | ROS 1 전용, ROS 2에서 직접 재생 불가 | ROS 2 전용, ROS 1 Bagfile 변환 도구 제공 (rosbag2_bag_v2)    |

<br>

## **설치 방법**

```bash
$ pip install rosbags
```

<br>

## **ROS2 bag -> ROS1 bag**

```bash
$ rosbags-convert {변환하고픈 bagfile dir} # 디렉토리 형식이므로 ROS2의 bag directory임을 알 수 있다. 
#뒤에 아무것도 입력하지 않으면 입력한 이름으로 새롭게 ROS1 bagfile로 생성됨
```

```bash
$ rosbags-convert  --src {변환하고픈 bagfile dir} --dst {생성하고자 하는 ROS1 bagfile 이름}.bag
```

<br>

## **ROS1 bag -> ROS2 bag**

```bash
$ rosbags-convert {변환하고픈 bagfile}.bag # 디렉토리 형식이므로 ROS1의 bagfile임을 알 수 있다. 
#뒤에 아무것도 입력하지 않으면 입력한 이름으로 새롭게 ROS2 bag directory로 생성됨
```

```bash
$ rosbags-convert  --src {변환하고픈 bagfile}.bag --dst {생성하고자 하는 ROS1 bagfile dir}
```

