/**
 * 근거 계보 — 어떤 자료가 어떤 결론을 만들었고, 그 결론이 어느 안을 지지하는가.
 *
 * 그래스호퍼처럼 좌에서 우로 흐른다.
 *   원자료 → 처리 → 산출 → 검정 → 결론 → 대안
 *
 * 실패한 분석도 노드로 남긴다. 버스와 집값에서 신호를 못 잡은 것이
 * 따릉이로 옮긴 이유이므로, 그 사슬을 지우면 방법을 설명할 수 없다.
 *
 * 수치는 전부 실제 파일에서 센 것이다. 추정치를 쓰지 않는다.
 */

const K = (ko, it, en) => ({ ko, it, en })

/** 노드 종류. 색이 아니라 테두리·타이포로 구분한다 (Deck Minimal) */
export const KINDS = {
  source: { key: 'prov.k.source', mono: false },
  script: { key: 'prov.k.script', mono: true },
  dataset: { key: 'prov.k.dataset', mono: true },
  test: { key: 'prov.k.test', mono: true },
  finding: { key: 'prov.k.finding', mono: false },
  option: { key: 'prov.k.option', mono: false },
}

export const COLS = [
  { col: 0, key: 'prov.c.source' },
  { col: 1, key: 'prov.c.script' },
  { col: 2, key: 'prov.c.dataset' },
  { col: 3, key: 'prov.c.test' },
  { col: 4, key: 'prov.c.finding' },
  { col: 5, key: 'prov.c.option' },
]

/**
 * ok:false 는 신호를 못 잡은 분석이다. 실패가 아니라 결과다.
 * meta 는 노드 아래 작게 붙는 한 줄 — 규모나 기간처럼 검증 가능한 사실만.
 */
