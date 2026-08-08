/**
 * 첫 화면 배경 — 두 가지 언어로만 짠 화면.
 *
 *   바닥   압출된 막대 도시. 잡음으로 높이를 정하되 계단으로 끊어,
 *          같은 높이의 막대들이 모여 하나의 매스를 이루게 한다.
 *          칸보다 막대를 얇게 세우면 사이가 벌어져 세로 줄무늬가 생긴다 —
 *          그 줄무늬가 이 조형의 전부다.
 *
 *   모래   그 건물 사이에서 피어올라 바람에 실려 가는 알갱이.
 *          건물과 같은 회백색이고, 스스로 빛나지 않는다.
 *
 *   공중   선으로 짠 프레임. 타원 하나를 축 둘레로 조금씩 돌려가며 겹치면
 *          겹친 자리에 저절로 꽃잎 모양의 봉투선이 생긴다.
 *          면이 없고 선뿐이라 뒤가 비치고, 겹칠수록 밝아진다.
 *
 * 모두 매 프레임 그린다. 회전 속도를 서로 나눠떨어지지 않게 잡아
 * 같은 자세로 다시 모이기까지 몇 시간이 걸린다.
 *
 * WebGL 을 쓸 수 없으면 아무것도 그리지 않는다 —
 *   그 경우 .page-bg 에 깔아 둔 대상지 사진이 그대로 보인다.
 */

import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  NormalBlending,
  Object3D,
  ShaderMaterial,
  Sphere,
  Vector2,
  Vector3,
} from 'three'

import { cursor, damp } from '../lib/cursor'

/* ── 잡음 ── 좌표에서 늘 같은 값이 나와야 새로고침해도 같은 도시가 된다 */
function hash(x, y, z) {
  const h = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453
  return h - Math.floor(h)
}

function vnoise(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z)
  const xf = x - xi, yf = y - yi, zf = z - zi
  const u = xf * xf * (3 - 2 * xf)
  const v = yf * yf * (3 - 2 * yf)
  const w = zf * zf * (3 - 2 * zf)
  const lerp = (a, b, k) => a + (b - a) * k
  const c = (dx, dy, dz) => hash(xi + dx, yi + dy, zi + dz)
  return lerp(
    lerp(lerp(c(0, 0, 0), c(1, 0, 0), u), lerp(c(0, 1, 0), c(1, 1, 0), u), v),
    lerp(lerp(c(0, 0, 1), c(1, 0, 1), u), lerp(c(0, 1, 1), c(1, 1, 1), u), v),
    w,
  )
}

function fbm(x, y, z, octaves = 4) {
  let v = 0, a = 0.5, f = 1
  for (let i = 0; i < octaves; i++) {
    v += a * vnoise(x * f, y * f, z * f)
    f *= 2.03
    a *= 0.5
  }
  return v
}

/* ══ 바닥 — 압출된 막대 도시 ══════════════════════════════════ */

/** 격자 한 칸 */
const CELL = 0.42
/** 막대 굵기. 칸보다 얇아야 사이가 벌어진다. */
const ROD = 0.27
/** 한 변의 길이. 화면 밖까지 나가야 끝이 안 보인다. */
const SPAN = 26
const N = Math.floor(SPAN / CELL)
const COUNT = N * N
/** 높이를 이만큼의 계단으로 끊는다 */
const LEVELS = 11
const TALL = 3.4
/** 계단 위에 얹는 흔들림 — 옥상이 자로 잰 듯 평평하지 않게 */
const JITTER = 0.5
/** 건물 색 — 모래도 이 색에서 나온다 */
const STONE = new Color('#D6D6D3')

