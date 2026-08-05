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

/** 상위계획 — RAG 대상 문서 */
export const UPPER_PLANS = [
  { name: '노원구 제1차 탄소중립 녹색성장 기본계획', period: '2025–2034', src: 'nowonCarbon' },
  { name: '2040 서울도시기본계획', period: '~2040', src: 'seoulPlan' },
  { name: '2040 서울시 공원녹지 기본계획', period: '~2040', src: 'seoulPlan' },
  { name: '어르신친화도시 노원 제2기 종합계획', period: '2023–2027', src: 'nowonStat' },
]
