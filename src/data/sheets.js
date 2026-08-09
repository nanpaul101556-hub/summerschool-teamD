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

  // ── 예산 ────────────────────────────────────────────────
  budget: {
    title: K('예산 어느 줄을 읽었는가', 'Quali righe di bilancio'),
    where: K(
      '이름이 닮은 다른 건물을 걸러내는 것이 이 시트의 전부다. '
      + '「노원구민의전당」(동일로 1229 · 1989년 · 시설관리공단)과 '
      + '「노원문화예술회관」(중계로 181 · 2004년 · 문화재단)은 2 km 떨어진 별개 건물이다. '
      + '원자료에 「노원구민의 전당」처럼 띄어 쓴 줄이 섞여 있어, 공백을 지우고 맞춘다.',
      'Tutto il foglio serve a separare due edifici dal nome simile: l\'Auditorium di Nowon '
      + '(Dongil-ro 1229, 1989) e il Centro culturale (Junggye-ro 181, 2004) distano 2 km. '
      + 'Nei dati il nome compare anche spaziato: si confronta ignorando gli spazi.',
    ),
    cols: ['연도', '구분', '부서', '사업', '지출'],
    rows: [
      ['2022', '대상지', '행정지원과', '노원구민의 전당 사무동 리모델링', '98'],
      ['2022', '대상지', '복지정책과', '임시선별검사소 운영(노원구민의 전당)', '41'],
      ['2023', '대상지', '어르신복지과', '노원구민의 전당 내 노인회관 건립', '1'],
      ['2024', '대상지', '어르신지원과', '노원구민의 전당 내 노인회관 건립', '346'],
      ['2025', '대상지', '문화도시과', '구민의전당 문화교실 운영', '190'],
      ['2025', '대상지', '어르신지원과', '노원구민의 전당 내 노인회관 건립', '174'],
      ['2024', '타건물', '문화도시과', '노원문화예술회관 리모델링', '9,418'],
    ],
    rowNote: K(
      '단위 백만원. 마지막 줄이 처음에 이 건물 것으로 잘못 넣었던 94.2억이다 — '
      + '중계로 181 건물이며 2025년 1월 재개관했다.',
      'In milioni di won. L\'ultima riga sono i 9,42 mld inizialmente attribuiti per errore: '
      + 'riguardano l\'edificio di Junggye-ro 181, riaperto nel gennaio 2025.',
    ),
    calc: [
      K('사업명에서 공백을 지우고 「구민의전당·구민회관」과 「문화예술회관」을 갈랐다',
        'Rimossi gli spazi, separate le due denominazioni'),
      K('대상지 실집행 합계 — 2022년 149 → 2025년 364 (백만원 · +143%)',
        'Spesa effettiva sul sito: da 149 a 364 milioni, +143%'),
      K('들어간 돈은 전부 새 용도를 끼워 넣는 일이었다 — 선별검사소·노인회관·문화교실',
        'Tutto per inserire nuovi usi: tamponi, anziani, corsi'),
      K('설비 공사비 94.2억은 이 건물 것이 아니므로 생애주기에서 「유사 실적」으로 표시한다',
        'I 9,42 mld restano nel ciclo di vita solo come riferimento analogo, non come spesa propria'),
    ],
    src: {
      raw: K('서울재정포털 노원구 세출예산 2022–2025', 'Portale finanziario di Seoul, bilancio di Nowon'),
      file: 'budget/building_lines.csv · 13행',
      script: 'budget/building_lines.py',
    },
    limit: K(
      '띄어쓰기 하나로 갈린 실수였다. 사업명만으로 건물을 특정하는 방식 자체가 위험하다 — '
      + '주소나 시설 코드가 붙은 예산 자료가 있으면 그것으로 바꿔야 한다.',
      'L\'errore nasceva da uno spazio. Identificare un edificio dal solo nome del progetto è fragile: '
      + 'servirebbero dati di bilancio con indirizzo o codice struttura.',
    ),
  },

  // ── 미확보 둘 ───────────────────────────────────────────
  minwon: {
    title: K('실데이터가 없어 예시로 흐름만 보인다',
      'Senza dato reale, resta visibile solo il flusso'),
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
      ['202104', '도로교통', '626', '575', '5.3'],
      ['202104', '환경위생', '489', '448', '5.2'],
      ['202104', '주택건축', '422', '405', '7.6'],
      ['202104', '복지', '288', '263', '5.1'],
      ['202104', '문화체육', '282', '275', '8.4'],
      ['202104', '일반행정', '229', '222', '8.2'],
      ['202105', '도로교통', '681', '643', '6.7'],
      ['202105', '환경위생', '532', '501', '6.6'],
      ['202105', '주택건축', '373', '338', '4.6'],
      ['202105', '복지', '313', '294', '6.5'],
      ['202105', '문화체육', '251', '231', '5.4'],
      ['202105', '일반행정', '204', '187', '5.2'],
    ],
    rowNote: K(
      '기준 사건이 낀 두 달을 통째로 뽑았다 — 한 달에 여섯 줄씩, 전부 546행 · 2019.01–2026.07. '
      + '실제 자료도 이 다섯 컬럼이면 그대로 들어온다.',
      'Estratti per intero i due mesi a cavallo dell\'evento: sei righe al mese, 546 in tutto, '
      + '2019.01–2026.07. Con queste cinque colonne il dato reale entra così com\'è.',
    ),
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
      '이 건물은 노원구시설관리공단이 운영한다. 대관·강좌·전시 이용자 통계를 공단이 갖고 있지만 '
      + '공개돼 있지 않고, 정보공개청구로만 얻는다. 가장 가까운 공개 자료였던 '
      + '「동북권 공공도서관 이용자 현황」(61개관 · 2018–2023)도 다운로드가 보안문자로 막힌다. '
      + '그래서 예산줄에서 확인된 용도 그대로 예시 파일을 만들어 두었다.',
      'L\'edificio è gestito dall\'ente municipale, che possiede le statistiche di utenza '
      + 'ma non le pubblica: servirebbe una richiesta di accesso agli atti. Anche il dato pubblico '
      + 'più vicino (utenza delle biblioteche del nord-est) è protetto da CAPTCHA. '
      + 'Abbiamo quindi predisposto un esempio con gli usi confermati dal bilancio.',
    ),
    cols: ['연월', '이용구분', '이용건수', '이용인원'],
    rows: [
      ['202104', '대관', '20', '2,387'],
      ['202104', '강좌', '92', '2,036'],
      ['202104', '전시', '21', '990'],
      ['202104', '단체', '184', '1,652'],
      ['202105', '대관', '17', '2,036'],
      ['202105', '강좌', '75', '1,657'],
      ['202105', '전시', '18', '844'],
      ['202105', '단체', '176', '1,580'],
    ],
    rowNote: K(
      '기준 사건이 낀 두 달을 통째로 뽑았다 — 한 달에 네 줄씩, 전부 364행 · 2019.01–2026.07.',
      'Estratti per intero i due mesi a cavallo dell\'evento: quattro righe al mese, 364 in tutto.',
    ),
    calc: [
      K('승하차와 같은 방식으로 전후 12개월을 잰다',
        'Si misurano 12 mesi prima e dopo, come per i flussi'),
      K('전체 59,273명 → 78,096명 · +31.8% (이것이 대조군이 된다)',
        'Totale da 59.273 a 78.096: +31,8%, che funge da controllo'),
      K('구분별 초과분 — 전시 +12.8%p · 강좌 +10.4%p · 단체 −20.4%p',
        'Scostamenti: mostre +12,8, corsi +10,4, enti residenti −20,4 p.p.'),
      K('이 수치는 지어낸 값이다. 실제 자료가 오면 SRC 한 줄만 바꾸면 그대로 돌아간다',
        'I valori sono inventati: col dato reale basta cambiare una riga dello script'),
    ],
    src: {
      raw: K('노원구시설관리공단 — 정보공개청구 필요',
        'Ente gestore di Nowon — serve una richiesta di accesso agli atti'),
      file: 'signals/entry_SAMPLE.xlsx · 364행 (예시)',
      script: 'signals/make_entry_sample.py → analyze_entry.py',
    },
    missing: true,
  },

  satis: {
    title: K('이 자료는 있다 — 받는 길만 막혀 있다',
      'Il dato esiste: è bloccato solo il canale'),
    where: K(
      '앞의 둘과 사정이 다르다. 민원은 자치구 단위 자료가 애초에 없고, 출입은 공단이 안 열어 준다. '
      + '만족도는 이미 자치구별로 공표돼 있다 — 서울서베이 도시정책지표조사의 '
      + '「문화환경 만족도」이다. 2003년부터 매년 8월 공표하며 5점 척도, '
      + '표본은 가구 2만 · 시민 5천이고 노원구가 따로 나온다. '
      + '다만 통계 표가 화면 조회만 되고 파일 내려받기가 보안문자로 막혀 수치를 못 넣었다.',
      'Qui la situazione è diversa dagli altri due assi: il dato per distretto esiste ed è pubblicato. '
      + 'È la "soddisfazione per l\'ambiente culturale" del Seoul Survey: dal 2003, ogni agosto, '
      + 'scala 1-5, su 20.000 famiglie e 5.000 cittadini, con Nowon separato. '
      + 'Solo il download è protetto da CAPTCHA, quindi i valori non sono ancora inseriti.',
    ),
    cols: ['연도', '지역', '항목', '만족도', '표본수'],
    rows: [
      ['2021', '노원구', '문화환경 전반', '3.04', '800'],
      ['2021', '서울시', '문화환경 전반', '3.13', '20000'],
      ['2025', '노원구', '문화환경 전반', '3.42', '800'],
      ['2025', '노원구', '문화시설', '3.50', '800'],
      ['2025', '노원구', '문화프로그램', '3.41', '800'],
      ['2025', '서울시', '문화환경 전반', '3.47', '20000'],
    ],
    rowNote: K(
      '예시 파일 120행 · 2016–2025 · 지역 4 · 항목 3. 실제 자료도 이 다섯 컬럼이면 그대로 들어온다.',
      'File di esempio: 120 righe, 2016–2025, quattro aree e tre voci. Il dato reale entra con le stesse colonne.',
    ),
    calc: [
      K('연 1회 조사라 전후 12개월을 만들 수 없다 — 서울시 평균을 대조군으로 둔다',
        'Indagine annuale: si usa la media cittadina come controllo'),
      K('격차 = 노원구 − 서울시. 2021년 −0.09 → 2025년 −0.05',
        'Divario = Nowon meno Seoul: da −0,09 (2021) a −0,05 (2025)'),
      K('말한 만족도와 행동한 결과(승하차·이용)가 어긋나는 지점이 곧 판정 재료다',
        'Dove il dichiarato diverge dal comportamento nasce il giudizio'),
      K('이 수치는 지어낸 값이다. 통계 10305 에서 받으면 그대로 대체된다',
        'I valori sono inventati: scaricando la statistica 10305 vengono sostituiti'),
    ],
    src: {
      raw: K('서울 열린데이터광장 통계 10305 · 서울서베이 도시정책지표조사',
        'Portale open data di Seoul, statistica 10305 · Seoul Survey'),
      file: 'signals/satis_SAMPLE.xlsx · 120행 (예시)',
      script: 'signals/make_satis_sample.py → analyze_satis.py',
    },
    limit: K(
      '만족도는 구 전체를 묻는다. 이 건물 하나의 만족도가 아니므로 '
      + '그대로 들이밀면 과장이 된다. 배경 지표로만 쓴다.',
      'La soddisfazione riguarda l\'intero distretto, non questo singolo edificio: '
      + 'attribuirgliela sarebbe una forzatura. Va usata solo come sfondo.',
    ),
    missing: true,
  },

}

export const REPO = 'https://github.com/nanpaul101556-hub/summerschool-teamD-data'

export const sheetOf = (id) => SHEETS[id] ?? null
