/**
 * 전환 대안 — 이 건물을 언제 무엇으로 바꿀 것인가.
 *
 * 신축 스펙이 아니다. 신설이 답이 아니라고 해 놓고 대안이 신축이면 모순이다.
 * 여기서 갈리는 것은 「무엇으로 바꾸는가 × 어디까지 손대는가」다.
 *
 * 어디까지 손대는가는 Brand 의 Shearing Layers 를 따른다. Askar(2021) p.17 이
 * Duffy 의 층별 수명을 이렇게 옮긴다 —
 *   shell(structure) 50년 · services 15년 · scenery 5~7년 · set 수시
 * 그리고 같은 쪽에 원리가 있다. 수명이 다른 층은 서로 직접 붙이지 말 것.
 * 그래야 짧은 것을 갈 때 긴 것까지 뜯지 않는다.
 *
 * 시점은 우리가 정하지 않는다. 건물의 물리 주기가 정한다.
 */

const K = (ko, it, en) => ({ ko, it, en })

/** 대상지 건물 — 이미지(현황분석)와 예산 자료에서 확인한 사실 */
export const BUILDING = {
  name: K('노원구민의전당', 'Centro civico di Nowon'),
  alias: K('노원문화예술회관', 'Auditorium culturale di Nowon'),
  built: 1989,
  now: 2026,
  uses: K('대강당(대관·영화상영) · 문화강좌 · 사무실 · 노인회관',
    'Auditorium, corsi culturali, uffici, centro anziani'),
  state: K('1~3층 리모델링 관련 미운영', 'Piani 1–3 chiusi per ristrutturazione'),
  age: 2026 - 1989,
}

/**
 * 물리 주기 — Duffy/Brand 의 층별 수명을 이 건물에 대입한 것.
 * 2024년 리모델링으로 설비 시계가 다시 시작됐다고 본다.
 */
export const CYCLE = [
  {
    year: 1989, kind: 'built',
    label: K('준공', 'Costruzione'),
    note: K('철근콘크리트 · 대강당 중심 문화시설', 'C.a. · struttura culturale con auditorium'),
  },
  {
    // 여기 있던 94.2억·주변정비 6.0억은 중계로 181 의 다른 건물(노원문화예술회관) 값이었다.
    // 띄어쓰기 때문에 예산 검색이 갈렸던 탓이다 — budget/building_lines.py 로 다시 뽑았다.
    year: 2025, kind: 'done',
    label: K('1차 전환 — 완료', 'Prima riconversione — conclusa'),
    note: K('노인회관 건립 5.2억 · 문화교실 1.9억 · 사무동 1.0억 · 임시선별검사소 0.4억',
      'Centro anziani 0,52 mld · corsi 0,19 · uffici 0,10 · centro tamponi 0,04'),
    cost: 850,
    layers: ['space'],
    result: K('앞 정류장 통행 대조군 대비 +5%p — 노원구 전환 사례 중 1위',
      'Flussi alla fermata +5 p.p. sul controllo: primo fra le riconversioni del distretto'),
  },
  {
    year: 2031, kind: 'due',
    label: K('내장 주기', 'Ciclo delle finiture'),
    note: K('Scenery 5~7년 — 마감·가구·실 구성', 'Scenery 5–7 anni: finiture, arredi, layout'),
    layers: ['space'],
  },
  {
    year: 2039, kind: 'decide',
    label: K('결정점 — 설비 15년 + 구조 50년', 'Punto di decisione — impianti 15 + struttura 50'),
    note: K('2024년 리모델링에서 15년 · 준공에서 50년이 같은 해에 온다',
      'Quindici anni dalla ristrutturazione e cinquanta dalla costruzione cadono nello stesso anno'),
    layers: ['space', 'services', 'structure'],
    key: true,
  },
  {
    year: 2054, kind: 'due',
    label: K('설비 주기', 'Ciclo impiantistico'),
    note: K('Services 15년', 'Services 15 anni'),
    layers: ['services'],
  },
]

/** 손대는 층 — 위로 갈수록 비싸고 되돌리기 어렵다 */
export const LAYERS = {
  space: {
    label: K('실 구성 · 마감', 'Layout e finiture'),
    life: K('5~7년', '5–7 anni'),
    back: 3,
  },
  services: {
    label: K('설비 · 동선', 'Impianti e percorsi'),
    life: K('15년', '15 anni'),
    back: 2,
  },
  structure: {
    label: K('구조 · 스팬', 'Struttura e luci'),
    life: K('50년', '50 anni'),
    back: 1,
  },
}

/**
 * 무엇으로 바꿀 것인가 — 인근에 이미 있는 기능은 뺀다.
 * 대상지 반경 안의 시설은 현황분석 자료에서, 이용 추이는 우리 실측에서 왔다.
 */
