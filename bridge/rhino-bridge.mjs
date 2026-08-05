/**
 * Rhino 브리지 — HTTP를 TCP로 중계하고, 산출 파일을 내려준다.
 *
 *   브라우저 ──HTTP :8787──▶ 이 프로세스 ──TCP :1999──▶ rhinomcp ──▶ Rhino
 *
 * 브라우저는 raw TCP 소켓을 열 수 없고 rhinomcp 는 헤더 없는 JSON 을
 * TCP 로만 받으므로 중간 단계가 반드시 필요하다.
 *
 * 실행:  node bridge/rhino-bridge.mjs
 * 전제:  Rhino 명령줄에서 mcpstart 실행
 *
 * ── 경로 ──
 *   GET  /health          브리지·Rhino 생존 확인
 *   POST /command         rhinomcp 명령 중계
 *   POST /build           모델링 실시 → 평면·투시 캡처 → 두 이미지 URL
 *   POST /export          현재 문서를 3dm 으로 저장 → 내려받기 URL
 *   POST /capture         활성 뷰포트를 PNG 로 캡처 → 이미지 URL
 *   GET  /file/<name>     위에서 만든 파일 전송
 *
 * ── 보안 ──
 * 로컬 전용이다. 127.0.0.1 에만 바인딩하고 루프백 오리진만 허용한다.
 * 이 브리지는 Rhino 안에서 임의의 파이썬을 실행시킬 수 있으므로,
 * 외부에 노출하면 접근한 누구나 이 컴퓨터에서 코드를 돌릴 수 있게 된다.
 * 포트포워딩이나 0.0.0.0 바인딩을 하지 말 것.
 */

import fs from 'node:fs/promises'
import http from 'node:http'
import net from 'node:net'
import os from 'node:os'
import path from 'node:path'

const PORT = Number(process.env.BRIDGE_PORT ?? 8787)
const RHINO_HOST = '127.0.0.1'
const RHINO_PORT = Number(process.env.RHINO_PORT ?? 1999)
const CALL_TIMEOUT = 120000

const OUT_DIR = path.join(os.tmpdir(), 'rhino-bridge')

const MIME = {
  '.3dm': 'model/vnd.3dm',
  '.png': 'image/png',
}

/** dev 서버 포트가 바뀌어도 되도록 루프백 오리진이면 허용한다. */
function allowedOrigin(origin) {
  if (!origin) return null
  try {
    const { hostname, protocol } = new URL(origin)
    const local = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]'
    return local && protocol === 'http:' ? origin : null
  } catch {
    return null
  }
}

function cors(req, res) {
  const origin = allowedOrigin(req.headers.origin)
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

function send(res, code, body) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(body))
}

/**
 * rhinomcp 는 레거시 프로토콜이다 — 길이 헤더 없이 JSON 을 그대로 흘려보내고,
 * 응답도 그대로 돌아온다. 따라서 파싱될 때까지 모아서 판단한다.
 */
function callRhino(message) {
  return new Promise((resolve, reject) => {
    const sock = net.createConnection({ host: RHINO_HOST, port: RHINO_PORT })
    let buf = ''
    let settled = false

    const done = (err, value) => {
      if (settled) return
      settled = true
      sock.destroy()
      err ? reject(err) : resolve(value)
    }

    sock.setTimeout(CALL_TIMEOUT)
    sock.on('connect', () => sock.write(JSON.stringify(message)))
    sock.on('data', (chunk) => {
      buf += chunk.toString('utf8')
      try {
        done(null, JSON.parse(buf))
      } catch {
        /* 아직 덜 왔다 — 더 기다린다 */
      }
    })
    sock.on('timeout', () => done(new Error('Rhino 응답 시간 초과')))
    sock.on('error', (err) =>
      done(
        new Error(
          err.code === 'ECONNREFUSED'
            ? `Rhino(:${RHINO_PORT})가 응답하지 않습니다. Rhino에서 mcpstart를 실행하십시오.`
            : err.message,
        ),
      ),
    )
    sock.on('close', () => done(new Error('응답 없이 연결이 끊겼습니다')))
  })
}

