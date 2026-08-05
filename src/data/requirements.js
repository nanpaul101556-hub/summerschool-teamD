/**
 * 용도별 요구 성능.
 * ⚠️ load/height/power/span 은 현재 통상값 추정치다 (src: 'estimate').
 *    KDS 41 12 00 확보 시 교체할 것.
 */

export const USES = [
  {
    key: 'welfare', label: '노인복지 · 돌봄', color: '#C3762F',
    load: 300, span: 6.0, height: 3.6, power: 100, src: 'estimate',
    needs: ['채광', '무장애', '보행접근'],
  },
  {
    key: 'community', label: '커뮤니티 · 평생학습', color: '#3B7FA8',
    load: 400, span: 9.0, height: 4.0, power: 120, src: 'estimate',
    needs: ['대공간', '가변칸막이', '음향'],
  },
  {
    key: 'clinic', label: '의료 · 재활', color: '#5B8F6E',
    load: 500, span: 7.2, height: 4.0, power: 180, src: 'estimate',
    needs: ['위생', '동선분리', '비상전원'],
  },
  {
    key: 'library', label: '도서관 · 서고', color: '#8A6FA8',
    load: 750, span: 9.0, height: 4.0, power: 110, src: 'estimate',
    needs: ['고하중', '항온항습'],
  },
  {
    key: 'datacenter', label: '엣지 데이터센터', color: '#7B7B88',
    load: 800, span: 9.0, height: 4.2, power: 400, src: 'estimate',
    needs: ['고하중', '상시냉방', '대용량전력', '보안'],
  },
]

/** 시기별 시나리오 — certainty 로 확실/조건부를 구분한다 */
export const PHASES = [
  { year: 2026, use: 'welfare', certainty: 'certain', basis: '65세+ 22.3% 초고령 진입 · 독거노인 +73%' },
  { year: 2035, use: 'community', certainty: 'certain', basis: '세대교체 · 65세+ 30.5%' },
  { year: 2045, use: 'datacenter', certainty: 'scenario', basis: '인구 −17.7% · 시설 재편 압력' },
]

/** 인증 목표 */
export const CERT_TARGETS = [
  { key: 'gseed', label: 'G-SEED', target: '그린2 (우수)', status: 'pending', note: '배점표 미확보' },
  { key: 'zeb', label: 'ZEB', target: '5등급 (자립률 20%)', status: 'ready', note: '의무 아님 · 자발적' },
  { key: 'bf', label: 'BF 무장애', target: '우수', status: 'pending', note: '장애인 5.4% 서울 2위' },
  { key: 'taxonomy', label: 'K-택소노미', target: '적합', status: 'pending', note: '2026.1 기준 상향' },
]
