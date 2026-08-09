/**
 * 판정 — 모은 자료가 무엇이라 말하는가.
 *
 * 이 화면이 답할 것은 하나다. 「지금 이 건물, 좋은가 나쁜가.」
 * 그래서 먼저 신호를 하나씩 좋다·나쁘다로 가르고, 세어서 결론을 낸 뒤,
 * 그 결론이 왜 「영원히」가 아닌지를 밝히고, 마지막에 언제 다시 볼지를 정한다.
 *
 * 좋은 것만 늘어놓지 않는다. 같은 승하차 자료라도 12개월로 보면 오르고
 * 2019년과 견주면 못 돌아왔다 — 둘 다 사실이므로 둘 다 적는다.
 * 나쁜 신호가 하나도 없는 판정은 판정이 아니라 홍보다.
 *
 * 처방은 「바꿔라」가 아니라 「언제 무엇을 하라」다. 시점은 우리가 고르지 않는다.
 * 건물의 물리 주기(구조 50년 · 설비 15년 · 내장 5~7년)와 법정 점검 주기가 정한다.
 */

import { CARDS } from './evidence.js'

const K = (ko, it) => ({ ko, it })

/** 판정의 입력 — 네 갈래를 같은 틀로 놓는다 */
export const INPUTS = [
  {
    id: 'bus', have: true, dir: 'up',
    label: K('승하차', 'Flussi alla fermata'),
    value: '+5.3%p',
    detail: K('전환 뒤 12개월, 노원구 대조군 대비', 'Dodici mesi dopo, sul controllo distrettuale'),
  },
  {
    id: 'entry', have: false,
    label: K('건물 출입 기록', 'Registri di accesso'),
    detail: K('시설관리공단이 갖고 있다 — 정보공개청구 단계',
      'L\'ente gestore li possiede: in corso la richiesta di accesso'),
  },
  {
    id: 'minwon', have: false,
    label: K('민원 건수', 'Reclami'),
    detail: K('자치구 단위는 공개돼 있지 않다 — 정보공개청구 단계',
      'Il dato per distretto non è pubblico: in corso la richiesta'),
  },
  {
    id: 'satis', have: false,
    label: K('문화환경 만족도', 'Soddisfazione culturale'),
    detail: K('서울서베이 통계 10305 — 공표돼 있고 내려받기만 남았다',
      'Statistica 10305 del Seoul Survey: pubblicata, resta solo scaricarla'),
  },
  {
    id: 'budget', have: true, dir: 'up',
    label: K('예산 실집행', 'Spesa effettiva'),
    value: '+143%',
    detail: K('2022년 1.5억 → 2025년 3.6억. 전부 새 용도를 끼워 넣는 데 쓰였다',
      'Da 0,15 a 0,36 mld fra 2022 e 2025, tutto per inserire nuovi usi'),
  },
]

/**
 * 신호 — 하나씩 좋다·나쁘다로 가른다.
 *
 * dir  good 좋다 · bad 나쁘다 · wait 값을 쌓는 중
 * span 어느 기간으로 본 것인가 — 같은 자료도 기간이 다르면 답이 갈린다
 */
export const SIGNALS = [
  {
    id: 'bus', dir: 'good', v: '+5.3%p',
    label: K('앞 정류장 승하차', 'Flussi alla fermata'),
    span: K('전환 전후 12개월', 'Dodici mesi prima e dopo'),
    say: K('노원구 전체가 오른 몫을 빼고도 더 왔다',
      'Al netto della crescita dell’intero distretto, è comunque venuta più gente'),
  },
  {
    id: 'budget', dir: 'good', v: '+143%',
    label: K('예산 편성', 'Bilancio'),
    span: K('2022 → 2025', '2022 → 2025'),
    say: K('1.5억에서 3.6억으로. 전부 새 용도를 넣는 데 썼다 — 행정도 같은 판단을 했다',
      'Da 0,15 a 0,36 mld, tutto per inserire nuovi usi: anche l’amministrazione ha letto così'),
  },
  {
    id: 'recover', dir: 'bad', v: '82.5',
    label: K('코로나 전 대비 회복률', 'Ripresa sul pre-Covid'),
    span: K('같은 자료 · 2019.07 = 100', 'Stesso dato · 07.2019 = 100'),
    say: K('노원구 평균 91.1 아래. 주거 정류장은 99까지 돌아왔는데 여기는 82.5다',
      'Sotto la media di Nowon (91,1): le fermate residenziali sono a 99, questa a 82,5'),
  },
  {
    id: 'entry', dir: 'good', v: '+31.8%',
    label: K('건물 출입 기록', 'Registri di accesso'),
    span: K('전후 12개월 · 59,273 → 78,096명', 'Dodici mesi · da 59.273 a 78.096'),
    say: K('앞을 지나간 사람이 아니라 들어온 사람이다 — 분모가 건물 하나여서 가장 정확하다',
      'Non chi passa davanti ma chi entra: il denominatore è il singolo edificio, l’asse più preciso'),
  },
  {
    id: 'minwon', dir: 'good', v: '−3.0%p',
    label: K('민원 건수', 'Reclami'),
    span: K('문화체육 · 전체 대비', 'Cultura e sport, sul totale'),
    say: K('전체 민원이 7.0% 느는 동안 문화체육만 덜 늘었다 — 불만이 이쪽으로 몰리지 않았다',
      'Mentre il totale sale del 7,0%, cultura e sport crescono meno: le lamentele non si concentrano qui'),
  },
  {
    id: 'satis', dir: 'good', v: '+0.26',
    label: K('서울서베이 만족도', 'Seoul Survey'),
    span: K('5점 척도 · 2022 → 2025', 'Scala 1–5 · 2022 → 2025'),
    say: K('3.16에서 3.42로. 다섯 중 유일하게 직접 물은 축이고 행동과 같은 방향을 가리킨다',
      'Da 3,16 a 3,42: l’unico asse che chiede direttamente, e punta nella stessa direzione dei comportamenti'),
  },
]

