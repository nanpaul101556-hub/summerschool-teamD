/**
 * 정량 근거 — 건물이 바뀌기 전과 후, 무엇이 달라졌는가.
 *
 * 다섯 갈래를 같은 방식으로 묻는다. 전에는 얼마였고 후에는 얼마인가,
 * 그리고 그 변화가 노원구 전체의 흐름보다 큰가 작은가.
 *
 * 확보하지 못한 갈래도 자리를 지운다. 빈칸이 보여야 결론이 어디까지
 * 근거를 가진 것인지 알 수 있다.
 */

const K = (ko, it) => ({ ko, it })

/** 기준 사건 — 이 건물이 바뀐 시점 */
export const EVENT = {
  ym: '2021.05',
  label: K('노원구민회관 → 노원구민의전당', 'Da centro civico a Auditorium di Nowon'),
  note: K(
    '정류장 이름이 바뀐 달이다. 뒤이어 2022년 설계, 2024년 공사 94억이 집행됐고 '
    + '건물 안에 노인회관이 들어갔다.',
    'È il mese in cui cambia il nome della fermata. Seguono la progettazione (2022), '
    + 'il cantiere da 9,4 miliardi (2024) e l\'inserimento di un centro anziani.',
  ),
  why: K(
    '2024년을 기준으로 잡으면 전후 12개월을 만들 수 없다. 2023·2024·2025년은 '
    + '각각 한 달치만 공표됐기 때문이다.',
    'Con il 2024 come riferimento non si formano dodici mesi prima e dopo: '
    + 'per 2023, 2024 e 2025 è pubblicato un solo mese per anno.',
  ),
}

export const VERDICT = {
  keep: { key: 'ev.keep' },
  change: { key: 'ev.change' },
}

/**
 * status
 *   have    전후를 실제로 쟀다
 *   flat    자료는 있으나 전후로 나눌 수 없다 (단면)
 *   missing 아직 못 구했다
 */
