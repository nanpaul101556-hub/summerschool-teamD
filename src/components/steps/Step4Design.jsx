/** ④ 유동적 설계안 — 조건에서 형태를 역산한다 */

import { CERT_TARGETS, USES } from '../../data/requirements'
import { SITE } from '../../data/site'
import { MISSING } from '../../data/sources'
import { LAYERS } from '../../lib/adaptability'
import { Badge, Chips, MissingNotice, Panel, Section, SourceTag, Stat } from '../ui'

export default function Step4Design({ uses, toggleUse, calc, verdict }) {
  return (
    <>
      <Section no="04" title="유동적 설계안 · 조건에서 형태를 역산한다">
        <p className="notice" style={{ marginBottom: 12 }}>
          이 건물이 소화해야 할 용도를 고르면, 각 항목의 <b>최댓값</b>이 채택됩니다.
          최댓값과 첫 용도의 차이가 곧 「여유」이고, 그것이 옵션 프리미엄의 물리적 실체입니다.
        </p>

        <Chips items={USES} selected={uses} onToggle={toggleUse} />

        {calc?.estimated && (
          <MissingNotice items={[MISSING.liveLoad]} />
        )}

        {calc && (
          <>
            <Panel style={{ padding: 0 }}>
              <div className="tbl">
                <table>
                  <thead>
                    <tr>
                      <th>용도</th>
                      <th className="num">하중 kg/㎡</th>
                      <th className="num">스팬 m</th>
                      <th className="num">층고 m</th>
                      <th className="num">전력 %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calc.rows.map((r) => (
                      <tr key={r.key}>
                        <td>
                          <span style={{
                            display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
                            background: r.color, marginRight: 7, verticalAlign: 1,
                          }} />
                          {r.label}
                          {r.src === 'estimate' && <SourceTag id="estimate" />}
                        </td>
                        <td className="num">{r.load}</td>
                        <td className="num">{r.span.toFixed(1)}</td>
                        <td className="num">{r.height.toFixed(1)}</td>
                        <td className="num">{r.power}</td>
                      </tr>
                    ))}
                    <tr className="total">
                      <td>채택 (최댓값)</td>
                      <td className="num">{calc.spec.load}</td>
                      <td className="num">{calc.spec.span.toFixed(1)}</td>
                      <td className="num">{calc.spec.height.toFixed(1)}</td>
                      <td className="num">{calc.spec.power}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Panel>

            <div className="stats" style={{ marginTop: 14 }}>
              <Stat label="구조 스팬" value={calc.spec.span.toFixed(1)} unit="m" tone="accent"
                note={calc.premium.span > 0 ? `기본 대비 +${calc.premium.span} m` : '여유 없음'} />
              <Stat label="바닥하중" value={calc.spec.load} unit="kg/㎡" tone="accent"
                note={calc.premium.load > 0 ? `+${calc.premium.load}` : '여유 없음'} />
              <Stat label="층고" value={calc.spec.height.toFixed(1)} unit="m" tone="accent"
                note={calc.premium.height > 0 ? `+${calc.premium.height} m` : '여유 없음'} />
              <Stat label="전력 인입" value={calc.spec.power} unit="%" tone="accent"
                note={`기본 대비 +${calc.premium.power}%p`} />
            </div>
          </>
        )}
      </Section>

      {verdict && (
        <Section title="전환 가능성 판정">
          <div className={`verdict ${verdict.ok ? 'good' : 'bad'}`}>
            <b>최소 전환 면적 {verdict.required.toLocaleString()} m² · 계획 {verdict.plannedArea} m²</b>
            <span>{verdict.msg}</span>
          </div>
          {!verdict.ok && (
            <p className="notice">
              적응성에는 <b>최소 규모</b>가 있습니다. 스팬 한 베이가 들어가지 않으면 무주공간을 만들 수 없고,
              무주공간이 없으면 평면 재분할이 불가능합니다.
              부족분 <b>{verdict.shortfall.toLocaleString()} m²</b>
            </p>
          )}
        </Section>
      )}

      <Section title="Shearing Layers · 무엇을 고정하고 무엇을 바꾸는가">
        <div className="tbl">
          <table>
            <thead><tr><th>층</th><th style={{ width: 120 }}>수명</th><th style={{ width: 110 }}>성격</th></tr></thead>
            <tbody>
              {LAYERS.map((l) => (
                <tr key={l.key}>
                  <td>{l.label}</td>
                  <td className="num">{l.life}</td>
                  <td><Badge tone={l.fixed ? 'keep' : 'support'}>{l.fixed ? 'Support 고정' : 'Infill 가변'}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="notice">
          수명이 다른 부재끼리 직접 붙이지 않는 것이 적응성의 기본 규칙입니다 (Brand 1994).
          붙여 놓으면 하나를 바꾸려다 전부 뜯어야 합니다.
        </p>
      </Section>

      <Section title="인증 · 금융 판정">
        <MissingNotice items={[MISSING.certScore]} />
        <div className="grid g2">
          {CERT_TARGETS.map((c) => (
            <Panel key={c.key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                <h3 style={{ margin: 0 }}>{c.label}</h3>
                <Badge tone={c.status === 'ready' ? 'ok' : 'pending'}>
                  {c.status === 'ready' ? '판정 가능' : '기준 미확보'}
                </Badge>
              </div>
              <p className="notice" style={{ marginTop: 6 }}>
                목표 <b>{c.target}</b> — {c.note}
              </p>
            </Panel>
          ))}
        </div>
        <p className="notice">
          ZEB 추가공사비 ㎡당 404,208~567,840원 · 단순 회수기간 20.9~23.6년
          <SourceTag id="zebCost" />
          {' '}그린리모델링 국비 7:3 적용 시 회수기간이 크게 단축됩니다 (산정 필요).
        </p>
      </Section>

      <Section title="산출물">
        <div className="grid g2">
          <Panel>
            <h3>건축 사양서</h3>
            <p className="notice">대응유형 · 규모 · 인증목표 · 적응형 사양 (어디에 여유를 둘 것인가)</p>
            <Badge tone="ok">데이터 준비됨</Badge>
          </Panel>
          <Panel>
            <h3>정책 브리프</h3>
            <p className="notice">
              이 지역의 격차 · 언제 문제가 되는가 · 어떤 제도가 막고 있는가 · 무엇을 바꿔야 하는가
            </p>
            <Badge tone="pending">미구현</Badge>
          </Panel>
        </div>
        <p className="notice">
          계획 대상 — {SITE.name} · {SITE.address}
        </p>
      </Section>
    </>
  )
}
