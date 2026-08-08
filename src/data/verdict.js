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

/** 종합 판정 — 시점은 두 선이 정한다 (lib/trajectory.js) */
export const CALL = {
  head: K('2029년부터 벌어지고, 2034년에 손대야 한다',
    'Diverge dal 2029, si interviene nel 2034'),
  body: K(
    '이 건물은 전에도 두 번 벌어졌고 두 번 다 닫았다 — 2022년 사무동 리모델링, '
    + '2025년 노인회관 입주. 그래서 지금은 수요보다 적합도가 앞선다. '
    + '그러나 고령 비중은 계속 오르고 용도는 손대야만 바뀐다. '
    + '2029년에 다시 벌어지기 시작해 2034년에는 그 폭이 15pt를 넘는다. '
    + '이번에는 닫아 줄 개입이 예정돼 있지 않다.',
    'Questo edificio ha già divaricato due volte e due volte è stato richiuso: gli uffici nel 2022, '
    + 'il centro anziani nel 2025. Per questo oggi l\'idoneità precede la domanda. '
    + 'Ma la quota di anziani continua a salire e la destinazione cambia solo se la si tocca. '
    + 'Dal 2029 ricomincia a divaricare e nel 2034 lo scarto supera i 15 punti. '
    + 'Stavolta non è previsto nulla che lo richiuda.',
  ),
}

/**
 * 시간 구간별 처방.
 * kind — hold 유지 · plan 준비 · work 공사 · watch 감시
 */
export const PHASES = [
  {
    id: 'hold-1', from: 2026, to: 2029, kind: 'hold',
    label: K('유지', 'Mantenere'),
    what: K('2025년 개입 효과가 아직 앞서는 구간',
      'Fase in cui l\'intervento del 2025 è ancora in vantaggio'),
    why: K(
      '노인회관이 들어가면서 적합도가 46까지 올랐고, 2028년까지는 수요보다 높다. '
      + '지금 다시 손댈 이유가 없다.',
      'Con il centro anziani l\'idoneità è salita a 46 e fino al 2028 resta sopra la domanda: '
      + 'non c\'è ragione di intervenire ora.',
    ),
    watch: K('해마다 두 선의 폭을 다시 잰다', 'Ogni anno si rimisura lo scarto fra le due linee'),
  },
  {
    id: 'plan-1', from: 2029, to: 2034, kind: 'plan',
    label: K('벌어짐 확인 · 용도 결정', 'Verifica dello scarto · scelta d\'uso'),
    what: K('수요가 적합도를 앞지른 뒤 닫히지 않는 구간',
      'Fase in cui la domanda supera l\'idoneità e non si richiude'),
    why: K(
      '2029년에 교차하고 그대로 벌어진다. 이 5년이 무슨 용도로 바꿀지 정하고 '
      + '설계를 마칠 시간이다 — 2022~2024년 설계에 실제로 3년이 걸렸다.',
      'L\'incrocio avviene nel 2029 e da lì lo scarto cresce. Questi cinque anni servono a decidere '
      + 'la nuova destinazione e completare la progettazione: nel 2022–2024 ne servirono tre.',
    ),
    watch: K('그때의 인구·이용 자료로 용도를 정한다 — 지금 정하지 않는다',
      'La destinazione la decidono i dati di allora, non quelli di oggi'),
  },
  {
    id: 'work-1', year: 2034, kind: 'work', key: true,
    label: K('용도 전환', 'Cambio di destinazione'),
    what: K('벌어진 폭이 15pt를 넘는 해', 'Anno in cui lo scarto supera i 15 punti'),
    why: K(
      '이 해에 손대야 다시 닫힌다. 그리고 이 시점은 건물을 어차피 점검·수선해야 하는 '
      + '주기와 맞물린다 — 다음 화면이 그 이야기다.',
      'Intervenendo in quest\'anno lo scarto si richiude. E la data coincide con il ciclo '
      + 'di controllo e manutenzione già dovuto: è il tema della schermata successiva.',
    ),
    watch: K('닫힌 뒤에도 같은 방식으로 계속 잰다 — 이것이 한 번으로 끝나지 않는 이유다',
      'Anche dopo si continua a misurare allo stesso modo: per questo non è un intervento unico'),
  },
  {
    id: 'hold-2', from: 2034, to: 2050, kind: 'hold',
    label: K('다시 유지 · 다시 감시', 'Di nuovo mantenere e sorvegliare'),
    what: K('세 번째 개입의 효과가 유지되는 구간', 'Fase in cui persiste il terzo intervento'),
    why: K('2022 · 2025 · 2034 — 같은 일이 세 번째다. 건물은 이렇게 살아간다.',
      '2022, 2025, 2034: la stessa cosa per la terza volta. È così che un edificio resta in vita.'),
    watch: K('다음 벌어짐은 다시 계산된다', 'La prossima divergenza si ricalcola'),
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
    + '그때 2034라는 해는 앞당겨질 수도 뒤로 밀릴 수도 있다 — 시점이 흔들린다는 것이 이 도구의 결함은 아니다. '
    + '자료가 좋아지면 답도 좋아진다는 뜻이다.',
    'Tre assi non sono ancora collegati: accessi, reclami e soddisfazione. I registri di accesso sono '
    + 'l\'unico dato che misura chi entra davvero: quando ci saranno, la prima riga passerà dalla fermata '
    + 'all\'edificio e il 2034 potrà anticiparsi o slittare. Che la data si muova non è un difetto '
    + 'dello strumento: significa che con dati migliori migliora anche la risposta.',
  ),
}

export const RECOMMEND = { work: [2034], hold: [2029] }

export const inputOf = (id) => CARDS.find((c) => c.id === id)
export const haveCount = () => INPUTS.filter((i) => i.have).length
