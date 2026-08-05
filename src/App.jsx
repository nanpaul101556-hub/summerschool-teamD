import 'leaflet/dist/leaflet.css'

import { useState } from 'react'

import { STEPS } from './components/AppFrame'
import FutureView from './components/FutureView'
import Landing from './components/Landing'
import OptionsView from './components/OptionsView'
import RegionView from './components/RegionView'
import RhinoView from './components/RhinoView'
import SiteView from './components/SiteView'
import './styles/tokens.css'

/**
 * 01 대상지 → 02 지역 정보 → 03 대안 산출 → 04 모델링 → 05 시간 변화
 * 앞 단계가 뒤 단계의 근거가 된다. 03 에서 고른 대안이 04·05 의 입력이다.
 */
const FLOW = STEPS.map((s) => s.key)

export default function App() {
  const [site, setSite] = useState(null)
  const [stage, setStage] = useState('site')
  const [picked, setPicked] = useState(null)

  const reset = () => {
    setSite(null)
    setStage('site')
    setPicked(null)
  }

  if (!site) return <Landing onFound={setSite} />

  const next = () => {
    const i = FLOW.indexOf(stage)
    if (FLOW[i + 1]) setStage(FLOW[i + 1])
  }

  const shared = { site, onStep: setStage, onReset: reset, onNext: next }

  switch (stage) {
    case 'region':
      return <RegionView {...shared} />
    case 'options':
      return <OptionsView {...shared} picked={picked} onPick={setPicked} />
    case 'rhino':
      return <RhinoView {...shared} picked={picked} />
    case 'future':
      return <FutureView {...shared} picked={picked} />
    default:
      return <SiteView {...shared} />
  }
}