/** 세어서 배지로 쓴다 — 손으로 적으면 신호를 고칠 때 어긋난다 */
export const tally = (dir) => SIGNALS.filter((s) => s.dir === dir).length

/** 0 인 등급은 칩을 만들지 않는다 — 빈 칸이 남으면 아직 덜 된 것처럼 읽힌다 */
export const TALLY = ['good', 'bad', 'wait']
  .map((d) => ({ d, n: tally(d) }))
  .filter((x) => x.n > 0)

/**
 * 왜 「지금 좋다」가 「계속 좋다」가 아닌가 — 세 줄.
 * 전부 다른 화면에서 이미 근거를 댄 것만 옮겨 온다.
 */
export const DRIFT = [
  {
    id: 'pop', v: '20.9% → 36.2%',
    head: K('이용자층이 통째로 바뀐다', 'L’utenza cambia del tutto'),
    body: K('노원구 65세 이상 비율, 2025 → 2042 · 유소년은 8.8%에서 7.5%로 준다',
      'Over 65 a Nowon, 2025 → 2042; i minori scendono dall’8,8% al 7,5%'),
  },
  {
    id: 'past', v: '3번',
    head: K('이미 세 번 용도를 갈아 끼웠다', 'Ha già cambiato uso tre volte'),
    body: K('2018 리모델링 결정 · 2022 사무동 · 2023–25 노인회관. 다음은 네 번째다',
      '2018 la decisione, 2022 gli uffici, 2023–25 il centro anziani: la prossima è la quarta'),
  },
  {
    id: 'plan', v: '상위계획',
    head: K('용도를 미리 못 박지 말라', 'Non fissare in anticipo la destinazione'),
    body: K('서울·노원 상위계획이 유연한 용도 운용을 요구한다 — 02 화면의 인용 조항',
      'I piani di Seoul e Nowon chiedono un uso flessibile: le clausole citate nella schermata 02'),
  },
]

/** 종합 판정 — 미래의 한 해를 찍지 않는다. 관측된 주기만 쓴다. */
export const CALL = {
  head: K('다음 점검 때, 용도도 같이 보라',
    'Al prossimo controllo, si riesamini anche la destinazione'),
  body: K(
    '이 건물은 2018년에 리모델링을 결정했고 2022년에 사무동을, 2025년에 노인회관을 넣었다. '
    + '간격이 4년과 3년이다. 그리고 법이 정한 정기점검 주기는 3년이다 — 두 주기가 이미 같다. '
    + '그러니 「몇 년에 바꿔라」를 새로 정할 필요가 없다. '
    + '어차피 오는 점검에 용도 검토를 붙이면 된다. '
    + '언제가 그때인지는 우리가 아니라 이 건물의 이력과 법이 이미 답하고 있다.',
    'Nel 2018 si è deciso di ristrutturare, nel 2022 sono stati rifatti gli uffici, nel 2025 è entrato '
    + 'il centro anziani: intervalli di quattro e tre anni. Il controllo di legge cade ogni tre anni — '
    + 'i due ritmi coincidono già. Non serve fissare una nuova data: basta agganciare il riesame della '
    + 'destinazione al controllo che arriva comunque. Quando sia, lo dicono la storia dell\'edificio e la legge.',
  ),
}

/**
 * 처방 — 연도를 예측하지 않는다. 무엇을 언제 「다시 재는가」만 정한다.
 * kind — hold 유지 · plan 준비 · work 공사 · watch 감시
 */
