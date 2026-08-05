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

/** 현재 문서를 3dm 으로 저장시키고 내려받기 주소를 받는다. 파일이 커서 넉넉히 기다린다. */
export async function exportModel() {
  const r = await call('/export', { method: 'POST' }, 120000)
  return { ...r, href: `${BRIDGE}${r.url}` }
}

/** 활성 뷰포트를 캡처시키고 이미지 주소를 받는다. */
export async function captureView() {
  const r = await call('/capture', { method: 'POST' }, 60000)
  return { ...r, href: `${BRIDGE}${r.url}` }
}

export const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`

/**
 * 매싱에서 Rhino 생성 코드를 만든다.
 *
 * 형태 규칙은 두 선례에서 온다 — 골조가 외피보다 크고(Folie N6),
 * 슬래브가 드러나며 1층은 열려 있다. 규칙은 모든 안에 같고 치수와
 * 채움만 대안에 따라 달라진다.
 *
 * 사양은 미터인데 문서 단위는 무엇이든 될 수 있다(현재 대상 문서는 mm).
 * 그대로 보내면 1000배 작게 생기므로 문서 단위로 환산한 뒤 그린다.
 * 기존 SUPPORT_* 레이어와 섞이지 않도록 안별 전용 레이어에 올린다.
 */
export function massingScript(m, key = 'X') {
  const filled = m.cells.filter((c) => c.filled).map((c) => `(${c.ix},${c.iy})`).join(',')
  const L = `MASS_${key}`

  return `import rhinoscriptsyntax as rs

# 미터(4) → 현재 문서 단위 환산 계수
S = rs.UnitScale(rs.UnitSystem(), 4)
SPAN = ${m.span} * S
H = ${m.height} * S
GX, GY, FL = ${m.gx}, ${m.gy}, ${m.floors}
FILLED = [${filled}]

for name in ("${L}_FRAME", "${L}_SLAB", "${L}_SKIN"):
    if not rs.IsLayer(name):
        rs.AddLayer(name)
prev = rs.CurrentLayer("${L}_FRAME")

rs.EnableRedraw(False)
made = []

# ── 골조 — 채운 곳뿐 아니라 그리드 전체에 세운다 (여유를 남긴다)
for i in range(GX + 1):
    for j in range(GY + 1):
        x, y = i * SPAN, j * SPAN
        made.append(rs.AddLine((x, y, 0), (x, y, FL * H)))

for f in range(1, FL + 1):
    z = f * H
    for i in range(GX + 1):
        for j in range(GY):
            made.append(rs.AddLine((i * SPAN, j * SPAN, z), (i * SPAN, (j + 1) * SPAN, z)))
    for j in range(GY + 1):
        for i in range(GX):
            made.append(rs.AddLine((i * SPAN, j * SPAN, z), ((i + 1) * SPAN, j * SPAN, z)))

# ── 슬래브 — 채운 베이 위에만. 1층 바닥은 두지 않는다 (필로티)
rs.CurrentLayer("${L}_SLAB")
slabs = 0
for (ix, iy) in FILLED:
    for f in range(1, FL + 1):
        z = f * H
        pts = [(ix * SPAN, iy * SPAN, z), ((ix + 1) * SPAN, iy * SPAN, z),
               ((ix + 1) * SPAN, (iy + 1) * SPAN, z), (ix * SPAN, (iy + 1) * SPAN, z)]
        made.append(rs.AddSrfPt(pts)); slabs += 1

# ── 외피 — 채운 덩어리의 바깥 면에만, 위층에만 (1층은 열어 둔다)
rs.CurrentLayer("${L}_SKIN")
fill = set(FILLED)
skins = 0
z0, z1 = H, FL * H
for (ix, iy) in FILLED:
    edges = []
    if (ix, iy - 1) not in fill: edges.append(((ix, iy), (ix + 1, iy)))
    if (ix, iy + 1) not in fill: edges.append(((ix, iy + 1), (ix + 1, iy + 1)))
    if (ix - 1, iy) not in fill: edges.append(((ix, iy), (ix, iy + 1)))
    if (ix + 1, iy) not in fill: edges.append(((ix + 1, iy), (ix + 1, iy + 1)))
    for (a, b) in edges:
        pts = [(a[0] * SPAN, a[1] * SPAN, z0), (b[0] * SPAN, b[1] * SPAN, z0),
               (b[0] * SPAN, b[1] * SPAN, z1), (a[0] * SPAN, a[1] * SPAN, z1)]
        made.append(rs.AddSrfPt(pts)); skins += 1

rs.CurrentLayer(prev)
rs.EnableRedraw(True)
print("${key}안 %dx%d bay, span %.1fm, 채움 %d/%d, 객체 %d (슬래브 %d, 외피 %d)"
      % (GX, GY, ${m.span}, len(FILLED), GX * GY, len(made), slabs, skins))
`
}
