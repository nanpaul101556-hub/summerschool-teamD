/**
 * 대안 산출.
 *
 * 지역 정보(인구·격차·활동)에서 대안이 나오고, 대안에서 사양이 나오고,
 * 사양에서 모델이 나온다. 이 파일은 그 사슬의 가운데 고리다.
 *
 * 대안을 가르는 축은 하나다 — 이 건물이 몇 개의 미래를 받아낼 것인가.
 * 많이 받을수록 초기 사양이 무거워지고, 그 무게가 곧 선택의 대가다.
 */

import { USES } from '../data/requirements'
import { backCalculate, judgeAdaptability, minAdaptableArea } from './adaptability'

/** 대안의 뼈대 — 어떤 용도들을 소화할 것인가 */
const SHAPES = [
  {
    key: 'A',
    label: '단일 용도',
    uses: ['welfare'],
    stance: '지금 필요한 것만 짓는다',
    risk: '용도가 바뀌면 재건축 외에 방법이 없다',
  },
  {
    key: 'B',
    label: '2단계 적응',
    uses: ['welfare', 'community'],
    stance: '확정된 두 시기를 한 건물로 받는다',
    risk: '고부하 용도로는 전환할 수 없다',
  },
  {
    key: 'C',
    label: '개방형',
    uses: ['welfare', 'community', 'datacenter'],
    stance: '예측하지 못한 용도까지 받아낸다',
    risk: '초기 공사비가 가장 크다',
  },
]

/**
 * 대안 목록을 만든다.
 * @param {number} plannedArea 계획 연면적 m²
 */
export function buildOptions(plannedArea) {
  return SHAPES.map((s) => {
    const calc = backCalculate(USES, s.uses)
    const verdict = judgeAdaptability(plannedArea, calc.spec.span)

    return {
      ...s,
      calc,
      spec: calc.spec,
      premium: calc.premium,
      /** 이 대안이 받아낼 수 있는 미래의 수 */
      absorbs: s.uses.length,
      /** 전환에 필요한 최소 면적 — 스팬이 커질수록 커진다 */
      minArea: minAdaptableArea(calc.spec.span),
      verdict,
      labels: s.uses.map((k) => USES.find((u) => u.key === k)?.label).filter(Boolean),
    }
  })
}

/**
 * 지역 정보에서 어느 대안을 권하는지 판정한다.
 * 근거를 함께 돌려준다 — 결론만 있으면 설득할 수 없다.
 */
export function recommend(options, { elderNow, elderLate, declineRank }) {
  const shrinking = declineRank <= 3
  const ageing = elderLate - elderNow >= 8

  if (shrinking && ageing) {
    return {
      key: 'C',
      because: [
        `인구 감소 ${declineRank}위 — 신설한 시설이 유휴자산이 될 위험이 크다`,
        `고령화 ${elderNow}% → ${elderLate}% — 지금의 용도가 오래가지 않는다`,
        '두 조건이 겹치면 「지금 용도에 맞춘 건물」이 가장 위험한 선택이 된다',
      ],
    }
  }
  if (ageing) {
    return {
      key: 'B',
      because: [`고령화 ${elderNow}% → ${elderLate}% — 확정된 두 시기는 대비해야 한다`],
    }
  }
  return {
    key: 'A',
    because: ['변화 신호가 약하다 — 여유를 두는 비용이 정당화되지 않는다'],
  }
}
