---
title: Rviz_satellite로 원하는 지역을 지도 시각화하기
image: /assets/img/ROS2_logo.png
categories: ROS2/tools
tag: [ROS2, RVIZ, rviz_satellite]
typora-root-url: ../../../
---

----

## Rviz2 관련 유용한 플러그인: Rviz_satellite

패스트 캠프 강의 중 rviz에 대해 설명을 하면서 소개한 플러그인이다. 

이전에 송도 센트럴 파크 근처 LiDAR SLAM을 수행하고 만들어진 PCD Map을 검증하는 과정에서 유용하게 사용될 것 같아 따로 포스팅하여 내가 원하는 지역을 시각화하는 방법도 함께 정리하고자 한다. 

더 자세히 설명해보면 이전 검증 과정에서 기존에  다른 업체에게 맡겨 제작된 송도 센트럴 파크 근처 HD Map를 활용하였는데 이때 신호등의 위치를 기준으로 비교 분석하였다. 

하지만, 시각화하는 과정에서 해당 부분이 어딘지 확실히 표현하는 것이 좋겠음을 느꼈었는데 Rviz_satellite Plugin이 이를 해결해줄 수 있을 것 같다.

<br> 

## **설치 방법**

---

```bash
$ sudo apt install ros-humble-rviz-satellite
```

[rviz_satellite](https://github.com/nobleo/rviz_satellite)

<br>

## **실행 방법**

---

Github Readme를 보면

- OpenStreetMap
- TomTom
- Mapbox

위의 3가지를 지원하는 것으로 소개되어 있다. 이때 TomTom과 Mapbox는 token이 한정되어 있기 때문에 제일 만만한 OpenStreetMap을 활용하자. 

Rviz_satellite를 활용하기 위해서 아래의 과정을 거친다. 

1. 우선 OpenStreetMap에 접속하여 내가 시각화하고 싶은 지역의 위도와 경도를 알아낸다. 

   나는 내가 근무하고 있는 중학교 근처의 위도와 경도를 알아냈다. 

   ![image (3)](/assets/images/2025-06-30-RvizSatellite/image (3).png)

2. rviz2를 실행하고 지도 관련 data를 publish 할 node를 실행한다. 이때 1번에서 알아낸 위도와 경도를 인자로 입력한다. 

```bash
$ rviz2
$ ros2 run rviz_satellite publish_demo_data {내가 원하는 위도} {내가 원하는 경도}
```

3. rviz에서 Add를 통해 AerialMap을 추가한다. 그리고, Topic을 /fix로 수정하고 Object URL을 "https://tile.openstreetmap.org/{z}/{x}/{y}.png"로 설정한다. *(이때 z,x,y에 값을 입력할 필요 없다.)*

![image (4)](/assets/images/2025-06-30-RvizSatellite/image (4).png)