function City() {
  const mesh = useRef(null)
  const spin = useRef(null)

  useLayoutEffect(() => {
    const m = mesh.current
    if (!m) return
    const o = new Object3D()
    let i = 0

    for (let gx = 0; gx < N; gx++) {
      for (let gz = 0; gz < N; gz++) {
        const x = (gx - N / 2) * CELL
        const z = (gz - N / 2) * CELL

        // 계단으로 끊어야 같은 높이끼리 모여 매스가 된다
        let n = fbm(x * 0.11 + 3.1, 0.5, z * 0.11 + 7.3, 4)
        n = Math.pow(Math.min(Math.max(n, 0), 1), 1.7)
        const step = (Math.round(n * LEVELS) / LEVELS) * TALL

        // 다만 계단만 두면 옥상이 자로 잰 듯 평평하다.
        // 막대마다 조금씩 흔들어 윗면을 성기게 만든다 — 매스는 그대로 남는다.
        const j = hash(gx * 1.7 + 0.5, 7.3, gz * 2.9 + 1.1) - 0.5
        const h = Math.max(0.08, step + j * JITTER)

        o.position.set(x, h / 2, z)
        o.scale.set(ROD, h, ROD)
        o.updateMatrix()
        m.setMatrixAt(i++, o.matrix)
      }
    }
    m.instanceMatrix.needsUpdate = true
    m.computeBoundingSphere()
  }, [])

  // 한 바퀴에 열 분 남짓
  useFrame((_, dt) => {
    if (spin.current) spin.current.rotation.y += dt * 0.010
  })

  return (
    <group ref={spin}>
      <instancedMesh ref={mesh} args={[undefined, undefined, COUNT]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#D6D6D3" roughness={0.74} metalness={0.02} />
      </instancedMesh>
    </group>
  )
}

/* ══ 모래 — 건물 사이에서 피어올라 바람에 실린다 ══════════════ */

/**
 * 사막에서 모래가 날리듯, 건물 틈에서 알갱이가 솟아 바람을 타고 흩어진다.
 *
 * 스스로 빛나는 것이 아니므로 더하기로 섞지 않는다 —
 *   더하기로 섞으면 겹친 자리가 하얗게 타서 불빛으로 보인다.
 *   보통 방식으로 얹고 흐리게 두어야 먼지로 읽힌다.
 *
 * 색은 건물에서 그대로 가져오되 알갱이마다 어둡기를 달리한다.
 * 크기는 대부분 아주 작고 드물게만 조금 크다 — 굵기가 고르면 알갱이가 아니라 점이 된다.
 *
 * 자리를 매 프레임 자바스크립트로 옮기면 알갱이 수만큼 계산이 늘어난다.
 * 그래서 씨앗만 넘기고 실제 자리는 그래픽카드가 시간에서 구한다 —
 * 프레임마다 넘기는 것은 시간 값 하나뿐이다.
 *
 * 좌표는 도시와 같은 무리 안에 있어 y = 0 이 지면이다.
 */

const GRAINS = 2850
/** 지면에서 이만큼 오르면 다시 아래에서 시작한다 */
const LIFT = 7.6
/** 도시가 깔린 넓이 — 그 안에서 고루 피어오른다 */
const FIELD_X = 24
const FIELD_Z = 20

function sandGeometry() {
  const seed = new Float32Array(GRAINS * 3) // 시작 x · 시작 높이 · 시작 z
  const mot = new Float32Array(GRAINS * 3)  // 오르는 속도 · 흔들림 위상 · 크기
  const col = new Float32Array(GRAINS * 3)
  const c = new Color()

  for (let i = 0; i < GRAINS; i++) {
    seed[i * 3] = (Math.random() - 0.5) * FIELD_X
    seed[i * 3 + 1] = Math.random() * LIFT
    seed[i * 3 + 2] = (Math.random() - 0.5) * FIELD_Z - 3

    mot[i * 3] = 0.32 + Math.random() * 0.85
    mot[i * 3 + 1] = Math.random() * Math.PI * 2
    // 제곱을 크게 줄수록 큰 알갱이가 드물어진다
    mot[i * 3 + 2] = 0.34 + Math.pow(Math.random(), 3.8) * 0.9

    // 건물과 같은 색. 알갱이마다 어둡기만 다르다.
    c.copy(STONE).multiplyScalar(0.42 + Math.random() * 0.58)
    col[i * 3] = c.r
    col[i * 3 + 1] = c.g
    col[i * 3 + 2] = c.b
  }

  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute(seed, 3))
  g.setAttribute('aMot', new Float32BufferAttribute(mot, 3))
  g.setAttribute('aCol', new Float32BufferAttribute(col, 3))
  // position 에 자리가 아니라 씨앗이 들어 있으므로 경계는 손으로 넉넉히 준다
  g.boundingSphere = new Sphere(new Vector3(0, LIFT / 2, -3), 26)
  return g
}

