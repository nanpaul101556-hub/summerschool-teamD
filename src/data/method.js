/**
 * 무엇으로 「만족한다」를 재는가 — 다섯 갈래가 왜 다섯인지.
 *
 * 만족은 직접 잴 수 없다. 물어보면 말은 듣지만, 사람은 말과 다르게 움직인다.
 * 그래서 세 층위에서 나눠 묻는다.
 *
 *   말한 것    만족한다고 답한 비율        — 직접 묻는 유일한 축
 *   행동한 것  왔는가 · 들어왔나 · 불편했나 — 말과 무관하게 남는 흔적
 *   행정이 본 것  돈이 따라왔나            — 구청의 판단
 *
 * 한 축만 보면 속는다. 셋이 갈리는 지점이 곧 판정 재료다.
 */

const K = (ko, it) => ({ ko, it })

/** 층위 — 카드 id 를 담는다. 순서가 화면 순서다. */
export const LAYERS = [
  {
    id: 'say',
    label: K('말한 것', 'Ciò che si dichiara'),
    lead: K('직접 물어본 유일한 축', 'L\'unico asse che chiede direttamente'),
    axes: ['satis'],
  },
  {
    id: 'act',
    label: K('행동한 것', 'Ciò che si fa'),
    lead: K('말과 무관하게 남는 흔적', 'Tracce che restano a prescindere dalle parole'),
    axes: ['bus', 'entry', 'minwon'],
  },
  {
    id: 'admin',
    label: K('행정이 본 것', 'Ciò che vede l\'amministrazione'),
    lead: K('구청이 내린 판단', 'Il giudizio già espresso dal distretto'),
    axes: ['budget'],
  },
]

/**
 * 갈래마다 — 무엇을 재는가 · 왜 그것이 만족의 신호인가 · 무엇을 못 말하는가.
 * 카드의 수치가 아니라 카드를 고른 이유를 적는다.
 */
export const WHY = {
  bus: {
    name: K('앞 정류장 승하차', 'Flussi alla fermata'),
    short: K('왔는가', 'Sono venuti?'),
    measures: K('앞 정류장에서 타고 내린 사람 수 (월별)',
      'Saliti e discesi alla fermata davanti, per mese'),
    why: K(
      '만족하면 다시 온다. 그리고 버스를 타고 오는 것은 지나가는 것이 아니라 '
      + '오려고 온 것이다 — 의도가 실린 이동이라 신호가 굵다.',
      'Chi è soddisfatto torna. E arrivare in autobus non è passare di lì: '
      + 'è un movimento intenzionale, quindi un segnale forte.',
    ),
    blind: K('건물에 들어갔는지는 모른다 — 그래서 출입 기록이 따로 필요하다',
      'Non dice se sia entrato: per questo servono i registri di accesso'),
  },
  entry: {
    name: K('건물 출입 기록', 'Registri di accesso'),
    short: K('들어왔나', 'Sono entrati?'),
    measures: K('대관·강좌·전시로 건물에 들어온 사람 수',
      'Persone entrate per affitti, corsi, mostre'),
    why: K(
      '승하차는 건물 앞을 지나간 사람이고 이것은 건물에 들어온 사람이다. '
      + '분모가 동네가 아니라 건물 하나가 되므로 다섯 중 가장 정확하다.',
      'I flussi contano chi passa davanti, questo conta chi entra: '
      + 'il denominatore non è il quartiere ma il singolo edificio. È l\'asse più preciso.',
    ),
    blind: K('공단이 갖고 있으나 공개하지 않는다 — 정보공개청구 단계다',
      'L\'ente gestore li possiede ma non li pubblica: in corso la richiesta di accesso'),
  },
  minwon: {
    name: K('민원 건수', 'Numero di reclami'),
    short: K('불편했나', 'Ci sono stati disagi?'),
    measures: K('행정에 접수된 불만 건수 (분야별)',
      'Reclami presentati all\'amministrazione, per ambito'),
    why: K(
      '만족의 반대편을 잰다. 승하차가 「왔다」를 세는 동안 민원은 「불편했다」를 센다. '
      + '좋으면 조용하다 — 그 조용함을 수치로 잡는 유일한 축이다.',
      'Misura il rovescio della soddisfazione: mentre i flussi contano chi viene, '
      + 'i reclami contano chi ha avuto problemi. Quando va bene, si tace: '
      + 'è l\'unico asse che quantifica quel silenzio.',
    ),
    blind: K('불만 있는 사람만 낸다 — 조용한 것이 만족인지 포기인지는 가르지 못한다',
      'Solo chi è scontento scrive: il silenzio può essere soddisfazione o rassegnazione'),
  },
  satis: {
    name: K('서울서베이 만족도', 'Seoul Survey'),
    short: K('만족한다 말하나', 'Si dichiarano soddisfatti?'),
    measures: K('문화환경에 만족한다고 답한 정도 (5점 척도)',
      'Grado di soddisfazione dichiarato per l\'ambiente culturale, scala 1-5'),
    why: K(
      '나머지 넷은 전부 행동에서 만족을 추론한다. 이것만 직접 묻는다. '
      + '그래서 말과 행동이 어긋나면 그 어긋남 자체가 판정 재료가 된다.',
      'Gli altri quattro deducono la soddisfazione dal comportamento; questo la chiede. '
      + 'Perciò, quando parole e azioni divergono, è la divergenza stessa a diventare materia di giudizio.',
    ),
    blind: K('구 전체를 묻지 이 건물을 묻지 않는다 — 배경 지표로만 쓴다',
      'Riguarda l\'intero distretto, non questo edificio: va usato solo come sfondo'),
  },
  budget: {
    name: K('예산 편성', 'Bilancio'),
    short: K('돈이 따라왔나', 'Il bilancio ha seguito?'),
    measures: K('구청이 이 건물에 실제로 집행한 예산',
      'Spesa effettivamente eseguita dal distretto su questo edificio'),
    why: K(
      '사람이 오고 불만이 없으면 예산이 따라온다. 안 쓰이는 건물에는 돈을 넣지 않는다. '
      + '주민의 만족을 행정이 어떻게 읽었는지가 여기에 남는다.',
      'Se la gente viene e non ci sono lamentele, i fondi seguono: su un edificio inutilizzato '
      + 'non si spende. Qui resta come l\'amministrazione ha letto quella soddisfazione.',
    ),
    blind: K('정치적 결정일 수도 있다 — 그래서 통행과 함께 봐야 한다',
      'Può essere una scelta politica: va letto insieme ai flussi'),
  },
}

