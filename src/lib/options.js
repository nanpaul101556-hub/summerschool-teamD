/**
 * 대안 산출.
 *
 * 대안을 가르는 축은 「몇 개 용도를 받는가」가 아니라
 * 「어느 시점의 수요를 건물이 직접 받고, 어디부터 주변에 넘기는가」다.
 *
 * 앞 구간은 인구추계가 말해주므로 모든 안이 같다. 자료가 끊기는 지점부터
 * 갈리고, 그 갈림이 곧 각 안의 베팅이다. 베팅에는 전제가 있고, 전제를
 * 적어야 심사자가 그것을 공격할 수 있다.
 *
 * 근거 — Askar(2021) §3.2 구조는 최악 시나리오를 견디도록 설계한다,
 *        van Ellen(2021) 적응성 차원(convertible / scalable).
 */

import { USES } from '../data/requirements'
import { backCalculate, minAdaptableArea } from './adaptability'

const K = (ko, it, en) => ({ ko, it, en })

/** 건물이 직접 받는 용도(own)와 주변으로 넘기는 용도(link) */
const PLANS = [
  {
    key: 'A',
    label: K('최소 · 연계형', 'Minima, in rete'),
    strategy: K(
      '건물은 돌봄만 받고, 늘어나는 커뮤니티 수요는 인근 시설로 넘긴다',
      'L\'edificio accoglie solo l\'assistenza; la crescente domanda di spazi collettivi viene affidata alle strutture vicine',
    ),
    track: [
      { year: 2031, use: 'welfare', mode: 'own' },
      { year: 2036, use: 'community', mode: 'link' },
      { year: 2046, use: 'welfare', mode: 'own', bet: true },
    ],
    benefit: K('초기 공사비가 가장 낮다', 'Costo di costruzione iniziale minimo'),
    risk: K(
      '돌봄 수요가 사라지면 건물을 다시 짓는 것 외에 방법이 없다',
      'Se la domanda di assistenza si esaurisce, non resta che ricostruire',
    ),
    premise: K(
      '걸어서 닿는 거리에 연계할 커뮤니티 시설이 실제로 있다',
      'Esistono davvero strutture collettive raggiungibili a piedi con cui fare rete',
    ),
  },
  {
    key: 'B',
    label: K('부분 적응형', 'Adattabilità parziale'),
    strategy: K(
      '돌봄에서 의료·재활까지는 건물이 받고, 대공간 용도는 넘긴다',
      'L\'edificio copre dall\'assistenza fino alla riabilitazione; le funzioni che richiedono grandi luci restano fuori',
    ),
    track: [
      { year: 2031, use: 'welfare', mode: 'own' },
      { year: 2036, use: 'community', mode: 'link' },
      { year: 2046, use: 'clinic', mode: 'own', bet: true },
    ],
    benefit: K(
      '초고령이 심화될수록 수요가 커지는 용도로 이동할 수 있다',
      'Consente di spostarsi verso la funzione la cui domanda cresce con l\'invecchiamento',
    ),
    risk: K(
      '스팬이 모자라 대공간·고하중 용도로는 전환할 수 없다',
      'La luce strutturale non basta per convertire verso grandi spazi o carichi elevati',
    ),
    premise: K(
      '2046년에 의료·재활 수요가 돌봄 수요를 넘어선다',
      'Nel 2046 la domanda sanitaria e riabilitativa supera quella assistenziale',
    ),
  },
  {
    key: 'C',
    label: K('완전 적응형', 'Adattabilità piena'),
    strategy: K(
      '확정된 두 시기를 모두 건물이 받고, 예측 못 한 용도까지 열어 둔다',
      'L\'edificio assorbe entrambe le fasi certe e resta aperto anche a destinazioni non prevedibili',
    ),
    track: [
      { year: 2031, use: 'welfare', mode: 'own' },
      { year: 2036, use: 'community', mode: 'own' },
      { year: 2046, use: 'datacenter', mode: 'own', bet: true },
    ],
    benefit: K(
      '확정 구간을 한 건물로 소화하고, 용도 전환의 폭이 가장 넓다',
      'Copre in un solo edificio le fasi certe e offre il ventaglio di riconversione più ampio',
    ),
    risk: K(
      '초기 공사비가 가장 크고, 쓰지 않을 여유를 미리 지불한다',
      'Costo iniziale più alto: si paga in anticipo una riserva che potrebbe non essere usata',
    ),
    premise: K(
      '건물 수명 안에 최소 한 번은 용도 전환이 실제로 일어난다',
      'Nell\'arco di vita dell\'edificio avviene almeno una riconversione effettiva',
    ),
  },
]