export const CARDS = [
  // ── ① 승하차 ─────────────────────────────────────────────
  {
    id: 'bus', no: '01', status: 'have',
    title: K('앞 정류장 승하차', 'Saliti e discesi alla fermata'),
    ask: K('사람이 더 왔는가', 'È venuta più gente?'),
    unit: K('월평균 승하차', 'media mensile'),
    before: { period: '2020.05–2021.04', v: 58785 },
    after: { period: '2021.05–2022.08', v: 64274 },
    pct: 9.3,
    ctrl: 4.1,
    excess: 5.3,
    verdict: 'keep',
    facts: [
      K('전 58,785회 → 후 64,274회 · +9.3%',
        'Da 58.785 a 64.274 passaggi al mese: +9,3%'),
      K('같은 기간 노원구 전체는 +4.1% — 대상지가 5.3%p 더 올랐다',
        'Nello stesso periodo Nowon +4,1%: il sito sale 5,3 p.p. in più'),
      K('노원구에서 같은 방식으로 잰 전환 사례 9곳 중 3위, 건물 전환만 보면 1위',
        'Terzo fra i nove casi misurati allo stesso modo, primo fra le sole riconversioni'),
    ],
    reading: K(
      '건물이 바뀐 뒤 오는 사람이 늘었다. 노원구 전체 회복분을 빼고도 5.3%p 남는다.',
      'Dopo il cambio sono aumentati gli arrivi: al netto del recupero distrettuale restano 5,3 p.p.',
    ),
    limit: K(
      '다만 코로나 전(2019.07)과 견주면 아직 82 수준이다. 주거 정류장은 99까지 돌아왔다. '
      + '단기로는 올랐고 장기로는 못 돌아왔다 — 둘 다 사실이다.',
      'Rispetto al pre-Covid (07.2019) siamo però ancora a 82, mentre le fermate residenziali sono a 99. '
      + 'Nel breve è salito, nel lungo non è tornato: entrambe le cose sono vere.',
    ),
    src: 'OA-12913 · analyze_events.py',
  },

  // ── ② 민원 ───────────────────────────────────────────────
  {
    id: 'minwon', no: '02', status: 'missing', sample: true,
    title: K('민원 건수', 'Numero di reclami'),
    ask: K('불만이 줄었는가', 'Le lamentele sono diminuite?'),
    facts: [
      K('공공데이터포털·서울 열린데이터광장 모두 다운로드가 스크립트로 뚫리지 않았다',
        'Su entrambi i portali il download non è automatizzabile via script'),
      K('받아서 열어 보니 전국 처리건수뿐이었다 — 노원구를 뽑을 수 없다',
        'Scaricato e aperto: contiene solo totali nazionali, Nowon non è isolabile'),
      K('대신 통상 형식대로 예시 파일을 만들어 두었다 — 실제 자료가 오면 그대로 대체된다',
        'Predisposto un file di esempio nel formato consueto, sostituibile all\'arrivo del dato'),
    ],
    reading: K(
      '「민원이 몇 건 줄었다」는 지금 댈 수 없다. 자리를 비워 둔다.',
      'Non possiamo ancora dire di quanto siano calati i reclami: lo spazio resta vuoto.',
    ),
    src: K('data.go.kr 15066811 — 수동 내려받기 필요', 'data.go.kr 15066811 — download manuale'),
  },

  // ── ③ 출입 대장 ──────────────────────────────────────────
  {
    id: 'entry', no: '03', status: 'missing',
    title: K('건물 출입 기록', 'Registri di accesso all\'edificio'),
    ask: K('실제로 건물에 들어온 사람이 늘었는가', 'Sono davvero aumentati gli ingressi?'),
    facts: [
      K('정류장 통행은 건물 앞을 지나간 사람이지 건물에 들어온 사람이 아니다',
        'I flussi alla fermata contano chi passa davanti, non chi entra'),
      K('노원구시설관리공단이 대관·강좌·전시 이용자 통계를 갖고 있을 가능성이 높다',
        'È probabile che l\'ente gestore disponga delle statistiche di utenza'),
    ],
    reading: K(
      '이것이 있으면 분모가 건물 하나가 되어 지금까지의 모든 수치보다 정확해진다. '
      + '가장 먼저 구해야 할 자료다.',
      'Con questi dati il denominatore diventa il singolo edificio: più preciso di ogni altra misura finora. '
      + 'È il dato da procurarsi per primo.',
    ),
    src: K('노원구시설관리공단 — 정보공개청구', 'Ente gestore di Nowon — richiesta di accesso agli atti'),
  },

  // ── ④ 소비와 연령 ────────────────────────────────────────
  {
    id: 'age', no: '04', status: 'flat',
    title: K('무엇에 돈을 쓰고 누가 쓰는가', 'Su che cosa e chi spende'),
    ask: K('주민이 실제로 관심 있는 것은 무엇인가', 'Che cosa interessa davvero ai residenti?'),
    unit: K('대상지 일대 상권 · 2025년', 'Area commerciale attorno al sito · 2025'),
    bars: [
      { label: K('일반교습학원', 'Doposcuola'), v: 34.1, lead: true },
      { label: K('일반의원', 'Ambulatori'), v: 19.5 },
      { label: K('슈퍼마켓', 'Supermercati'), v: 16.6 },
    ],
    ages: [
      { label: '40', v: 50.1 },
      { label: '50', v: 38.3 },
      { label: '60+', v: 0 },
    ],
    verdict: 'change',
    facts: [
      K('일반교습학원이 매출의 34.1% · 725억원으로 압도적 1위다',
        'I doposcuola valgono il 34,1% del fatturato, 72,5 miliardi: primi con distacco'),
      K('40대 50.1% · 50대 38.3% — 두 세대가 소비의 88%를 만든다',
        '40enni 50,1% e 50enni 38,3%: l\'88% della spesa'),
      K('65세 이상은 2025년 20.9%에서 2042년 36.2%로 늘지만 60대+ 소비는 잡히지 않는다',
        'Gli over 65 passano dal 20,9% al 36,2%, ma la loro spesa non compare'),
    ],
    reading: K(
      '거주자는 늙어 가는데 돈을 쓰는 쪽은 40~50대 학부모 세대다. '
      + '이 건물이 지금 무엇을 담아야 하는지에서 두 신호가 어긋난다.',
      'I residenti invecchiano ma a spendere sono i quarantenni e cinquantenni con figli a scuola: '
      + 'i due segnali divergono su che cosa debba ospitare l\'edificio.',
    ),
    limit: K(
      '2025년 한 해 자료라 전후로 나눌 수 없다. 60대+ 열이 정말 0인지, '
      + '연령 구간이 50대에서 끊기는지도 아직 확인하지 못했다.',
      'È un solo anno (2025), non divisibile in prima e dopo. Né è verificato se la colonna over-60 '
      + 'sia davvero nulla o se le fasce si fermino ai 50.',
    ),
    src: K('서울시 상권분석 · analyze_demand.py', 'Analisi commerciale di Seoul · analyze_demand.py'),
  },

  // ── ⑤ 예산 ───────────────────────────────────────────────
  {
    id: 'budget', no: '05', status: 'have',
    title: K('이 건물에 들어간 돈과 노원구가 가는 방향',
      'La spesa su questo edificio e la direzione del distretto'),
    ask: K('예산은 어디로 움직였는가', 'Dove si è spostato il bilancio?'),
    unit: K('노원구 세출예산 · 백만원', 'Bilancio di spesa di Nowon · milioni di won'),
    before: { period: '2022', v: 5079, label: K('이 건물 투입', 'Su questo edificio') },
    after: { period: '2025', v: 348, label: K('이 건물 투입', 'Su questo edificio') },
    pct: -93,
    verdict: 'change',
    moves: [
      { label: K('자전거문화센터 건립', 'Centro cultura ciclistica'), v: 3281, up: true },
      { label: K('어르신여가 복지시설', 'Strutture ricreative per anziani'), v: 588, up: true },
      { label: K('공원 유지관리', 'Manutenzione parchi'), v: 914, up: true },
      { label: K('노원문화예술회관 리모델링', 'Ristrutturazione dell\'auditorium'), v: -3379 },
      { label: K('창동·상계 신경제중심지', 'Nuovo polo economico Changdong'), v: -5007 },
    ],
    facts: [
      K('이 건물에 2022년 50.8억, 2023년 36.2억, 2024년 34.1억이 편성됐고 2025년 3.5억으로 끝났다',
        'Stanziati 5,08 mld (2022), 3,62 (2023), 3,41 (2024); nel 2025 scende a 0,35: il ciclo è chiuso'),
      K('2024년 실제 집행은 94.2억 — 이월과 추경이 겹친 해다',
        'Nel 2024 la spesa effettiva è stata di 9,42 mld: anno di riporti e assestamenti'),
      K('노원구 시설조성 예산은 4년 사이 58% 줄고, 사업 수는 117개에서 70개가 됐다',
        'Il budget per nuove strutture cala del 58% in quattro anni; i progetti da 117 a 70'),
    ],
    reading: K(
      '이 건물의 전환은 예산상 끝났다. 그리고 노원구의 돈은 자전거·공원·어르신 여가처럼 '
      + '몸을 움직이는 쪽으로 가고, 대형 개발에서는 빠지고 있다.',
      'Per il bilancio la riconversione di questo edificio è conclusa. E i fondi di Nowon si spostano '
      + 'verso ciclabilità, parchi e attività per anziani, ritirandosi dai grandi sviluppi.',
    ),
    limit: K(
      '의료·재활 −33%와 공원·녹지 −51%는 일회성 사업이 끝난 탓이라 쓰지 않는다.',
      'I cali in sanità (−33%) e verde (−51%) derivano da progetti una tantum conclusi: non utilizzabili.',
    ),
    src: K('서울재정포털 · highlight.py', 'Portale finanziario di Seoul · highlight.py'),
  },
]

