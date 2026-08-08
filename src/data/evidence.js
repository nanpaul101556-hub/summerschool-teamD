/**
 * 정량 근거 — 건물이 바뀌기 전과 후, 무엇이 달라졌는가.
 *
 * 여섯 갈래를 같은 방식으로 묻는다. 전에는 얼마였고 후에는 얼마인가,
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
    '정류장 이름이 바뀐 달이다. 뒤이어 2022년 사무동 리모델링이 시작됐고, '
    + '2023–25년에 걸쳐 건물 안에 노인회관이 들어갔다(실집행 5.2억).',
    'È il mese in cui cambia il nome della fermata. Seguono la ristrutturazione degli uffici (2022) '
    + 'e l\'inserimento di un centro anziani fra 2023 e 2025 (0,52 mld effettivi).',
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
    // 예시 파일을 analyze_minwon.py 로 돌린 실제 출력. 수치는 지어낸 값이다.
    tab: {
      head: K('예시 파일을 승하차와 같은 방식으로 돌리면 이 표가 선다',
        'Elaborando il file di esempio come i flussi, si ottiene questa tabella'),
      cols: [
        K('분야', 'Ambito'),
        K('전 12개월', '12 mesi prima'),
        K('후 12개월', '12 mesi dopo'),
        K('초과', 'Scost.'),
      ],
      rows: [
        { label: K('환경위생', 'Igiene ambientale'), before: 5342, after: 5856, d: 2.7 },
        { label: K('복지', 'Welfare'), before: 3145, after: 3447, d: 2.7 },
        { label: K('도로교통', 'Viabilità'), before: 6842, after: 7386, d: 1.0 },
        { label: K('일반행정', 'Amministrazione'), before: 2233, after: 2366, d: -1.0 },
        { label: K('문화체육', 'Cultura e sport'), before: 2752, after: 2862, d: -3.0, lead: true },
        { label: K('주택건축', 'Edilizia'), before: 4313, after: 4422, d: -4.4 },
      ],
      note: K(
        '초과 = 분야 변화 − 전체 변화(+7.0%). 전체가 대조군 역할을 한다. '
        + '실제 자료에서도 문화체육이 음(−)으로 나와야 「불만이 줄었다」가 성립한다.',
        'Scostamento = variazione dell\'ambito meno quella complessiva (+7,0%), che funge da controllo. '
        + 'Solo un valore negativo nel dato reale proverebbe il calo dei reclami.',
      ),
    },
    reading: K(
      '「민원이 몇 건 줄었다」는 지금 댈 수 없다. 대신 자료가 오면 설 표를 세워 두었다 — '
      + '이 수치는 지어낸 값이고, 판정에는 들어가지 않는다.',
      'Non possiamo ancora dire di quanto siano calati i reclami. Resta però pronta la tabella '
      + 'che si popolerà: i valori sono inventati e non entrano nel giudizio.',
    ),
    src: K('예시 · make_minwon_sample.py → analyze_minwon.py',
      'Esempio · make_minwon_sample.py → analyze_minwon.py'),
  },

  // ── ③ 출입 대장 ──────────────────────────────────────────
  {
    id: 'entry', no: '03', status: 'missing', sample: true,
    title: K('건물 출입 기록', 'Registri di accesso all’edificio'),
    ask: K('실제로 건물에 들어온 사람이 늘었는가', 'Sono davvero aumentati gli ingressi?'),
    tab: {
      head: K('예시 파일을 승하차와 같은 방식으로 돌리면 이 표가 선다',
        'Elaborando il file di esempio come i flussi, si ottiene questa tabella'),
      cols: [
        K('이용구분', 'Tipo'),
        K('전 12개월', '12 mesi prima'),
        K('후 12개월', '12 mesi dopo'),
        K('초과', 'Scost.'),
      ],
      rows: [
        { label: K('전시', 'Mostre'), before: 7044, after: 10186, d: 12.8 },
        { label: K('강좌', 'Corsi'), before: 14921, after: 21207, d: 10.4, lead: true },
        { label: K('대관', 'Affitto sale'), before: 17191, after: 24306, d: 9.6 },
        { label: K('단체', 'Enti residenti'), before: 20117, after: 22397, d: -20.4 },
      ],
      note: K(
        '초과 = 구분 변화 − 전체 변화(+31.8%). 단체는 상주하므로 흔들리지 않는다. '
        + '실제 자료가 오면 분모가 건물 하나가 되어 가장 정확한 축이 된다.',
        'Scostamento = variazione del tipo meno quella complessiva (+31,8%). Gli enti residenti non oscillano. '
        + 'Con il dato reale il denominatore diventa il singolo edificio: l’asse più preciso.',
      ),
    },
    facts: [
      K('정류장 통행은 건물 앞을 지나간 사람이지 건물에 들어온 사람이 아니다',
        'I flussi alla fermata contano chi passa davanti, non chi entra'),
      K('예산줄에서 확인된 용도를 그대로 넣어 예시 파일을 만들었다 — 문화교실·노인회관·대관',
        'Il file di esempio riprende gli usi confermati dal bilancio: corsi, centro anziani, affitti'),
    ],
    reading: K(
      '이것이 있으면 분모가 건물 하나가 되어 지금까지의 모든 수치보다 정확해진다. '
      + '가장 먼저 구해야 할 자료이며, 그때까지 자리는 예시로 채워 둔다.',
      'Con questi dati il denominatore diventa il singolo edificio: più preciso di ogni altra misura finora. '
      + 'È il dato da procurarsi per primo; fino ad allora il posto resta occupato da un esempio.',
    ),
    src: K('노원구시설관리공단 — 정보공개청구 · 예시 make_entry_sample.py',
      'Ente gestore di Nowon — accesso agli atti · esempio make_entry_sample.py'),
  },

  // ── ④ 만족도 ─────────────────────────────────────────────
  {
    id: 'satis', no: '04', status: 'missing', sample: true, reachable: true,
    title: K('말로 물은 만족도', 'La soddisfazione dichiarata'),
    ask: K('주민은 문화환경에 만족한다고 답하는가', 'I residenti si dicono soddisfatti?'),
    tab: {
      head: K('서울서베이 문화환경 만족도 · 5점 척도 · 노원구와 서울시 평균',
        'Soddisfazione culturale (Seoul Survey), scala 1-5: Nowon e media cittadina'),
      cols: [
        K('연도', 'Anno'),
        K('노원구', 'Nowon'),
        K('서울시', 'Seoul'),
        K('격차', 'Divario'),
      ],
      scale: 100,
      rows: [
        { label: K('2021', '2021'), before: 304, after: 313, d: -0.09 },
        { label: K('2022', '2022'), before: 316, after: 334, d: -0.18 },
        { label: K('2023', '2023'), before: 327, after: 345, d: -0.18 },
        { label: K('2024', '2024'), before: 337, after: 355, d: -0.18 },
        { label: K('2025', '2025'), before: 342, after: 347, d: -0.05, lead: true },
      ],
      unitD: 'pt',
      note: K(
        '연 1회 조사라 전후 12개월을 만들 수 없다. 서울시 평균을 대조군으로 두고 격차를 본다 — '
        + '이것이 이 자료의 원래 쓰임이다.',
        'Indagine annuale: non si formano 12 mesi prima e dopo. Si usa la media cittadina come controllo '
        + 'e si osserva il divario, che è l’uso proprio di questo dato.',
      ),
    },
    facts: [
      K('자료는 실재한다 — 서울서베이 도시정책지표조사, 자치구별, 5점 척도, 매년 8월 공표',
        'Il dato esiste: Seoul Survey, per distretto, scala 1-5, pubblicato ogni agosto'),
      K('2003년부터 있고 표본은 가구 2만·시민 5천 — 노원구가 따로 나온다',
        'Dal 2003, su 20.000 famiglie e 5.000 cittadini; Nowon compare separatamente'),
      K('앞의 둘과 다르다 — 없는 자료가 아니라 내려받기가 막힌 자료다',
        'A differenza degli altri due, non manca: è solo il download a essere bloccato'),
    ],
    reading: K(
      '이 축은 사람들이 「그렇다고 말한」 만족도이고, 승하차와 이용은 「그렇게 행동한」 결과다. '
      + '둘이 어긋나는 지점이 곧 판정 재료다 — 우리 가설의 출발점이 여기였다.',
      'Questo asse misura ciò che le persone dichiarano; flussi e ingressi misurano ciò che fanno. '
      + 'Dove i due divergono nasce il giudizio: è da lì che parte la nostra ipotesi.',
    ),
    src: K('서울 열린데이터광장 통계 10305 · 예시 make_satis_sample.py',
      'Portale open data di Seoul, statistica 10305 · esempio make_satis_sample.py'),
  },

  // ── ⑤ 소비와 연령 ────────────────────────────────────────
  {
    id: 'age', no: '05', status: 'flat',
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

  // ── ⑥ 예산 ───────────────────────────────────────────────
  {
    id: 'budget', no: '06', status: 'have',
    title: K('이 건물에 들어간 돈과 노원구가 가는 방향',
      'La spesa su questo edificio e la direzione del distretto'),
    ask: K('예산은 어디로 움직였는가', 'Dove si è spostato il bilancio?'),
    unit: K('노원구 세출예산 실집행 · 백만원', 'Spesa effettiva di Nowon · milioni di won'),
    before: { period: '2022', v: 149, label: K('이 건물 실집행', 'Speso su questo edificio') },
    after: { period: '2025', v: 364, label: K('이 건물 실집행', 'Speso su questo edificio') },
    pct: 143,
    verdict: 'change',
    moves: [
      { label: K('노인회관 건립 (2023–25)', 'Centro anziani (2023-25)'), v: 521, up: true },
      { label: K('문화교실 운영 (2025)', 'Corsi culturali (2025)'), v: 190, up: true },
      { label: K('앞 스마트쉼터 (2025 주민제안)', 'Pensilina smart (proposta 2025)'), v: 158, up: true },
      { label: K('사무동 리모델링 (2022)', 'Uffici ristrutturati (2022)'), v: 98, up: true },
      { label: K('임시선별검사소 (2022)', 'Centro tamponi (2022)'), v: 41, up: true },
    ],
    facts: [
      K('이 건물 실집행은 2022년 1.5억 → 2025년 3.6억으로 오히려 늘었다',
        'La spesa su questo edificio sale da 0,15 a 0,36 mld fra 2022 e 2025'),
      K('들어간 돈은 전부 「새 용도를 끼워 넣는」 데 쓰였다 — 선별검사소·노인회관·문화교실',
        'Tutto speso per inserire nuovi usi: centro tamponi, centro anziani, corsi culturali'),
      K('노원구 시설조성 예산은 4년 사이 58% 줄고 사업 수는 117개에서 70개가 됐다',
        'Il budget per nuove strutture cala del 58% in quattro anni; i progetti da 117 a 70'),
    ],
    reading: K(
      '노원구는 새로 짓는 일을 줄이고 있는데, 이 건물에는 돈이 계속 들어간다. '
      + '그 돈이 하는 일은 하나뿐이다 — 있는 껍데기 안에 새 용도를 끼워 넣는 것. '
      + '이 건물은 이미 우리가 주장하는 방식으로 살아 왔다.',
      'Nowon riduce le nuove costruzioni, ma su questo edificio continua a spendere. '
      + 'E quella spesa fa una cosa sola: inserire nuovi usi dentro un guscio esistente. '
      + 'L\'edificio vive già come sosteniamo debba vivere.',
    ),
    limit: K(
      '처음에는 「노원문화예술회관 리모델링」 94.2억을 이 건물 것으로 넣었다. 틀렸다 — '
      + '그것은 중계로 181의 다른 건물(2004년 개관, 노원문화재단 운영)이고 2025년 1월 재개관했다. '
      + '원자료에 「노원구민의 전당」처럼 띄어 쓴 줄이 있어 검색에서 갈렸던 탓이다.',
      'Inizialmente i 9,42 mld della ristrutturazione erano attribuiti a questo edificio: errore. '
      + 'Riguardano un altro edificio in Junggye-ro 181 (2004, Fondazione culturale di Nowon), '
      + 'riaperto nel gennaio 2025. La confusione nasceva da una spaziatura nel nome.',
    ),
    src: K('서울재정포털 · building_lines.py', 'Portale finanziario di Seoul · building_lines.py'),
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
    K('노원구는 새로 짓는 일을 줄이는데 이 건물에는 돈이 계속 들어간다 — 그것도 용도를 끼워 넣는 데만',
      'Nowon riduce le nuove costruzioni, ma qui continua a spendere: e solo per inserire nuovi usi'),
  ],
  but: K(
    '다만 이 판정은 여섯 갈래 중 셋으로 내린 것이다. 민원·출입·만족도가 비어 있다. '
    + '특히 출입 기록은 「건물에 실제로 들어온 사람」을 재는 유일한 자료여서, '
    + '그것이 채워지기 전까지 이 결론은 정류장을 지나간 사람으로 대신 말하고 있다.',
    'Il giudizio poggia però su tre delle sei voci: mancano reclami, accessi e soddisfazione. '
    + 'I registri di accesso sono l\'unico dato che misura chi entra davvero: finché mancano, '
    + 'la conclusione parla al loro posto con chi passa davanti alla fermata.',
  ),
}
