/**
 * 출처 레지스트리.
 * 화면의 모든 수치는 이 표의 id를 참조한다.
 * grade: 3 = 공표 통계·법정기준 / 2 = 학술·2차자료 / 1 = 추정 (화면에 경고 표시)
 */

export const SOURCES = {
  nowonStat: { label: '노원구 2024 통계연보', year: 2024, grade: 3 },
  nowonPop: { label: '노원구청 인구통계 (노원신문)', year: 2024, grade: 3 },
  seoulProj: { label: '서울시 자치구별 장래인구추계 2020–2040', year: 2021, grade: 3 },
  nowonCarbon: { label: '노원구 제1차 탄소중립 녹색성장 기본계획', year: 2025, grade: 3 },
  seoulPlan: { label: '2040 서울도시기본계획', year: 2023, grade: 3 },
  certGuide: { label: '친환경건축물 인증제도 가이드북', year: 2025, grade: 3 },
  repairCycle: { label: '시설물의 안전 및 유지관리 실시 등에 관한 지침 [별표15] 시설물 표준 수선주기', year: 2025, grade: 3 },
  bldgInspect: { label: '건축물관리법 제13조 · 시설물안전법 (점검 주기)', year: 2025, grade: 3 },
  zebCost: { label: '제로에너지건축물 공사비 증가분 산출 (KAIS 22-1)', year: 2021, grade: 2 },
  parkUse: { label: '노인친화공원 이용행태 분석 (한국도시설계학회지 25-2)', year: 2024, grade: 2 },
  walkDist: { label: '노인친화형 공원 유치거리 (조현주·이순주)', year: 2019, grade: 2 },
  teamSurvey: { label: '팀 현장조사', year: 2026, grade: 2 },
  estimate: { label: '통상값 추정 — 근거 미확보', year: null, grade: 1 },
}

/** 미확보 데이터 목록 — 화면에서 「미확보」로 노출한다 */
export const MISSING = {
  zoning: '용도지역 · 건폐율 · 용적률 (토지이음 API)',
  facilityCoords: '복지시설 좌표 (공공데이터포털)',
  isochrone: '등시권 폴리곤 (OpenRouteService)',
  liveLoad: '용도별 활하중 (KDS 41 12 00)',
  opCost: '시설 운영비 · 결산 (노원구 예산서)',
  certScore: '인증 배점표 (G-SEED · ZEB)',
}
