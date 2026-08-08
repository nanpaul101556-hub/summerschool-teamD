/** 대상지 제원과 법정 제약. null = 미확보 (화면에 「미확보」로 표시) */

export const SITE = {
  name: '중계문화공원 연계 건축물',
  address: '서울특별시 노원구 동일로 1229',
  coords: [37.6388, 127.0664],
  landArea: 22727, // m²  src: parkUse
  builtYear: 1989, // 노원구의회 제245회 행정재경위 회의록 (2018.08.22) — 「1989년 건립」
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
    name: {
      ko: '노원구 제1차 탄소중립 녹색성장 기본계획',
      it: 'Primo piano per la neutralità carbonica del distretto di Nowon',
    },
    period: '2025–2034',
    src: 'nowonCarbon',
    demand: {
      ko: '신축 공공건축물의 에너지 자립 — ZEB 적용 시 정비계획 우선 검토',
      it: 'Autonomia energetica per i nuovi edifici pubblici — con lo standard ZEB il piano attuativo ha corsia preferenziale',
    },
  },
  {
    name: { ko: '2040 서울도시기본계획', it: 'Piano urbanistico generale di Seoul 2040' },
    period: '~2040',
    src: 'seoulPlan',
    demand: {
      ko: '보행 생활권 중심 — 도보 거리 안에서 생활서비스가 완결될 것',
      it: 'Città di prossimità — i servizi quotidiani devono essere raggiungibili a piedi',
    },
  },
  {
    name: { ko: '2040 서울시 공원녹지 기본계획', it: 'Piano del verde urbano di Seoul 2040' },
    period: '~2040',
    src: 'seoulPlan',
    demand: {
      ko: '공원의 기능 복합화 — 녹지를 줄이지 않고 시설을 얹을 것',
      it: 'Parchi multifunzionali — aggiungere servizi senza sottrarre superficie verde',
    },
  },
  {
    name: {
      ko: '어르신친화도시 노원 제2기 종합계획',
      it: 'Secondo piano per una città a misura di anziano — Nowon',
    },
    period: '2023–2027',
    src: 'nowonStat',
    demand: {
      ko: '고령자 접근성 — 무장애와 짧은 보행거리를 전제로 할 것',
      it: 'Accessibilità per gli anziani — assenza di barriere e percorsi pedonali brevi come presupposto',
    },
  },
]

/**
 * 인구 추세가 가리키는 설계 방향.
 * 계획 문서가 아니라 자료에서 직접 나오는 요구다.
 */
export const TREND_DIRECTION = [
  {
    k: { ko: '고령화', it: 'Invecchiamento' },
    v: { ko: '65세 이상 22.3% → 30.5%', it: 'Over 65 dal 22,3% al 30,5%' },
    demand: {
      ko: '초기 용도는 돌봄이지만, 그 수요도 세대교체와 함께 이동한다',
      it: 'La prima destinazione è l\'assistenza, ma quella domanda si sposta con il ricambio generazionale',
    },
  },
  {
    k: { ko: '인구 감소', it: 'Calo demografico' },
    v: { ko: '서울 25개 자치구 중 1위', it: 'Primo fra i 25 distretti di Seoul' },
    demand: {
      ko: '신설 시설은 미래의 유휴자산이 된다 — 전환 가능성이 곧 자산가치다',
      it: 'Una nuova struttura rischia di diventare un bene inutilizzato: la convertibilità è essa stessa valore patrimoniale',
    },
  },
  {
    k: { ko: '용도 수명', it: 'Durata degli strati' },
    v: {
      ko: '구조 30–300년 vs 평면 3–30년',
      it: 'Struttura 30–300 anni · distribuzione interna 3–30 anni',
    },
    demand: {
      ko: '수명이 다른 층위를 분리해야 한 층위만 바꿀 수 있다',
      it: 'Separare strati con vita utile diversa è ciò che permette di sostituirne uno solo',
    },
  },
]

/**
 * 01 이 남기는 한 줄 — 왜 「바꿔 쓰기」가 가능한가.
 * 나머지 트렌드는 02 가 원문과 함께 다룬다.
 */
export const LIFESPAN = TREND_DIRECTION.find((d) => d.k.ko === '용도 수명')