const SAND_VERT = `
attribute vec3 aMot;
attribute vec3 aCol;
uniform float uTime;
uniform float uLift;
uniform float uWind;
uniform vec2 uCursor;
uniform float uPush;
varying vec3 vCol;
varying float vFade;

void main(){
  float x0 = position.x, y0 = position.y, z0 = position.z;
  float rise = aMot.x, ph = aMot.y, size = aMot.z;

  // 지면에서 올라가다 끝에 닿으면 다시 아래에서 시작한다
  float y = mod(y0 + uTime * rise, uLift);
  float k = y / uLift;

  // 높이 올라갈수록 바람에 더 실린다 — 지면 가까이는 거의 그대로 있다
  float w = k * k * uWind;
  float x = x0 + w + sin(uTime * 0.5 + ph) * 0.4 * k;
  float z = z0 + w * 0.45 + cos(uTime * 0.43 + ph * 1.7) * 0.32 * k;

  // 커서 둘레의 알갱이가 비켜선다. 가까울수록 세게 밀리고 금세 사그라든다.
  vec2 d = vec2(x, y) - uCursor;
  float dd = dot(d, d);
  float g = uPush * exp(-dd * 0.14);
  vec2 dir = dd > 0.0001 ? d * inversesqrt(dd) : vec2(0.0, 1.0);
  // 곧게만 밀면 기계처럼 보인다 — 옆으로 살짝 돌려 흩어지게 한다
  x += dir.x * g - dir.y * g * 0.45;
  y += dir.y * g + dir.x * g * 0.45;

  // 돋보기 — 밀려난 자리 바깥에서 알갱이가 커지고 또렷해진다.
  // 물방울이 작아진 만큼 미치는 범위도 좁힌다. 넓으면 확대된 알갱이가
  // 너무 많아져서 전체가 늘어난 것처럼 보인다.
  float lens = exp(-dd * 0.10);

  vec4 mv = modelViewMatrix * vec4(x, y, z, 1.0);
  gl_Position = projectionMatrix * mv;
  // 작게. 멀수록 더 작아진다.
  gl_PointSize = size * (1.0 + lens * 1.5) * (92.0 / max(-mv.z, 0.001));

  // 건물 틈에서 피어나 위로 갈수록 흩어져 사라진다
  vFade = smoothstep(0.0, 0.05, k) * (1.0 - smoothstep(0.4, 1.0, k));
  vFade *= 1.0 + lens * 0.9;
  vCol = aCol;
}
`

const SAND_FRAG = `
precision mediump float;
uniform float uOpacity;
varying vec3 vCol;
varying float vFade;

void main(){
  // 네모난 점이 아니라 둥근 알갱이로
  float d = length(gl_PointCoord - vec2(0.5));
  if (d > 0.5) discard;
  gl_FragColor = vec4(vCol, smoothstep(0.5, 0.15, d) * vFade * uOpacity);
}
`

/** 모래가 놓인 깊이 — 커서를 여기에 비춰 실제 좌표를 얻는다 */
const SAND_AT = new Vector3(0, 0, -2.2)

