/**
 * Rhino 브리지 — HTTP를 TCP로 중계한다.
 *
 *   브라우저 ──HTTP :8787──▶ 이 프로세스 ──TCP :1999──▶ rhinomcp ──▶ Rhino
 *
 * 브라우저는 raw TCP 소켓을 열 수 없고 rhinomcp 는 헤더 없는 JSON 을
 * TCP 로만 받으므로 중간 단계가 반드시 필요하다.
 *
 * 실행:  node bridge/rhino-bridge.mjs
 * 전제:  Rhino 명령줄에서 mcpstart 실행
 *
 * 로컬 전용이다. 127.0.0.1 에만 바인딩하고 로컬 오리진만 허용한다.
 */

import http from 'node:http'
import net from 'node:net'

const PORT = Number(process.env.BRIDGE_PORT ?? 8787)
const RHINO_HOST = '127.0.0.1'
const RHINO_PORT = Number(process.env.RHINO_PORT ?? 1999)
const CALL_TIMEOUT = 60000

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
  const payload = JSON.stringify(body)
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' })
  res.end(payload)
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

const server = http.createServer(async (req, res) => {
  cors(req, res)

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    return res.end()
  }

  if (req.method === 'GET' && req.url === '/health') {
    return send(res, 200, { bridge: true, rhino: await probeRhino(), port: RHINO_PORT })
  }

  if (req.method === 'POST' && req.url === '/command') {
    try {
      const raw = await readBody(req)
      const { type, params } = JSON.parse(raw || '{}')
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

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Rhino 브리지 http://127.0.0.1:${PORT}`)
  console.log(`중계 대상 ${RHINO_HOST}:${RHINO_PORT} — Rhino에서 mcpstart 실행 필요`)
})