export const PROGRAMS = [
  {
    id: 'culture', state: 'taken',
    label: K('문화 · 전시', 'Cultura ed esposizioni'),
    why: K('북서울미술관 196 m (2013) — 그런데 통행은 대조군 대비 −14%p로 전환 검토 대상이다',
      'Museo Buk-Seoul a 196 m (2013), ma i flussi sono −14 p.p.: già da riconvertire'),
  },
  {
    id: 'senior', state: 'taken',
    label: K('어르신 · 돌봄', 'Anziani e assistenza'),
    why: K('중계어르신센터 2026년 개관 + 이 건물 안에 노인회관 건립(2023–25). 이미 두 곳이다',
      'Centro anziani Junggye aperto nel 2026 e centro anziani già inserito qui (2023–25): sono due'),
  },
  {
    id: 'child', state: 'taken',
    label: K('아동 · 과학', 'Infanzia e scienza'),
    why: K('노원천문우주과학관 2017 — 미취학·초등 대상',
      'Osservatorio astronomico 2017, per prescolare ed elementari'),
  },
  {
    id: 'learn', state: 'taken',
    label: K('평생학습', 'Apprendimento permanente'),
    why: K('노원평생학습관 (1989) — 같은 공원 안',
      'Centro di apprendimento permanente (1989), nello stesso parco'),
  },
  {
    id: 'youth', state: 'taken',
    label: K('청소년 · 체험', 'Giovani e attività'),
    why: K('하계동 252-6 복합지원센터 629 m 2024년 고시 확정 · 상계청소년문화의집은 −22%p',
      'Polo giovanile a 629 m confermato nel 2024; il centro giovani di Sanggye è a −22 p.p.'),
  },
  {
    id: 'sport', state: 'open', lead: true, v: '+51%p',
    label: K('생활체육 · 활동', 'Sport di base e attività'),
    why: K('중계구민체육센터가 대조군 대비 +51%p — 노원구 시설 중 최상위 상승',
      'Il centro sportivo di Junggye è a +51 p.p.: la crescita più alta fra le strutture del distretto'),
  },
  {
    id: 'work', state: 'open', lead: true, v: '+35%p',
    label: K('창업 · 일자리', 'Impresa e lavoro'),
    why: K('서울창업디딤터 +35%p · 어르신 일자리 참여가 인근 시설의 실제 프로그램이다',
      'Il centro startup è a +35 p.p.; il lavoro per anziani è già un programma delle strutture vicine'),
  },
]

/**
 * 대안 — 다음 점검이 올 때 어디까지 손댈 것인가.
 * back 은 다음 전환을 얼마나 열어 두는가다. 유기체적 설계에서는 이것이 값이다.
 */
export const OPTIONS = [
  {
    key: 'A',
    label: K('최소 개입 · 실 구성만', 'Intervento minimo · solo layout'),
    layers: ['space'],
    program: ['sport'],
    what: K(
      '내장 주기(5~7년)에 맞춰 실 구성만 바꾼다. 대관 위주 공간을 '
      + '생활체육·동호회 활동 공간으로 다시 나눈다.',
      'Al ciclo delle finiture si cambia solo il layout: gli spazi da affitto '
      + 'diventano aree per sport di base e associazioni.',
    ),
    good: K('가장 싸고, 언제든 되돌릴 수 있다', 'Il più economico e sempre reversibile'),
    bad: K('대강당의 큰 스팬은 그대로라 활용 폭이 제한된다',
      'La grande luce dell\'auditorium resta: il ventaglio d\'uso è limitato'),
    keeps: K('다음 결정을 그대로 남겨 둔다', 'Lascia intatta la decisione successiva'),
  },
  {
    key: 'B',
    label: K('설비까지 · 주기를 맞춘다', 'Fino agli impianti · sincronizzato'),
    layers: ['space', 'services'],
    program: ['sport', 'work'],
    lead: true,
    what: K(
      '어차피 오는 점검에 설비 교체와 용도 전환을 함께 붙인다. '
      + '체육·활동과 창업·일자리를 한 건물에 넣는다.',
      'Al controllo che arriva comunque si agganciano insieme impianti e destinazione: '
      + 'sport e attività insieme a impresa e lavoro.',
    ),
    good: K('공사를 한 번만 한다. 2024년에 노원구가 이미 쓴 방식이다',
      'Un solo cantiere: è il metodo che Nowon ha già usato nel 2024'),
    bad: K('설비를 새로 깔면 다음 15년은 그 배치에 묶인다',
      'Rifatti gli impianti, i prossimi 15 anni restano legati a quella disposizione'),
    keeps: K('구조는 건드리지 않아 다음에 다시 바꿀 수 있다',
      'La struttura resta intatta: si potrà ricambiare in futuro'),
  },
  {
    key: 'C',
    label: K('구조까지 · 대수선', 'Fino alla struttura · grande intervento'),
    layers: ['space', 'services', 'structure'],
    program: ['sport', 'work'],
    what: K(
      '구조 50년이 되는 2039년에 스팬과 하중까지 손봐 '
      + '앞으로 무엇이 오든 받을 수 있게 연다.',
      'Nel 2039, ai cinquant\'anni della struttura, si interviene su luci e carichi '
      + 'per accogliere qualunque funzione futura.',
    ),
    good: K('전환의 폭이 가장 넓어진다', 'Il ventaglio di riconversione diventa il più ampio'),
    bad: K('가장 비싸고, 구조를 한 번 고정하면 다음 50년이 거기 묶인다',
      'Il più costoso: fissata la struttura, i prossimi 50 anni ne dipendono'),
    keeps: K('되돌리기 어렵다 — 이번 결정이 다음 전환을 막을 수 있다',
      'Difficile tornare indietro: questa scelta può bloccare la successiva'),
  },
]

export const TRIGGER = {
  now: -4,
  threshold: -10,
  museum: -14,
  note: K(
    '대상지는 대조군 대비 −4%p 로 아직 임계선(−10%p) 안이다. 지금 당장 바꿔야 하는 상태는 아니다. '
    + '다만 196 m 옆 미술관은 −14%p 로 이미 넘었다.',
    'Il sito è a −4 p.p., ancora entro la soglia (−10). Non è un caso urgente. '
    + 'Il museo a 196 m è però già a −14.',
  ),
}

export const openPrograms = () => PROGRAMS.filter((p) => p.state === 'open')
export const takenPrograms = () => PROGRAMS.filter((p) => p.state === 'taken')
export const programOf = (id) => PROGRAMS.find((p) => p.id === id)

/** 되돌릴 수 있는 정도 — 손댄 층 중 가장 긴 수명이 결정한다 */
export function reversibility(o) {
  return Math.min(...o.layers.map((l) => LAYERS[l].back))
}
