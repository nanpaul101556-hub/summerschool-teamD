/**
 * 상위계획 — 넓은 데서 좁은 데로 내려온다.
 *
 *   서울시가 어디로 가는가  →  노원구는 어떤 상태인가  →  대상지는 어디에 놓였는가
 *
 * 각 단계마다 표시한 원문 페이지가 붙는다. 「이 조항에 의거했다」는 말은
 * 원문을 볼 수 있을 때만 근거가 된다.
 *
 * 인용문은 PDF 에서 그대로 옮겼다. 페이지 이미지는 source file/_pages.py 로 뽑는다.
 */

const K = (ko, it) => ({ ko, it })

/** 깔때기의 세 단 */
export const LEVELS = [
  {
    id: 'seoul',
    scope: K('서울시', 'Città di Seoul'),
    head: K('도시가 어디로 가는가', 'Dove sta andando la città'),
    doc: K('2040 서울도시기본계획', 'Piano urbanistico di Seoul 2040'),
    docMeta: K('2023년 확정 · 최상위 법정계획 · 205쪽',
      'approvato nel 2023 · piano statutario · 205 pp.'),
    lead: K(
      '서울은 두 가지를 바꾸겠다고 했다. 도시를 동네 단위로 다시 짜는 것, '
      + '그리고 용도를 미리 못 박는 방식에서 벗어나는 것.',
      'Seoul ha annunciato due cambiamenti: riorganizzare la città per quartieri '
      + 'e superare il metodo di fissare in anticipo le destinazioni d\'uso.',
    ),
    trends: [
      {
        id: 'walk',
        label: K('보행일상권', 'Bacino pedonale quotidiano'),
        text: K(
          '주거·일자리·여가문화·상업 등 다양한 일상생활을 도보 30분 내에서 향유',
          'Fruire entro 30 minuti a piedi di residenza, lavoro, tempo libero e commercio',
        ),
        p: 53, page: 'seoul-p53',
      },
      {
        id: 'zoning',
        label: K('Beyond Zoning Seoul', 'Beyond Zoning Seoul'),
        lead: true,
        text: K(
          '용도지역제는 (…) 토지의 기능을 선도적으로 규정하는 경직성으로 말미암아 '
          + '급변하는 환경에 선제적으로 대응하는 데 한계가 있다',
          'Lo zoning regola la funzione del suolo in anticipo: questa rigidità '
          + 'ne limita la capacità di risposta a un contesto in rapido mutamento',
        ),
        p: 67, page: 'seoul-p67',
      },
      {
        id: 'reuse',
        label: K('유휴시설 전환', 'Riconversione del patrimonio inutilizzato'),
        text: K(
          '용도지역 체계의 유연한 운영과 유휴시설의 용도 전환 및 복합화 검토',
          'Gestione flessibile dello zoning e valutazione della riconversione e integrazione',
        ),
        p: 76, page: 'seoul-p76',
      },
    ],
    summary: K(
      '세 조항이 한 방향을 가리킨다. 도시를 동네 단위로 다시 짜되(보행일상권), '
      + '그 안의 기능을 미리 못 박지 말고(Beyond Zoning), 새로 짓기보다 있는 것을 '
      + '바꿔 쓰라는 것(유휴시설 전환)이다. 셋 다 「확정」에서 「유연」으로 옮겨 간다.',
      'I tre passaggi indicano una sola direzione: riorganizzare la città per quartieri, '
      + 'non fissare in anticipo le funzioni al loro interno, riconvertire l\'esistente '
      + 'invece di costruire nuovo. Tutti si spostano dal definito al flessibile.',
    ),
    shifts: [
      {
        from: K('단일 용도', 'Uso singolo'),
        to: K('복합 용도', 'Uso misto'),
        why: K(
          '도보 30분 안에서 주거·일자리·여가·상업이 해결돼야 한다면 '
          + '한 시설이 한 기능만 해서는 생활권이 성립하지 않는다',
          'Se entro 30 minuti a piedi devono stare casa, lavoro, tempo libero e commercio, '
          + 'una struttura monofunzionale non basta a formare il bacino',
        ),
        p: 53,
      },
      {
        from: K('준공 시점의 용도가 50년을 지배', 'La destinazione iniziale domina 50 anni'),
        to: K('시기마다 용도를 다시 정함', 'Destinazione ridefinita per fasi'),
        why: K(
          '용도지역제의 경직성이 한계라는 진단을 건물 단위로 내리면, '
          + '준공 시점의 프로그램이 수명 전체를 결정해서는 안 된다',
          'Portando alla scala edilizia la diagnosi sulla rigidità dello zoning, '
          + 'il programma iniziale non può determinare l\'intera vita utile',
        ),
        p: 67,
      },
      {
        from: K('헐고 새로 짓기', 'Demolire e ricostruire'),
        to: K('있는 것을 바꿔 쓰기', 'Riconvertire l\'esistente'),
        why: K(
          '전환과 복합화가 제도가 밝힌 방향이다. 신축보다 전환 쪽에 정책적 지지가 있다',
          'La riconversione è la direzione dichiarata dalla norma: '
          + 'il sostegno politico va alla trasformazione più che al nuovo',
        ),
        p: 76,
      },
    ],
    so: K(
      '용도를 미리 정하는 것이 문제라는 진단이 최상위 계획에 적혀 있다. '
      + '서울은 이것을 도시 단위에서 말했고, 우리는 같은 문제를 건물 단위로 내린다.',
      'La diagnosi — fissare in anticipo le destinazioni è un problema — è scritta nel piano '
      + 'di livello più alto. Seoul la enuncia alla scala urbana; noi la portiamo all\'edificio.',
    ),
  },

  {
    id: 'nowon',
    scope: K('노원구', 'Distretto di Nowon'),
    head: K('그러면 이 자치구는 어떤 상태인가', 'In quale stato si trova il distretto'),
    doc: K('노원구 제1차 탄소중립·녹색성장 기본계획', 'Primo piano carbon neutral di Nowon'),
    docMeta: K('2025–2034 · 249쪽', '2025–2034 · 249 pp.'),
    lead: K(
      '서울에서 인구가 가장 빨리 줄고 가장 빨리 늙는 자치구다. '
      + '그리고 건물의 4분의 3이 2000년 이전에 지어졌다.',
      'È il distretto di Seoul che perde popolazione e invecchia più rapidamente. '
      + 'Tre quarti degli edifici sono anteriori al 2000.',
    ),
    trends: [
      {
        id: 'decline',
        label: K('인구 감소 1위', 'Primo per calo demografico'),
        lead: true,
        text: K(
          '노원구의 인구는 25개 자치구 중에서도 인구가 가장 많이 감소할 것으로 예상된다',
          'Nowon è il distretto con il calo demografico previsto maggiore tra i 25',
        ),
        p: 24, page: 'nowon-p24',
      },
      {
        id: 'aged',
        label: K('2042년 고령 36.2%', 'Over 65 al 36,2% nel 2042'),
        lead: true,
        text: K(
          '65세 이상 고령인구는 2025년 20.9%에서 2042년 36.2%로 증가 (…) '
          + '고령인구가 유소년 인구의 약 5배가 되는 초고령사회',
          'Gli over 65 passano dal 20,9% (2025) al 36,2% (2042): circa cinque volte i minori',
        ),
        p: 24, page: 'nowon-p24',
      },
      {
        id: 'faster',
        label: K('서울 평균보다 빠르다', 'Più rapido della media cittadina'),
        text: K(
          '노원구의 고령화가 서울시 평균보다 빠르게 진행되고 있음',
          'L\'invecchiamento di Nowon procede più rapidamente della media di Seoul',
        ),
        p: 21, page: 'nowon-p21',
      },
      {
        id: 'old',
        label: K('재건축이냐 리모델링이냐', 'Ricostruire o riqualificare'),
        text: K(
          '노후아파트 재건축과 리모델링 사이의 적정한 균형점을 찾는 것도 (…) '
          + '이에 대한 정책 개발도 중요하다',
          'Trovare il punto di equilibrio tra ricostruzione e riqualificazione: '
          + 'serve una politica dedicata',
        ),
        p: 27, page: 'nowon-p27',
      },
    ],
    summary: K(
      '서울이 2026년부터 초고령사회로 접어들 것으로 보는데 노원구는 2025년에 이미 들어섰다. '
      + '인구는 25개 구 중 가장 많이 줄고, 2042년에는 고령인구가 유소년의 약 5배가 된다. '
      + '그리고 건물의 75.8%가 2000년 이전에 지어졌다.',
      'Seoul prevede di entrare nella super-anzianità nel 2026; Nowon vi è entrata già nel 2025. '
      + 'È il distretto con il calo maggiore fra i 25 e nel 2042 avrà cinque anziani per ogni minore. '
      + 'Inoltre il 75,8% degli edifici è anteriore al 2000.',
    ),
    shifts: [
      {
        from: K('지금 수요에 맞춘 프로그램', 'Programma tarato sull\'oggi'),
        to: K('2042년까지 견디는 프로그램', 'Programma che regge fino al 2042'),
        why: K(
          '고령 20.9% → 36.2%, 유소년 8.8% → 7.5%. '
          + '준공 시점 이용자로 용도를 정하면 10년이면 어긋난다',
          'Anziani dal 20,9% al 36,2%, minori dall\'8,8% al 7,5%: '
          + 'programmare sull\'utenza iniziale sfasa entro dieci anni',
        ),
        p: 24,
      },
      {
        from: K('철거 후 신축', 'Demolizione e nuova costruzione'),
        to: K('존치 후 전환', 'Conservazione e riconversione'),
        why: K(
          '노후 건물이 75.8%라 전부 헐 수 없고, 노원구 스스로 '
          + '「재건축과 리모델링 사이의 균형점」을 정책 과제로 적었다',
          'Con il 75,8% di patrimonio obsoleto non si può demolire tutto; Nowon stessa '
          + 'pone come tema il punto di equilibrio fra ricostruzione e riqualificazione',
        ),
        p: 27,
      },
      {
        from: K('한 세대를 위한 시설', 'Struttura per una sola generazione'),
        to: K('세대 교체를 받아내는 시설', 'Struttura che assorbe il ricambio'),
        why: K(
          '노원구의 고령화는 서울 평균보다 빠르다. '
          + '건물이 서 있는 동안 이용자가 통째로 바뀐다',
          'L\'invecchiamento di Nowon supera la media cittadina: '
          + 'l\'utenza cambierà per intero durante la vita dell\'edificio',
        ),
        p: 21,
      },
    ],
    so: K(
      '노원구는 서울의 진단을 가장 먼저 겪는 자치구다. 그리고 스스로 '
      + '「재건축과 리모델링 사이」를 정책 과제로 적어 두었다 — 우리가 답하려는 질문이 그것이다.',
      'Nowon è il distretto che sperimenta per primo la diagnosi cittadina, '
      + 'e pone esso stesso il tema fra ricostruzione e riqualificazione: è la domanda a cui rispondiamo.',
    ),
  },

  {
    id: 'site',
    scope: K('대상지', 'Il sito'),
    head: K('그 안에서 우리 자리는 어디인가', 'Dove si colloca il nostro lotto'),
    doc: K('노원구고시 제2024-49호 도시관리계획', 'Decreto urbanistico di Nowon 2024-49'),
    docMeta: K('중계2택지 지구단위계획구역 · 2024.09.05', 'Ambito attuativo Junggye-2 · 05.09.2024'),
    lead: K(
      '서울 노원구 동일로 1229. 중계2택지 지구단위계획구역 안이고, '
      + '걸어서 닿는 거리에 어떤 기능이 이미 있는지가 여기서 정해진다.',
      'Dongil-ro 1229, Nowon-gu, entro l\'ambito attuativo Junggye-2. '
      + 'Qui si stabilisce quali funzioni esistano già a distanza pedonale.',
    ),
    trends: [
      {
        id: 'youth',
        label: K('629 m 에 복합지원센터 확정', 'Centro servizi confermato a 629 m'),
        lead: true,
        text: K(
          '세부개발계획 — 청소년 체험시설과 복합지원센터 건립',
          'Piano attuativo: polo giovanile e centro servizi integrato',
        ),
        p: 2, page: 'junggye-p2',
      },
      {
        id: 'bf',
        label: K('BF 인증이 인허가 조건', 'Certificazione Barrier-Free come condizione'),
        text: K(
          '장애물 없는 생활환경(BF) 인증기준에 적합하도록 공공보행통로 위치 조정',
          'Riposizionamento del percorso pedonale per conformità Barrier-Free',
        ),
        p: 2, page: 'junggye-p2',
      },
    ],
    near: [
      { label: K('북서울미술관', 'Museo Buk-Seoul'), m: 196,
        note: K('2013 개관 · 문화', '2013 · cultura') },
      { label: K('청소년 체험시설 · 복합지원센터', 'Polo giovanile e centro servizi'), m: 629,
        note: K('2024 고시 · 확정', 'decreto 2024') },
    ],
    summary: K(
      '이 자리는 비어 있는 땅이 아니라 이미 짜인 그물의 한 코다. '
      + '문화는 196 m 에 있고, 청소년은 629 m 에 고시로 확정됐다. '
      + '무엇을 넣을지보다 무엇이 이미 있는지가 먼저 정해져 있다.',
      'Questo lotto non è terreno vuoto ma una maglia di una rete già tessuta: '
      + 'la cultura è a 196 m, i giovani a 629 m per decreto. '
      + 'Prima ancora di scegliere che cosa inserire, è già definito che cosa esiste.',
    ),
    shifts: [
      {
        from: K('무엇이든 넣을 수 있는 자리', 'Un lotto aperto a qualsiasi funzione'),
        to: K('빠진 것만 채우는 자리', 'Un lotto che colma solo ciò che manca'),
        why: K(
          '걸어서 닿는 거리에 있는 기능을 또 넣으면 새 수요가 아니라 자리바꿈이 된다 '
          + '— 문화와 청소년은 이미 찼다',
          'Ripetere una funzione già raggiungibile a piedi non crea domanda: la sposta. '
          + 'Cultura e giovani sono già coperti',
        ),
        p: 2,
      },
      {
        from: K('모든 기능을 자체 수용', 'Assorbire tutte le funzioni'),
        to: K('넘길 것은 넘기는 연계형', 'Delegare ciò che si può delegare'),
        why: K(
          '629 m 에 복합지원센터가 확정돼 있으므로 연계 대상이 가정이 아니라 실물로 존재한다',
          'Il centro servizi a 629 m è confermato: il partner di rete non è un\'ipotesi ma un fatto',
        ),
        p: 2,
      },
      {
        from: K('접근성은 나중에', 'Accessibilità come aggiunta finale'),
        to: K('BF 인증이 출발 조건', 'Barrier-Free come premessa'),
        why: K(
          '인근 고시가 이미 BF 인증을 이유로 보행통로를 옮겼다. '
          + '고령화와 겹치면 선택이 아니라 전제다',
          'Il decreto vicino ha già spostato un percorso per la certificazione BF: '
          + 'con l\'invecchiamento non è un\'opzione ma una premessa',
        ),
        p: 2,
      },
    ],
    so: K(
      '문화는 196 m 에, 청소년은 629 m 에 이미 있다. 대상지가 채울 것은 그 둘이 아니다.',
      'La cultura è già a 196 m, i giovani a 629 m: non è ciò che il sito deve colmare.',
    ),
  },
]

