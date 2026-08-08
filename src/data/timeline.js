/**
 * 05 생애주기 — 언제 손봐야 하는가.
 *
 * 금액을 말하지 않는다. 단가를 확보하지 못한 상태에서 금액을 발표하면
 * 숫자를 지어내는 것이 된다. 대신 시점만 말한다 — 그것은 법과 이력에서 나온다.
 *
 * 확인한 것
 *   건축물관리법 제13조③  정기점검은 사용승인일부터 5년 이내 최초, 이후 3년마다
 *   건축물관리법 제11조①②  장기수선계획은 「사용승인을 받으려는」 건축물만 대상이다
 *                          → 1989년 준공인 이 건물에는 그 문서가 아예 없다
 */

const K = (ko, it) => ({ ko, it })

export const BUILT = 1989
export const NOW = 2026

/** 법정 점검 주기 — 조문 그대로 */
export const LAW = {
  cycle: 3,
  art: '건축물관리법 제13조③',
  quote: K(
    '정기점검은 해당 건축물의 사용승인일부터 5년 이내에 최초로 실시하고, '
    + '점검을 시작한 날을 기준으로 3년마다 실시하여야 한다.',
    'Il controllo periodico si effettua entro cinque anni dall\'agibilità '
    + 'e successivamente ogni tre anni.',
  ),
  gapArt: '건축물관리법 제11조①',
  gapQuote: K(
    '사용승인을 받고자 하는 건축물의 건축주는 건축물관리계획을 수립하여 '
    + '사용승인 신청 시 제출하여야 한다.',
    'Chi richiede l\'agibilità deve presentare il piano di gestione dell\'edificio.',
  ),
  gap: K(
    '이 조문은 앞으로 사용승인을 받을 건물에만 걸린다. 1989년에 준공된 이 건물에는 '
    + '건축물관리계획이 존재하지 않는다 — 즉 언제 무엇을 손봐야 하는지 적어 둔 문서가 없다. '
    + '그 빈자리가 이 플랫폼이 채우는 곳이다.',
    'La norma vale solo per gli edifici che devono ancora ottenere l\'agibilità: '
    + 'un edificio del 1989 non ha alcun piano di gestione, cioè nessun documento che dica '
    + 'quando e che cosa manutenere. È questo vuoto che la piattaforma riempie.',
  ),
}

/**
 * 지나온 시점 — 전부 원문에서 확인한 것.
 * grade: verified 만 싣는다. 추정은 이 표에 올리지 않는다.
 */
export const PAST = [
  {
    year: 1989, kind: 'built',
    label: K('대강당 공연장으로 준공', 'Inaugurato come auditorium'),
    note: K('노원구민회관', 'Centro civico di Nowon'),
    src: K('노원구의회 제245회 행정재경위 회의록 (2018.08.22)',
      'Verbale del consiglio distrettuale, 245ª sessione (22.08.2018)'),
  },
  {
    year: 2018, kind: 'decide', key: true,
    label: K('신축을 포기하고 리모델링으로 돌린다', 'Si rinuncia al nuovo e si ristruttura'),
    note: K(
      '준공 29년. 2005년부터 신축용으로 쌓아 둔 기금 28억을 리모델링에 돌렸다. '
      + '총사업비 약 50억(기금 28 + 특교세 10 + 시 특별교부금 10), 설계비 2억 추경.',
      'A 29 anni dall\'apertura, i 2,8 mld accantonati dal 2005 per il nuovo edificio '
      + 'vengono dirottati sulla ristrutturazione: circa 5 mld in tutto.',
    ),
    quote: K(
      '“대체부지도 없고 거기가 공원 내에 있어서 증축도 안 되고 여러 가지 제약조건이 있어서”',
      '"Nessun sito alternativo, e trovandosi dentro il parco non è ampliabile"',
    ),
    src: K('같은 회의록', 'Stesso verbale'),
  },
  {
    year: 2021, kind: 'use',
    label: K('노원구민회관 → 노원구민의전당', 'Da centro civico a Auditorium di Nowon'),
    note: K('정류장 이름이 바뀐 달. 이후 12개월 승하차가 대조군보다 5.3%p 더 올랐다',
      'Cambia il nome della fermata; nei 12 mesi seguenti i flussi salgono 5,3 p.p. sopra il controllo'),
    src: K('서울 열린데이터광장 OA-12913', 'Portale open data di Seoul OA-12913'),
  },
  {
    year: 2022, kind: 'work',
    label: K('사무동 리모델링', 'Ristrutturazione degli uffici'),
    note: K('행정지원과 편성 6.5억 · 실집행 0.98억. 임시선별검사소도 이 해에 들어왔다',
      'Stanziati 0,65 mld, spesi 0,098; nello stesso anno arriva il centro tamponi'),
    src: K('노원구 세출예산 2022', 'Bilancio di Nowon 2022'),
  },
  {
    year: 2025, kind: 'work',
    label: K('노인회관 입주 · 문화교실 상시화', 'Centro anziani e corsi stabili'),
    note: K('2023–25년 실집행 5.2억. 대한노인회·새마을·푸드뱅크가 사무동에 들어왔다',
      'Spesi 0,52 mld fra 2023 e 2025; associazioni di anziani e volontariato negli uffici'),
    src: K('노원구 세출예산 2023–2025 · 프로젝트서울 설계공모',
      'Bilancio di Nowon 2023–2025 · concorso di progettazione'),
  },
]