/** 파이썬을 실행시키고, rhinomcp 가 status:'error' 를 주면 예외로 올린다. */
async function runPython(code) {
  const res = await callRhino({ type: 'execute_rhinoscript_python_code', params: { code } })
  if (res?.status === 'error') throw new Error(res.message ?? 'Rhino 오류')
  return res
}

/** 포트가 열려 있는지만 확인한다 — 명령은 보내지 않는다. */
function probeRhino() {
  return new Promise((resolve) => {
    const sock = net.createConnection({ host: RHINO_HOST, port: RHINO_PORT })
    const finish = (ok) => {
      sock.destroy()
      resolve(ok)
    }
    sock.setTimeout(2000)
    sock.on('connect', () => finish(true))
    sock.on('timeout', () => finish(false))
    sock.on('error', () => finish(false))
  })
}

function readBody(req, limit = 1_000_000) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (c) => {
      data += c
      if (data.length > limit) {
        reject(new Error('요청이 너무 큽니다'))
        req.destroy()
      }
    })
    req.on('end', () => resolve(data))
    req.on('error', reject)
  })
}

/** 파이썬 리터럴에 넣기 위해 역슬래시를 슬래시로 바꾼다 (Rhino가 받아준다). */
const pyPath = (p) => p.replace(/\\/g, '/')

/** 현재 문서를 3dm 으로 저장시킨다. */
async function exportModel() {
  const name = 'model.3dm'
  const file = path.join(OUT_DIR, name)
  await runPython(`import scriptcontext as sc
import Rhino

opts = Rhino.FileIO.FileWriteOptions()
opts.FileVersion = 7
opts.IncludeRenderMeshes = True
ok = sc.doc.WriteFile("${pyPath(file)}", opts)
print("write ok" if ok else "write failed")
`)
  const { size } = await fs.stat(file)
  return { url: `/file/${name}`, bytes: size }
}

/** 캡처 공통부 — 활성 뷰를 파일로 떨군다. */
const capFn = `
def _cap(pathname, w, h):
    view = sc.doc.Views.ActiveView
    vc = Rhino.Display.ViewCapture()
    vc.Width = w
    vc.Height = h
    vc.ScaleScreenItems = False
    vc.DrawAxes = False
    vc.DrawGrid = False
    vc.DrawGridAxes = False
    vc.TransparentBackground = False
    bmp = vc.CaptureToBitmap(view)
    if not bmp:
        raise Exception("viewport capture failed")
    bmp.Save(pathname)

def _mode(name):
    d = Rhino.Display.DisplayModeDescription.FindByName(name)
    if d:
        sc.doc.Views.ActiveView.ActiveViewport.DisplayMode = d
`

/** 활성 뷰포트를 PNG 로 캡처시킨다. */
async function captureView(width = 1600, height = 1000, name = 'view.png') {
  const file = path.join(OUT_DIR, name)
  await runPython(`import scriptcontext as sc
import Rhino
${capFn}
_cap("${pyPath(file)}", ${width}, ${height})
print("captured %s" % sc.doc.Views.ActiveView.ActiveViewport.Name)
`)
  const { size } = await fs.stat(file)
  return { url: `/file/${name}`, bytes: size }
}

/**
 * 모델링을 실시하고 도면과 투시도를 한 번에 만든다.
 *
 * 평면은 Rhino 가 Top 뷰 와이어프레임으로 그린다 — 브라우저가 흉내낸
 * 그림이 아니라 실제 모델에서 나온 도면이다.
 * 여러 번 왕복하면 느리므로 생성·평면·투시를 한 호출에서 끝낸다.
 */
