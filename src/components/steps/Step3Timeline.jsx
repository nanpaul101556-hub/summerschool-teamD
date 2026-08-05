/** ③ 시간에 투영한다 — 확실한 변화와 시나리오를 섞지 않는다 */

import {
  Area, AreaChart, CartesianGrid, Line, ReferenceLine,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'

import { POPULATION } from '../../data/population'
import { PHASES, USES } from '../../data/requirements'
import { classifyChange } from '../../lib/timeline'
import { Panel, Section, SourceTag } from '../ui'

export default function Step3Timeline({ year, pop, trend }) {
  return (
    <>
      <Section no="03" title="시간에 투영한다 · 언제 바뀌는가">
        <Panel style={{ padding: '14px 8px 4px' }}>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={POPULATION} margin={{ top: 8, right: 14, left: -14, bottom: 0 }}>
              <defs>
                {/* 등시선 램프와 같은 온도 — 고령화 압력을 색 강도로 읽는다 */}
                <linearGradient id="grad-elder" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F5A65B" stopOpacity={0.42} />
                  <stop offset="100%" stopColor="#FBD9A0" stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#ECEAE7" vertical={false} />
              <XAxis dataKey="year" tickLine={false} axisLine={{ stroke: '#DEDBD6' }}
                tick={{ fontSize: 11, fill: '#9AA5B0' }} />
              <YAxis tickLine={false} axisLine={false}
                tick={{ fontSize: 11, fill: '#9AA5B0' }} unit="%" />
              <Tooltip
                cursor={{ stroke: '#DEDBD6' }}
                contentStyle={{
                  background: '#FFFFFF', border: 0, borderRadius: 12, fontSize: 12,
                  color: '#22303C', boxShadow: '0 1px 3px rgba(34,48,60,.07), 0 8px 24px rgba(34,48,60,.08)',
                }}
                labelStyle={{ color: '#9AA5B0', fontWeight: 700 }}
              />
              <Area type="monotone" dataKey="elder" name="65세 이상 (%)"
                stroke="#22303C" strokeWidth={2.5} fill="url(#grad-elder)" />
              <Line type="monotone" dataKey="youth" name="유소년 (%)"
                stroke="#B9C2CB" strokeWidth={2} dot={false} connectNulls />
              <ReferenceLine x={year} stroke="#E24B3F" strokeWidth={2} />
              <ReferenceLine y={20} stroke="#DEDBD6" strokeDasharray="4 4"
                label={{ value: '초고령 20%', fontSize: 10, fill: '#9AA5B0', position: 'insideTopRight' }} />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <p className="notice">
          2024 → 2042 변화 : 인구 <b>{trend.pop}%</b> · 65세 이상 <b>+{trend.elder}%p</b>
          <SourceTag id="seoulProj" />
          {' '}2042년에는 고령인구가 유소년의 약 5배가 됩니다.
        </p>
      </Section>

      <Section title="시기별 용도 경로">
        <div className="grid g3">
          {PHASES.map((p) => {
            const c = classifyChange(p)
            const use = USES.find((u) => u.key === p.use)
            return (
              <div key={p.year} className={`phase ${c.tone}`}>
                <div className="y">{p.year}</div>
                <div className="u">{use?.label}</div>
                <div className="b">{p.basis}</div>
                <div style={{ marginTop: 8 }}>
                  <span className={`badge ${c.tone === 'certain' ? 'support' : 'pending'}`}>
                    {c.label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        <div className="verdict good" style={{ marginTop: 14 }}>
          <b>확실한 변화와 시나리오를 섞지 않는다</b>
          <span>
            인구추계는 공표 자료이므로 <b>단언</b>합니다. 기술·산업 변화는 예측 불가이므로
            <b> 조건부 시나리오</b>로만 표기합니다. 둘을 섞어 말하는 순간 전체 신뢰를 잃습니다.
          </span>
        </div>
      </Section>
    </>
  )
}
