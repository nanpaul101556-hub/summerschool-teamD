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

/** 앞으로 — 법정 점검과 두 선이 정한 전환 시점이 만나는 자리 */
export const AHEAD = {
  turn: 2034,
  turnLabel: K('용도 전환 시점 — 두 선의 폭이 15pt를 넘는 해',
    'Cambio d\'uso: l\'anno in cui lo scarto supera i 15 punti'),
  anchorNote: K(
    '최초 점검일을 확인하지 못했다. 건축물관리법이 이 건물에 걸리기 시작한 해를 기준으로 '
    + '3년 주기를 그렸으므로, 실제 점검 해는 최대 두 해까지 밀릴 수 있다. '
    + '그래도 결론은 바뀌지 않는다 — 2034년 앞뒤 3년 안에 반드시 점검이 온다.',
    'La data del primo controllo non è stata verificata: il ciclo triennale è tracciato dall\'anno '
    + 'in cui la legge inizia ad applicarsi, quindi la data reale può slittare di un paio d\'anni. '
    + 'La conclusione non cambia: un controllo cade comunque entro tre anni dal 2034.',
  ),
}

/** 법정 점검이 떨어지는 해들 */
export function checkYears(from = 2020, to = 2050) {
  const out = []
  for (let y = from; y <= to; y += LAW.cycle) out.push(y)
  return out
}

/** 전환 시점에 가장 가까운 점검 해 — 「어차피 손볼 때」가 언제인지 */
export function nearestCheck(turn = AHEAD.turn) {
  return checkYears().reduce((a, b) =>
    (Math.abs(b - turn) < Math.abs(a - turn) ? b : a))
}

export const CLOSING = {
  head: K('어차피 손봐야 할 때가 오면, 그때 용도도 같이 바꿔라',
    'Quando arriva comunque il momento di intervenire, cambia anche la destinazione'),
  body: K(
    '두 선이 벌어지는 해와 건물을 어차피 점검·수선해야 하는 해가 같은 자리에 온다. '
    + '따로 하면 공사를 두 번 하고, 같이 하면 한 번이다. '
    + '노원구는 재정자립도가 서울에서 가장 낮다 — 이런 타이밍 하나가 큰 차이를 만든다.',
    'L\'anno in cui le linee divergono e quello in cui l\'edificio va comunque revisionato coincidono. '
    + 'Separarli significa due cantieri; unirli, uno solo. Nowon ha la più bassa autonomia finanziaria '
    + 'di Seoul: una coincidenza come questa fa una differenza reale.',
  ),
  hook: K(
    '1989년, 이 건물은 공원 안에 지어졌다. 그래서 2018년에 늘릴 수가 없었고, '
    + '신축용으로 13년간 쌓은 기금 28억을 리모델링에 돌리는 것 말고는 길이 없었다. '
    + '늘릴 수 없는 건물은 바꿔 쓰는 수밖에 없다. '
    + '그 계산을 2034년이 아니라 지금 해 두자는 것이 이 플랫폼이다.',
    'Nel 1989 questo edificio è stato costruito dentro un parco: nel 2018 non era ampliabile, '
    + 'e non restava che dirottare sulla ristrutturazione i 2,8 miliardi accantonati per tredici anni. '
    + 'Un edificio che non può crescere può solo cambiare uso. '
    + 'La piattaforma serve a fare quel conto adesso, non nel 2034.',
  ),
  noMoney: K(
    '금액은 말하지 않는다. 단가 두 종을 확보하지 못했고, 없이 계산하면 숫자를 지어내는 것이 된다. '
    + '그래서 지금은 시점만 낸다.',
    'Non diamo importi: mancano due voci di costo unitario e calcolarli senza sarebbe inventare numeri. '
    + 'Per ora, solo le date.',
  ),
}
