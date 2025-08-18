---
title: Notion Paper Manager
categories: Project
tag: [Notion, Docling, 논문 정리, figure 자동 추출, table 자동 추출] 
image: /assets/img/notion_icon.png
typora-root-url: ../../
---

----

> [Project 배경 및 필요성]
>
> 2025년 2학기 복학과 함께 **학부연구생** 활동을 시작하게 되었다. 연구 초기 교수님과의 면담을 통해 논문을 단순히 읽는 것에 그치지 않고, **논문의 Figure와 Table을 체계적으로 저장·활용하는 것의 중요성**을 깨닫게 되었다.
>
> 그러나 실제 연구 과정에서는 각 논문의 Figure와 Table을 일일이 추출하여 저장하는 작업이 반복적이고 번거로운 일이었다. 더구나 이러한 자원들이 연구의 핵심 아이디어를 담고 있음에도 불구하고, 별도의 관리 도구 없이 산발적으로 보관되다 보니 재활용이나 참고가 어려운 문제가 있었다.
>
> 이에 따라 기존에 사용하던 **Notion을 논문 관리의 중심 플랫폼**으로 삼고, 논문 PDF에서 Figure와 Table을 자동으로 추출한 뒤 곧바로 Notion Database에 업로드하여 관리할 수 있는 애플리케이션을 제작하고자 하였다. 이를 통해 **연구 효율성을 높이고, 반복 작업을 줄이며, 체계적인 논문 관리 시스템**을 구축하는 것이 본 프로젝트의 출발점이 되었다.

<br>

## Notion Paper Manager란?

논문의 figure와 table 뿐만 아니라 제목, 저자, 연도 등의 내용을 추출하여 노션의 database에 upload 하는 자동화 tool이다.

(하나하나 직접 정리하는게 귀찮아서 만들었다...)

![PDF_to_Notion](/assets/images/2025-08-18-NotionPaperMananger/PDF_to_Notion.png)

- **Docling**을 활용해 논문 PDF에서 **Figure와 Table**을 추출.
- ArXiv API, pypdf 등을 이용해 논문 메타데이터(제목, 저자, 연도) 자동 수집.
- 정리된 자료를 **Notion Database**에 추가.

#### <i class="fa-brands fa-square-github"></i>[Notion Paper Manager Github 주소](https://github.com/bottle-an00/Notion-Paper-Manager)

<br>

## Notion Paper Manager 파일 구조

``` bash
Notion-Paper-Manager/
│
├── data/                     # 데이터(논문 pdf) 저장소
├── image/                    # Readme에 사용되는 이미지 관련 리소스 저장 디렉토리
├── output/                   # 출력 결과물 저장 디렉토리 (local에서 각 논문의 figure와 table)
│
├── src/notion_paper_manager/ # 핵심 패키지 디렉토리
│
├── test/                     # 테스트 코드
│
├── .env.example              # 환경변수 설정 예시 파일
├── .gitignore                
├── .python-version           
│
├── README.md                 # 프로젝트 개요, 설치 및 사용 방법 등 문서
├── main.py                   # 실행 진입점: 파이프라인 전체 제어
└── requirements.txt          # 의존 패키지 목록

```

<br>

## 사용 방법 및 Notion Database 연결

Notion Paper Manager를 사용하기 위한 Notion Database 설정 및 사용법 등은 위의 **Github 링크**에 자세히 적어 두었다. 

