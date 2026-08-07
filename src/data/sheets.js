/**
 * 근거 시트 — 이 수치가 어디서 나왔는가.
 *
 * 「앞 정류장 승하차 +5.3%p」라고만 쓰면 앞 정류장이 어디인지, 그 수가
 * 어느 파일 몇 번째 줄에서 나왔는지 알 수 없다. 카드를 누르면 그것이 보여야 한다.
 *
 * 각 시트는 넷을 담는다.
 *   where  무엇을 쟀는가 (지점이면 좌표와 거리)
 *   rows   원자료 실제 몇 줄
 *   calc   그 줄에서 결론까지의 계산
 *   src    파일 경로와 공개 위치
 */

const K = (ko, it) => ({ ko, it })

/** 대상지 — 모든 거리의 기준점 */
export const ORIGIN = {
  label: K('대상지 · 노원구민의전당', 'Sito · Auditorium di Nowon'),
  addr: '서울 노원구 동일로 1229',
  lat: 37.63896054595598,
  lng: 127.06634512230045,
}

/**
 * 지도에 찍는 지점. 좌표는 V-World 장소검색, 거리는 haversine 실측.
 * kind — stop 정류장 · bldg 건물 · site 대상지
 */
export const PLACES = [
  {
    id: '11367', kind: 'stop', lead: true,
    label: K('노원구민의전당 정류장', 'Fermata Auditorium di Nowon'),
    sub: 'ARS 11367',
    addr: '서울 노원구 동일로 1231-2',
    lat: 37.639366, lng: 127.066466, m: 46,
    note: K('이것이 「앞 정류장」이다 — 대상지에서 46 m',
      'È questa la "fermata davanti": 46 m dal sito'),
  },
  {
    id: '11374', kind: 'stop',
    label: K('북서울미술관 정류장', 'Fermata Museo Buk-Seoul'),
    sub: 'ARS 11374',
    addr: '서울 노원구 동일로 1231-2',
    lat: 37.640599, lng: 127.066333, m: 182,
    note: K('같은 축선의 다음 정류장', 'Fermata successiva sullo stesso asse'),
  },
  {
    id: 'sema', kind: 'bldg',
    label: K('서울시립북서울미술관', 'Museo Buk-Seoul'),
    sub: '2013',
    addr: '서울 노원구 동일로 1238',
    lat: 37.640894, lng: 127.066766, m: 218,
  },
]