/**
 * 앞으로 — 연도를 찍지 않는다.
 *
 * 한때 여기에 「전환 시점 2034」가 있었다. 두 선 그래프에서 나온 값이었는데
 * 그 그래프의 계수와 임계값이 전부 우리가 매긴 것이어서 지웠다.
 * 남은 것은 실제로 관측된 두 주기뿐이고, 그 둘이 이미 같다.
 */
export const RHYTHM = {
  /** 이 건물이 실제로 손댄 간격 — PAST 에서 그대로 나온다 */
  gaps: [
    { from: 2018, to: 2022 },
    { from: 2022, to: 2025 },
  ],
  head: K('두 주기가 이미 같다', 'I due ritmi coincidono già'),
  body: K(
    '이 건물은 2018년에 리모델링을 결정하고 2022년에 사무동을, 2025년에 노인회관을 넣었다. '
    + '간격이 4년과 3년이다. 그리고 법이 정한 정기점검 주기는 3년이다. '
    + '앞으로 몇 년에 무엇을 하라고 새로 정할 필요가 없다 — '
    + '어차피 오는 점검에 용도 검토를 붙이면 그것이 곧 이 건물이 살아온 방식이다.',
    'Nel 2018 si decise di ristrutturare, nel 2022 si rifecero gli uffici, nel 2025 entrò il centro anziani: '
    + 'intervalli di quattro e tre anni. Il controllo di legge cade ogni tre anni. '
    + 'Non serve fissare nuove date: agganciare il riesame d\'uso al controllo che arriva comunque '
    + 'è esattamente il modo in cui questo edificio è vissuto finora.',
  ),
  caveat: K(
    '최초 점검일을 확인하지 못해 다음 점검이 몇 년인지는 적지 않는다. '
    + '3년 안에 온다는 것만 법에서 확실하다.',
    'La data del primo controllo non è verificata, quindi non indichiamo l\'anno del prossimo: '
    + 'dalla legge è certo solo che cade entro tre anni.',
  ),
}

/** 법정 점검이 떨어지는 해들 */
export function checkYears(from = 2020, to = 2050) {
  const out = []
  for (let y = from; y <= to; y += LAW.cycle) out.push(y)
  return out
}

/** 손댄 간격의 평균 — 「3~4년마다」를 말하기 위해서다 */
export function meanGap() {
  const g = RHYTHM.gaps.map((x) => x.to - x.from)
  return g.reduce((a, b) => a + b, 0) / g.length
}

export const CLOSING = {
  head: K('어차피 손봐야 할 때가 오면, 그때 용도도 같이 바꿔라',
    'Quando arriva comunque il momento di intervenire, cambia anche la destinazione'),
  body: K(
    '용도를 다시 묻는 일과 건물을 점검하는 일은 이미 같은 주기로 돌고 있다. '
    + '따로 하면 공사를 두 번 하고, 같이 하면 한 번이다. '
    + '노원구는 재정자립도가 서울에서 가장 낮다 — 이런 타이밍 하나가 큰 차이를 만든다.',
    'Riesaminare la destinazione e controllare l\'edificio girano già sullo stesso ritmo. '
    + 'Separarli significa due cantieri; unirli, uno solo. Nowon ha la più bassa autonomia finanziaria '
    + 'di Seoul: una coincidenza come questa fa una differenza reale.',
  ),
  hook: K(
    '1989년, 이 건물은 공원 안에 지어졌다. 그래서 2018년에 늘릴 수가 없었고, '
    + '신축용으로 13년간 쌓은 기금 28억을 리모델링에 돌리는 것 말고는 길이 없었다. '
    + '늘릴 수 없는 건물은 바꿔 쓰는 수밖에 없다. '
    + '그 계산을 다음 점검이 닥쳤을 때가 아니라 지금 해 두자는 것이 이 플랫폼이다.',
    'Nel 1989 questo edificio è stato costruito dentro un parco: nel 2018 non era ampliabile, '
    + 'e non restava che dirottare sulla ristrutturazione i 2,8 miliardi accantonati per tredici anni. '
    + 'Un edificio che non può crescere può solo cambiare uso. '
    + 'La piattaforma serve a fare quel conto adesso, non quando il controllo sarà già addosso.',
  ),
  noMoney: K(
    '금액은 말하지 않는다. 단가 두 종을 확보하지 못했고, 없이 계산하면 숫자를 지어내는 것이 된다. '
    + '그래서 지금은 시점만 낸다.',
    'Non diamo importi: mancano due voci di costo unitario e calcolarli senza sarebbe inventare numeri. '
    + 'Per ora, solo le date.',
  ),
}
