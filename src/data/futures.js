/**
 * 시간에 따른 용도 변화.
 *
 * 5년·10년은 공표된 인구추계에 근거하므로 단언한다.
 * 50년은 예측하지 않는다 — 예측할 수 없다는 것이 전제이고,
 * 그래서 구조체를 바꿀 수 있게 만드는 것이 답이 된다.
 */

const K = (ko, it, en) => ({ ko, it, en })

export const BASE_YEAR = 2026

export const FUTURES = [
  {
    key: 'y05',
    after: K('5년 후', 'Fra 5 anni'),
    year: 2031,
    img: '/building/y05.jpg',
    use: K('노인복지 · 돌봄', 'Assistenza agli anziani'),
    certainty: 'certain',
    basis: K(
      '65세 이상 22.3% 초고령 진입 · 독거노인 +73%',
      'Over 65 al 22,3%, soglia di società ultra-anziana · anziani soli +73%',
    ),
    infill: K(
      '오크 목재 + 유리 인필 · 무장애 램프 · 1층 필로티를 그늘 데크로',
      'Tamponamenti in rovere e vetro · rampa senza barriere · piano terra su pilotis come spazio ombreggiato',
    ),
    src: 'seoulProj',
  },
  {
    key: 'y10',
    after: K('10년 후', 'Fra 10 anni'),
    year: 2036,
    img: '/building/y10.jpg',
    use: K('커뮤니티 · 평생학습', 'Spazi collettivi e formazione'),
    certainty: 'certain',
    basis: K(
      '세대교체 · 65세 이상 30.5% · 돌봄 수요가 학습·교류 수요로 이동',
      'Ricambio generazionale · over 65 al 30,5% · la domanda di assistenza si sposta verso formazione e socialità',
    ),
    infill: K(
      '2층을 통층 홀로 재편 · 폴딩 글라스 · 외부 계단 신설 · 금속 스크린',
      'Primo piano riunito in una sala a doppia altezza · vetrate pieghevoli · nuova scala esterna · schermature metalliche',
    ),
    src: 'seoulProj',
  },
  {
    key: 'y50',
    after: K('50년 후', 'Fra 50 anni'),
    year: 2076,
    img: '/building/y50.jpg',
    use: K('용도 미정', 'Destinazione non definita'),
    certainty: 'unknown',
    basis: K(
      '50년 뒤 무엇이 필요할지는 알 수 없다 — 그것이 이 설계의 전제다',
      'Non è dato sapere cosa servirà fra cinquant\'anni: è proprio questa la premessa del progetto',
    ),
    infill: K(
      '외피 전면 교체 · 깊은 후퇴 유리 · PV 루버 · 1층은 공공 통로로',
      'Involucro interamente sostituito · vetrate profondamente arretrate · frangisole fotovoltaici · piano terra come passaggio pubblico',
    ),
    src: null,
  },
]

/** 세 시점 내내 손대지 않는 것 — Support(장수명 구조체) */
export const KEPT = [
  { k: 'kept.span', unit: 'm', from: 'span' },
  { k: 'kept.height', unit: 'm', from: 'height' },
  { k: 'kept.load', unit: 'kg/m²', from: 'load' },
  { k: 'kept.power', unit: '%', from: 'power' },
]
