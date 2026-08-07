/**
 * 판정 — 모은 자료를 합치면 무엇을 해야 하는가.
 *
 * 네 갈래를 본다. 승하차·출입 기록·민원·예산.
 * 둘은 재었고 둘은 못 구했다. 그 사실 위에서 처방을 낸다.
 *
 * 처방은 「바꿔라」가 아니라 「언제 무엇을 하라」다. 시점은 우리가 고르지 않는다.
 * 건물의 물리 주기(구조 50년 · 설비 15년 · 내장 5~7년)와 인구추계가 정한다.
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
    detail: K('시설관리공단 이용자 통계 — 미확보',
      'Statistiche di utenza dell\'ente gestore — non disponibili'),
  },
  {
    id: 'minwon', have: false,
    label: K('민원 건수', 'Reclami'),
    detail: K('고충민원 통계 2008–2020 — 미확보',
      'Serie reclami 2008–2020 — non disponibile'),
  },
  {
    id: 'budget', have: true, dir: 'done',
    label: K('예산 편성', 'Bilancio'),
    value: K('전환 완료', 'Ciclo concluso'),
    detail: K('2022년 50.8억 → 2025년 3.5억. 노원구 돈은 활동형 시설로 이동',
      'Da 5,08 mld (2022) a 0,35 (2025); i fondi si spostano su strutture attive'),
  },
]

/** 종합 판정 */
export const CALL = {
  head: K('지금은 유지하고, 2039년에 바꾼다',
    'Mantenere ora, riconvertire nel 2039'),
  body: K(
    '전환 직후 승하차가 대조군보다 5.3%p 더 올랐다. 2024년 공사의 효과가 아직 살아 있으므로 '
    + '지금 다시 손댈 이유가 없다. 그러나 그 효과는 영원하지 않고, 2039년에는 '
    + '설비 15년과 구조 50년이 같은 해에 온다. 그때 계획의 변화를 담아 용도를 바꾸면 '
    + '공사를 한 번만 하고 곡선을 다시 올릴 수 있다.',
    'Dopo la riconversione i flussi salgono 5,3 p.p. sopra il controllo: l\'effetto del cantiere 2024 '
    + 'è ancora attivo e non c\'è ragione di intervenire ora. Quell\'effetto però non dura, e nel 2039 '
    + 'scadono insieme i quindici anni degli impianti e i cinquanta della struttura. '
    + 'Allora un solo cantiere può cambiare destinazione e risollevare la curva.',
  ),
}

/**
 * 시간 구간별 처방.
 * kind — hold 유지 · plan 준비 · work 공사 · watch 감시
 */
export const PHASES = [
  {
    id: 'hold-1', from: 2026, to: 2036, kind: 'hold',
    label: K('유지', 'Mantenere'),
    what: K('2024년 공사 효과가 남아 있는 구간', 'Fase in cui l\'effetto del cantiere 2024 persiste'),
    why: K(
      '전환 뒤 승하차가 대조군보다 5.3%p 높다. 내장 주기(2031)에는 마감과 실 구성만 손본다.',
      'I flussi restano 5,3 p.p. sopra il controllo. Al ciclo delle finiture (2031) si tocca solo il layout.',
    ),
    watch: K('해마다 대조군 대비 격차를 다시 잰다', 'Ogni anno si rimisura lo scarto dal controllo'),
  },
  {
    id: 'plan-1', from: 2036, to: 2039, kind: 'plan',
    label: K('계획 반영 · 설계', 'Recepire il piano · progettare'),
    what: K('바뀐 수요를 확인하고 용도를 정하는 구간', 'Fase di verifica della domanda e scelta della destinazione'),
    why: K(
      '2036년 노원구 고령 비중이 31.9%에 이른다. 그때의 소비·이용 자료로 용도를 다시 정한다. '
      + '2022~2023년에 설계에 3년을 썼으므로 이번에도 그만큼이 필요하다.',
      'Nel 2036 gli over 65 di Nowon arrivano al 31,9%: si ridefinisce la destinazione con i dati di allora. '
      + 'La progettazione 2022–2023 richiese tre anni: ne serviranno altrettanti.',
    ),
    watch: K('임계선(대조군 대비 −10%p)에 닿으면 앞당긴다',
      'Se si tocca la soglia (−10 p.p. sul controllo) si anticipa'),
  },
  {
    id: 'work-1', year: 2039, kind: 'work', key: true,
    label: K('리모델링 · 용도 변경', 'Ristrutturazione e cambio d\'uso'),
    what: K('설비 15년과 구조 50년이 같은 해에 온다', 'Coincidono i 15 anni degli impianti e i 50 della struttura'),
    why: K(
      '2024년에 노원구가 이미 쓴 방식이다 — 설비를 갈면서 용도를 함께 바꿨고, '
      + '그 결과가 승하차 +5.3%p였다. 따로 하면 공사를 두 번 한다.',
      'È il metodo già usato da Nowon nel 2024: cambiare impianti e destinazione insieme, '
      + 'con il risultato di +5,3 p.p. Farlo separatamente significa due cantieri.',
    ),
    watch: K('용도는 그때의 자료가 정한다 — 지금 정하지 않는다',
      'La destinazione la decidono i dati di allora, non quelli di oggi'),
  },
  {
    id: 'hold-2', from: 2039, to: 2054, kind: 'hold',
    label: K('유지', 'Mantenere'),
    what: K('두 번째 전환의 효과가 유지되는 구간', 'Fase in cui persiste l\'effetto della seconda riconversione'),
    why: K('같은 방식으로 격차를 감시한다', 'Si sorveglia lo scarto con lo stesso metodo'),
    watch: K('내장 주기(2045)에는 실 구성만', 'Al ciclo 2045 si tocca solo il layout'),
  },
  {
    id: 'work-2', year: 2054, kind: 'work',
    label: K('설비 교체', 'Sostituzione impianti'),
    what: K('설비 15년 주기', 'Ciclo impiantistico di 15 anni'),
    why: K('구조를 남겨 두었으므로 이때 다시 용도를 바꿀 수 있다',
      'Avendo lasciato intatta la struttura, si può cambiare di nuovo destinazione'),
    watch: null,
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
    '출입 기록과 민원은 비어 있다. 출입 기록은 「건물에 실제로 들어온 사람」을 재는 유일한 자료이므로, '
    + '그것이 채워지면 이 판정의 첫 줄이 정류장에서 건물로 바뀐다. 그때 시점이 앞당겨질 수도 뒤로 밀릴 수도 있다.',
    'Mancano registri di accesso e reclami. I primi sono l\'unico dato che misura chi entra davvero: '
    + 'quando ci saranno, la prima riga di questo giudizio passerà dalla fermata all\'edificio, '
    + 'e la data potrà anticiparsi o slittare.',
  ),
}

export const RECOMMEND = { work: [2039, 2054], hold: [2031, 2045] }

export const inputOf = (id) => CARDS.find((c) => c.id === id)
export const haveCount = () => INPUTS.filter((i) => i.have).length
