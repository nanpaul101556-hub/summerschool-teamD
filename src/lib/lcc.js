/**
 * 생애주기 예측 — 값은 떨어지고, 공사가 되돌리고, 다시 떨어진다.
 *
 * 곡선의 두 계수는 지어낸 값이 아니라 이 건물에서 실측한 값이다.
 *   감쇠  코로나 전 5년(2015~2019) 추세 — 손대지 않으면 해마다 얼마나 빠지는가
 *   반등  2024년 공사 뒤 대조군 대비 +5%p — 공사가 얼마를 되돌리는가
 *
 * 미래는 그 둘을 반복해서 그린다. 예측이지 사실이 아니다.
 */

import { WORK_YEARS } from './clocks'

/**
 * 2015~2026 실측 지수. 곡선에는 더 이상 그리지 않는다 —
 * 2020~21 의 골은 이 건물이 아니라 코로나가 만든 것이라
 * 「건물의 값」으로 읽히면 안 된다. 참조용으로만 남긴다.
 */
export const HISTORY = [
  { y: 2015, v: 104 }, { y: 2016, v: 103 }, { y: 2017, v: 105 },
  { y: 2018, v: 101 }, { y: 2019, v: 100 }, { y: 2020, v: 73 },
  { y: 2021, v: 63 }, { y: 2022, v: 77 }, { y: 2025, v: 80 }, { y: 2026, v: 82 },
]

/** 실제로 일어난 공사 — 노원구 예산 4개 연도 집행액 */
export const DONE = {
  year: 2024,
  cost: 10640,                 // 백만원. 리모델링 9,417 + 노인회관 519 + 조경 595 + 사무동 98
  lift: 5,                     // 대조군 대비 %p. analyze_events.py
  label: { ko: '1차 전환', it: 'Prima riconversione' },
}

/**
 * 손대는 층별 공사비 — 노원구 세출예산에서 뽑은 실제 집행·편성액이다.
 * 남의 단가표를 쓰지 않는다. 이 구청이 이 규모의 건물에 실제로 쓴 돈이다.
 *
 * 다만 출처를 두 갈래로 구분해 둔다. own 은 이 건물 예산줄에서 그대로 나온 값,
 * comp 는 다른 건물의 실적을 규모 비교로 빌려 온 값이다. 섞으면 안 된다.
 */
export const WORK = {
  space: {
    cost: 650, lift: 3,
    label: { ko: '내장 · 부분보수', it: 'Finiture e riparazioni' },
    src: {
      ko: '2022년 이 건물 사무동 리모델링 편성 6.5억 — 노인회관 건립 3년 실집행 5.2억과 같은 급',
      it: 'Uffici di questo edificio, stanziamento 2022: 0,65 mld; in linea con i 0,52 del centro anziani',
    },
  },
  services: {
    cost: 9420, lift: 5,
    label: { ko: '설비 · 성능 개선', it: 'Impianti e prestazioni' },
    src: {
      ko: '같은 노원구 문예회관(중계로 181) 전면 리모델링 실집행 94.2억 — 이 건물 것이 아니라 유사 실적',
      it: 'Ristrutturazione integrale di un auditorium analogo a Nowon (Junggye-ro 181): 9,42 mld effettivi',
    },
    comp: true,
  },
  structure: {
    cost: 18000, lift: 8,
    label: { ko: '구조 · 대수선', it: 'Struttura e grande intervento' },
    src: {
      ko: '공릉구민체육센터 건립 288억·제2노인복지관 158억의 약 60% — 신축 대비 추정',
      it: 'Circa il 60% dei 28,8 mld del centro sportivo e dei 15,8 del centro anziani: stima sul nuovo',
    },
    guess: true,
  },
}

export const DECAY = -1.15         // %/년. 2015→2019 추세 (104 → 100)
export const FLOOR = 55            // 아무리 방치해도 이 아래로는 잘 안 간다 (관측 최저 63의 보수값)
export const START = 2026
export const END = 2045

/**
 * 두 갈래만 놓는다 — 판정이 권한 대로 하는 경우와 손대지 않는 경우.
 * 대안을 여러 개 늘어놓으면 「무엇을 해야 하는가」가 다시 흐려진다.
 * 시점은 우리가 고르지 않는다. lib/clocks.js 가 두 시계의 겹침에서 뽑아 준다.
 */
