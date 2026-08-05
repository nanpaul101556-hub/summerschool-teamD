/**
 * 지역을 읽는 데 필요한 자료 목록.
 * 03-data/DATA-REQUIREMENTS.md 의 그룹 2·3·4 를 그대로 옮긴다.
 *
 * status  have    확보 — 화면에 이미 쓰이고 있다
 *         partial 부분 — 있으나 해상도·범위가 모자라다
 *         none    없음 — 자리만 잡아 둔다
 *
 * impact 는 「없으면 무엇을 못 하는가」다. 이걸 적어야 목록이 우선순위가 된다.
 */

export const AXES = [
  {
    key: 'user',
    no: '2',
    label: '사용자 요구',
    q: '누가 무엇을 필요로 하는가',
    items: [
      { code: '2.1', name: '구 단위 연령 인구', src: '노원구 통계연보', status: 'have' },
      { code: '2.4', name: '장애인 · 독거노인', src: '노원구 통계연보', status: 'have' },
      { code: '2.8', name: '현장 이용 실측', src: '학술논문(2024) 600명', status: 'have' },
      {
        code: '2.2', name: '행정동별 연령 인구', src: '행정안전부', api: true,
        status: 'partial', impact: '동별 격차를 볼 수 없다',
      },
      {
        code: '2.5', name: '복지시설 위치 · 좌표', src: '공공데이터포털', api: true,
        status: 'none', rank: 2, impact: '격차 계산이 성립하지 않는다',
      },
      {
        code: '2.6', name: '등시권 폴리곤', src: 'OpenRouteService', api: true,
        status: 'none', rank: 3, impact: '도보 공백 지도를 그릴 수 없다',
      },
      {
        code: '2.3', name: '집계구 인구', src: '통계청 SGIS', api: true,
        status: 'none', rank: 9, impact: '등시권 안 인구를 셀 수 없다',
      },
    ],
  },
  {
    key: 'market',
    no: '2.7',
    label: '상권 · 문화',
    q: '주변에서 어떤 활동이 돈이 되는가',
    items: [
      {
        code: '2.7a', name: '점포 수 · 업종 구성', src: '서울시 우리마을가게', api: true,
        status: 'none', impact: '어떤 용도가 이미 공급되는지 모른다',
      },
      {
        code: '2.7b', name: '업종별 매출 추이', src: '서울시 우리마을가게', api: true,
        status: 'none', impact: '쇠퇴 업종과 성장 업종을 가를 수 없다',
      },
      {
        code: '2.7c', name: '문화시설 분포', src: '서울열린데이터광장', api: true,
        status: 'none', impact: '문화 기능의 공백 위치를 특정할 수 없다',
      },
      {
        code: '2.7d', name: '개폐업률', src: '서울시 우리마을가게', api: true,
        status: 'none', impact: '상권 수명 주기를 읽을 수 없다',
      },
    ],
  },
  {
    key: 'ops',
    no: '3',
    label: '운영 조건',
    q: '이 시설은 언제 적자가 되는가',
    lead: '적자는 인구 변화보다 먼저 나타난다 — 전환 시점의 가장 빠른 신호다',
    items: [
      {
        code: '3.1', name: '시설별 운영비 · 결산', src: '노원구 예산서 · 결산서',
        status: 'none', rank: 4, impact: '전환 시점을 판단할 수 없다',
      },
      {
        code: '3.2', name: '시설별 이용률 · 가동률', src: '노원구 시설 운영현황',
        status: 'none', rank: 6, impact: '수요 소멸을 감지할 수 없다',
      },
      {
        code: '3.3', name: '건물 에너지사용량 실적', src: '국토부 건물에너지통계', api: true,
        status: 'partial', impact: '원단위만 있어 성능 저하를 추적할 수 없다',
      },
      {
        code: '3.5', name: '유지관리 이력 · 노후도', src: '시설물통합정보관리', api: true,
        status: 'none', impact: '교체 주기를 산정할 수 없다',
      },
    ],
  },
  {
    key: 'env',
    no: '4',
    label: '환경 · 외부',
    q: '건물 밖의 조건이 어떻게 변하는가',
    items: [
      {
        code: '4.1', name: '기후변화 시나리오(SSP)', src: '기상청 기후정보포털',
        status: 'none', rank: 8, impact: '미래 냉난방 부하를 예측할 수 없다',
      },
      {
        code: '4.4', name: '에너지 단가 추이', src: '한전 · 도시가스', api: true,
        status: 'none', rank: 10, impact: '운영비를 예측할 수 없다',
      },
      {
        code: '4.2', name: '과거 기상 실측(ASOS)', src: '기상청', api: true,
        status: 'partial', impact: '요약값만 있어 기준선이 거칠다',
      },
      {
        code: '4.5', name: '주변 개발계획 변경', src: '도시관리계획',
        status: 'none', impact: '주변 수요 변화를 반영할 수 없다',
      },
    ],
  },
]

/**
 * 일부러 쓰지 않기로 한 자료.
 * 목록에서 빠진 것과 「빼기로 결정한 것」은 다르다. 이유까지 남긴다.
 */
export const EXCLUDED = [
  {
    name: 'SNS 언급량 · 검색량',
    why: '주 이용층이 75세 이상이라 표본이 편향된다 — 근거가 아니라 반박거리가 된다',
  },
  {
    name: '통신사 유동인구',
    why: '유료이고, 상권분석의 추정치로 대체할 수 있다',
  },
  { name: '카드 매출', why: '유료' },
]

/** 확보 현황 집계 */
export function tally(axes = AXES) {
  const all = axes.flatMap((a) => a.items)
  return {
    total: all.length,
    have: all.filter((i) => i.status === 'have').length,
    partial: all.filter((i) => i.status === 'partial').length,
    none: all.filter((i) => i.status === 'none').length,
  }
}

export const STATUS = {
  have: { label: '확보', tone: 'have' },
  partial: { label: '부분', tone: 'partial' },
  none: { label: '미연결', tone: 'none' },
}