function Sand() {
  const geo = useMemo(sandGeometry, [])
  const mat = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: SAND_VERT,
        fragmentShader: SAND_FRAG,
        uniforms: {
          uTime: { value: 0 },
          uLift: { value: LIFT },
          uWind: { value: 5.2 },
          uOpacity: { value: 0.46 },
          uCursor: { value: new Vector2(0, 1e4) },
          uPush: { value: 1.2 },
        },
        transparent: true,
        depthWrite: false,
        blending: NormalBlending,
        fog: false,
      }),
    [],
  )

  const c = useRef({ x: 0, y: 0 })

  useFrame((state, dt) => {
    mat.uniforms.uTime.value += dt

    // 화면 위의 커서를 모래가 놓인 깊이의 실제 좌표로 옮긴다
    const v = state.viewport.getCurrentViewport(state.camera, SAND_AT)
    c.current.x = damp(c.current.x, cursor.x * v.width * 0.5, 3.2, dt)
    c.current.y = damp(c.current.y, cursor.y * v.height * 0.5, 3.2, dt)

    // 모래는 지면이 y = 0 인 무리 안에 있으므로 그만큼 올려 맞춘다
    mat.uniforms.uCursor.value.set(c.current.x, c.current.y + 4.3)
  })

  useEffect(() => () => {
    geo.dispose()
    mat.dispose()
  }, [geo, mat])

  return <points geometry={geo} material={mat} frustumCulled={false} />
}

/* ══ 양옆 — 흐르는 선면 ════════════════════════════════════════ */

/**
 * 가로가 긴 화면에서 좌우 위쪽이 비어 보이던 자리를 채운다.
 *
 * 가로줄만 긋고 세로줄은 긋지 않는다 — 격자로 짜면 무늬가 되고,
 * 가로줄만 두면 흐름이 된다. 채우려는 것은 무늬가 아니라 결이다.
 *
 * 굴곡은 두 겹이다.
 *   한 겹은 잡음으로 미리 구워 넣는다 — 판마다 다른 얼굴을 갖는다.
 *   한 겹은 그래픽카드가 매 프레임 얹는다 — 물결이 실제로 흘러간다.
 *
 * 네 변은 사그라들게 두어 잘라 낸 자리가 보이지 않는다.
 * 선뿐이라 뒤가 그대로 비치고, 겹칠수록 밝아진다 — 프레임과 같은 문법이다.
 */

const SHEET_ROWS = 26
const SHEET_COLS = 96

function sheetGeometry({ w, h, seed }) {
  const pos = []
  const fade = []

  for (let r = 0; r < SHEET_ROWS; r++) {
    const v = r / (SHEET_ROWS - 1)
    const y = (v - 0.5) * h
    let px = 0, py = 0, pz = 0, pf = 0

    for (let c = 0; c < SHEET_COLS; c++) {
      const u = c / (SHEET_COLS - 1)
      const x = (u - 0.5) * w
      // 앞뒤로 물결친다 — 깊이가 있어야 판이 아니라 면으로 보인다
      const z = (fbm(x * 0.24 + seed, y * 0.34 + seed, seed * 1.9, 4) - 0.5) * 3.2
      // 네 변에서 사그라든다
      const f =
        Math.pow(Math.sin(Math.PI * u), 1.15) * Math.pow(Math.sin(Math.PI * v), 0.6)

      if (c > 0) {
        pos.push(px, py, pz, x, y, z)
        fade.push(pf, f)
      }
      px = x; py = y; pz = z; pf = f
    }
  }

  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute(pos, 3))
  g.setAttribute('aFade', new Float32BufferAttribute(fade, 1))
  return g
}

const SHEET_VERT = `
attribute float aFade;
uniform float uTime;
varying float vFade;

void main(){
  vec3 p = position;
  // 미리 구워 둔 굴곡 위에 흐르는 물결을 한 겹 더 얹는다
  p.z += sin(p.x * 0.62 + p.y * 0.34 + uTime * 0.45) * 0.42;
  p.y += cos(p.x * 0.38 - uTime * 0.3) * 0.14;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  vFade = aFade;
}
`

