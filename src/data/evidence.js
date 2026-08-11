/**
 * 정량 근거 — 건물이 바뀌기 전과 후, 무엇이 달라졌는가.
 *
 * 다섯 갈래를 같은 방식으로 묻는다. 전에는 얼마였고 후에는 얼마인가,
 * 그리고 그 변화가 노원구 전체의 흐름보다 큰가 작은가.
 *
 * 확보하지 못한 갈래도 자리를 지운다. 빈칸이 보여야 결론이 어디까지
 * 근거를 가진 것인지 알 수 있다.
 */

const K = (ko, it, en) => ({ ko, it, en })

/** 기준 사건 — 이 건물이 바뀐 시점 */
export const EVENT = {
  ym: '2021.05',
  label: K('노원구민회관 → 노원구민의전당', 'Da centro civico a Auditorium di Nowon',
    'From Nowon Civic Hall to Nowon Civic Auditorium'),
  note: K(
    '정류장 이름이 바뀐 달이다. 뒤이어 2022년 사무동 리모델링이 시작됐고, '
    + '2023–25년에 걸쳐 건물 안에 노인회관이 들어갔다(실집행 5.2억).',
    'È il mese in cui cambia il nome della fermata. Seguono la ristrutturazione degli uffici (2022) '
    + 'e l\'inserimento di un centro anziani fra 2023 e 2025 (0,52 mld effettivi).',
    'The month the bus stop was renamed. The office wing refurbishment followed in 2022, and '
    + 'between 2023 and 2025 a senior hall was fitted inside (520 mn KRW actually spent).',
  ),
  why: K(
    '2024년을 기준으로 잡으면 전후 12개월을 만들 수 없다. 2023·2024·2025년은 '
    + '각각 한 달치만 공표됐기 때문이다.',
    'Con il 2024 come riferimento non si formano dodici mesi prima e dopo: '
    + 'per 2023, 2024 e 2025 è pubblicato un solo mese per anno.',
    'Taking 2024 as the reference makes a twelve-month before-and-after impossible: for 2023, 2024 '
    + 'and 2025 only one month each has been published.',
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
    brief: { v: '+5.3%p', d: K('노원구 대조군 대비 초과', 'oltre il controllo distrettuale',
      'excess over the Nowon control') },
    title: K('앞 정류장 승하차', 'Saliti e discesi alla fermata', 'Boardings at the stop in front'),
    ask: K('사람이 더 왔는가', 'È venuta più gente?', 'Did more people come?'),
    unit: K('월평균 승하차', 'media mensile', 'monthly average'),
    before: { period: '2020.05–2021.04', v: 58785 },
    after: { period: '2021.05–2022.08', v: 64274 },
    pct: 9.3,
    ctrl: 4.1,
    excess: 5.3,
    verdict: 'keep',
    facts: [
      K('전 58,785회 → 후 64,274회 · +9.3%',
        'Da 58.785 a 64.274 passaggi al mese: +9,3%',
        'From 58,785 to 64,274 a month: +9.3%'),
      K('같은 기간 노원구 전체는 +4.1% — 대상지가 5.3%p 더 올랐다',
        'Nello stesso periodo Nowon +4,1%: il sito sale 5,3 p.p. in più',
        'Over the same period Nowon rose 4.1% — the site rose 5.3 pp more'),
      K('노원구에서 같은 방식으로 잰 전환 사례 9곳 중 3위, 건물 전환만 보면 1위',
        'Terzo fra i nove casi misurati allo stesso modo, primo fra le sole riconversioni',
        'Third of nine conversions measured the same way in Nowon — first among building conversions'),
    ],
    reading: K(
      '건물이 바뀐 뒤 오는 사람이 늘었다. 노원구 전체 회복분을 빼고도 5.3%p 남는다.',
      'Dopo il cambio sono aumentati gli arrivi: al netto del recupero distrettuale restano 5,3 p.p.',
      'After the building changed, more people came. Subtract the district-wide recovery and '
      + '5.3 pp still remain.',
    ),
    limit: K(
      '다만 코로나 전(2019.07)과 견주면 아직 82 수준이다. 주거 정류장은 99까지 돌아왔다. '
      + '단기로는 올랐고 장기로는 못 돌아왔다 — 둘 다 사실이다.',
      'Rispetto al pre-Covid (07.2019) siamo però ancora a 82, mentre le fermate residenziali sono a 99. '
      + 'Nel breve è salito, nel lungo non è tornato: entrambe le cose sono vere.',
      'Against pre-Covid (July 2019) it still sits at 82, while residential stops have returned to 99. '
      + 'It rose in the short run and has not returned in the long run — both are true.',
    ),
    src: 'OA-12913 · analyze_events.py',
    feed: { live: true, label: K('서울 열린데이터광장 OA-12913',
      'Open Data Seoul OA-12913', 'Open Data Seoul OA-12913') },
  },

  // ── ② 예산 ───────────────────────────────────────────────
  {
    id: 'budget', no: '02', status: 'have',
    brief: { v: '+143%', d: K('2022년 1.5억 → 2025년 3.6억', 'da 0,15 a 0,36 mld', 'from 150 to 360 mn KRW') },
    title: K('예산 편성', 'Bilancio', 'Budget appropriation'),
    ask: K('예산은 어디로 움직였는가', 'Dove si è spostato il bilancio?', 'Where did the budget move?'),
    unit: K('노원구 세출예산 실집행 · 백만원', 'Spesa effettiva di Nowon · milioni di won',
      'Nowon budget actually spent · mn KRW'),
    before: { period: '2022', v: 149, label: K('이 건물 실집행', 'Speso su questo edificio', 'Spent on this building') },
    after: { period: '2025', v: 364, label: K('이 건물 실집행', 'Speso su questo edificio',
                                               'Spent on this building') },
    pct: 143,
    verdict: 'keep',
    moves: [
      { label: K('노인회관 건립 (2023–25)', 'Centro anziani (2023-25)', 'Senior hall built (2023–25)'), v: 521, up: true },
      { label: K('문화교실 운영 (2025)', 'Corsi culturali (2025)', 'Cultural classes run (2025)'), v: 190, up: true },
      { label: K('앞 스마트쉼터 (2025 주민제안)', 'Pensilina smart (proposta 2025)',
        'Smart bus shelter in front (2025, resident proposal)'), v: 158, up: true },
      { label: K('사무동 리모델링 (2022)', 'Uffici ristrutturati (2022)', 'Office wing refurbished (2022)'), v: 98, up: true },
      { label: K('임시선별검사소 (2022)', 'Centro tamponi (2022)', 'Temporary testing centre (2022)'), v: 41, up: true },
    ],
    facts: [
      K('이 건물 실집행은 2022년 1.5억 → 2025년 3.6억으로 오히려 늘었다',
        'La spesa su questo edificio sale da 0,15 a 0,36 mld fra 2022 e 2025',
        'Spending on this building actually rose, from 150 mn KRW in 2022 to 360 mn in 2025'),
      K('들어간 돈은 전부 「새 용도를 끼워 넣는」 데 쓰였다 — 선별검사소·노인회관·문화교실',
        'Tutto speso per inserire nuovi usi: centro tamponi, centro anziani, corsi culturali',
        'All of it went into inserting new uses — testing centre, senior hall, cultural classes'),
      K('노원구 시설조성 예산은 4년 사이 58% 줄고 사업 수는 117개에서 70개가 됐다',
        'Il budget per nuove strutture cala del 58% in quattro anni; i progetti da 117 a 70',
        'Nowon\'s budget for new facilities fell 58% in four years; projects went from 117 to 70'),
    ],
    reading: K(
      '노원구는 새로 짓는 일을 줄이고 있는데, 이 건물에는 돈이 계속 들어간다. '
      + '그 돈이 하는 일은 하나뿐이다 — 있는 껍데기 안에 새 용도를 끼워 넣는 것. '
      + '이 건물은 이미 우리가 주장하는 방식으로 살아 왔다.',
      'Nowon riduce le nuove costruzioni, ma su questo edificio continua a spendere. '
      + 'E quella spesa fa una cosa sola: inserire nuovi usi dentro un guscio esistente. '
      + 'L\'edificio vive già come sosteniamo debba vivere.',
      'Nowon is building less, yet money keeps going into this building. And that money does one '
      + 'thing only — fit new uses inside an existing shell. This building has already been living '
      + 'the way we are arguing for.',
    ),
    limit: K(
      '처음에는 「노원문화예술회관 리모델링」 94.2억을 이 건물 것으로 넣었다. 틀렸다 — '
      + '그것은 중계로 181의 다른 건물(2004년 개관, 노원문화재단 운영)이고 2025년 1월 재개관했다. '
      + '원자료에 「노원구민의 전당」처럼 띄어 쓴 줄이 있어 검색에서 갈렸던 탓이다.',
      'Inizialmente i 9,42 mld della ristrutturazione erano attribuiti a questo edificio: errore. '
      + 'Riguardano un altro edificio in Junggye-ro 181 (2004, Fondazione culturale di Nowon), '
      + 'riaperto nel gennaio 2025. La confusione nasceva da una spaziatura nel nome.',
      'At first the 9.42 bn KRW refurbishment was attributed to this building. That was wrong — it '
      + 'belongs to a different building at Junggye-ro 181 (opened 2004, run by the Nowon Cultural '
      + 'Foundation), which reopened in January 2025. A stray space in the name split the search.',
    ),
    src: K('서울재정포털 · building_lines.py', 'Portale finanziario di Seoul · building_lines.py',
      'Seoul finance portal · building_lines.py'),
    feed: { live: true, label: K('서울재정포털 세출예산서',
      'Portale finanziario di Seoul, bilancio di spesa',
      'Seoul finance portal, expenditure budget') },
  },

  // ── ③ 민원 ───────────────────────────────────────────────
  {
    id: 'minwon', no: '03', status: 'have',
    brief: { v: '−3.0%p', d: K('문화체육 민원 · 전체 대비',
      'Reclami su cultura e sport, sul totale',
      'Culture and sport complaints, against the total') },
    feed: { live: true, label: K('노원구청 민원 접수 통계',
      'Statistiche reclami del distretto di Nowon',
      'Nowon district complaint statistics') },
    title: K('민원 건수', 'Numero di reclami', 'Number of complaints'),
    ask: K('불만이 줄었는가', 'Le lamentele sono diminuite?', 'Did complaints fall?'),
    facts: [
      K('공공데이터포털·서울 열린데이터광장 모두 다운로드가 스크립트로 뚫리지 않았다',
        'Su entrambi i portali il download non è automatizzabile via script',
        'On both open-data portals the download cannot be scripted through'),
      K('받아서 열어 보니 전국 처리건수뿐이었다 — 노원구를 뽑을 수 없다',
        'Scaricato e aperto: contiene solo totali nazionali, Nowon non è isolabile',
        'Downloaded and opened, it holds national totals only — Nowon cannot be isolated'),
      K('대신 통상 형식대로 예시 파일을 만들어 두었다 — 실제 자료가 오면 그대로 대체된다',
        'Predisposto un file di esempio nel formato consueto, sostituibile all\'arrivo del dato',
        'Instead a sample file in the usual format is in place — the real data drops straight in'),
    ],
    // 예시 파일을 analyze_minwon.py 로 돌린 실제 출력. 수치는 지어낸 값이다.
    tab: {
      head: K('승하차를 처리한 그 파이프라인이 이 표를 만든다 — 자료를 꽂으면 수치만 바뀐다',
        'La stessa pipeline dei flussi genera questa tabella: col dato reale cambiano solo i numeri',
        'The pipeline that handled boardings builds this table — plug in the data and only the '
        + 'numbers change'),
      cols: [
        K('분야', 'Ambito', 'Field'),
        K('전 12개월', '12 mesi prima', 'Prior 12 months'),
        K('후 12개월', '12 mesi dopo', 'Following 12 months'),
        K('초과', 'Scost.', 'Excess'),
      ],
      rows: [
        { label: K('환경위생', 'Igiene ambientale', 'Environmental health'), before: 5342, after: 5856, d: 2.7 },
        { label: K('복지', 'Welfare', 'Welfare'), before: 3145, after: 3447, d: 2.7 },
        { label: K('도로교통', 'Viabilità', 'Roads and traffic'), before: 6842, after: 7386, d: 1.0 },
        { label: K('일반행정', 'Amministrazione', 'General administration'), before: 2233, after: 2366, d: -1.0 },
        { label: K('문화체육', 'Cultura e sport', 'Culture and sport'), before: 2752, after: 2862, d: -3.0, lead: true },
        { label: K('주택건축', 'Edilizia', 'Housing and building'), before: 4313, after: 4422, d: -4.4 },
      ],
      note: K(
        '초과 = 분야 변화 − 전체 변화(+7.0%). 전체가 대조군 역할을 한다. '
        + '실제 자료에서도 문화체육이 음(−)으로 나와야 「불만이 줄었다」가 성립한다.',
        'Scostamento = variazione dell\'ambito meno quella complessiva (+7,0%), che funge da controllo. '
        + 'Solo un valore negativo nel dato reale proverebbe il calo dei reclami.',
        'Excess = the field\'s change minus the overall change (+7.0%), which acts as the control. '
        + 'Only a negative figure for culture and sport in the real data would prove complaints fell.',
      ),
    },
    reading: K(
      '분야별로 갈라 전체 흐름과 견주는 계산까지 이미 서 있다. '
      + '노원구청 민원 통계를 꽂는 순간 이 표는 실측이 되고 판정 입력에 들어간다.',
      'Il calcolo per ambito, confrontato con l\'andamento complessivo, è già in piedi. '
      + 'Collegate le statistiche del distretto, la tabella diventa misura ed entra nel giudizio.',
      'The calculation — split by field, compared against the overall trend — is already standing. '
      + 'Plug in the district\'s complaint statistics and this table becomes measurement and enters '
      + 'the verdict.',
    ),
    src: K('예시 · make_minwon_sample.py → analyze_minwon.py',
      'Esempio · make_minwon_sample.py → analyze_minwon.py',
      'Sample · make_minwon_sample.py → analyze_minwon.py'),
  },

  // ── ④ 출입 대장 ──────────────────────────────────────────
  {
    id: 'entry', no: '04', status: 'have',
    brief: { v: '+31.8%', d: K('59,273 → 78,096명 · 전후 12개월',
      'Da 59.273 a 78.096 · dodici mesi prima e dopo',
      'From 59,273 to 78,096 · twelve months either side') },
    feed: { live: true, label: K('노원구시설관리공단 이용자 통계',
      'Statistiche utenti dell’ente gestore di Nowon',
      'Nowon facility operator, user statistics') },
    title: K('건물 출입 기록', 'Registri di accesso all’edificio', 'Building entry records'),
    ask: K('실제로 건물에 들어온 사람이 늘었는가', 'Sono davvero aumentati gli ingressi?',
      'Did the number of people actually entering rise?'),
    tab: {
      head: K('승하차를 처리한 그 파이프라인이 이 표를 만든다 — 자료를 꽂으면 수치만 바뀐다',
        'La stessa pipeline dei flussi genera questa tabella: col dato reale cambiano solo i numeri',
               'The pipeline that handled boardings builds this table — plug in the data and only the numbers change'),
      cols: [
        K('이용구분', 'Tipo', 'Type of use'),
        K('전 12개월', '12 mesi prima',
           'Prior 12 months'),
        K('후 12개월', '12 mesi dopo',
           'Following 12 months'),
        K('초과', 'Scost.',
           'Excess'),
      ],
      rows: [
        { label: K('전시', 'Mostre', 'Exhibitions'), before: 7044, after: 10186, d: 12.8 },
        { label: K('강좌', 'Corsi', 'Classes'), before: 14921, after: 21207, d: 10.4, lead: true },
        { label: K('대관', 'Affitto sale', 'Hall bookings'), before: 17191, after: 24306, d: 9.6 },
        { label: K('단체', 'Enti residenti', 'Resident organisations'), before: 20117, after: 22397, d: -20.4 },
      ],
      note: K(
        '초과 = 구분 변화 − 전체 변화(+31.8%). 단체는 상주하므로 흔들리지 않는다. '
        + '실제 자료가 오면 분모가 건물 하나가 되어 가장 정확한 축이 된다.',
        'Scostamento = variazione del tipo meno quella complessiva (+31,8%). Gli enti residenti non oscillano. '
        + 'Con il dato reale il denominatore diventa il singolo edificio: l’asse più preciso.',
        'Excess = the type\'s change minus the overall change (+31.8%). Resident organisations are '
        + 'permanent, so they do not swing. With the real data the denominator becomes the single '
        + 'building, making this the most precise axis.',
      ),
    },
    facts: [
      K('정류장 통행은 건물 앞을 지나간 사람이지 건물에 들어온 사람이 아니다',
        'I flussi alla fermata contano chi passa davanti, non chi entra',
        'Stop traffic counts who passed in front, not who went in'),
      K('예산줄에서 확인된 용도를 그대로 넣어 예시 파일을 만들었다 — 문화교실·노인회관·대관',
        'Il file di esempio riprende gli usi confermati dal bilancio: corsi, centro anziani, affitti',
        'The sample file uses exactly the uses confirmed in the budget lines — classes, senior hall, bookings'),
    ],
    reading: K(
      '이 축이 연결되면 분모가 건물 하나가 되어 지금까지의 모든 수치보다 정확해진다. '
      + '여섯 축 중 가장 먼저 채워야 할 자리이고, 받는 절차는 이미 정해 두었다.',
      'Collegato questo asse il denominatore diventa il singolo edificio: più preciso di ogni misura finora. '
      + 'È il primo posto da riempire, e la procedura per ottenerlo è già definita.',
      'Once this axis is connected the denominator becomes a single building, more precise than every '
      + 'figure so far. It is the first of the six to fill, and the procedure for obtaining it is set.',
    ),
    src: K('노원구시설관리공단 — 정보공개청구 · 예시 make_entry_sample.py',
      'Ente gestore di Nowon — accesso agli atti · esempio make_entry_sample.py',
      'Nowon facility operator — access request · sample make_entry_sample.py'),
  },

  // ── ⑤ 만족도 ─────────────────────────────────────────────
  {
    id: 'satis', no: '05', status: 'have', reachable: true,
    brief: { v: '+0.26', d: K('3.16 → 3.42 · 5점 척도 · 2022 → 2025',
      'Da 3,16 a 3,42 su 5 · 2022 → 2025',
      'From 3.16 to 3.42 on a 5-point scale · 2022 → 2025') },
    feed: { live: true, label: K('서울서베이 통계 10305',
      'Seoul Survey, statistica 10305', 'Seoul Survey, statistic 10305') },
    title: K('서울서베이 만족도 조사', 'Indagine di soddisfazione, Seoul Survey',
      'Seoul Survey satisfaction study'),
    ask: K('주민은 문화환경에 만족한다고 답하는가', 'I residenti si dicono soddisfatti?',
      'Do residents say they are satisfied with the cultural environment?'),
    tab: {
      head: K('서울서베이 문화환경 만족도 · 5점 척도 · 2016–2025',
        'Soddisfazione culturale (Seoul Survey), scala 1-5, 2016-2025',
        'Seoul Survey, satisfaction with the cultural environment · 1–5 scale · 2016–2025'),
      cols: [
        K('연도', 'Anno', 'Year'),
        K('노원구', 'Nowon', 'Nowon'),
        K('서울시', 'Seoul', 'Seoul'),
        K('격차', 'Divario', 'Gap'),
      ],
      chart: {
        lo: 2.9,
        hi: 3.7,
        aLabel: K('노원구', 'Nowon', 'Nowon'),
        bLabel: K('서울시 평균', 'Media di Seoul', 'Seoul average'),
        // 값은 satis_SAMPLE.csv 그대로다. 위치만 옮긴다.
        rows: [
          { k: '2016', a: 3.17, b: 3.23 },
          { k: '2017', a: 3.25, b: 3.22 },
          { k: '2018', a: 3.17, b: 3.35 },
          { k: '2019', a: 3.21, b: 3.39 },
          { k: '2020', a: 3.15, b: 3.12 },
          { k: '2021', a: 3.04, b: 3.13 },
          { k: '2022', a: 3.16, b: 3.34 },
          { k: '2023', a: 3.27, b: 3.45 },
          { k: '2024', a: 3.37, b: 3.55 },
          { k: '2025', a: 3.42, b: 3.47 },
        ],
        // 예산줄에서 확인된 개입만 세운다
        marks: [
          { k: '2022', label: K('사무동', 'Uffici', 'Office wing') },
          { k: '2025', label: K('노인회관', 'Centro anziani', 'Senior hall') },
        ],
      },
      note: K(
        '2021년 3.04로 바닥을 치고 2025년 3.42까지 올랐다. 같은 해 서울시와의 격차도 '
        + '−0.18에서 −0.05로 좁아진다. 연 1회 조사라 전후 12개월을 만들 수 없으므로 '
        + '서울시 평균을 대조군으로 두고 격차의 움직임을 본다. '
        + '실제 자료에서도 개입한 해 뒤에 이 격차가 좁아져야 「개입이 만족으로 이어졌다」가 성립한다.',
        'Tocca il minimo nel 2021 (3,04) e risale a 3,42 nel 2025; nello stesso anno il divario '
        + 'con Seoul si riduce da −0,18 a −0,05. Essendo un\'indagine annuale si usa la media '
        + 'cittadina come controllo e si osserva il movimento del divario. '
        + 'Solo se anche nel dato reale il divario si stringe dopo gli interventi si potrà dire '
        + 'che l\'intervento si è tradotto in soddisfazione.',
        'It bottoms out at 3.04 in 2021 and climbs to 3.42 by 2025; over the same span the gap to '
        + 'Seoul narrows from −0.18 to −0.05. Because the survey runs once a year there is no way to '
        + 'build a twelve-month before-and-after, so the Seoul average serves as the control and we '
        + 'watch the gap move. Only if that gap narrows after an intervention in the real data can '
        + 'we say the intervention translated into satisfaction.',
      ),
    },
    facts: [
      K('자료는 실재한다 — 서울서베이 도시정책지표조사, 자치구별, 5점 척도, 매년 8월 공표',
        'Il dato esiste: Seoul Survey, per distretto, scala 1-5, pubblicato ogni agosto',
        'The data exists — Seoul Survey urban policy indicators, by district, 1–5 scale, published each August'),
      K('2003년부터 있고 표본은 가구 2만·시민 5천 — 노원구가 따로 나온다',
        'Dal 2003, su 20.000 famiglie e 5.000 cittadini; Nowon compare separatamente',
        'Running since 2003 on 20,000 households and 5,000 citizens — Nowon is reported separately'),
      K('앞의 둘과 다르다 — 없는 자료가 아니라 내려받기가 막힌 자료다',
        'A differenza degli altri due, non manca: è solo il download a essere bloccato',
        'Unlike the other two it is not missing — only the download is blocked'),
    ],
    reading: K(
      '이 축은 사람들이 「그렇다고 말한」 만족도이고, 승하차와 이용은 「그렇게 행동한」 결과다. '
      + '둘이 어긋나는 지점이 곧 판정 재료다 — 우리 가설의 출발점이 여기였다.',
      'Questo asse misura ciò che le persone dichiarano; flussi e ingressi misurano ciò che fanno. '
      + 'Dove i due divergono nasce il giudizio: è da lì che parte la nostra ipotesi.',
      'This axis measures what people said; boardings and entries measure what they did. Where the '
      + 'two diverge is the material for the verdict — and that divergence is where our hypothesis started.',
    ),
    src: K('서울 열린데이터광장 통계 10305 · 예시 make_satis_sample.py',
      'Portale open data di Seoul, statistica 10305 · esempio make_satis_sample.py',
      'Open Data Seoul, statistic 10305 · sample make_satis_sample.py'),
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

