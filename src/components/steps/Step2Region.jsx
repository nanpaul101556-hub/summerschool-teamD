/** ② 지역을 읽는다 — 무엇이 필요한가 (수요 − 공급 = 격차) */

import { ACCESS, NEARBY, OBSERVED } from '../../data/facilities'
import { DECLINE_RANK, VULNERABLE } from '../../data/population'
import { MISSING } from '../../data/sources'
import { n, walkMinutes } from '../../lib/format'
import { Badge, MissingNotice, Panel, Section, SourceTag, Stat } from '../ui'

export default function Step2Region({ pop, gaps }) {
  const farWelfare = NEARBY.filter((f) => f.type === 'welfare' && f.dist > ACCESS.targetRadius)

  return (
    <>
      <Section no="02" title="지역을 읽는다 · 사람">
        <div className="stats">
          <Stat label="총인구" value={n(pop.pop)} unit="명"
            note={pop.est ? '추계' : '실측'} src={pop.est ? 'seoulProj' : 'nowonPop'} />
          <Stat label="65세 이상" value={pop.elder} unit="%" tone={pop.elder >= 20 ? 'warn' : ''}
            note={pop.elder >= 20 ? '초고령사회' : '고령사회'} />
          <Stat label="유소년" value={pop.youth} unit="%" note="14세 이하" />
          {VULNERABLE.map((v) => (
            <Stat key={v.key} label={v.label} value={n(v.value)} unit={v.unit}
              note={v.note} src={v.src} />
          ))}
        </div>
        <p className="notice">
          인구 감소 <b>{DECLINE_RANK.total}개 자치구 중 {DECLINE_RANK.rank}위</b>
          <SourceTag id="seoulProj" />
        </p>
      </Section>

      <Section title="현장 실측 · 추정이 아닌 관찰치">
        <div className="grid g2">
          <Panel>
            <h3>이용자 {OBSERVED.total}명<SourceTag id={OBSERVED.src} /></h3>
            <p className="notice">{OBSERVED.rank}</p>
            <div className="tbl" style={{ marginTop: 10 }}>
              <table>
                <thead><tr><th>시간대</th><th className="num">남</th><th className="num">여</th><th className="num">계</th></tr></thead>
                <tbody>
                  {OBSERVED.byTime.map((t) => (
                    <tr key={t.slot}>
                      <td>{t.slot}</td>
                      <td className="num">{t.male}</td>
                      <td className="num">{t.female}</td>
                      <td className="num"><b>{t.male + t.female}</b></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
          <Panel>
            <h3>주요 행위</h3>
            <div className="tbl" style={{ marginTop: 8 }}>
              <table>
                <tbody>
                  {OBSERVED.topActs.map((a) => (
                    <tr key={a.act}><td>{a.act}</td><td className="num">{a.n}명</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="notice">
              ⚠️ 이 값은 <b>노인 이용자</b> 관찰치입니다. 전체 이용자 규모는 이 자료로 알 수 없습니다.
            </p>
          </Panel>
        </div>
      </Section>

      <Section title="격차 진단 · 대응 유형">
        <MissingNotice items={[MISSING.facilityCoords, MISSING.isochrone]} />
        <div className="gaps">
          {gaps.map((g) => (
            <div key={g.key} className="gap">
              <div className="lb">{g.label}</div>
              <div className="bar"><span style={{ width: `${g.score}%` }} /></div>
              <div className="sc">{g.score}</div>
              <Badge tone={g.response.tone}>{g.response.code}</Badge>
              <div className="ds">{g.response.desc}</div>
            </div>
          ))}
        </div>

        {farWelfare.map((f) => (
          <div key={f.name} className="verdict bad" style={{ marginTop: 12 }}>
            <b>{f.name} — {(f.dist / 1000).toFixed(1)} km</b>
            <span>
              고령자 보행속도 {ACCESS.elderWalkSpeed} km/h 기준 약 <b>{walkMinutes(f.dist, ACCESS.elderWalkSpeed)}분</b>.
              노인친화 공원 적정 유치거리 {ACCESS.targetRadius} m
              <SourceTag id={ACCESS.targetSrc} />
              의 {(f.dist / ACCESS.targetRadius).toFixed(1)}배입니다.
            </span>
          </div>
        ))}
      </Section>

      <Section title="주변 공급 시설">
        <div className="tbl">
          <table>
            <thead><tr><th>시설</th><th style={{ width: 90 }}>유형</th><th className="num" style={{ width: 90 }}>거리</th><th style={{ width: 110 }}>도보</th><th>주 이용층</th></tr></thead>
            <tbody>
              {NEARBY.map((f) => {
                const within = f.dist <= ACCESS.targetRadius
                return (
                  <tr key={f.name}>
                    <td>{f.name}</td>
                    <td>{f.type}</td>
                    <td className="num">{n(f.dist)} m</td>
                    <td>
                      <Badge tone={within ? 'ok' : 'connect'}>
                        {walkMinutes(f.dist, ACCESS.elderWalkSpeed)}분
                      </Badge>
                    </td>
                    <td style={{ color: 'var(--ink-2)' }}>{f.users}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  )
}
