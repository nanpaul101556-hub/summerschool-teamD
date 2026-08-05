/** 인구 — 실측(2012–2024)과 추계(2026–2050)를 est 플래그로 구분한다. */

export const POPULATION = [
  { year: 2012, pop: 597189, elder: 10.2, youth: null, est: false },
  { year: 2014, pop: 582552, elder: 11.4, youth: null, est: false },
  { year: 2016, pop: 567581, elder: 12.5, youth: null, est: false },
  { year: 2018, pop: 543752, elder: 14.2, youth: null, est: false },
  { year: 2020, pop: 523037, elder: 16.3, youth: null, est: false },
  { year: 2022, pop: 503734, elder: 18.3, youth: null, est: false },
  { year: 2024, pop: 491247, elder: 20.4, youth: 8.8, est: false },
  { year: 2026, pop: 483000, elder: 22.3, youth: 8.6, est: true },
  { year: 2030, pop: 468000, elder: 26.0, youth: 8.2, est: true },
  { year: 2035, pop: 450000, elder: 30.5, youth: 7.9, est: true },
  { year: 2042, pop: 425000, elder: 36.2, youth: 7.5, est: true },
  { year: 2050, pop: 405000, elder: 38.0, youth: 7.3, est: true },
]

export const POP_SRC = { history: 'nowonPop', forecast: 'seoulProj' }

/** 취약계층 — 2023 기준 */
export const VULNERABLE = [
  {
    key: 'soloElder',
    label: { ko: '독거노인', it: 'Anziani soli' },
    value: 36839, unit: { ko: '명', it: '' },
    note: { ko: '2019→2023 +73%', it: '+73% fra il 2019 e il 2023' },
    src: 'nowonStat',
  },
  {
    key: 'disabled',
    label: { ko: '장애인', it: 'Persone con disabilità' },
    value: 26425, unit: { ko: '명', it: '' },
    note: { ko: '구민의 5.4% · 서울 2위', it: '5,4% dei residenti · secondo distretto di Seoul' },
    src: 'nowonStat',
  },
  {
    key: 'basic',
    label: { ko: '기초생활수급', it: 'Beneficiari del reddito minimo' },
    value: 32168, unit: { ko: '명', it: '' },
    note: { ko: '6.5% · 서울평균 4.4%', it: '6,5% · media di Seoul 4,4%' },
    src: 'nowonStat',
  },
]

/** 인구 감소 순위 — 25개 자치구 중 */
export const DECLINE_RANK = { rank: 1, total: 25, src: 'seoulProj' }
