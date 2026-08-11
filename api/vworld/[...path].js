/**
 * V-World(국토교통부) 조회 프록시 — 배포용.
 *
 * V-World 의 JSON API 는 CORS 헤더를 주지 않아 브라우저가 직접 부를 수 없다.
 * 개발에서는 vite 서버의 프록시가, 배포에서는 이 함수가 같은 일을 한다.
 * 인증키는 발급 시 등록한 도메인에서만 동작하므로 Referer 를 붙여 보낸다.
 *
 * 경로는 그대로 이어 붙인다 — /vworld/req/search → https://api.vworld.kr/req/search
 */

const UPSTREAM = 'https://api.vworld.kr'
const TIMEOUT = 12000

export default async function handler(req, res) {
  const { path = [], ...params } = req.query
  const tail = Array.isArray(path) ? path.join('/') : path
  if (!tail) return res.status(400).json({ error: 'path required' })

  // 서버가 키를 들고 있으면 그것을 쓰고, 없으면 클라이언트가 보낸 것을 그대로 넘긴다.
  // 키를 번들에서 빼고 싶으면 Vercel 에 VWORLD_KEY 만 넣고 VITE_VWORLD_KEY 를 비우면 된다.
  const key = process.env.VWORLD_KEY || params.key
  if (!key) return res.status(500).json({ error: 'VWORLD_KEY not configured' })

  const qs = new URLSearchParams({ ...params, key }).toString()
  const ctl = new AbortController()
  const timer = setTimeout(() => ctl.abort(), TIMEOUT)

  try {
    const up = await fetch(`${UPSTREAM}/${tail}?${qs}`, {
      signal: ctl.signal,
      headers: { Referer: process.env.VWORLD_REFERER || `https://${req.headers.host}/` },
    })
    const body = await up.text()
    res.status(up.status)
    res.setHeader('content-type', up.headers.get('content-type') ?? 'application/json')
    // 필지 경계와 용도지역은 자주 바뀌지 않는다 — 엣지에서 한 시간 재사용한다
    res.setHeader('cache-control', 's-maxage=3600, stale-while-revalidate=86400')
    return res.send(body)
  } catch (err) {
    const timedOut = err.name === 'AbortError'
    return res.status(timedOut ? 504 : 502).json({ error: timedOut ? 'timeout' : String(err) })
  } finally {
    clearTimeout(timer)
  }
}
