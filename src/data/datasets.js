/**
 * 지역을 읽는 데 필요한 자료 목록.
 * 03-data/DATA-REQUIREMENTS.md 의 그룹 2·3·4 를 그대로 옮긴다.
 *
 * status  have    확보 — 화면에 이미 쓰이고 있다
 *         partial 부분 — 있으나 해상도·범위가 모자라다
 *         none    없음 — 자리만 잡아 둔다
 *
 * impact 는 「없으면 무엇을 못 하는가」다. 이걸 적어야 목록이 우선순위가 된다.
 */

const K = (ko, it) => ({ ko, it })

export const AXES = [
  {
    key: 'user',
    no: '2',
    label: K('사용자 요구', 'Domanda degli utenti'),
    q: K('누가 무엇을 필요로 하는가', 'Chi ha bisogno di che cosa'),
    items: [
      { code: '2.1', name: K('구 단위 연령 인구', 'Popolazione per età, scala distrettuale'), src: K('노원구 통계연보', 'Annuario statistico di Nowon'), status: 'have' },
      { code: '2.4', name: K('장애인 · 독거노인', 'Disabilità e anziani soli'), src: K('노원구 통계연보', 'Annuario statistico di Nowon'), status: 'have' },
      { code: '2.8', name: K('현장 이용 실측', 'Rilievo diretto degli utenti'), src: K('학술논문(2024) 600명', 'Studio accademico 2024 · 600 persone'), status: 'have' },
      {
        code: '2.2', name: K('행정동별 연령 인구', 'Popolazione per età, scala di quartiere'),
        src: K('행정안전부', 'Ministero dell\'Interno'), api: true,
        status: 'partial', impact: K('동별 격차를 볼 수 없다', 'Impossibile leggere le differenze fra quartieri'),
      },
      {
        code: '2.5', name: K('복지시설 위치 · 좌표', 'Localizzazione dei servizi socio-assistenziali'),
        src: K('공공데이터포털', 'Portale open data nazionale'), api: true,
        status: 'none', rank: 2, impact: K('격차 계산이 성립하지 않는다', 'Il calcolo del divario non regge'),
      },
      {
        code: '2.6', name: K('등시권 폴리곤', 'Isocrone pedonali'),
        src: 'OpenRouteService', api: true,
        status: 'none', rank: 3, impact: K('도보 공백 지도를 그릴 수 없다', 'Impossibile mappare i vuoti di accessibilità'),
      },
      {
        code: '2.3', name: K('집계구 인구', 'Popolazione per sezione di censimento'),
        src: K('통계청 SGIS', 'Istituto di statistica · SGIS'), api: true,
        status: 'none', rank: 9, impact: K('등시권 안 인구를 셀 수 없다', 'Impossibile contare la popolazione dentro le isocrone'),
      },
    ],
  },
  {
    key: 'market',
    no: '2.7',
    label: K('상권 · 문화', 'Commercio e cultura'),
    q: K('주변에서 어떤 활동이 돈이 되는가', 'Quali attività reggono economicamente nell\'intorno'),
    viz: 'bars',
    items: [
      { code: '2.7a', name: K('점포 수 · 업종 구성', 'Numero di esercizi e composizione merceologica'), src: K('서울시 우리마을가게', 'Osservatorio commercio di Seoul'), api: true, status: 'none', impact: K('어떤 용도가 이미 공급되는지 모른다', 'Non si sa quali funzioni siano già presenti') },
      { code: '2.7b', name: K('업종별 매출 추이', 'Andamento del fatturato per settore'), src: K('서울시 우리마을가게', 'Osservatorio commercio di Seoul'), api: true, status: 'none', impact: K('쇠퇴 업종과 성장 업종을 가를 수 없다', 'Impossibile distinguere i settori in crescita da quelli in declino') },
      { code: '2.7c', name: K('문화시설 분포', 'Distribuzione delle attrezzature culturali'), src: K('서울열린데이터광장', 'Open data di Seoul'), api: true, status: 'none', impact: K('문화 기능의 공백 위치를 특정할 수 없다', 'Impossibile individuare i vuoti di offerta culturale') },
      { code: '2.7d', name: K('개폐업률', 'Tasso di apertura e chiusura'), src: K('서울시 우리마을가게', 'Osservatorio commercio di Seoul'), api: true, status: 'none', impact: K('상권 수명 주기를 읽을 수 없다', 'Impossibile leggere il ciclo di vita del tessuto commerciale') },
    ],
  },
  {
    key: 'ops',
    no: '3',
    label: K('운영 조건', 'Condizioni di gestione'),
    q: K('이 시설은 언제 적자가 되는가', 'Quando questa struttura entra in perdita'),
    viz: 'line',
    lead: K(
      '적자는 인구 변화보다 먼저 나타난다 — 전환 시점의 가장 빠른 신호다',
      'Il deficit di bilancio arriva prima del cambiamento demografico: è il segnale più precoce del momento di riconversione',
    ),
    items: [
      { code: '3.1', name: K('시설별 운영비 · 결산', 'Costi di gestione e bilanci consuntivi'), src: K('노원구 예산서 · 결산서', 'Bilanci del distretto di Nowon'), status: 'none', rank: 4, impact: K('전환 시점을 판단할 수 없다', 'Impossibile stabilire quando riconvertire') },
      { code: '3.2', name: K('시설별 이용률 · 가동률', 'Tassi di utilizzo delle strutture'), src: K('노원구 시설 운영현황', 'Rendiconti gestionali del distretto'), status: 'none', rank: 6, impact: K('수요 소멸을 감지할 수 없다', 'Impossibile rilevare l\'estinzione della domanda') },
      { code: '3.3', name: K('건물 에너지사용량 실적', 'Consumi energetici reali degli edifici'), src: K('국토부 건물에너지통계', 'Statistiche energetiche del Ministero'), api: true, status: 'partial', impact: K('원단위만 있어 성능 저하를 추적할 수 없다', 'Solo valori medi: impossibile seguire il degrado prestazionale') },
      { code: '3.5', name: K('유지관리 이력 · 노후도', 'Storico manutentivo e obsolescenza'), src: K('시설물통합정보관리', 'Anagrafe nazionale delle opere'), api: true, status: 'none', impact: K('교체 주기를 산정할 수 없다', 'Impossibile calcolare i cicli di sostituzione') },
    ],
  },
  {
    key: 'env',
    no: '4',
    label: K('환경 · 외부', 'Ambiente e fattori esterni'),
    q: K('건물 밖의 조건이 어떻게 변하는가', 'Come cambiano le condizioni fuori dall\'edificio'),
    viz: 'curve',
    items: [
      { code: '4.1', name: K('기후변화 시나리오(SSP)', 'Scenari climatici SSP'), src: K('기상청 기후정보포털', 'Servizio meteorologico nazionale'), status: 'none', rank: 8, impact: K('미래 냉난방 부하를 예측할 수 없다', 'Impossibile stimare i carichi termici futuri') },
      { code: '4.4', name: K('에너지 단가 추이', 'Andamento dei prezzi dell\'energia'), src: K('한전 · 도시가스', 'Utility elettrica e gas'), api: true, status: 'none', rank: 10, impact: K('운영비를 예측할 수 없다', 'Impossibile prevedere i costi di gestione') },
      { code: '4.2', name: K('과거 기상 실측(ASOS)', 'Serie storiche meteo (ASOS)'), src: K('기상청', 'Servizio meteorologico nazionale'), api: true, status: 'partial', impact: K('요약값만 있어 기준선이 거칠다', 'Solo valori sintetici: baseline poco accurata') },
      { code: '4.5', name: K('주변 개발계획 변경', 'Varianti urbanistiche nell\'intorno'), src: K('도시관리계획', 'Piani urbanistici attuativi'), status: 'none', impact: K('주변 수요 변화를 반영할 수 없다', 'Impossibile recepire i cambiamenti di domanda circostante') },
    ],
  },
]