export const NODES = [
  // ── 0 원자료 ────────────────────────────────────────────
  {
    id: 'src.bike', kind: 'source', col: 0, row: 0,
    label: K('따릉이 대여소별 이용', 'Uso per stazione bike-sharing'),
    meta: 'OA-15249 · 26 files',
    detail: K(
      '서울 열린데이터광장. 파일 26개의 헤더 형식이 여덟 가지로 갈린다.',
      'Portale open data di Seoul. I 26 file hanno otto formati di intestazione diversi.',
    ),
    src: 'data.seoul.go.kr / OA-15249',
  },
  {
    id: 'src.bus', kind: 'source', col: 0, row: 1,
    label: K('버스 정류장별 승하차', 'Saliti/discesi per fermata'),
    meta: 'OA-12913',
    detail: K(
      '노원구 566개 정류장. 2016년 파일은 헤더와 데이터의 열이 어긋나 있다(공표 오류).',
      '566 fermate a Nowon. Nel file 2016 le colonne di intestazione e dati non coincidono (errore di pubblicazione).',
    ),
    src: 'data.seoul.go.kr / OA-12913',
  },
  {
    id: 'src.price', kind: 'source', col: 0, row: 2,
    label: K('아파트 실거래가', 'Compravendite di appartamenti'),
    meta: '2015–2019',
    detail: K(
      '서울부동산정보광장. 분기가 아니라 1월/2월/3월 블록 구조라 파서를 새로 썼다.',
      'Portale immobiliare di Seoul. Struttura a blocchi mensili, non trimestrale: parser riscritto.',
    ),
    src: 'land.seoul.go.kr',
  },
  {
    id: 'src.sales', kind: 'source', col: 0, row: 3,
    label: K('상권 추정매출', 'Fatturato commerciale stimato'),
    meta: K('업종 100종 · 연령대별', '100 settori · per fascia d\'età'),
    detail: K(
      '서울시 상권분석서비스. 요일·시간대·성별·연령대까지 나뉘어 이용층을 특정할 수 있다.',
      'Servizio di analisi commerciale di Seoul. Suddiviso per giorno, fascia oraria, genere ed età.',
    ),
    src: 'golmok.seoul.go.kr',
  },
  {
    id: 'src.budget', kind: 'source', col: 0, row: 4,
    label: K('노원구 세출예산', 'Bilancio di spesa di Nowon'),
    meta: '2022–2025',
    detail: K(
      '서울재정포털. 사업 단위 편성표를 4개 연도분 받았다.',
      'Portale finanziario di Seoul. Prospetti per singolo progetto, quattro annualità.',
    ),
    src: 'lofin.seoul.go.kr',
  },
  {
    id: 'src.plan40', kind: 'source', col: 0, row: 5,
    label: K('2040 서울도시기본계획', 'Piano urbanistico di Seoul 2040'),
    meta: '205 p.',
    detail: K(
      '서울 최상위 법정계획. 보행일상권과 Beyond Zoning Seoul 이 여기 있다.',
      'Piano statutario di livello superiore. Contiene il "boheang-ilsang-gwon" e Beyond Zoning Seoul.',
    ),
    src: 'source file / 상위 서울 폴더',
  },
  {
    id: 'src.plannowon', kind: 'source', col: 0, row: 6,
    label: K('노원구 탄소중립 기본계획', 'Piano carbon neutral di Nowon'),
    meta: '2025–2034 · 249 p.',
    detail: K(
      '인구추계와 노후 건물 현황이 실려 있다. 우리 앱의 인구 수치가 여기서 나온다.',
      'Contiene proiezioni demografiche e stato del patrimonio edilizio obsoleto.',
    ),
    src: 'source file / 노원구 데이터',
  },

  // ── 1 처리 ──────────────────────────────────────────────
  {
    id: 'p.bike', kind: 'script', col: 1, row: 0,
    label: 'build_bike.py',
    meta: K('헤더 8종 통합', 'unifica 8 formati'),
    detail: K(
      '컬럼 위치로 읽으면 매번 깨진다. 「연월처럼 생긴 칸 · 대여소처럼 생긴 칸 · 숫자 칸」을 각자 찾아 맞춘다.',
      'Leggere per posizione fallisce sempre. Individua separatamente la cella-mese, la cella-stazione e i numeri.',
    ),
    src: '03-data/signals/build_bike.py',
  },
  {
    id: 'p.geo', kind: 'script', col: 1, row: 1,
    label: 'geocode_bike.py',
    meta: K('83곳 중 57곳 좌표', '57 coordinate su 83'),
    detail: K(
      '대여소 마스터는 인증키 없이 못 받는다. 대여소명을 V-World 장소검색으로 되돌렸다. 오차 50~150 m.',
      'L\'anagrafica stazioni richiede una chiave. Coordinate ricostruite dai nomi via V-World. Errore 50–150 m.',
    ),
    src: '03-data/signals/geocode_bike.py',
  },
  {
    id: 'p.bus', kind: 'script', col: 1, row: 2,
    label: 'build_series.py',
    meta: K('96개월 복원', '96 mesi ricostruiti'),
    detail: K(
      '2016년 파일은 열이 한 칸 밀려 있어 ARS 번호 형태로 어긋남을 감지해 되돌렸다.',
      'Nel file 2016 le colonne slittano di uno: disallineamento rilevato dal formato del codice ARS.',
    ),
    src: '03-data/signals/build_series.py',
  },
  {
    id: 'p.price', kind: 'script', col: 1, row: 3,
    label: 'analyze_price.py',
    meta: K('43,942건 집계', '43.942 transazioni'),
    detail: K('개별 거래를 월별 평균 단가로 집계했다.', 'Transazioni aggregate in prezzo medio mensile al m².'),
    src: '03-data/signals/analyze_price.py',
  },
  {
    id: 'p.demand', kind: 'script', col: 1, row: 4,
    label: 'analyze_demand.py',
    meta: K('중계·하계 상권', 'aree di Junggye e Hagye'),
    detail: K(
      '대상지 일대 상권만 뽑아 업종별·연령대별 매출을 집계했다.',
      'Estratte solo le aree commerciali attorno al sito, aggregate per settore ed età.',
    ),
    src: '03-data/signals/analyze_demand.py',
  },
  {
    id: 'p.budget', kind: 'script', col: 1, row: 5,
    label: 'highlight.py',
    meta: K('필요 항목 추출', 'estrae le voci utili'),
    detail: K('5,141행에서 우리 용도와 관련된 사업만 걸러냈다.', 'Da 5.141 righe filtrati i soli progetti pertinenti.'),
    src: '03-data/budget/highlight.py',
  },
  {
    id: 'p.pdf', kind: 'script', col: 1, row: 6,
    label: '_highlight.py',
    meta: K('근거 21건 표시', '21 passaggi evidenziati'),
    detail: K(
      '무차별 키워드 검색은 하지 않는다. 문맥을 읽고 고른 문장만 갈래별 색으로 표시한다.',
      'Nessuna ricerca automatica per parola chiave: solo passaggi scelti leggendo il contesto.',
    ),
    src: 'source file/_highlight.py',
  },

  // ── 2 산출 ──────────────────────────────────────────────
  {
    id: 'd.bike', kind: 'dataset', col: 2, row: 0,
    label: 'bike_nowon_monthly.csv',
    meta: '7,906 · 2017.01–2026.06',
    detail: K(
      '노원구 대여소 83곳 · 114개월. 대여와 반납이 함께 들어 있다.',
      '83 stazioni a Nowon · 114 mesi. Include sia prelievi sia riconsegne.',
    ),
    src: '03-data/signals/bike_nowon_monthly.csv',
  },
  {
    id: 'd.geo', kind: 'dataset', col: 2, row: 1,
    label: 'bike_nowon_geo.csv',
    meta: K('83곳 · 대상지 거리', '83 stazioni · distanza dal sito'),
    detail: K('각 대여소의 좌표와 대상지까지의 직선거리.', 'Coordinate di ogni stazione e distanza in linea d\'aria dal sito.'),
    src: '03-data/signals/bike_nowon_geo.csv',
  },
  {
    id: 'd.bus', kind: 'dataset', col: 2, row: 2,
    label: 'nowon_stops_monthly.csv',
    meta: '49,909 · 2015.01–2026.07',
    detail: K(
      '노원구 566개 정류장의 월별 승하차. 범위는 138개월이지만 실제로 들어온 것은 96개월이다 — 공표 형식이 바뀐 구간이 비어 있다.',
      '566 fermate di Nowon, dati mensili. L\'arco è di 138 mesi ma ne risultano 96: mancano i periodi in cui è cambiato il formato di pubblicazione.',
    ),
    src: '03-data/signals/nowon_stops_monthly.csv',
  },
  {
    id: 'd.price', kind: 'dataset', col: 2, row: 3,
    label: 'apt_price_monthly.csv',
    meta: '240 · 2015.01–2019.12',
    detail: K('동별 월평균 ㎡당 거래가.', 'Prezzo medio mensile al m² per quartiere.'),
    src: '03-data/signals/apt_price_monthly.csv',
  },
  {
    id: 'd.demand', kind: 'dataset', col: 2, row: 4,
    label: 'demand_junggye.csv',
    meta: K('34업종', '34 settori'),
    detail: K('대상지 일대 업종별 매출과 비중.', 'Fatturato e quota per settore attorno al sito.'),
    src: '03-data/signals/demand_junggye.csv',
  },
  {
    id: 'd.budget', kind: 'dataset', col: 2, row: 5,
    label: 'nowon_highlight.csv',
    meta: K('1,180행', '1.180 righe'),
    detail: K('우리 용도와 관련된 사업만 남긴 예산표.', 'Prospetto ridotto ai soli progetti pertinenti.'),
    src: '03-data/budget/nowon_highlight.csv',
  },

  // ── 3 검정 ──────────────────────────────────────────────
  {
    id: 't.bikeuse', kind: 'test', col: 3, row: 0,
    label: 'analyze_bike.py',
    meta: K('반납÷대여 · 순위', 'riconsegne÷prelievi · classifica'),
    detail: K(
      '반경 700 m 대여소의 유입·유출 성격과 노원구 76곳 중 순위를 낸다.',
      'Carattere di afflusso/deflusso entro 700 m e posizione tra le 76 stazioni di Nowon.',
    ),
    src: '03-data/signals/analyze_bike.py',
  },
  {
    id: 't.placebo', kind: 'test', col: 3, row: 1,
    label: 'placebo_bike.py',
    meta: K('플라시보 7 · 평행추세', '7 placebo · trend paralleli'),
    detail: K(
      '폐쇄가 없던 달 여섯 개를 가짜 폐쇄일로 두고 같은 계산을 돌렸다. 일곱 중 실제 폐쇄일에서만 거리순 단조가 나왔다.',
      'Sei mesi senza chiusura usati come date fittizie. Solo la data reale produce un andamento monotono con la distanza.',
    ),
    src: '03-data/signals/placebo_bike.py',
  },
  {
    id: 't.busdid', kind: 'test', col: 3, row: 2, ok: false,
    label: 'analyze_openings.py',
    meta: K('DID · 노원우주학교 2017.06', 'DID · apertura 2017.06'),
    detail: K(
      '시설 개관 전후를 정류장 승하차로 비교했다. 효과 +0.8%p, 플라시보 +1.2%p — 플라시보가 더 크다.',
      'Confronto pre/post apertura sui saliti/discesi. Effetto +0,8 p.p., placebo +1,2 p.p.: il placebo è maggiore.',
    ),
    src: '03-data/signals/analyze_openings.py',
  },
  {
    id: 't.pricedid', kind: 'test', col: 3, row: 3, ok: false,
    label: K('가격 DID', 'DID sui prezzi'),
    meta: K('평행추세 위반', 'trend paralleli violati'),
    detail: K(
      '효과 −1.1%, 평행추세 −6.8%p, 플라시보 −3.4%. 가정이 깨져 추정 자체가 성립하지 않는다.',
      'Effetto −1,1%, pre-trend −6,8 p.p., placebo −3,4%. L\'ipotesi cade: la stima non regge.',
    ),
    src: '03-data/signals/analyze_price.py',
  },

  // ── 4 결론 ──────────────────────────────────────────────
  {
    id: 'f.dest', kind: 'finding', col: 4, row: 0,
    label: K('대상지는 목적지다', 'Il sito è una destinazione'),
    meta: K('반납÷대여 1.036', 'riconsegne÷prelievi 1,036'),
    detail: K(
      '들어오는 사람이 나가는 사람보다 많다. 중평어린이공원 1.102는 노원구 유입 3위. 사람이 사는 곳이 아니라 오는 곳이다.',
      'Entrano più persone di quante escano. Junpyeong 1,102 è terzo per afflusso a Nowon: non un luogo dove si abita, ma dove si va.',
    ),
    limit: K(
      '따릉이 이용자는 젊은 층에 편향된다. 고령 수요의 신호로는 약하다.',
      'Gli utenti del bike-sharing sono sbilanciati verso i giovani: segnale debole per la domanda anziana.',
    ),
    src: '03-data/FINDING-bike.md',
  },
  {
    id: 'f.radius', kind: 'finding', col: 4, row: 1,
    label: K('생활권은 300~400 m', 'Il bacino reale è 300–400 m'),
    meta: K('거리순 단조 · 플라시보 통과', 'monotono · placebo superato'),
    detail: K(
      '대상지 앞 대여소가 2020.01 폐쇄됐다. 123 m +53%p, 339 m +37%p, 425 m +5%p, 685 m −27%p — 거리 순서 그대로 줄을 섰다.',
      'La stazione davanti al sito ha chiuso nel 01.2020. 123 m +53 p.p., 339 m +37, 425 m +5, 685 m −27: ordinati per distanza.',
    ),
    limit: K(
      '평행추세가 깨졌다. 크기는 인용할 수 없고 순위 역전만 인용한다. 사례도 하나뿐이다.',
      'I trend paralleli sono violati: citabile solo l\'inversione di rango, non l\'entità. E il caso è uno solo.',
    ),
    src: '03-data/FINDING-bike.md',
  },
  {
    id: 'f.nobus', kind: 'finding', col: 4, row: 2, ok: false,
    label: K('신설의 통행 효과 없음', 'Nessun effetto sui flussi'),
    meta: K('플라시보가 더 컸다', 'placebo maggiore dell\'effetto'),
    detail: K(
      '시설을 새로 지어도 주변 정류장 통행량은 변하지 않았다. 이것도 결과다 — 신설이 수요를 만들지 않는다.',
      'Un nuovo edificio non ha cambiato i flussi alle fermate vicine. Anche questo è un risultato.',
    ),
    src: '03-data/METHOD-satisfaction.md',
  },
  {
    id: 'f.noprice', kind: 'finding', col: 4, row: 3, ok: false,
    label: K('자산가치 효과도 없음', 'Nessun effetto sui valori'),
    meta: K('평행추세 위반', 'trend paralleli violati'),
    detail: K(
      '동네 집값은 서울 전체 파도에 휩쓸린다. 시설 하나의 몫을 분리할 수 없었다.',
      'I prezzi locali seguono l\'onda dell\'intera città: impossibile isolare il contributo di un singolo edificio.',
    ),
    src: '03-data/METHOD-satisfaction.md',
  },
  {
    id: 'f.denominator', kind: 'finding', col: 4, row: 4,
    label: K('분모가 작아야 보인다', 'Serve un denominatore piccolo'),
    meta: K('두 번의 실패가 만든 진단', 'diagnosi nata da due fallimenti'),
    detail: K(
      '정류장은 월 9만 회, 집값은 서울 전체. 시설 하나 몫이 3% 아래로 내려가면 어떤 기법으로도 못 건진다. 따릉이 대여소는 월 1~3천 회다.',
      'Una fermata fa 90.000 corse al mese, i prezzi seguono la città. Sotto il 3% nessun metodo recupera il segnale. Una stazione bici ne fa 1.000–3.000.',
    ),
    src: '03-data/IDEAS-satisfaction-data.md',
  },
  {
    id: 'f.consume', kind: 'finding', col: 4, row: 5,
    label: K('소비는 학원 34% · 60대+ 0%', 'Consumi: 34% doposcuola, 0% over-60'),
    meta: K('40대 50.1% · 50대 38.3%', '40enni 50,1% · 50enni 38,3%'),
    detail: K(
      '대상지 일대 매출은 일반교습학원 34.1%(725억), 일반의원 19.5%, 슈퍼마켓 16.6%. 60대 이상 소비가 잡히지 않는다.',
      'Il fatturato locale: doposcuola 34,1%, ambulatori 19,5%, supermercati 16,6%. Gli over-60 non compaiono.',
    ),
    limit: K(
      '60대+ 열이 정말 0인지, 연령 구간이 50대에서 끊기는지 아직 확인하지 못했다.',
      'Non è ancora verificato se la colonna over-60 sia davvero nulla o se le fasce si fermino ai 50.',
    ),
    src: '03-data/signals/demand_junggye.csv',
  },
  {
    id: 'f.budget', kind: 'finding', col: 4, row: 6,
    label: K('시설조성 예산 −58%', 'Spesa per nuove strutture −58%'),
    meta: K('사업 수 117 → 70', 'progetti 117 → 70'),
    detail: K(
      '상위 6개 사업의 점유가 35%에서 60%로 올랐다. 적은 사업에 몰아주는 방향이다.',
      'La quota dei sei progetti maggiori sale dal 35% al 60%: si concentra su meno interventi.',
    ),
    limit: K(
      '의료·재활 −33%와 공원·녹지 −51%는 일회성 사업 종료 탓이라 쓰지 않는다.',
      'I cali in sanità (−33%) e verde (−51%) derivano da progetti una tantum conclusi: non utilizzabili.',
    ),
    src: '03-data/budget-genealogy.md',
  },
  {
    id: 'f.pop', kind: 'finding', col: 4, row: 7,
    label: K('인구 감소 1위 · 고령 36.2%', 'Primo per calo · anziani 36,2%'),
    meta: K('25개 자치구 중', 'su 25 distretti'),
    detail: K(
      '노원구는 25개 자치구 중 인구가 가장 많이 줄 것으로 예상된다. 고령인구는 2025년 20.9%에서 2042년 36.2%로, 유소년의 약 5배가 된다.',
      'Nowon è il distretto con il calo demografico previsto maggiore. Gli anziani passano dal 20,9% (2025) al 36,2% (2042).',
    ),
    src: 'source file/00-상위계획_근거.md',
  },
  {
    id: 'f.zoning', kind: 'finding', col: 4, row: 8,
    label: K('용도를 미리 정하면 못 따라간다', 'Fissare la destinazione blocca'),
    meta: 'Beyond Zoning Seoul',
    detail: K(
      '2040 서울도시기본계획 p.67 — 용도지역제는 "토지의 기능을 선도적으로 규정하는 경직성"으로 "선제적으로 대응하는 데 한계"가 있다. 서울시가 도시 단위에서 인정한 문제다.',
      'Piano 2040, p.67: lo zoning ha una "rigidità" che ne limita la capacità di risposta. Seoul lo ammette a scala urbana.',
    ),
    limit: K(
      '용도지역제에 관한 서술이지 개별 건물의 가변성을 말한 것이 아니다. 원칙만 빌려 온다.',
      'Riguarda lo zoning, non la flessibilità del singolo edificio: se ne mutua solo il principio.',
    ),
    src: 'source file/00-상위계획_근거.md',
  },
  {
    id: 'f.museum', kind: 'finding', col: 4, row: 9,
    label: K('북서울미술관이 196 m', 'Museo a 196 m'),
    meta: K('연계 시설 629 m', 'polo collegato a 629 m'),
    detail: K(
      '북서울미술관(2013.09 개관)이 196 m, 청소년 체험시설·복합지원센터(2024 고시)가 629 m. 미술관은 우리가 실측한 생활권 안쪽이다.',
      'Il museo (2013) è a 196 m, il polo giovanile e centro servizi (decreto 2024) a 629 m: il museo è dentro il bacino misurato.',
    ),
    src: 'source file/00-상위계획_근거.md',
  },

  // ── 5 대안 ──────────────────────────────────────────────
  {
    id: 'opt.A', kind: 'option', col: 5, row: 1,
    label: K('A · 최소 · 연계형', 'A · Minima, in rete'),
    meta: K('스팬 6.0 m', 'luce 6,0 m'),
    detail: K(
      '건물은 돌봄만 받고 커뮤니티 수요는 인근 시설로 넘긴다. 초기 공사비가 가장 낮다.',
      'L\'edificio accoglie solo l\'assistenza; la domanda collettiva va alle strutture vicine. Costo iniziale minimo.',
    ),
    src: 'frontend/src/lib/options.js',
  },
  {
    id: 'opt.B', kind: 'option', col: 5, row: 4,
    label: K('B · 부분 적응형', 'B · Adattabilità parziale'),
    meta: K('스팬 7.2 m', 'luce 7,2 m'),
    detail: K(
      '돌봄에서 의료·재활까지는 건물이 받고 대공간 용도는 넘긴다.',
      'Copre dall\'assistenza alla riabilitazione; le grandi luci restano fuori.',
    ),
    src: 'frontend/src/lib/options.js',
  },
  {
    id: 'opt.C', kind: 'option', col: 5, row: 7,
    label: K('C · 완전 적응형', 'C · Adattabilità piena'),
    meta: K('스팬 9.0 m', 'luce 9,0 m'),
    detail: K(
      '확정된 두 시기를 모두 건물이 받고 예측 못 한 용도까지 열어 둔다. 쓰지 않을 여유를 미리 지불한다.',
      'Assorbe entrambe le fasi certe e resta aperto all\'imprevisto: si paga in anticipo una riserva.',
    ),
    src: 'frontend/src/lib/options.js',
  },
]

