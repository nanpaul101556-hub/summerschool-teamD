/** ① 제도를 읽는다 — 무엇이 허용되는가 */

import { UPPER_PLANS, SITE } from '../../data/site'
import { MISSING } from '../../data/sources'
import { m2, orMissing } from '../../lib/format'
import { Badge, MissingNotice, Panel, Section, SourceTag, Stat } from '../ui'

export default function Step1Institution({ limits, compliance, incentives }) {
  return (
    <>
      <Section no="01" title="제도를 읽는다 · 무엇이 허용되는가">
        <MissingNotice items={[MISSING.zoning]} />

        <div className="stats">
          <Stat label="대지면적" value={SITE.landArea.toLocaleString()} unit="m²" src="parkUse" note="확보" />
          <Stat label="용도지역" value={orMissing(SITE.zoning)} />
          <Stat label="건폐율" value={orMissing(SITE.bcr, '%')} />
          <Stat label="용적률" value={orMissing(SITE.far, '%')} />
          <Stat label="최대 건축면적" value={limits.buildingArea ? m2(limits.buildingArea) : null} />
          <Stat label="최대 연면적" value={limits.totalArea ? m2(limits.totalArea) : null} />
        </div>

        <p className="notice">
          계획 연면적 {SITE.plannedArea} m² — {compliance.msg}
        </p>
      </Section>

      <Section title="적용 가능한 제도 · 인센티브">
        <div className="grid g2">
          {incentives.map((inc) => (
            <Panel key={inc.key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                <h3 style={{ margin: 0 }}>{inc.label}</h3>
                <Badge tone={inc.active ? 'ok' : 'keep'}>{inc.active ? '해당' : '비대상'}</Badge>
              </div>
              <p className="notice" style={{ marginTop: 6 }}>{inc.detail}</p>
            </Panel>
          ))}
        </div>
        <p className="notice">
          노원구는 환경부·국토교통부 선정 <b>탄소중립 선도도시</b>이며 수도권에서 유일합니다.
          <SourceTag id="nowonCarbon" />
        </p>
      </Section>

      <Section title="상위계획 · RAG 대상 문서">
        <div className="tbl">
          <table>
            <thead><tr><th>계획명</th><th style={{ width: 130 }}>기간</th><th style={{ width: 90 }}>확보</th></tr></thead>
            <tbody>
              {UPPER_PLANS.map((p) => (
                <tr key={p.name}>
                  <td>{p.name}</td>
                  <td className="num">{p.period}</td>
                  <td><Badge tone="ok">확보</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  )
}