/**
 * 일부러 쓰지 않기로 한 자료.
 * 목록에서 빠진 것과 「빼기로 결정한 것」은 다르다. 이유까지 남긴다.
 */
export const EXCLUDED = [
  {
    name: K('SNS 언급량 · 검색량', 'Menzioni sui social e volumi di ricerca'),
    why: K(
      '주 이용층이 75세 이상이라 표본이 편향된다 — 근거가 아니라 반박거리가 된다',
      'L\'utenza principale ha più di 75 anni: il campione è distorto e diventerebbe un\'obiezione, non una prova',
    ),
  },
  {
    name: K('통신사 유동인구', 'Flussi da dati di telefonia'),
    why: K(
      '유료이고, 상권분석의 추정치로 대체할 수 있다',
      'A pagamento e sostituibile con le stime dell\'osservatorio commerciale',
    ),
  },
  { name: K('카드 매출', 'Transazioni con carta'), why: K('유료', 'A pagamento') },
]

/** 확보 현황 집계 */
export function tally(axes = AXES) {
  const all = axes.flatMap((a) => a.items)
  return {
    total: all.length,
    have: all.filter((i) => i.status === 'have').length,
    partial: all.filter((i) => i.status === 'partial').length,
    none: all.filter((i) => i.status === 'none').length,
  }
}

export const STATUS = {
  have: { key: 'region.have', tone: 'have' },
  partial: { key: 'region.partial', tone: 'partial' },
  none: { key: 'region.none', tone: 'none' },
}