export function tally() {
  const t = { keep: 0, change: 0, have: 0, missing: 0, flat: 0 }
  for (const c of CARDS) {
    t[c.status] += 1
    if (c.verdict) t[c.verdict] += 1
  }
  return t
}

/**
 * 종합 — 다른 건물이 되어야 하는가, 현황을 유지하면 되는가.
 * 두 답이 갈리는 지점을 감추지 않는다.
 */
export const CONCLUSION = {
  key: 'change',
  head: K('이 건물은 다른 건물이 되어야 한다', 'Questo edificio deve diventare un altro edificio'),
  yes: [
    K('전환 직후 승하차가 노원구 평균보다 5.3%p 더 올랐다 — 바꾸면 사람이 온다는 증거다',
      'Dopo la riconversione i flussi salgono 5,3 p.p. sopra la media: cambiare porta gente'),
    K('그런데 코로나 전 수준으로는 82에 그친다. 주거 정류장은 99까지 돌아왔다',
      'Ma rispetto al pre-Covid resta a 82, mentre le fermate residenziali sono tornate a 99'),
    K('소비는 40~50대가 88%를 만드는데 거주자는 2042년 고령 36.2%로 간다',
      'L\'88% della spesa è di quarantenni e cinquantenni, ma i residenti vanno verso il 36,2% di over 65'),
    K('예산은 이 건물의 전환을 이미 끝냈고, 노원구의 돈은 활동형 시설로 옮겨 가고 있다',
      'Il bilancio ha già chiuso questa riconversione e i fondi si spostano verso strutture attive'),
  ],
  but: K(
    '다만 이 판정은 다섯 갈래 중 셋으로 내린 것이다. 민원과 출입 기록이 비어 있다. '
    + '특히 출입 기록은 「건물에 실제로 들어온 사람」을 재는 유일한 자료여서, '
    + '그것이 채워지기 전까지 이 결론은 정류장을 지나간 사람으로 대신 말하고 있다.',
    'Il giudizio poggia però su tre delle cinque voci: mancano reclami e registri di accesso. '
    + 'Questi ultimi sono l\'unico dato che misura chi entra davvero: finché mancano, '
    + 'la conclusione parla al loro posto con chi passa davanti alla fermata.',
  ),
}