export const SCENARIOS = [
  {
    key: 'none',
    label: { ko: '손대지 않으면', it: 'Senza interventi' },
    works: [],
    note: {
      ko: '유지비만 쓴다. 이용은 코로나 전 추세대로 계속 빠져 2052년에 바닥에 닿는다.',
      it: 'Solo manutenzione: l\'uso scende secondo il trend pre-Covid e tocca il minimo nel 2052.',
    },
  },
  {
    key: 'plan',
    label: { ko: '판정이 권한 대로', it: 'Seguendo il giudizio' },
    lead: true,
    works: WORK_YEARS,
    note: {
      ko: '물리 시계와 수요 시계가 겹치는 해에만 손댄다. 내장·설비·구조가 각각 '
        + '수명을 다하는 자리에 용도 전환을 얹으므로 공사가 두 번이 되지 않는다.',
      it: 'Si interviene solo dove i due orologi coincidono: la riconversione si innesta '
        + 'sul punto in cui finiture, impianti e struttura esauriscono la loro vita utile.',
    },
  },
]

const sum = (ls, k) => ls.reduce((n, l) => n + WORK[l][k], 0)
const maxOf = (ls, k) => Math.max(...ls.map((l) => WORK[l][k]))

/** 구조까지 손대면 그 뒤 노후 속도가 느려진다 */
const RENEW = 0.6

const K = (ko, it) => ({ ko, it })

/** 그해가 왜 그 값인지 — 곡선 위에 커서를 대면 이것이 뜬다 */
const MILESTONE = {
  2031: K('내장 주기 — Duffy 의 scenery 5~7년 (Askar 2021 p.17)',
    'Ciclo delle finiture — scenery 5–7 anni (Askar 2021, p.17)'),
  2036: K('노원구 고령 비중 31.9% 도달 — 용도를 다시 정할 자료가 모이는 해',
    'Nowon raggiunge il 31,9% di over 65: l\'anno in cui maturano i dati per ridefinire l\'uso'),
  2039: K('설비 15년(2024 공사 기준)과 구조 50년(1989 준공)이 같은 해에 온다',
    'Coincidono i 15 anni degli impianti (dal 2024) e i 50 della struttura (dal 1989)'),
  2042: K('노원구 고령 36.2% · 고령이 유소년의 약 5배가 되는 해',
    'Over 65 al 36,2%: circa cinque volte i minori'),
  2054: K('설비 15년 주기 — 구조를 남겨 두었으므로 용도를 또 바꿀 수 있다',
    'Ciclo impiantistico di 15 anni: struttura intatta, destinazione di nuovo modificabile'),
}

function reasonFor(y, w, v) {
  if (w) {
    return {
      kind: 'work',
      head: K(`${y}년 공사`, `Cantiere ${y}`),
      layers: w.layers,
      cost: w.cost,
      lift: w.lift,
      why: MILESTONE[y] ?? K('공사 시점', 'Anno di intervento'),
      src: w.layers.map((l) => WORK[l].src),
      guess: w.layers.some((l) => WORK[l].guess),
    }
  }
  return {
    kind: v <= FLOOR + 0.1 ? 'floor' : 'decay',
    head: K(`${y}년`, `${y}`),
    why: MILESTONE[y] ?? null,
    rate: DECAY,
  }
}

/**
 * 한 시나리오의 이용 곡선과 누적 비용.
 *
 * 공사는 값을 더하기만 하는 것이 아니라 감쇠 시계를 되돌린다.
 * 그렇게 보지 않으면 몇 번을 고쳐도 결국 바닥에 붙어, 손보는 의미가 사라진다.
 */
export function project(sc) {
  const works = sc.works.map((w) => ({
    ...w,
    cost: sum(w.layers, 'cost'),
    lift: maxOf(w.layers, 'lift'),
    deep: w.layers.includes('structure'),
  }))

  const pts = []
  let spent = 0
  let level = HISTORY[HISTORY.length - 1].v   // 마지막 실측에서 출발한다
  let since = START
  let rate = DECAY

  for (let y = START; y <= END; y += 1) {
    const w = works.find((x) => x.year === y)
    if (w) {
      // 공사 직전 값에서 lift 만큼 올리고, 감쇠를 그 해부터 다시 센다
      level = Math.max(FLOOR, level + rate * (y - since)) + w.lift
      since = y
      spent += w.cost
      if (w.deep) rate = DECAY * RENEW
    }
    const v = Math.max(FLOOR, level + rate * (y - since))
    pts.push({ y, v: +v.toFixed(1), spent, work: w ?? null, reason: reasonFor(y, w, v) })
  }

  const mean = pts.reduce((n, p) => n + p.v, 0) / pts.length
  return {
    key: sc.key,
    label: sc.label,
    note: sc.note,
    works,
    pts,
    total: spent,
    end: pts[pts.length - 1].v,
    mean: +mean.toFixed(1),
    /** 100억을 써서 평균 이용 수준을 얼마나 유지했는가 — 높을수록 효율적 */
    perCost: spent ? +(mean / (spent / 1000)).toFixed(1) : null,
  }
}

export function projectAll() {
  return SCENARIOS.map(project)
}

export const money = (m) => `${Math.round(m / 100)}`      // 백만원 → 억원
