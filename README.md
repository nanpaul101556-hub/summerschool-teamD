# 적응형 건축 사전판정 · 프론트엔드

2026 KR–IT GSC Summer School · Team D

대상지를 입력하면 상위계획·제도 조건을 불러와, 인구 변화에 따라 용도가 바뀌는
건물의 최소 사양을 역산하고 Rhino 모델로 넘긴다.

대상지 — 중계문화공원 연계 건축물 (서울 노원구 동일로 1229)

## 화면

| | 화면 | 내용 |
|---|---|---|
| 01 | 입력 | 대상지 검색 |
| 02 | 대상지 | 지도(연결 예정) · 제원 · 적용 제도 · 시기별 용도 경로 · 상위계획 |
| 03 | Rhino | 역산 사양 전송 · 연결 상태 · 실행 기록 |

## 실행

```bash
npm install
npm run dev          # http://localhost:5173
```

## Rhino 연결

브라우저는 raw TCP 소켓을 열 수 없고 rhinomcp 는 `127.0.0.1:1999` 에서
**헤더 없는 JSON** 을 TCP 로만 받는다. 그래서 중계가 필요하다.

```
브라우저 ──HTTP :8787──▶ bridge/rhino-bridge.mjs ──TCP :1999──▶ rhinomcp ──▶ Rhino
```

```bash
node bridge/rhino-bridge.mjs   # 별도 터미널
```

Rhino 명령줄에서 `mcpstart` 를 먼저 실행해 둔다.

| 경로 | 하는 일 |
|---|---|
| `GET /health` | 브리지·Rhino 생존 확인 |
| `POST /command` | rhinomcp 명령 중계 |
| `POST /export` | 현재 문서를 3dm 으로 저장 → 내려받기 URL |
| `POST /capture` | 활성 뷰포트를 PNG 로 캡처 → 이미지 URL |
| `GET /file/<name>` | 위에서 만든 파일 전송 |

뷰포트는 영상 스트림이 아니라 **캡처를 주기적으로 갱신**하는 방식이다.
캡처와 전송에 시간이 걸려 회전을 실시간으로 따라오지 못한다(실측 2초 간격).

검증된 rhinomcp 명령 (0.3.2):

| 명령 | 파라미터 |
|---|---|
| `get_document_summary` | — |
| `execute_rhinoscript_python_code` | `code` |

### 보안

브리지는 `127.0.0.1` 에만 바인딩하고 루프백 오리진만 허용한다 — 로컬 전용이다.
이 브리지는 Rhino 안에서 **임의의 파이썬을 실행**시킬 수 있으므로, 외부에
노출하면 접근한 누구나 이 컴퓨터에서 코드를 돌릴 수 있게 된다. 포트포워딩이나
`0.0.0.0` 바인딩을 하지 말 것.

사양은 미터인데 문서 단위는 다를 수 있어(현재 대상 문서는 mm)
스크립트가 `rs.UnitScale` 로 환산한 뒤 그린다. 생성물은 기존 `SUPPORT_*`
레이어와 섞이지 않도록 `SUPPORT_AUTO` 레이어에 올린다.

## 구조

```
src/
├── data/        대상지 · 인구 · 시설 · 용도별 요구성능 · 출처 등록부
├── lib/         법정한계 · 시간보간 · 격차판정 · 역산 · Rhino 통신
├── components/  Landing · SiteView · RhinoView
└── styles/      tokens.css
```

## 자료 원칙

모든 수치에 출처를 붙이고, 확보하지 못한 값은 추정으로 메우지 않고
「미확보」로 표시한다. 인구추계처럼 공표된 값은 단언하고, 산업 변화처럼
예측 불가한 것은 조건부 시나리오로만 적는다.

현재 미확보 — 용도지역 · 건폐율 · 용적률 · 시설 좌표 · G-SEED 배점표.
용도별 하중·층고·전력은 통상값 추정치이며 KDS 41 12 00 확보 시 교체한다.

## 스택

Vite · React 19 · JavaScript (TypeScript 미사용) · CSS 커스텀 프로퍼티
