/** 공급 — 주변 시설과 접근성. 좌표는 미확보라 거리만 우선 사용한다. */

export const NEARBY = [
  { name: '서울시립 북서울미술관', type: 'culture', opened: 2013, dist: 150, users: '전연령' },
  { name: '노원 천문우주과학관', type: 'culture', opened: 2017, dist: 250, users: '미취학~초등' },
  { name: '노원구민의전당', type: 'culture', opened: 1989, dist: 200, users: '전연령' },
  { name: '노원평생학습관', type: 'education', opened: 1989, dist: 350, users: '청년~중장년' },
  { name: '중계어르신센터', type: 'welfare', opened: 2026, dist: 180, users: '65세 이상' },
  { name: '중계종합사회복지관', type: 'welfare', opened: null, dist: 2000, users: '전연령' },
]

/** 접근성 기준 */
export const ACCESS = {
  elderWalkSpeed: 2.5, // km/h — 고령자·보행보조
  targetRadius: 300, // m — 노인친화형 공원 적정 유치거리
  targetSrc: 'walkDist',
  neighborhoodStandard: 500, // m — 근린생활권 근린공원 기준
  transit: { subway: ['7호선 하계역', '7호선 중계역'], busStops: 22 },
  parking: { park: 121, adjacent: 120, commercial: 2262 },
}

/** 현장 실측 — 추정이 아니라 관찰치 */
export const OBSERVED = {
  total: 600,
  rank: '조사 6개 공원 중 1위 (2위의 1.85배)',
  src: 'parkUse',
  byTime: [
    { slot: { ko: '평일 오전 9시', en: 'Weekday, 9 am', it: 'Feriale, ore 9' }, male: 56, female: 62 },
    { slot: { ko: '평일 오후 4시', en: 'Weekday, 4 pm', it: 'Feriale, ore 16' }, male: 131, female: 75 },
    { slot: { ko: '주말 오전 9시', en: 'Weekend, 9 am', it: 'Festivo, ore 9' }, male: 26, female: 56 },
    { slot: { ko: '주말 오후 4시', en: 'Weekend, 4 pm', it: 'Festivo, ore 16' }, male: 113, female: 81 },
  ],
  topActs: [
    { act: { ko: '걷기', en: 'Walking', it: 'Camminare' }, n: 319 },
    { act: { ko: '앉아서 이야기하기', en: 'Sitting and talking', it: 'Sedersi e conversare' }, n: 87 },
    { act: { ko: '장기·바둑', en: 'Board games', it: 'Giochi da tavolo' }, n: 51 },
    { act: { ko: '휠체어 이용', en: 'Wheelchair use', it: 'Uso della carrozzina' }, n: 9 },
  ],
}
