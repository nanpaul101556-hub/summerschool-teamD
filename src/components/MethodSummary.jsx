/**
 * 03 머리 오른쪽 아래 — 「여기까지 나온 것」.
 *
 * 카드 다섯을 하나씩 눌러 봐야 그림이 잡히면 발표에서 늦는다.
 * 네 줄로 먼저 알려 주고 카드는 근거를 펴는 자리로 둔다.
 *
 * 숫자를 여기 적어 두지 않는다. 전부 카드와 정류장 자료에서 끌어온다 —
 * 그래야 원본이 바뀌면 요약도 같이 바뀌고 둘이 어긋날 일이 없다.
 *
 * 마지막 줄은 이 플랫폼이 실제로 실시간 호출하는 것을 밝힌다.
 * 대상지를 넣는 순간 V-World 를 네 번 부른다 — 그것만 실시간이고,
 * 다섯 갈래의 통계는 월·연 단위로 공표되는 자료다. 카드마다 그렇게 적었다.
 */

import { CARDS } from '../data/evidence'
import { CONTROL, STOPS } from '../data/stops'
import { useLang } from '../i18n'

const by = (id) => CARDS.find((c) => c.id === id)
const HAVE = CARDS.filter((c) => c.status === 'have').length
const SITE = STOPS.find((s) => s.lead)

export default function MethodSummary() {
  const { t, tx } = useLang()

  const rows = [
    { k: 'came', v: by('bus').brief.v, d: tx(by('bus').brief.d), on: true },
    { k: 'paid', v: by('budget').brief.v, d: tx(by('budget').brief.d), on: true },
    { k: 'back', v: SITE.idx.toFixed(1), d: t('ms.backD', { n: CONTROL.idx.toFixed(1) }) },
    { k: 'link', v: `${HAVE}/${CARDS.length}`, d: t('tj.axDataD') },
  ]

  return (
    <section className="ms">
      <h4>{t('ms.title')}</h4>

      <ul>
        {rows.map((r) => (
          <li key={r.k} className={r.on ? 'on' : ''}>
            <b className="num">{r.v}</b>
            <span className="h">{t(`ms.${r.k}`)}</span>
            <span className="d">{r.d}</span>
          </li>
        ))}
      </ul>

      <p className="ms-n">{t('ms.lead')}</p>

      <p className="ms-l">
        <i aria-hidden="true" />
        <b>{t('ms.live')}</b>
        <span>{t('ms.liveList')}</span>
      </p>
    </section>
  )
}
