/**
 * 지평마다 「그 숫자가 어느 문서에서 나왔는가」.
 *
 * 3 · 10 · 20년은 우리가 고른 숫자가 아니다. 그 사실을 말로만 적어 두면
 * 발표에서 「그래서 근거가 뭐냐」를 다시 받는다. 그래서 카드 안에
 * 항목 — 값 — 출처를 그대로 붙인다.
 *
 * 여기 실린 것은 전부 원문에서 확인한 것이다.
 *   법령      건축물관리법 제13조③ · 법인세법 시행규칙 별표5
 *   상위계획  노원구 탄소중립녹색성장 기본계획 2025–2034 (docs/LAWSPaper, RAG 인덱스)
 *   이 건물   노원구의회 회의록 · 노원구 세출예산
 *
 * 확인하지 못한 것은 싣지 않는다. 설비의 마지막 교체일이 그렇다 —
 * 교체 주기 15년은 상위계획 p.106 에 있으나 이 건물의 마지막 교체일은
 * 확인하지 못해 기준일을 준공(1989)으로 두고, 그 사실을 각주에 적는다.
 */

const K = (ko, it, en) => ({ ko, it, en })

/** 되풀이해 쓰는 출처 — 문서명을 한 곳에서 고친다 */
const PLAN = K(
  '노원구 탄소중립녹색성장 기본계획 2025–2034',
  'Piano quadro per la neutralità carbonica di Nowon 2025–2034',
  'Nowon Carbon Neutrality & Green Growth Master Plan 2025–2034',
)

/**
 * 지평별 근거. k 가 무엇을, v 가 값을, s 가 출처를 든다.
 * doc 이 있으면 출처 앞에 문서명이 붙는다.
 */
export const HZ_SOURCES = {
  short: [
    {
      k: K('정기점검 주기', 'Ciclo di controllo', 'Statutory inspection cycle'),
      v: K('3년', '3 anni', '3 years'),
      s: K('건축물관리법 제13조③', 'Legge sulla gestione degli edifici, art. 13 c.3',
        'Building Management Act, art. 13(3)'),
    },
    {
      k: K('ZEB 로드맵 1구간', 'Prima fascia della roadmap ZEB', 'ZEB roadmap, first band'),
      v: K('2025–2029', '2025–2029', '2025–2029'),
      doc: PLAN,
      s: 'p.96–97',
    },
    {
      k: K('이 안에 드는 물리 만기', 'Scadenze fisiche nel periodo', 'Physical due dates inside'),
      v: K('0건', 'nessuna', 'none'),
      s: K('내장 2031 · 설비 2034 · 구조 2039',
        'Finiture 2031 · impianti 2034 · struttura 2039',
        'Fit-out 2031 · plant 2034 · structure 2039'),
    },
  ],

  mid: [
    {
      k: K('설비 교체주기', 'Ciclo di sostituzione impianti', 'Plant replacement cycle'),
      v: K('15년 · 보일러 · 배관 · 열교환기',
        '15 anni · caldaia, tubazioni, scambiatore',
        '15 years · boiler, piping, heat exchanger'),
      doc: PLAN,
      s: 'p.106',
    },
    {
      k: K('상위계획 기간', 'Orizzonte del piano sovraordinato', 'Master-plan horizon'),
      v: K('10년 · 2025–2034', '10 anni · 2025–2034', '10 years · 2025–2034'),
      doc: PLAN,
      s: 'p.7',
    },
    {
      k: K('내장 기준일', 'Data di riferimento delle finiture', 'Fit-out base year'),
      v: K('2025 노인회관 입주', '2025, ingresso del centro anziani',
        '2025, seniors’ centre moves in'),
      s: K('노원구 세출예산 2023–2025', 'Bilancio di spesa di Nowon 2023–2025',
        'Nowon expenditure budget 2023–2025'),
    },
  ],

  long: [
    {
      k: K('구조 수명 50년', 'Vita della struttura: 50 anni', 'Structural life: 50 years'),
      v: K('내용연수범위 30~50년의 상한', 'limite superiore dell’intervallo 30–50 anni',
        'upper bound of the 30–50 year range'),
      s: K('법인세법 시행규칙 별표5 — 철근콘크리트조 기준내용연수 40년',
        'Normativa tributaria coreana, tab. 5 — c.a., vita fiscale 40 anni',
        'Korean corporate tax rules, table 5 — RC frame, 40 years'),
    },
    {
      k: K('노후 판정 기준', 'Soglia di obsolescenza', 'Ageing threshold'),
      v: K('준공 30년 경과 · 노원구는 158,174호로 서울 자치구 최다',
        'oltre 30 anni dall’agibilità; Nowon ne conta 158.174, il massimo di Seoul',
        'over 30 years since completion; Nowon has 158,174 — the most in Seoul'),
      doc: PLAN,
      s: 'p.63',
    },
    {
      k: K('재건축을 고르면', 'Se si sceglie la ricostruzione', 'If rebuilding is chosen'),
      v: K('2030년 이후 ZEB 4등급 전제', 'dal 2030 si presuppone ZEB livello 4',
        'ZEB grade 4 assumed from 2030'),
      doc: PLAN,
      s: 'p.96',
    },
  ],
}

/** 카드 아래 한 줄 — 어떤 문서를 열고 말하는가 */
export const HZ_SOURCES_FOOT = K(
  '위 근거는 모두 원문에서 확인한 것입니다 — 법령은 국가법령정보센터, 상위계획은 '
  + '노원구 탄소중립녹색성장 기본계획 2025–2034, 이 건물의 이력은 노원구의회 회의록과 '
  + '노원구 세출예산입니다. 설비의 마지막 교체일만 확인하지 못해 기준일을 준공 1989년으로 둡니다.',
  'Tutte le fonti sono state verificate sui documenti originali: le norme dal portale legislativo '
  + 'nazionale, il piano sovraordinato dal Piano quadro di Nowon 2025–2034, la storia dell’edificio '
  + 'dai verbali del consiglio distrettuale e dai bilanci di Nowon. Solo la data dell’ultima '
  + 'sostituzione degli impianti non è verificata: si conta dall’agibilità del 1989.',
  'Every source here was checked against the original document — statutes from the national law '
  + 'portal, the master plan from Nowon’s 2025–2034 Carbon Neutrality Plan, and this building’s '
  + 'history from district council minutes and Nowon budgets. Only the plant’s last replacement '
  + 'date is unverified, so it is counted from completion in 1989.',
)
