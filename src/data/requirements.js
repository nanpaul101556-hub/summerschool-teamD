/**
 * 용도별 요구 성능.
 * ⚠️ load/height/power/span 은 현재 통상값 추정치다 (src: 'estimate').
 *    KDS 41 12 00 확보 시 교체할 것.
 *
 * 화면에 나가는 문구는 { ko, it } 두 벌을 들고, tx() 로 꺼낸다.
 */

export const USES = [
  {
    key: 'welfare',
    label: { ko: '노인복지 · 돌봄', it: 'Assistenza agli anziani' },
    color: '#C3762F',
    load: 300, span: 6.0, height: 3.6, power: 100, src: 'estimate',
    needs: ['채광', '무장애', '보행접근'],
  },
  {
    key: 'community',
    label: { ko: '커뮤니티 · 평생학습', it: 'Spazi collettivi e formazione' },
    color: '#3B7FA8',
    load: 400, span: 9.0, height: 4.0, power: 120, src: 'estimate',
    needs: ['대공간', '가변칸막이', '음향'],
  },
  {
    key: 'clinic',
    label: { ko: '의료 · 재활', it: 'Presidio sanitario e riabilitazione' },
    color: '#5B8F6E',
    load: 500, span: 7.2, height: 4.0, power: 180, src: 'estimate',
    needs: ['위생', '동선분리', '비상전원'],
  },
  {
    key: 'library',
    label: { ko: '도서관 · 서고', it: 'Biblioteca e depositi' },
    color: '#8A6FA8',
    load: 750, span: 9.0, height: 4.0, power: 110, src: 'estimate',
    needs: ['고하중', '항온항습'],
  },
  {
    key: 'datacenter',
    label: { ko: '엣지 데이터센터', it: 'Data center di prossimità' },
    color: '#7B7B88',
    load: 800, span: 9.0, height: 4.2, power: 400, src: 'estimate',
    needs: ['고하중', '상시냉방', '대용량전력', '보안'],
  },
]

/** 시기별 시나리오 — certainty 로 확실/조건부를 구분한다 */
export const PHASES = [
  {
    year: 2026, use: 'welfare', certainty: 'certain',
    basis: {
      ko: '65세+ 22.3% 초고령 진입 · 독거노인 +73%',
      it: 'Over 65 al 22,3%, soglia di società ultra-anziana · anziani soli +73%',
    },
  },
  {
    year: 2035, use: 'community', certainty: 'certain',
    basis: {
      ko: '세대교체 · 65세+ 30.5%',
      it: 'Ricambio generazionale · over 65 al 30,5%',
    },
  },
  {
    year: 2045, use: 'datacenter', certainty: 'scenario',
    basis: {
      ko: '인구 −17.7% · 시설 재편 압력',
      it: 'Popolazione −17,7% · pressione alla riorganizzazione dei servizi',
    },
  },
]

/** 인증 목표 */
export const CERT_TARGETS = [
  {
    key: 'gseed', label: 'G-SEED', target: '그린2 (우수)', status: 'pending',
    note: { ko: '배점표 미확보', it: 'Griglia di punteggio non disponibile' },
  },
  {
    key: 'zeb', label: 'ZEB', target: '5등급 (자립률 20%)', status: 'ready',
    note: { ko: '의무 아님 · 자발적', it: 'Non obbligatorio · adesione volontaria' },
  },
  {
    key: 'bf', label: 'BF', target: '우수', status: 'pending',
    note: { ko: '장애인 5.4% 서울 2위', it: 'Disabilità al 5,4%, secondo distretto di Seoul' },
  },
  {
    key: 'taxonomy', label: 'K-Taxonomy', target: '적합', status: 'pending',
    note: { ko: '2026.1 기준 상향', it: 'Criteri inaspriti da gennaio 2026' },
  },
]
