import 'leaflet/dist/leaflet.css'

import { useState } from 'react'

import { STEPS } from './components/AppFrame'
import DataView from './components/DataView'
import Intro from './components/Intro'
import Landing from './components/Landing'
import LccView from './components/LccView'
import PlanView from './components/PlanView'
import SiteView from './components/SiteView'
import VerdictView from './components/VerdictView'
import './styles/tokens.css'

/**
 * v2 — 01 대상지 → 02 상위계획 → 03 정량 근거 → 04 판정 → 05 생애주기
 *
 * 앞 단계가 뒤 단계의 근거가 된다. 02 가 「무엇에 의거하는가」를,
 * 03 이 「전과 후로 무엇이 달라졌는가」를 답하고, 04 가 그것을 합쳐
 * 「언제 무엇을 하라」를 낸다. 05 는 그 처방을 50년 곡선 위에 그린다.
 *
 * v1 의 모델링(Rhino)·시간변화 화면은 라우팅에서 뺐다. 컴포넌트는 남아 있다.
 */
const FLOW = STEPS.map((s) => s.key)

export default function App() {
  const [intro, setIntro] = useState(true)
  const [site, setSite] = useState(null)
  const [stage, setStage] = useState('site')

  /** 처음으로 돌아가도 인트로는 다시 틀지 않는다 — 발표 중 되감기가 번거롭다 */
  const reset = () => {
    setSite(null)
    setStage('site')
  }

  if (intro) return <Intro onDone={() => setIntro(false)} />
  if (!site) return <Landing onFound={setSite} />

  const i = FLOW.indexOf(stage)
  const next = FLOW[i + 1] ? () => setStage(FLOW[i + 1]) : null

  const shared = { site, onStep: setStage, onReset: reset, onNext: next }

  switch (stage) {
    case 'plan':
      return <PlanView {...shared} />
    case 'data':
      return <DataView {...shared} />
    case 'verdict':
      return <VerdictView {...shared} />
    case 'lcc':
      return <LccView {...shared} />
    default:
      return <SiteView {...shared} />
  }
}
