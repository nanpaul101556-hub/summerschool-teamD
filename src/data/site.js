/** 대상지 제원과 법정 제약. null = 미확보 (화면에 「미확보」로 표시) */

export const SITE = {
  name: '중계문화공원 연계 건축물',
  address: '서울특별시 노원구 동일로 1229',
  coords: [37.6388, 127.0664],
  landArea: 22727, // m²  src: parkUse
  builtYear: 1990,
  parkType: '문화공원 (2025.12 근린공원에서 세분 변경)',

  // ── 법정 제약 — 미확보 ──
  zoning: null, // 용도지역
  bcr: null, // 건폐율 %
  far: null, // 용적률 %
  heightLimit: null, // m

  // ── 확보된 제도 조건 ──
  zebMandatory: false, // 500 m² 미만 → 의무 대상 아님
  zebNote: '노원구 자체 기준 500 m² 이상 (국가 로드맵보다 5년 선행)',
  greenRemodel: true, // 노유자시설 → 국비:지방비 7:3
  carbonPilot: true, // 탄소중립 선도도시 (수도권 유일)
  incentive: 'ZEB 적용 시 정비계획 입안 우선 검토',

  plannedArea: 200, // 기존 계획 실버카페 연면적 m²
}

/**
 * 상위계획 — RAG 대상 문서.
 * 목록만 나열하면 설계에 쓸 수 없다. 각 계획이 이 대상지에 무엇을 요구하는지까지 적는다.
 */
export const UPPER_PLANS = [
  {
    name: '노원구 제1차 탄소중립 녹색성장 기본계획',
    period: '2025–2034',
    src: 'nowonCarbon',
    demand: '신축 공공건축물의 에너지 자립 — ZEB 적용 시 정비계획 우선 검토',
  },
  {
    name: '2040 서울도시기본계획',
    period: '~2040',
    src: 'seoulPlan',
    demand: '보행 생활권 중심 — 도보 거리 안에서 생활서비스가 완결될 것',
  },
  {
    name: '2040 서울시 공원녹지 기본계획',
    period: '~2040',
    src: 'seoulPlan',
    demand: '공원의 기능 복합화 — 녹지를 줄이지 않고 시설을 얹을 것',
  },
  {
    name: '어르신친화도시 노원 제2기 종합계획',
    period: '2023–2027',
    src: 'nowonStat',
    demand: '고령자 접근성 — 무장애와 짧은 보행거리를 전제로 할 것',
  },
]

/**
 * 인구 추세가 가리키는 설계 방향.
 * 계획 문서가 아니라 자료에서 직접 나오는 요구다.
 */
export const TREND_DIRECTION = [
  {
    k: '고령화',
    v: '65세 이상 22.3% → 30.5%',
    demand: '초기 용도는 돌봄이지만, 그 수요도 세대교체와 함께 이동한다',
  },
  {
    k: '인구 감소',
    v: '서울 25개 자치구 중 1위',
    demand: '신설 시설은 미래의 유휴자산이 된다 — 전환 가능성이 곧 자산가치다',
  },
  {
    k: '용도 수명',
    v: '구조 30–300년 vs 평면 3–30년',
    demand: '수명이 다른 층위를 분리해야 한 층위만 바꿀 수 있다',
  },
]