const SHEET_FRAG = `
precision mediump float;
uniform vec3 uColor;
uniform float uOpacity;
varying float vFade;

void main(){
  gl_FragColor = vec4(uColor, vFade * uOpacity);
}
`

const SHEET_COLOR = new Color('#BFD4DC')

function WaveSheet({ w, h, seed, position, rotation, opacity }) {
  const geo = useMemo(() => sheetGeometry({ w, h, seed }), [w, h, seed])
  const mat = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: SHEET_VERT,
        fragmentShader: SHEET_FRAG,
        uniforms: {
          uTime: { value: seed * 7 },
          uColor: { value: SHEET_COLOR },
          uOpacity: { value: opacity },
        },
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        fog: false,
      }),
    [seed, opacity],
  )

  useFrame((_, dt) => {
    mat.uniforms.uTime.value += dt
  })

  useEffect(() => () => {
    geo.dispose()
    mat.dispose()
  }, [geo, mat])

  return (
    <lineSegments
      geometry={geo}
      material={mat}
      position={position}
      rotation={rotation}
      frustumCulled={false}
    />
  )
}

/* ══ 공중 — 선으로 짠 프레임 ═══════════════════════════════════ */

/** 안쪽 — 청록 */
const IN = new Color('#8FC9C4')
/** 바깥 — 남보라 */
const OUT = new Color('#A9B6E4')

/**
 * 타원 하나를 축 둘레로 조금씩 돌려가며 겹친다.
 * 겹친 자리에 꽃잎 모양의 봉투선이 저절로 생긴다.
 */
function rosette({ loops, seg, rx, ry, tilt, twist }) {
  const pos = []
  const col = []
  const c = new Color()

  const ct = Math.cos(tilt), st = Math.sin(tilt)

  for (let k = 0; k < loops; k++) {
    const f = k / (loops - 1)
    const ang = f * twist
    const ca = Math.cos(ang), sa = Math.sin(ang)

    c.copy(IN).lerp(OUT, f)

    let px = 0, py = 0, pz = 0
    for (let i = 0; i <= seg; i++) {
      const t = (i / seg) * Math.PI * 2
      const ex = rx * Math.cos(t)
      const ey = ry * Math.sin(t)

      // X 축으로 눕히고
      const y1 = ey * ct
      const z1 = ey * st
      // Y 축으로 돌린다
      const x2 = ex * ca + z1 * sa
      const z2 = -ex * sa + z1 * ca

      if (i > 0) {
        pos.push(px, py, pz, x2, y1, z2)
        col.push(c.r, c.g, c.b, c.r, c.g, c.b)
      }
      px = x2; py = y1; pz = z2
    }
  }

  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute(pos, 3))
  g.setAttribute('color', new Float32BufferAttribute(col, 3))
  return g
}

function Frame({ geometry, position, rotation, scale, spin, opacity }) {
  const ref = useRef(null)
  useFrame((_, dt) => {
    const l = ref.current
    if (!l) return
    l.rotation.x += dt * spin[0]
    l.rotation.y += dt * spin[1]
    l.rotation.z += dt * spin[2]
  })
  return (
    <lineSegments
      ref={ref}
      geometry={geometry}
      position={position}
      rotation={rotation}
      scale={scale}
    >
      {/* 선뿐이라 빛을 받지 않는다. 겹칠수록 밝아지게 더하기로 섞는다. */}
      <lineBasicMaterial
        vertexColors
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </lineSegments>
  )
}

/**
 * 화면 전체가 느리게 흔들리고, 그 위에 커서가 얹힌다.
 *
 * 스스로 흔들리는 것을 없애고 커서만 따르게 하면 마우스를 멈춘 순간 화면이
 * 죽는다. 두 움직임을 더해야 커서를 놓아도 계속 살아 있다.
 */
