/**
 * Rhino 통신 클라이언트.
 *
 * 브라우저는 raw TCP 소켓을 열 수 없다. rhinomcp 는 127.0.0.1:1999 에서
 * 헤더 없는 JSON 을 TCP 로 주고받으므로, 웹에서 직접 붙을 방법이 없다.
 * 그래서 로컬 브리지(bridge/rhino-bridge.mjs)가 HTTP → TCP 로 중계한다.
 *
 *   브라우저 ──HTTP──▶ 브리지 :8787 ──TCP──▶ rhinomcp :1999 ──▶ Rhino
 */

export const BRIDGE = 'http://127.0.0.1:8787'

/** 응답이 없을 때 화면이 멎지 않도록 항상 시한을 건다. */
async function call(path, init = {}, timeout = 15000) {
  const ctl = new AbortController()
  const timer = setTimeout(() => ctl.abort(), timeout)
  try {
    const res = await fetch(`${BRIDGE}${path}`, { ...init, signal: ctl.signal })
    const body = await res.json().catch(() => null)
    if (!res.ok) throw new Error(body?.error ?? `HTTP ${res.status}`)
    return body
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('응답 시간 초과')
    if (err instanceof TypeError) throw new Error('브리지에 연결할 수 없습니다')
    throw err
  } finally {
    clearTimeout(timer)
  }
}

/** 브리지와 Rhino 각각의 생존 여부를 확인한다. */
export async function health() {
  return call('/health', {}, 4000)
}

/** rhinomcp 명령 하나를 보낸다. */
export async function command(type, params = {}) {
  return call('/command', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, params }),
  })
}

/**
 * 역산 사양에서 Support(장수명 구조체) 생성 코드를 만든다.
 * 스팬은 그리드 간격이 되고, 층고는 기둥 높이가 된다.
 *
 * 사양은 미터인데 문서 단위는 무엇이든 될 수 있다(현재 대상 문서는 mm).
 * 그대로 보내면 1000배 작게 생기므로 문서 단위로 환산한 뒤 그린다.
 * 기존 SUPPORT_* 레이어와 섞이지 않도록 전용 레이어에 올린다.
 */
export function supportScript({ span, height }, bays = 3, layer = 'SUPPORT_AUTO') {
  return `import rhinoscriptsyntax as rs

# 미터(4) → 현재 문서 단위 환산 계수
S = rs.UnitScale(rs.UnitSystem(), 4)
SPAN = ${span} * S
H = ${height} * S
BAYS = ${bays}

if not rs.IsLayer("${layer}"):
    rs.AddLayer("${layer}")
prev = rs.CurrentLayer("${layer}")

rs.EnableRedraw(False)
made = []

# 기둥 — (BAYS+1)^2 격자
for i in range(BAYS + 1):
    for j in range(BAYS + 1):
        x, y = i * SPAN, j * SPAN
        made.append(rs.AddLine((x, y, 0), (x, y, H)))

# 보 — 양방향
for i in range(BAYS + 1):
    for j in range(BAYS):
        a, b = i * SPAN, j * SPAN
        made.append(rs.AddLine((a, b, H), (a, b + SPAN, H)))
        made.append(rs.AddLine((b, a, H), (b + SPAN, a, H)))

rs.CurrentLayer(prev)
rs.EnableRedraw(True)
print("layer ${layer}: %d objects, span %.0f, height %.0f" % (len(made), SPAN, H))
`
}