/**
 * rel — flow 처리 흐름 · retry 실패가 낳은 재시도 · back 지지 · against 반대
 * 지지/반대는 결론이 대안을 어떻게 가리키는지를 말한다.
 */
export const EDGES = [
  // 따릉이
  { a: 'src.bike', b: 'p.bike' },
  { a: 'p.bike', b: 'd.bike' },
  { a: 'src.bike', b: 'p.geo' },
  { a: 'p.geo', b: 'd.geo' },
  { a: 'd.bike', b: 't.bikeuse' },
  { a: 'd.geo', b: 't.bikeuse' },
  { a: 'd.bike', b: 't.placebo' },
  { a: 'd.geo', b: 't.placebo' },
  { a: 't.bikeuse', b: 'f.dest' },
  { a: 't.placebo', b: 'f.radius' },

  // 버스 — 신호를 못 잡은 쪽
  { a: 'src.bus', b: 'p.bus' },
  { a: 'p.bus', b: 'd.bus' },
  { a: 'd.bus', b: 't.busdid' },
  { a: 't.busdid', b: 'f.nobus' },

  // 실거래가 — 마찬가지
  { a: 'src.price', b: 'p.price' },
  { a: 'p.price', b: 'd.price' },
  { a: 'd.price', b: 't.pricedid' },
  { a: 't.pricedid', b: 'f.noprice' },

  // 두 번의 실패가 진단을 낳고, 진단이 따릉이를 낳았다
  { a: 'f.nobus', b: 'f.denominator', rel: 'retry' },
  { a: 'f.noprice', b: 'f.denominator', rel: 'retry' },
  { a: 'f.denominator', b: 't.bikeuse', rel: 'retry' },
  { a: 'f.denominator', b: 't.placebo', rel: 'retry' },

  // 소비 · 예산
  { a: 'src.sales', b: 'p.demand' },
  { a: 'p.demand', b: 'd.demand' },
  { a: 'd.demand', b: 'f.consume' },
  { a: 'src.budget', b: 'p.budget' },
  { a: 'p.budget', b: 'd.budget' },
  { a: 'd.budget', b: 'f.budget' },

  // 상위계획
  { a: 'src.plan40', b: 'p.pdf' },
  { a: 'src.plannowon', b: 'p.pdf' },
  { a: 'p.pdf', b: 'f.zoning' },
  { a: 'src.plannowon', b: 'f.pop' },
  { a: 'f.radius', b: 'f.museum' },

  // 결론 → 대안
  { a: 'f.radius', b: 'opt.A', rel: 'back' },
  { a: 'f.museum', b: 'opt.A', rel: 'back' },
  { a: 'f.budget', b: 'opt.A', rel: 'back' },
  { a: 'f.nobus', b: 'opt.A', rel: 'back' },
  { a: 'f.noprice', b: 'opt.A', rel: 'back' },

  { a: 'f.pop', b: 'opt.B', rel: 'back' },
  { a: 'f.dest', b: 'opt.B', rel: 'back' },
  { a: 'f.consume', b: 'opt.B', rel: 'against' },

  { a: 'f.pop', b: 'opt.C', rel: 'back' },
  { a: 'f.zoning', b: 'opt.C', rel: 'back' },
  { a: 'f.dest', b: 'opt.C', rel: 'back' },
  { a: 'f.budget', b: 'opt.C', rel: 'against' },
]

