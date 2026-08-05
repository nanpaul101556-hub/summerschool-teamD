import { useState } from 'react'

import Landing from './components/Landing'
import RhinoView from './components/RhinoView'
import SiteView from './components/SiteView'
import './styles/tokens.css'

/** 01 입력 → 02 대상지 → 03 Rhino */
export default function App() {
  const [site, setSite] = useState(null)
  const [stage, setStage] = useState('site')

  if (!site) return <Landing onFound={setSite} />

  if (stage === 'rhino') return <RhinoView onBack={() => setStage('site')} />

  return (
    <SiteView
      site={site}
      onBack={() => setSite(null)}
      onNext={() => setStage('rhino')}
    />
  )
}