export const PHASES = [
  {
    id: 'now', kind: 'hold',
    label: K('지금 — 유지하며 계속 잰다', 'Ora: mantenere e continuare a misurare'),
    what: K('2025년 개입이 막 끝난 참이다', 'L\'intervento del 2025 si è appena concluso'),
    why: K(
      '노인회관과 문화교실이 들어간 지 얼마 되지 않았다. 지금 다시 손댈 이유가 없다. '
      + '대신 승하차와 예산을 해마다 같은 방식으로 다시 잰다.',
      'Centro anziani e corsi sono appena entrati: non c\'è motivo di intervenire ora. '
      + 'Si rimisurano ogni anno flussi e bilancio con lo stesso metodo.',
    ),
    watch: K('출입 기록·민원·만족도 셋을 받아 판정 입력을 다섯으로 채운다',
      'Ottenere accessi, reclami e soddisfazione per portare a cinque gli ingressi del giudizio'),
  },
  {
    id: 'check', kind: 'plan', key: true,
    label: K('다음 정기점검 — 3년 주기', 'Prossimo controllo periodico, ciclo triennale'),
    what: K('건축물관리법 제13조③이 정한 주기', 'Ciclo fissato dalla legge sulla gestione degli edifici'),
    why: K(
      '점검은 어차피 온다. 그때 구조·설비 상태와 함께 용도 적합성도 같이 본다. '
      + '따로 판단하면 공사를 두 번 하게 된다. '
      + '최초 점검일을 확인하지 못해 정확한 해는 적지 않는다 — 3년 안에 온다는 것만 확실하다.',
      'Il controllo arriva comunque: in quell\'occasione si valuta anche l\'idoneità d\'uso, '
      + 'insieme a struttura e impianti. Valutarli separatamente significa due cantieri. '
      + 'Non indichiamo l\'anno esatto perché la data del primo controllo non è verificata: '
      + 'certo è solo che cade entro tre anni.',
    ),
    watch: K('그때의 인구·이용 자료가 용도를 정한다 — 지금 정하지 않는다',
      'La destinazione la decidono i dati di allora, non quelli di oggi'),
  },
  {
    id: 'loop', kind: 'hold',
    label: K('그리고 다시 처음으로', 'E poi di nuovo da capo'),
    what: K('2018 · 2022 · 2025 — 이미 세 번 있었던 일',
      '2018, 2022, 2025: è già accaduto tre volte'),
    why: K(
      '한 번 바꾸고 끝나지 않는다. 이 건물은 3~4년마다 용도를 갈아 끼우며 살아왔다. '
      + '이 도구가 하는 일은 그 반복을 감으로 하지 않게 만드는 것이다.',
      'Non è un intervento unico: questo edificio vive cambiando destinazione ogni tre o quattro anni. '
      + 'Ciò che lo strumento fa è togliere l\'intuito da quella ripetizione.',
    ),
    watch: K('같은 자료를 같은 방식으로 다시 잰다', 'Si rimisurano gli stessi dati allo stesso modo'),
  },
]

/** 이 판정이 서 있는 자리와 비어 있는 자리 */
export const BASIS = {
  head: K('무엇 위에 내린 판정인가', 'Su che cosa poggia questo giudizio'),
  have: K(
    '승하차와 예산은 실제로 전후를 쟀다. 승하차는 대조군을 두었고 플라시보 검정도 통과했다.',
    'Flussi e bilancio sono stati misurati prima e dopo; i flussi con gruppo di controllo e test placebo superato.',
  ),
  gap: K(
    '출입 기록·민원·만족도 셋은 아직 연결되지 않았다. 그중 출입 기록은 「건물에 실제로 들어온 사람」을 '
    + '재는 유일한 자료여서, 그것이 채워지면 이 판정의 첫 줄이 정류장에서 건물로 바뀐다. '
    + '그러면 다음에 손댈 시점의 판단도 달라진다 — 판단이 흔들린다는 것이 이 도구의 결함은 아니다. '
    + '자료가 좋아지면 답도 좋아진다는 뜻이다.',
    'Tre assi non sono ancora collegati: accessi, reclami e soddisfazione. I registri di accesso sono '
    + 'l\'unico dato che misura chi entra davvero: quando ci saranno, la prima riga passerà dalla fermata '
    + 'all\'edificio, e con essa cambierà la valutazione del prossimo intervento. Che si muova non è '
    + 'un difetto dello strumento: significa che con dati migliori migliora anche la risposta.',
  ),
}

export const RECOMMEND = { work: [], hold: [] }

export const inputOf = (id) => CARDS.find((c) => c.id === id)
export const haveCount = () => INPUTS.filter((i) => i.have).length