const BY_ID = new Map(NODES.map((n) => [n.id, n]))
export const node = (id) => BY_ID.get(id)

/** 선택한 노드로 흘러드는 것과 흘러나가는 것을 모두 모은다 */
export function lineage(id) {
  if (!id) return { nodes: new Set(), edges: new Set() }
  const nodes = new Set([id])
  const edges = new Set()
  const walk = (cur, dir) => {
    for (const [i, e] of EDGES.entries()) {
      const [from, to] = dir === 'up' ? [e.b, e.a] : [e.a, e.b]
      if (from !== cur || nodes.has(to)) {
        if (from === cur) edges.add(i)
        continue
      }
      edges.add(i)
      nodes.add(to)
      walk(to, dir)
    }
  }
  walk(id, 'up')
  walk(id, 'down')
  return { nodes, edges }
}

/** 대안별로 이를 지지·반대하는 결론 */
export function reasonsFor(optId) {
  const back = []
  const against = []
  for (const e of EDGES) {
    if (e.b !== optId) continue
    if (e.rel === 'back') back.push(node(e.a))
    if (e.rel === 'against') against.push(node(e.a))
  }
  return { back, against }
}

export const COUNTS = {
  source: NODES.filter((n) => n.kind === 'source').length,
  dataset: NODES.filter((n) => n.kind === 'dataset').length,
  finding: NODES.filter((n) => n.kind === 'finding').length,
  null: NODES.filter((n) => n.ok === false).length,
}