function Drift({ children }) {
  const ref = useRef(null)
  const t = useRef(0)
  const m = useRef({ x: 0, y: 0 })

  useFrame((_, dt) => {
    const g = ref.current
    if (!g) return
    t.current += dt
    const s = t.current

    m.current.x = damp(m.current.x, cursor.x, 2.4, dt)
    m.current.y = damp(m.current.y, cursor.y, 2.4, dt)

    g.rotation.y = Math.sin(s * 0.058) * 0.09 + m.current.x * 0.38
    g.rotation.x = Math.cos(s * 0.042) * 0.05 - m.current.y * 0.28
    g.position.x = m.current.x * 1.5
    g.position.y = Math.sin(s * 0.032) * 0.16 + m.current.y * 0.95
  })

  return <group ref={ref}>{children}</group>
}

/**
 * 바닥은 커서를 거슬러 조금만 움직인다.
 * 앞의 것과 뒤의 것이 서로 반대로 밀려야 깊이가 생긴다 — 시차다.
 */
function Ground({ children }) {
  const ref = useRef(null)
  const m = useRef({ x: 0, y: 0 })

  useFrame((_, dt) => {
    const g = ref.current
    if (!g) return
    m.current.x = damp(m.current.x, cursor.x, 1.7, dt)
    m.current.y = damp(m.current.y, cursor.y, 1.7, dt)

    g.position.x = -m.current.x * 0.9
    g.position.y = -4.3 - m.current.y * 0.5
    g.rotation.z = -m.current.x * 0.032
    g.rotation.x = m.current.y * 0.05
  })

  return <group ref={ref} position={[0, -4.3, -2.2]}>{children}</group>
}

/**
 * @param sand 모래를 날릴지. 자료를 읽는 화면에서는 끈다 —
 *             글자 뒤에서 알갱이가 계속 움직이면 눈이 그쪽으로 끌린다.
 */
