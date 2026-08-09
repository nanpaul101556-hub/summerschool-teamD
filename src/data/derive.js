/**
 * 판정이 어디서 나왔는가 — 자료에서 결론까지의 사슬.
 *
 * 「입력이 다섯이고 결론은 이것이다」만 있으면 그 사이가 보이지 않는다.
 * 무엇이 무엇을 말했고, 그 둘이 합쳐 무엇이 됐는지를 눈에 보이게 놓는다.
 *
 *   잰 것 ─→ 그것이 말하는 것 ─→ 합치면
 *
 * 실측 둘과 관측 둘만 쓴다. 데모 셋은 여기 들어오지 않는다.
 */

const K = (ko, it) => ({ ko, it })

/** 왼쪽 — 실제로 잰 것과 관측한 것. from 은 어느 화면에서 왔는지. */
export const FACTS = [
  {
    id: 'bus', from: '03', grade: 'verified',
    label: K('앞 정류장 승하차', 'Flussi alla fermata'),
    value: '+5.3%p',
    detail: K('전환 뒤 12개월 · 노원구 대조군 대비', 'Dodici mesi dopo, sul controllo distrettuale'),
    to: 'used',
  },
  {
    id: 'budget', from: '03', grade: 'verified',
    label: K('예산 실집행', 'Spesa effettiva'),
    value: '+143%',
    detail: K('2022년 1.5억 → 2025년 3.6억 · 전부 용도 삽입', 'Da 0,15 a 0,36 mld, tutto per inserire usi'),
    to: 'used',
  },
  {
    id: 'gap', from: '01', grade: 'verified',
    label: K('손댄 간격', 'Intervallo fra gli interventi'),
    value: '3.5년',
    detail: K('2018 → 2022 → 2025 · 4년과 3년', '2018 → 2022 → 2025: quattro e tre anni'),
    to: 'rhythm',
  },
  {
    id: 'law', from: '05', grade: 'law',
    label: K('법정 점검 주기', 'Ciclo di controllo di legge'),
    value: '3년',
    detail: K('건축물관리법 제13조③', 'Legge sulla gestione degli edifici, art. 13 c.3'),
    to: 'rhythm',
  },
]

/** 가운데 — 그 자료가 말하는 것 */
export const READS = [
  {
    id: 'used',
    head: K('지금은 잘 쓰이고 있다', 'Oggi è ben utilizzato'),
    body: K(
      '사람이 대조군보다 더 오고, 그 판단을 행정도 예산으로 따라왔다. '
      + '주민의 행동과 구청의 결정이 같은 방향을 가리킨다.',
      'Viene più gente che nel gruppo di controllo, e l\'amministrazione ha seguito con la spesa: '
      + 'il comportamento dei residenti e la decisione del distretto puntano nella stessa direzione.',
    ),
  },
  {
    id: 'rhythm',
    head: K('두 주기가 이미 같다', 'I due ritmi coincidono già'),
    body: K(
      '이 건물이 스스로 손대 온 간격과 법이 정한 점검 주기가 겹친다. '
      + '개입 시점을 새로 정할 필요가 없다는 뜻이다.',
      'L\'intervallo con cui l\'edificio è stato modificato coincide con il ciclo di controllo di legge: '
      + 'non serve fissare una nuova data d\'intervento.',
    ),
  },
]

/** 오른쪽 — 합치면 */
export const CALL_OUT = {
  head: K('다음 점검 때, 용도도 같이 보라', 'Al prossimo controllo, si riesamini anche l\'uso'),
  body: K(
    '지금 바꿀 이유는 없다 — 잘 쓰이고 있으니까. 그러나 이 건물은 3~4년마다 용도를 갈아 끼워 왔고, '
    + '점검은 어차피 3년마다 온다. 그 자리에 용도 검토를 붙이면 공사를 두 번 하지 않는다.',
    'Non c\'è motivo di cambiare ora: funziona. Ma questo edificio cambia uso ogni tre o quattro anni '
    + 'e il controllo arriva comunque ogni tre: agganciare lì il riesame evita un secondo cantiere.',
  ),
}

/** 아직 못 쓴 것 — 이 판정이 어디까지만 서 있는지 */
export const UNUSED = {
  head: K('이 판정에 쓰지 않은 것', 'Ciò che non è entrato in questo giudizio'),
  body: K(
    '민원·출입·만족도 셋은 데모 상태라 위 사슬에 넣지 않았다. '
    + '특히 출입 기록이 들어오면 첫 줄이 「정류장을 지나간 사람」에서 「건물에 들어온 사람」으로 바뀐다 — '
    + '그때 판정이 달라질 수도 있다.',
    'Reclami, accessi e soddisfazione sono in stato dimostrativo e non entrano nella catena. '
    + 'Con i registri di accesso la prima riga passerebbe da «chi passa alla fermata» a «chi entra»: '
    + 'allora il giudizio potrebbe cambiare.',
  ),
}
