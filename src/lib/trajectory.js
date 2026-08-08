/**
 * 두 선 — 지역이 요구하는 용도 vs 지금 용도의 적합도.
 *
 * 실존 건물에는 「신축 사건」이 없다. 그래서 전/후로 자르지 않고
 * 두 궤적이 벌어지는 지점을 본다. 그 지점이 용도를 다시 물어야 할 때다.
 *
 * 두 선 모두 지어낸 곡선이 아니다. 입력이 무엇이고 어떻게 계산했는지
 * 화면에 그대로 내놓는다 — 그래야 결과를 조작할 이유가 없다는 말이 성립한다.
 *
 *   수요선   노원구 인구 추계의 고령 비율에서 만든다 (실측 2012–2024 · 추계 2026–2050)
 *   적합도선 이 건물에 실제로 들어간 용도에서 만든다 (노원구 세출예산 실집행 줄)
 */

import { POPULATION } from '../data/population'

/** 65세 이상 비율 → 고령 대응 용도 수요(0~100). 기울기와 절편을 숨기지 않는다. */
export const DEMAND = { base: 10, slope: 3.2 }

/**
 * 이 건물이 실제로 받아들인 용도. 연도와 근거는 예산 실집행 줄에서 나온다.
 * fit = 그 구성이 고령 대응 수요를 받아낼 수 있는 정도(0~100).
 */
export const PROGRAM = [
  {
    year: 1989, fit: 22,
    label: { ko: '대강당 공연장으로 준공', it: 'Inaugurato come auditorium' },
    src: { ko: '노원구의회 제245회 행정재경위 회의록', it: 'Verbale del consiglio distrettuale, 245ª sessione' },
    grade: 'verified',
  },
  {
    year: 2022, fit: 28,
    label: { ko: '사무동 리모델링 — 입주단체 재배치', it: 'Uffici ristrutturati, enti ricollocati' },
    src: { ko: '행정지원과 편성 6.5억 · 실집행 0.98억', it: 'Stanziati 0,65 mld, spesi 0,098' },
    grade: 'verified',
  },
  {
    year: 2025, fit: 46,
    label: { ko: '노인회관 입주 · 문화교실 상시화', it: 'Centro anziani e corsi stabili' },
    src: { ko: '노인회관 건립 실집행 5.2억 · 문화교실 1.9억', it: 'Centro anziani 0,52 mld · corsi 0,19' },
    grade: 'verified',
  },
]

/** 이 폭만큼 벌어지면 용도를 다시 물어야 한다고 본다. */
export const THRESHOLD = 15

export const START = 2020
export const END = 2050

/** 추계표 사이를 선형으로 채운다 — 표에 없는 해의 값을 지어내지 않기 위해서다. */
function elderAt(year) {
  const p = POPULATION
  if (year <= p[0].year) return p[0].elder
  if (year >= p[p.length - 1].year) return p[p.length - 1].elder
  for (let i = 0; i < p.length - 1; i += 1) {
    const a = p[i]
    const b = p[i + 1]
    if (year >= a.year && year <= b.year) {
      const t = (year - a.year) / (b.year - a.year)
      return a.elder + (b.elder - a.elder) * t
    }
  }
  return p[p.length - 1].elder
}

/** 그 해가 실측 구간인지 추계 구간인지 — 선의 등급이 갈린다. */
function isEstimate(year) {
  const last = POPULATION.filter((p) => !p.est).slice(-1)[0]
  return year > last.year
}

const clamp = (v) => Math.max(0, Math.min(100, v))

export const demandAt = (year) => clamp((elderAt(year) - DEMAND.base) * DEMAND.slope)

/** 용도는 손대기 전까지 그대로다 — 그래서 계단이지 곡선이 아니다. */
export function fitAt(year) {
  let fit = PROGRAM[0].fit
  for (const p of PROGRAM) if (year >= p.year) fit = p.fit
  return fit
}

/** 두 선과 그 사이. 화면은 이 배열만 그린다. */
export function series() {
  const out = []
  for (let y = START; y <= END; y += 1) {
    const demand = demandAt(y)
    const fit = fitAt(y)
    out.push({ year: y, demand, fit, gap: demand - fit, est: isEstimate(y) })
  }
  return out
}

/**
 * 벌어지기 시작하는 해와 임계를 넘는 해.
 *
 * 첫 교차를 쓰면 안 된다. 2021년에 한 번 벌어졌다가 2025년 노인회관이
 * 들어오면서 도로 닫혔기 때문이다 — 그 반복이 이 건물의 이력이다.
 * 지금 문제가 되는 것은 「닫히지 않고 계속 벌어지는」 마지막 교차다.
 *
 *   cross  수요가 적합도를 앞지른 뒤 다시 닫히지 않는 해
 *   turn   그 뒤 벌어진 폭이 THRESHOLD 를 넘는 해 — 용도를 다시 물어야 할 때
 */
export function findTurn(rows = series()) {
  let cross = null
  for (let i = rows.length - 1; i >= 0; i -= 1) {
    if (rows[i].gap <= 0) break
    cross = rows[i]
  }
  const turn = rows.find((r) => cross && r.year >= cross.year && r.gap >= THRESHOLD) || null
  return { cross, turn }
}

/** 앞서 닫힌 적이 있는가 — 「전에도 이렇게 벌어졌고 개입으로 닫혔다」를 말하기 위해서다. */
export function priorClosings(rows = series()) {
  const out = []
  for (let i = 1; i < rows.length; i += 1) {
    if (rows[i - 1].gap > 0 && rows[i].gap <= 0) {
      const by = PROGRAM.filter((p) => p.year <= rows[i].year).slice(-1)[0]
      out.push({ year: rows[i].year, by })
    }
  }
  return out
}

/** 임계에 닿기까지 남은 해 수 — 「몇 년 뒤」로 말하기 위해서다. */
export function yearsLeft(now = new Date().getFullYear()) {
  const { turn } = findTurn()
  return turn ? turn.year - now : null
}