function Scene({ sand }) {
  // 프레임은 서로 다른 짜임을 갖는다 — 같은 언어이되 같은 물건은 아니다
  const wide = useMemo(
    () => rosette({ loops: 56, seg: 110, rx: 1, ry: 0.34, tilt: 0.62, twist: Math.PI }),
    [],
  )
  const tall = useMemo(
    () => rosette({ loops: 40, seg: 96, rx: 0.62, ry: 1, tilt: 0.9, twist: Math.PI * 0.75 }),
    [],
  )
  const tight = useMemo(
    () => rosette({ loops: 30, seg: 80, rx: 1, ry: 0.72, tilt: 1.25, twist: Math.PI * 1.5 }),
    [],
  )
  const small = useMemo(
    () => rosette({ loops: 24, seg: 72, rx: 1, ry: 0.5, tilt: 0.42, twist: Math.PI }),
    [],
  )

  return (
    <>
      {/* 멀어질수록 어둠에 잠긴다 — 도시의 끝과 화면의 끝이 만나지 않게 */}
      <fog attach="fog" args={['#000000', 6, 19]} />

      <ambientLight intensity={0.45} />
      {/* 주광 — 위에서 비스듬히. 막대 사이에 그늘이 져야 줄무늬가 산다. */}
      <directionalLight position={[6, 9, 4]} intensity={2.6} color="#FFF4E6" />
      {/* 역광 — 윤곽만 떠오르게 */}
      <directionalLight position={[-7, 2, -6]} intensity={1.2} color="#A6C4FF" />

      {/* 바닥 — 화면 아래쪽에 깔리고, 커서를 거슬러 조금 밀린다 */}
      <Ground>
        <City />
        {/* 모래는 도시와 같은 무리 안에 둔다 — y = 0 이 지면이 된다 */}
        {sand && <Sand />}
      </Ground>

      <Drift>
        {/* 왼쪽 — 안쪽을 향해 세워 화면 밖까지 물러난다 */}
        <WaveSheet
          w={11}
          h={10}
          seed={2.4}
          position={[-6.6, 0.5, -3.2]}
          rotation={[0.06, 0.62, 0.14]}
          opacity={0.3}
        />
        {/* 오른쪽 — 같은 언어이되 굴곡도 각도도 다르다 */}
        <WaveSheet
          w={11}
          h={10}
          seed={8.1}
          position={[6.8, 0.9, -3.6]}
          rotation={[-0.05, -0.66, -0.11]}
          opacity={0.27}
        />

        {/* 가운데 뒤 — 표제 뒤라 가장 옅게 */}
        <Frame
          geometry={wide}
          position={[0.4, 0.9, -5]}
          rotation={[0.2, 0, 0.1]}
          scale={3.1}
          spin={[0.0022, 0.0134, 0]}
          opacity={0.22}
        />
        {/* 왼쪽 */}
        <Frame
          geometry={tall}
          position={[-3.4, 0.7, -1.4]}
          rotation={[0.1, 0.4, -0.22]}
          scale={1.5}
          spin={[0.0086, 0.0178, 0.0026]}
          opacity={0.42}
        />
        {/* 오른쪽 위 */}
        <Frame
          geometry={tight}
          position={[3.5, 1.9, -2.4]}
          rotation={[-0.25, 0, 0.3]}
          scale={1.25}
          spin={[0.0058, 0.0226, 0.0014]}
          opacity={0.38}
        />
        {/* 오른쪽 아래 — 처음에 마음에 들어 하신 자리 */}
        <Frame
          geometry={small}
          position={[2.7, -1.7, 1.1]}
          rotation={[0.35, 0.2, -0.15]}
          scale={0.95}
          spin={[0.0122, 0.0074, 0.0038]}
          opacity={0.5}
        />

        {/*
          양옆 가장자리의 작은 프레임 넷.
          도형은 앞의 것을 그대로 다시 쓴다 — 크기와 각도만 달리하면
          같은 물건으로 보이지 않으면서 메모리는 늘지 않는다.
          안쪽 프레임보다 작고 옅어야 가장자리로 물러나 보인다.
        */}
        <Frame
          geometry={small}
          position={[-6.4, 2.6, -1.9]}
          rotation={[0.5, 0.3, 0.25]}
          scale={0.5}
          spin={[0.0094, 0.0206, 0.0031]}
          opacity={0.4}
        />
        <Frame
          geometry={tight}
          position={[-5.7, -2.3, 0.5]}
          rotation={[-0.3, 0.55, -0.2]}
          scale={0.62}
          spin={[0.0137, 0.0089, 0.0017]}
          opacity={0.34}
        />
        <Frame
          geometry={tall}
          position={[6.5, 2.9, -2.7]}
          rotation={[0.22, -0.4, -0.3]}
          scale={0.46}
          spin={[0.0071, 0.0243, 0.0046]}
          opacity={0.42}
        />
        <Frame
          geometry={small}
          position={[6.0, -2.7, -0.6]}
          rotation={[-0.45, -0.25, 0.18]}
          scale={0.56}
          spin={[0.0113, 0.0158, 0.0023]}
          opacity={0.36}
        />
      </Drift>
    </>
  )
}

/** WebGL 을 쓸 수 있는지 먼저 본다 — 못 쓰면 조용히 물러난다 */
function canRender() {
  try {
    const c = document.createElement('canvas')
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

export default function Ambient({ sand = true }) {
  const [ok] = useState(canRender)
  const still = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )
  // 탭이 가려지면 그릴 이유가 없다
  const [awake, setAwake] = useState(true)

  useEffect(() => {
    const onVis = () => setAwake(!document.hidden)
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  if (!ok) return null

  return (
    <Canvas
      className="amb"
      // 움직임을 줄이도록 설정했으면 한 장만 그리고 멈춘다
      frameloop={still || !awake ? 'demand' : 'always'}
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 8], fov: 42 }}
      gl={{ antialias: true, powerPreference: 'low-power' }}
    >
      <color attach="background" args={['#000000']} />
      <Scene sand={sand} />
    </Canvas>
  )
}