async function buildModel(code) {
  const plan = path.join(OUT_DIR, 'plan.png')
  const model = path.join(OUT_DIR, 'model.png')

  const out = await runPython(`import rhinoscriptsyntax as rs
import scriptcontext as sc
import Rhino
${capFn}

# ① 모델링 실시
${code}

# ② 평면 — Top 정사영 와이어프레임
vp = sc.doc.Views.ActiveView.ActiveViewport
vp.SetProjection(Rhino.Display.DefinedViewportProjection.Top, "Top", False)
_mode("Wireframe")
rs.ZoomExtents(None, False)
sc.doc.Views.Redraw()
_cap("${pyPath(plan)}", 1600, 900)

# ③ 투시 — 음영
vp.SetProjection(Rhino.Display.DefinedViewportProjection.Perspective, "Perspective", False)
_mode("Shaded")
rs.ZoomExtents(None, False)
sc.doc.Views.Redraw()
_cap("${pyPath(model)}", 1600, 900)
print("plan + model captured")
`)

  const [p, m] = await Promise.all([fs.stat(plan), fs.stat(model)])
  return {
    plan: { url: '/file/plan.png', bytes: p.size },
    model: { url: '/file/model.png', bytes: m.size },
    output: out?.result?.output ?? '',
  }
}

/** 경로 조작을 막기 위해 이름을 제한하고 출력 폴더 안으로만 해석한다. */
async function serveFile(res, rawName) {
  const name = decodeURIComponent(rawName)
  if (!/^[\w.-]+$/.test(name) || name.includes('..')) {
    return send(res, 400, { error: '잘못된 파일 이름' })
  }
  const file = path.join(OUT_DIR, name)
  if (path.dirname(path.resolve(file)) !== path.resolve(OUT_DIR)) {
    return send(res, 400, { error: '잘못된 경로' })
  }

  let data
  try {
    data = await fs.readFile(file)
  } catch {
    return send(res, 404, { error: '아직 생성되지 않았습니다' })
  }

  res.writeHead(200, {
    'Content-Type': MIME[path.extname(name)] ?? 'application/octet-stream',
    'Content-Length': data.length,
    'Cache-Control': 'no-store',
    'Content-Disposition': `attachment; filename="${name}"`,
  })
  res.end(data)
}

const server = http.createServer(async (req, res) => {
  cors(req, res)

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    return res.end()
  }

  const { pathname } = new URL(req.url, `http://127.0.0.1:${PORT}`)

  if (req.method === 'GET' && pathname === '/health') {
    return send(res, 200, { bridge: true, rhino: await probeRhino(), port: RHINO_PORT })
  }

  if (req.method === 'GET' && pathname.startsWith('/file/')) {
    return serveFile(res, pathname.slice('/file/'.length))
  }

  if (req.method === 'POST' && pathname === '/build') {
    try {
      const { code } = JSON.parse((await readBody(req)) || '{}')
      if (!code) return send(res, 400, { error: 'code가 필요합니다' })

      console.log('→ 모델링 실시')
      const out = await buildModel(code)
      console.log(`← 모델링 완료 · ${out.output.trim().split('\n')[0] ?? ''}`)
      return send(res, 200, out)
    } catch (err) {
      console.error(`✕ ${err.message}`)
      return send(res, 502, { error: err.message })
    }
  }

  if (req.method === 'POST' && (pathname === '/export' || pathname === '/capture')) {
    const what = pathname === '/export' ? '3dm 저장' : '뷰 캡처'
    try {
      console.log(`→ ${what}`)
      const out = pathname === '/export' ? await exportModel() : await captureView()
      console.log(`← ${what} ${(out.bytes / 1024 / 1024).toFixed(1)} MB`)
      return send(res, 200, out)
    } catch (err) {
      console.error(`✕ ${err.message}`)
      return send(res, 502, { error: err.message })
    }
  }

  if (req.method === 'POST' && pathname === '/command') {
    try {
      const { type, params } = JSON.parse((await readBody(req)) || '{}')
      if (!type) return send(res, 400, { error: 'type이 필요합니다' })

      console.log(`→ ${type}`)
      const result = await callRhino({ type, params: params ?? {} })
      console.log(`← ${type} 완료`)
      return send(res, 200, result)
    } catch (err) {
      console.error(`✕ ${err.message}`)
      return send(res, 502, { error: err.message })
    }
  }

  send(res, 404, { error: 'not found' })
})

await fs.mkdir(OUT_DIR, { recursive: true })

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Rhino 브리지 http://127.0.0.1:${PORT}`)
  console.log(`중계 대상 ${RHINO_HOST}:${RHINO_PORT} — Rhino에서 mcpstart 실행 필요`)
  console.log(`산출 폴더 ${OUT_DIR}`)
})
