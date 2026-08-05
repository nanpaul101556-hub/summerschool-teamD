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

/**
 * 모델링을 실시하고 평면·투시를 함께 받는다.
 * 생성과 두 번의 캡처가 한 호출에서 끝나므로 왕복이 한 번이다.
 */
export async function buildModel(code) {
  const r = await call('/build', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  }, 180000)
  return {
    output: r.output,
    plan: { ...r.plan, href: `${BRIDGE}${r.plan.url}` },
    model: { ...r.model, href: `${BRIDGE}${r.model.url}` },
  }
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

  return `import rhinoscriptsyntax as rs

# 미터(4) → 현재 문서 단위 환산 계수
S = rs.UnitScale(rs.UnitSystem(), 4)
SPAN = ${m.span} * S
H = ${m.height} * S
GX, GY, FL = ${m.gx}, ${m.gy}, ${m.floors}
FILLED = [${filled}]
NAME = "${key}"
# 레이어 접두 — 아래 삭제 루프가 이 접두로 이전 매싱을 찾는다
KEY = "MASS_${key}"

# 부재 치수 (m 기준)
COL_W  = 0.45 * S      # 기둥
BEAM_W = 0.35 * S      # 보 폭
BEAM_D = 0.60 * S      # 보 춤
SLAB_T = 0.30 * S      # 슬래브 두께
EAVE   = 0.70 * S      # 슬래브 내밀기 — 선례 2 의 드러난 슬래브
FIN_W  = 0.10 * S      # 수직 핀
FIN_D  = 0.28 * S
GLASS_T = 0.04 * S
CROWN  = 0.55 * H      # 지붕 위로 솟는 프레임 — Folie N6

LAYERS = [(KEY+"_FRAME", (90,90,95)), (KEY+"_SLAB", (170,170,165)),
          (KEY+"_FIN", (120,110,100)), (KEY+"_GLASS", (150,185,205)),
          (KEY+"_CROWN", (70,70,75))]

rs.EnableRedraw(False)

# 고른 안만 서 있어야 한다 — 이전 매싱은 다른 안의 것까지 모두 지운다
for name in (rs.LayerNames() or []):
    if name.startswith("MASS_"):
        old = rs.ObjectsByLayer(name)
        if old:
            rs.DeleteObjects(old)

for (name, col) in LAYERS:
    if not rs.IsLayer(name):
        rs.AddLayer(name, col)

prev = rs.CurrentLayer()
made = []

def box(x0, y0, z0, x1, y1, z1):
    pts = [(x0,y0,z0),(x1,y0,z0),(x1,y1,z0),(x0,y1,z0),
           (x0,y0,z1),(x1,y0,z1),(x1,y1,z1),(x0,y1,z1)]
    return rs.AddBox(pts)

fill = set(FILLED)
def has(ix, iy):
    return (ix, iy) in fill

# ── 기둥 — 그리드 전체. 채우지 않은 곳에도 세운다 (여유를 남긴다)
rs.CurrentLayer(KEY+"_FRAME")
h = COL_W / 2.0
for i in range(GX + 1):
    for j in range(GY + 1):
        x, y = i * SPAN, j * SPAN
        made.append(box(x-h, y-h, 0, x+h, y+h, FL * H))

# ── 보 — 각 층 레벨, 양방향
bw = BEAM_W / 2.0
for f in range(1, FL + 1):
    z = f * H
    for i in range(GX + 1):
        for j in range(GY):
            x, y0, y1 = i * SPAN, j * SPAN, (j + 1) * SPAN
            made.append(box(x-bw, y0, z-BEAM_D, x+bw, y1, z))
    for j in range(GY + 1):
        for i in range(GX):
            y, x0, x1 = j * SPAN, i * SPAN, (i + 1) * SPAN
            made.append(box(x0, y-bw, z-BEAM_D, x1, y+bw, z))

# ── 슬래브 — 채운 베이 위에만. 1층 바닥은 두지 않는다 (필로티)
rs.CurrentLayer(KEY+"_SLAB")
for (ix, iy) in FILLED:
    for f in range(1, FL + 1):
        z = f * H
        # 덩어리 바깥쪽으로만 내민다
        x0 = ix * SPAN - (EAVE if not has(ix-1, iy) else 0)
        x1 = (ix+1) * SPAN + (EAVE if not has(ix+1, iy) else 0)
        y0 = iy * SPAN - (EAVE if not has(ix, iy-1) else 0)
        y1 = (iy+1) * SPAN + (EAVE if not has(ix, iy+1) else 0)
        made.append(box(x0, y0, z, x1, y1, z + SLAB_T))

# ── 외피 — 채운 덩어리의 바깥 면, 위층에만 (1층은 열어 둔다)
z0, z1 = H + SLAB_T, FL * H
STEP = SPAN / 6.0
for (ix, iy) in FILLED:
    edges = []
    if not has(ix, iy-1): edges.append(((ix,iy), (ix+1,iy), 0, -1))
    if not has(ix, iy+1): edges.append(((ix,iy+1), (ix+1,iy+1), 0, 1))
    if not has(ix-1, iy): edges.append(((ix,iy), (ix,iy+1), -1, 0))
    if not has(ix+1, iy): edges.append(((ix+1,iy), (ix+1,iy+1), 1, 0))

    for (a, b, nx, ny) in edges:
        ax, ay = a[0] * SPAN, a[1] * SPAN
        bx, by = b[0] * SPAN, b[1] * SPAN
        # 유리면
        rs.CurrentLayer(KEY+"_GLASS")
        if nx != 0:
            made.append(box(ax - GLASS_T/2, ay, z0, ax + GLASS_T/2, by, z1))
        else:
            made.append(box(ax, ay - GLASS_T/2, z0, bx, ay + GLASS_T/2, z1))
        # 수직 핀 — 선례의 줄무늬 입면
        rs.CurrentLayer(KEY+"_FIN")
        n = int(SPAN / STEP)
        for k in range(1, n):
            t = k * STEP
            if nx != 0:
                y = ay + t
                made.append(box(ax + nx*0 - FIN_D/2, y - FIN_W/2, z0,
                                ax + nx*FIN_D, y + FIN_W/2, z1))
            else:
                x = ax + t
                made.append(box(x - FIN_W/2, ay + ny*0 - FIN_D/2, z0,
                                x + FIN_W/2, ay + ny*FIN_D, z1))

# ── 크라운 — 지붕 위로 솟는 프레임. 골조가 프로그램보다 오래 남는다는 표시
rs.CurrentLayer(KEY+"_CROWN")
zt = FL * H
for i in range(GX + 1):
    for j in range(GY + 1):
        x, y = i * SPAN, j * SPAN
        made.append(box(x-h, y-h, zt, x+h, y+h, zt + CROWN))
zc = zt + CROWN
for i in range(GX + 1):
    for j in range(GY):
        x = i * SPAN
        made.append(box(x-bw, j*SPAN, zc-BEAM_D, x+bw, (j+1)*SPAN, zc))
for j in range(GY + 1):
    for i in range(GX):
        y = j * SPAN
        made.append(box(i*SPAN, y-bw, zc-BEAM_D, (i+1)*SPAN, y+bw, zc))

rs.CurrentLayer(prev)
rs.EnableRedraw(True)
print("%s: %dx%d bay, span %.1fm, fill %d/%d, objects %d"
      % (NAME, GX, GY, ${m.span}, len(FILLED), GX*GY, len(made)))
`
}

