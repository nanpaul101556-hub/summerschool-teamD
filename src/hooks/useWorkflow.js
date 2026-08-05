/** 워크플로우 4단계의 상태를 한 곳에서 관리한다. */

import { useMemo, useState } from 'react'

import { NEARBY, ACCESS } from '../data/facilities'
import { POPULATION } from '../data/population'
import { PHASES, USES } from '../data/requirements'
import { SITE } from '../data/site'
import { backCalculate, judgeAdaptability } from '../lib/adaptability'
import { checkCompliance, computeLimits, eligibleIncentives } from '../lib/constraint'
import { assessSupply, classify, deriveDemand } from '../lib/gap'
import { changeRate, interpolate } from '../lib/timeline'

export function useWorkflow() {
  const [step, setStep] = useState(1)
  const [year, setYear] = useState(2026)
  const [uses, setUses] = useState(PHASES.map((p) => p.use))

  // ① 제도
  const limits = useMemo(() => computeLimits(SITE), [])
  const compliance = useMemo(() => checkCompliance(limits, SITE.plannedArea), [limits])
  const incentives = useMemo(() => eligibleIncentives(SITE), [])

  // ③ 시간 (② 가 이 값을 쓰므로 먼저 계산)
  const pop = useMemo(() => interpolate(POPULATION, year), [year])
  const trend = useMemo(() => changeRate(POPULATION, 2024, 2042), [])

  // ② 지역
  const supply = useMemo(() => assessSupply(NEARBY, ACCESS.targetRadius), [])
  const gaps = useMemo(() => {
    const demand = deriveDemand(pop)
    return demand.map((d) => {
      const map = { care: 'welfare', medical: 'welfare', community: 'culture', education: 'education' }
      const type = map[d.key]
      return {
        ...d,
        response: classify({
          demand: d.score,
          supplyExists: supply[type]?.exists ?? false,
          reachable: supply.reachable(type),
          surplus: d.key === 'education' && d.score < 62,
        }),
      }
    })
  }, [pop, supply])

  // ④ 설계
  const calc = useMemo(() => backCalculate(USES, uses), [uses])
  const verdict = useMemo(
    () => (calc ? judgeAdaptability(SITE.plannedArea, calc.spec.span) : null),
    [calc],
  )

  const toggleUse = (key) =>
    setUses((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))

  return {
    step, setStep,
    year, setYear,
    uses, toggleUse,
    limits, compliance, incentives,
    pop, trend,
    gaps, supply,
    calc, verdict,
  }
}