/**
 * 노원구 장래인구추계 — 계획서 원문 「표 5」에서 옮긴 값.
 * 본문의 20.9% · 36.2% · 8.8% · 7.5% 와 계산이 일치하는 것을 확인했다.
 */
export const POP_TABLE = {
  src: K('노원구 제1차 탄소중립·녹색성장 기본계획 표 5 (p.24)',
    'Piano carbon neutral di Nowon, tab. 5 (p.24)'),
  origin: K('출처 서울열린데이터광장 자치구별 장래인구추계 2020–2040',
    'Fonte: proiezioni demografiche per distretto, portale open data di Seoul'),
  rows: [
    { y: 2025, all: 484035, young: 42668, old: 101329 },
    { y: 2027, all: 474044, young: 37555, old: 109808 },
    { y: 2030, all: 460504, young: 32120, old: 120102 },
    { y: 2033, all: 449816, young: 29248, old: 129508 },
    { y: 2036, all: 440900, young: 29143, old: 140598 },
    { y: 2039, all: 432446, young: 30305, old: 149111 },
    { y: 2042, all: 423543, young: 31734, old: 153182 },
  ],
}

export function popShare() {
  return POP_TABLE.rows.map((r) => ({
    y: r.y,
    old: +(r.old / r.all * 100).toFixed(1),
    young: +(r.young / r.all * 100).toFixed(1),
    all: r.all,
  }))
}

export const PLAN_STATS = {
  levels: LEVELS.length,
  quotes: LEVELS.reduce((n, l) => n + l.trends.length, 0),
  pages: 7,
  marks: 21,
}