const use = (key) => USES.find((u) => u.key === key)

/**
 * 대안 목록.
 * @param {number} plannedArea 계획 연면적 m²
 */
export function buildOptions(plannedArea) {
  return PLANS.map((p) => {
    const ownKeys = [...new Set(p.track.filter((s) => s.mode === 'own').map((s) => s.use))]
    const calc = backCalculate(USES, ownKeys)
    const required = minAdaptableArea(calc.spec.span)
    const ok = plannedArea >= required

    return {
      ...p,
      calc,
      spec: calc.spec,
      premium: calc.premium,
      ownKeys,
      /** 건물이 직접 받는 용도 수 — 넘긴 것은 세지 않는다 */
      absorbs: ownKeys.length,
      required,
      ok,
      shortfall: ok ? 0 : required - plannedArea,
      track: p.track.map((s) => ({ ...s, label: use(s.use)?.label ?? s.use })),
      labels: ownKeys.map((k) => use(k)?.label).filter(Boolean),
    }
  })
}

/**
 * 규모가 선택지의 개수를 정한다.
 * 스팬이 커질수록 전환에 필요한 최소 면적이 계단식으로 올라간다.
 */
export function areaLadder(plannedArea) {
  const spans = [...new Set(USES.map((u) => u.span))].sort((a, b) => a - b)
  return spans.map((span) => {
    const area = minAdaptableArea(span)
    return {
      span,
      area,
      uses: USES.filter((u) => u.span <= span).map((u) => u.label),
      reached: plannedArea >= area,
    }
  })
}

/**
 * 자료가 어느 대안을 가리키는지 판정한다.
 * 결론만 있으면 설득할 수 없으므로 근거를 함께 돌려준다.
 */
export function recommend(options, { elderNow, elderLate, declineRank, plannedArea }) {
  const viable = options.filter((o) => o.ok)
  const shrinking = declineRank <= 3
  const ageing = elderLate - elderNow >= 8

  const because = []
  if (shrinking) {
    because.push(K(
      `인구 감소 ${declineRank}위 — 신설 시설이 유휴자산이 될 위험이 크다`,
      `${declineRank}° distretto per calo demografico: alto rischio che una nuova struttura resti inutilizzata`,
    ))
  }
  if (ageing) {
    because.push(K(
      `고령화 ${elderNow}% → ${elderLate}% — 지금의 용도가 오래가지 않는다`,
      `Invecchiamento dal ${elderNow}% al ${elderLate}%: l'attuale destinazione non reggerà a lungo`,
    ))
  }

  // 자료가 가리키는 안과 규모가 허락하는 안이 다를 수 있다 — 그 차이가 결론이다
  const wanted = shrinking && ageing ? 'C' : ageing ? 'B' : 'A'
  const target = options.find((o) => o.key === wanted)
  const forced = viable.length === 1 ? viable[0] : null

  if (target && !target.ok) {
    const need = target.required.toLocaleString()
    const have = plannedArea.toLocaleString()
    const gap = target.shortfall.toLocaleString()
    because.push(K(
      `자료는 ${wanted}안을 가리키지만 ${need} m²가 필요하다 — 계획 ${have} m² 로는 ${gap} m² 모자란다`,
      `I dati indicano l'alternativa ${wanted}, che richiede ${need} m²: con i ${have} m² previsti ne mancano ${gap}`,
    ))
  }

  return {
    key: wanted,
    viableKeys: viable.map((o) => o.key),
    /** 규모 때문에 선택의 여지가 없을 때 */
    forcedKey: forced && forced.key !== wanted ? forced.key : null,
    because,
  }
}