/** 카드 id → 근거 시트 */
export const SHEETS = {
  // ── 승하차 ──────────────────────────────────────────────
  bus: {
    title: K('앞 정류장이 어디인가', 'Qual è la "fermata davanti"'),
    map: true,
    where: K(
      '대상지 정문 앞 동일로변 정류장이다. 좌표는 V-World 장소검색으로 확인했고 '
      + '거리는 대상지 지오코딩 좌표에서 haversine 으로 쟀다. '
      + '정류장 이름 자체가 2021년 5월에 「노원구민회관」에서 「노원구민의전당」으로 바뀌었다 — '
      + '그 달을 기준 사건으로 삼은 이유가 이것이다.',
      'È la fermata su Dongil-ro davanti all\'ingresso. Coordinate da V-World, '
      + 'distanza calcolata con la formula dell\'emisenoverso. Il nome della fermata stessa '
      + 'è cambiato nel maggio 2021: da qui la scelta della data di riferimento.',
    ),
    cols: ['ARS', '역명', '사용년월', '승차', '하차', '합계'],
    rows: [
      ['11367', '노원구민회관', '202104', '28,914', '29,105', '58,019'],
      ['11367', '노원구민의전당', '202105', '30,102', '30,441', '60,543'],
      ['11367', '노원구민의전당', '202607', '38,410', '39,028', '77,438'],
    ],
    rowNote: K('실제 파일에서 뽑은 세 줄. 202105 부터 역명이 바뀐다.',
      'Tre righe reali dal file: da 202105 cambia il nome della fermata.'),
    calc: [
      K('전 12개월(2020.05–2021.04) 월평균 = 58,785', 'Media 12 mesi prima = 58.785'),
      K('후 12개월(2021.05–2022.08) 월평균 = 64,274', 'Media 12 mesi dopo = 64.274'),
      K('변화 = 64,274 ÷ 58,785 − 1 = +9.3%', 'Variazione = +9,3%'),
      K('같은 기간 노원구 나머지 정류장 = +4.1% (대조군)',
        'Stesso periodo, resto delle fermate di Nowon = +4,1%'),
      K('초과 = 9.3 − 4.1 = +5.3%p', 'Scostamento = +5,3 p.p.'),
    ],
    src: {
      raw: K('서울 열린데이터광장 OA-12913 · 노원구 566개 정류장 · 2015.01–2026.07',
        'Portale open data di Seoul OA-12913 · 566 fermate · 2015.01–2026.07'),
      file: 'signals/nowon_stops_monthly.csv · 49,909행',
      script: 'signals/analyze_events.py',
    },
    limit: K(
      '2023·2024·2025년은 각각 한 달치만 공표됐다. 그래서 연도 비교는 7월끼리만 한다.',
      'Per 2023, 2024 e 2025 è pubblicato un solo mese: i confronti annuali usano solo luglio.',
    ),
  },

  // ── 소비 ────────────────────────────────────────────────
  age: {
    title: K('어느 상권을 어떻게 잘랐는가', 'Quale area commerciale e come'),
    where: K(
      '대상지 반경의 상권만 골랐다. 상권 코드명에 중계·하계·은행사거리·불암이 들어간 것을 '
      + '정규식으로 걸러 2025년 분기 자료를 합쳤다.',
      'Selezionate solo le aree attorno al sito filtrando i codici che contengono '
      + 'Junggye, Hagye, Eunhaeng-sageori, Buram; aggregati i trimestri 2025.',
    ),
    cols: ['업종', '매출(억원)', '비중'],
    rows: [
      ['일반교습학원', '725', '34.1%'],
      ['일반의원', '415', '19.5%'],
      ['슈퍼마켓', '353', '16.6%'],
    ],
    calc: [
      K('업종별 당월매출금액을 상권 전체로 합산', 'Somma del fatturato mensile per settore'),
      K('연령대별 매출금액 컬럼을 따로 합산 — 40대 50.1% · 50대 38.3% · 60대+ 0%',
        'Somma separata per fascia d\'età: 40enni 50,1%, 50enni 38,3%, over 60 nullo'),
    ],
    src: {
      raw: K('서울시 상권분석서비스 추정매출 · 업종 100종 · 요일·시간대·성별·연령대 분해',
        'Servizio di analisi commerciale di Seoul · 100 settori'),
      file: 'signals/demand_junggye.csv · 34업종',
      script: 'signals/analyze_demand.py',
    },
    limit: K(
      '2025년 한 해 자료라 전후로 나눌 수 없다. 60대+ 열이 정말 0인지, '
      + '연령 구간이 50대에서 끊기는지도 확인하지 못했다.',
      'Un solo anno (2025): non divisibile in prima e dopo. Né è verificato se la colonna '
      + 'over-60 sia davvero nulla o se le fasce si fermino ai 50.',
    ),
  },

  // ── 예산 ────────────────────────────────────────────────
  budget: {
    title: K('예산 어느 줄을 읽었는가', 'Quali righe di bilancio'),
    where: K(
      '노원구 세출예산 4개 연도에서 사업명에 「노원문화예술회관」 또는 「구민의전당」이 '
      + '들어간 줄만 골랐다. 두 이름은 같은 건물을 가리킨다 — 소관 부서만 다르다.',
      'Dalle quattro annualità del bilancio di Nowon sono state estratte le righe il cui '
      + 'progetto contiene "auditorium culturale" o "centro civico": due nomi, un solo edificio.',
    ),
    cols: ['연도', '부서', '사업', '편성', '지출'],
    rows: [
      ['2022', '문화도시과', '노원문화예술회관 리모델링', '3,379', '12'],
      ['2023', '문화도시과', '노원문화예술회관 리모델링', '3,366', '415'],
      ['2024', '문화도시과', '노원문화예술회관 리모델링', '3,153', '9,417'],
      ['2024', '어르신지원과', '구민의전당 내 노인회관 건립', '255', '345'],
      ['2025', '문화도시과', '노원문화예술회관 리모델링', '0', '0'],
    ],
    rowNote: K('단위 백만원. 2024년 지출이 편성을 넘는 것은 이월·추경이 겹쳤기 때문이다.',
      'In milioni di won. Nel 2024 la spesa supera lo stanziamento per riporti e assestamenti.'),
    calc: [
      K('이 건물 투입 합계 — 2022년 5,079 → 2025년 348 (백만원)',
        'Totale su questo edificio: da 5.079 (2022) a 348 (2025)'),
      K('2024년 실집행 94.2억이 생애주기 곡선의 설비 공사비 근거가 된다',
        'I 9,42 mld spesi nel 2024 fondano il costo impiantistico della curva di ciclo di vita'),
    ],
    src: {
      raw: K('서울재정포털 노원구 세출예산 2022–2025', 'Portale finanziario di Seoul, bilancio di Nowon'),
      file: 'budget/nowon_2022~2025.csv · 5,141행',
      script: 'budget/highlight.py',
    },
  },

  // ── 미확보 둘 ───────────────────────────────────────────
  minwon: {
    title: K('실데이터가 없어 예시로 흐름만 보인다',
      'Senza dato reale, resta visibile solo il flusso'),
    sample: true,
    where: K(
      '노원구 단위 민원 통계는 공개돼 있지 않다. 공공데이터포털에서 실제로 받아 열어 보니 '
      + '전국 처리건수와 언어별 집계뿐이었다(자료 15066811 · 3070323). '
      + '자치구 분해는 정보공개청구로만 얻는다. '
      + '그래서 지자체 민원 통계의 통상 형식대로 예시 파일을 만들어 두었다 — '
      + '실제 자료를 받으면 컬럼만 맞춰 그대로 갈아 끼운다.',
      'Le statistiche per distretto non sono pubbliche: i dataset scaricabili contengono solo '
      + 'totali nazionali e conteggi per lingua. La disaggregazione si ottiene solo con accesso agli atti. '
      + 'Abbiamo quindi predisposto un file di esempio nel formato consueto: '
      + 'arrivato il dato reale, basterà sostituirlo.',
    ),
    cols: ['연월', '분야', '접수건수', '처리건수', '평균처리일'],
    rows: [
      ['202104', '문화체육', '282', '275', '8.4'],
      ['202105', '문화체육', '251', '231', '5.4'],
      ['202607', '문화체육', '290', '283', '8.5'],
    ],
    rowNote: K('예시 파일에서 그대로 뽑은 세 줄. 546행 · 2019.01–2026.07 · 분야 6종.',
      'Tre righe prese dal file di esempio: 546 righe, 2019.01–2026.07, sei ambiti.'),
    calc: [
      K('승하차와 같은 방식으로 전후 12개월을 잰다 — 전 2020.05–2021.04 · 후 2021.05–2022.04',
        'Si misurano 12 mesi prima e dopo, come per i flussi'),
      K('전체 24,627건 → 26,339건 · +7.0% (이것이 대조군 역할을 한다)',
        'Totale da 24.627 a 26.339: +7,0%, che funge da controllo'),
      K('분야별로 나눠 전체 대비 초과분을 본다 — 문화체육 −3.0%p · 주택건축 −4.4%p',
        'Per ambito si osserva lo scostamento: cultura −3,0 p.p., edilizia −4,4 p.p.'),
      K('이 −3.0%p 는 지어낸 값이다. 실제 자료에서도 음(−)이 나와야 「불만이 줄었다」가 성립한다',
        'Quel −3,0 è inventato: solo un valore negativo nel dato reale proverebbe il calo'),
    ],
    src: {
      raw: K('실데이터 없음 — 공공데이터포털 15066811 은 전국 합계뿐',
        'Nessun dato reale: il dataset 15066811 contiene solo totali nazionali'),
      file: 'signals/minwon_SAMPLE.xlsx · 546행 (예시)',
      script: 'signals/make_minwon_sample.py → analyze_minwon.py',
    },
    missing: true,
  },

  entry: {
    title: K('가장 맞는 자료가 무엇에 막혔는가', 'Che cosa blocca il dato più pertinente'),
    where: K(
      '「서울특별시 동북권 공공도서관 이용자 현황」이 가장 가깝다 — 노원구 포함 61개관, '
      + '2018–2023, 성별·연령별. 그런데 다운로드 버튼이 보안문자를 요구한다. '
      + '스크립트로는 원리적으로 못 뚫는다.',
      'Il dato più vicino è l\'utenza delle 61 biblioteche del quadrante nord-est (2018–2023, '
      + 'per genere ed età), ma il download richiede un CAPTCHA: non automatizzabile.',
    ),
    cols: null,
    rows: null,
    calc: [
      K('노원구시설관리공단에 정보공개청구하면 이 건물 자체의 대관·강좌·관람 이용자 수를 받을 수 있다',
        'Con una richiesta di accesso agli atti si otterrebbe l\'utenza reale di questo edificio'),
      K('그것이 채워지면 분모가 건물 하나가 되어 지금의 모든 수치보다 정확해진다',
        'Allora il denominatore diventerebbe il singolo edificio: più preciso di ogni misura attuale'),
    ],
    src: {
      raw: K('공공데이터포털 15146068 — CAPTCHA', 'Portale open data 15146068 — CAPTCHA'),
      file: null,
      script: null,
    },
    missing: true,
  },
}

export const REPO = 'https://github.com/nanpaul101556-hub/summerschool-teamD-data'

export const sheetOf = (id) => SHEETS[id] ?? null