/** 어떻게 재는가 — 다섯 갈래에 똑같이 적용하는 틀 */
export const FRAME = {
  head: K('다섯 갈래에 같은 자를 댄다', 'Lo stesso metro su cinque assi'),
  /** 제목은 짧게, 이유는 한 줄. 왼쪽에서 오른쪽으로 읽히면 설명이 끝난다. */
  steps: [
    {
      t: K('기준 달 전후 12개월', 'Dodici mesi prima e dopo'),
      d: K('2021.05 에 이 건물이 바뀌었다', 'L\'edificio cambia nel maggio 2021'),
    },
    {
      t: K('전과 후의 차이', 'La differenza'),
      d: K('얼마나 움직였는가', 'Di quanto si è mosso'),
    },
    {
      t: K('노원구 전체를 뺀다', 'Meno l\'intero distretto'),
      d: K('동네가 같이 오른 건 이 건물 공이 아니다',
        'Se sale tutto il quartiere non è merito suo'),
    },
    {
      t: K('남은 것이 초과분', 'Ciò che resta è lo scostamento'),
      d: K('이것만 이 건물이 만든 몫이다', 'Solo questo è opera dell\'edificio'),
    },
  ],
  close: K(
    '한 축만 보면 속는다. 말과 행동이 갈리는 지점, 행동과 행정이 갈리는 지점 — '
    + '그 어긋남이 곧 판정 재료다.',
    'Un solo asse inganna. Dove le parole divergono dai comportamenti, e i comportamenti '
    + 'dall\'amministrazione: è quella divergenza a diventare materia di giudizio.',
  ),
}

/**
 * 왜 이 근거가 필요한가 — 세 덩어리.
 *
 * 넷으로 늘어놓았더니 문제와 해법이 같은 무게로 보여, 읽어야 이해되는 그림이 됐다.
 * 문제 둘 · 우리가 만든 것 하나로 줄이고 글자를 깎는다.
 * 마지막 칸만 강조해 「그래서 이걸 만들었다」가 눈에 먼저 들어오게 한다.
 */
export const CHAIN = [
  {
    id: 'problem',
    head: K('용도는 고정, 동네는 변한다', 'L\'uso è fisso, il quartiere cambia'),
    body: K('준공 때 정한 용도가 수십 년 간다', 'La destinazione fissata all\'apertura dura decenni'),
  },
  {
    id: 'gap',
    head: K('어긋나도 잴 자가 없다', 'Nessun metro per misurare lo scarto'),
    body: K('그래서 감으로 결정한다', 'Così si decide a intuito'),
  },
  {
    id: 'rule',
    head: K('그 자를 만든다', 'Costruiamo quel metro'),
    body: K('만족을 다섯 갈래로 나눠 같은 방식으로 잰다',
      'Misurando la soddisfazione su cinque assi, tutti allo stesso modo'),
  },
]
