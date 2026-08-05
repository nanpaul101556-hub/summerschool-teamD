/**
 * 시간에 따른 용도 변화.
 *
 * 5년·10년은 공표된 인구추계에 근거하므로 단언한다.
 * 50년은 예측하지 않는다 — 예측할 수 없다는 것이 전제이고,
 * 그래서 구조체를 바꿀 수 있게 만드는 것이 답이 된다.
 */

export const BASE_YEAR = 2026

export const FUTURES = [
  {
    key: 'y05',
    after: '5년 후',
    year: 2031,
    img: '/building/y05.jpg',
    use: '노인복지 · 돌봄',
    certainty: 'certain',
    basis: '65세 이상 22.3% 초고령 진입 · 독거노인 +73%',
    infill: '오크 목재 + 유리 인필 · 무장애 램프 · 1층 필로티를 그늘 데크로',
    src: 'seoulProj',
  },
  {
    key: 'y10',
    after: '10년 후',
    year: 2036,
    img: '/building/y10.jpg',
    use: '커뮤니티 · 평생학습',
    certainty: 'certain',
    basis: '세대교체 · 65세 이상 30.5% · 돌봄 수요가 학습·교류 수요로 이동',
    infill: '2층을 통층 홀로 재편 · 폴딩 글라스 · 외부 계단 신설 · 금속 스크린',
    src: 'seoulProj',
  },
  {
    key: 'y50',
    after: '50년 후',
    year: 2076,
    img: '/building/y50.jpg',
    use: '용도 미정',
    certainty: 'unknown',
    basis: '50년 뒤 무엇이 필요할지는 알 수 없다 — 그것이 이 설계의 전제다',
    infill: '외피 전면 교체 · 깊은 후퇴 유리 · PV 루버 · 1층은 공공 통로로',
    src: null,
  },
]

/** 세 시점 내내 손대지 않는 것 — Support(장수명 구조체) */
export const KEPT = [
  { k: '기둥 격자', unit: 'm', from: 'span' },
  { k: '층고', unit: 'm', from: 'height' },
  { k: '바닥하중', unit: 'kg/m²', from: 'load' },
  { k: '전력 인입', unit: '%', from: 'power' },
]
