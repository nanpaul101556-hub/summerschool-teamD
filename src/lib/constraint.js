/** ① 제도 — 법정 한계를 산정한다. 미확보 항목은 null을 그대로 반환한다. */

const K = (ko, it, en) => ({ ko, it, en })

/**
 * @param {{landArea:number, bcr:number|null, far:number|null, heightLimit:number|null}} site
 */
export function computeLimits(site) {
  const { landArea, bcr, far } = site
  const buildingArea = bcr == null ? null : (landArea * bcr) / 100
  const totalArea = far == null ? null : (landArea * far) / 100
  const floors = buildingArea && totalArea ? Math.floor(totalArea / buildingArea) : null

  return {
    landArea,
    buildingArea,
    totalArea,
    floors,
    resolved: bcr != null && far != null,
  }
}

/** 계획 규모가 법정 한계 안에 있는지 판정한다. */
export function checkCompliance(limits, plannedTotal) {
  if (!limits.resolved) return { status: 'unknown', msg: '용도지역 미확보 — 판정 불가' }
  if (plannedTotal > limits.totalArea) {
    return { status: 'over', msg: `용적률 초과 (한도 ${Math.round(limits.totalArea)} m²)` }
  }
  const usage = (plannedTotal / limits.totalArea) * 100
  return { status: 'ok', msg: `용적률 활용 ${usage.toFixed(0)}%`, usage }
}

/** 제도 인센티브 목록 — 대상지 조건에 따라 해당되는 것만 */
export function eligibleIncentives(site) {
  const list = []
  if (site.carbonPilot) {
    list.push({
      key: 'pilot',
      label: K('탄소중립 선도도시', 'Città pilota carbon neutral', 'Carbon-neutral pilot city'),
      detail: K(site.incentive, site.incentive,
        'Priority review of the maintenance plan where ZEB is applied'),
      active: true,
    })
  }
  if (site.greenRemodel) {
    list.push({
      key: 'green',
      label: K('그린리모델링', 'Green remodeling', 'Green remodeling'),
      detail: K('국비:지방비 7:3 · 70억 한도',
        'Stato/ente locale 7:3 · tetto 7 mld',
        'National to local funding 7:3 · capped at 7 bn KRW'),
      active: true,
    })
  }
  list.push({
    key: 'zeb',
    label: K('ZEB 의무', 'Obbligo ZEB', 'ZEB requirement'),
    detail: site.zebMandatory
      ? K('의무 대상', 'Obbligatorio', 'Mandatory')
      : K(
          `비대상 (${site.zebNote.ko})`,
          `Non soggetto (${site.zebNote.it})`,
          `Not subject (${site.zebNote.en})`,
        ),
    active: site.zebMandatory,
  })
  return list
}
