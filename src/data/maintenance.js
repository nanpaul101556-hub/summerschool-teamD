/**
 * 법정 수선주기 · 점검주기.
 *
 * 출처: 「시설물의 안전 및 유지관리 실시 등에 관한 지침」 [별표15] 시설물 표준 수선주기 (제32조 관련)
 *       — 국토교통부 고시. 공사종별 · 수선방법 · 수선주기(년) · 수선율(%)이 법으로 정해져 있다.
 *
 * 소규모 비주거 시설에 해당하는 항목만 추렸다.
 * 승강기 · 자가발전 · 가스 · 지능형홈네트워크는 우리 규모에 해당하지 않아 제외.
 *
 * layer 는 Brand(1994) Shearing Layers 매핑 — 수명이 다른 층을 구분하기 위한 것.
 */

/** 수선 항목 — cycle 년마다 rate % 를 손본다 */
export const REPAIR_CYCLES = [
  // ── Skin 외피 ──────────────────────────────────────────────
  { layer: 'skin', part: '지붕', work: '고분자시트방수', method: '부분수리', cycle: 8, rate: 20 },
  { layer: 'skin', part: '지붕', work: '고분자시트방수', method: '전면수리', cycle: 20, rate: 100 },
  { layer: 'skin', part: '지붕', work: '아스팔트방수층', method: '전면수리', cycle: 20, rate: 100 },
  { layer: 'skin', part: '외벽', work: '수성페인트', method: '전면도장', cycle: 5, rate: 100 },
  { layer: 'skin', part: '외벽', work: '타일 붙이기', method: '부분수리', cycle: 8, rate: 10 },
  { layer: 'skin', part: '외벽', work: '타일 붙이기', method: '전면수리', cycle: 30, rate: 100 },
  { layer: 'skin', part: '외부창문', work: '알미늄 창·문', method: '창·문틀수리', cycle: 10, rate: 10 },
  { layer: 'skin', part: '외부창문', work: '알미늄 창·문', method: '전면교체', cycle: 25, rate: 100 },
  { layer: 'skin', part: '기타', work: '홈통', method: '부분수리', cycle: 6, rate: 10 },
  { layer: 'skin', part: '기타', work: '홈통', method: '전면교체', cycle: 28, rate: 100 },

  // ── Space plan 평면 ────────────────────────────────────────
  { layer: 'space', part: '천정', work: '수성도료칠', method: '전면도장', cycle: 5, rate: 100 },
  { layer: 'space', part: '천정', work: '보드류', method: '전면수리', cycle: 25, rate: 100 },
  { layer: 'space', part: '내벽', work: '수성도료칠', method: '전면도장', cycle: 5, rate: 100 },
  { layer: 'space', part: '내벽', work: '보드류', method: '전면수리', cycle: 20, rate: 100 },
  { layer: 'space', part: '내벽', work: '간막이벽(경량철골)', method: '부분수리', cycle: 10, rate: 10 },
  { layer: 'space', part: '바닥', work: '마루널 깔기', method: '부분수리', cycle: 7, rate: 15 },
  { layer: 'space', part: '바닥', work: '마루널 깔기', method: '전면수리', cycle: 25, rate: 100 },
  { layer: 'space', part: '바닥', work: '아스타일류 깔기', method: '전면교체', cycle: 10, rate: 100 },
  { layer: 'space', part: '내부창문', work: '알루미늄 창·문', method: '창·문교체', cycle: 25, rate: 100 },
  { layer: 'space', part: '기타', work: '단열층(벽·천정)', method: '부분수리', cycle: 15, rate: 20 },
  { layer: 'space', part: '기타', work: '단열층(벽·천정)', method: '전면수리', cycle: 50, rate: 100 },

  // ── Services 설비 ──────────────────────────────────────────
  { layer: 'services', part: '옥내배선', work: '스위치', method: '전면교체', cycle: 6, rate: 100 },
  { layer: 'services', part: '옥내배선', work: '콘센트', method: '전면교체', cycle: 6, rate: 100 },
  { layer: 'services', part: '옥내배선', work: '배선배관', method: '전면교체', cycle: 20, rate: 100 },
  { layer: 'services', part: '변전설비', work: '변압기', method: '부분교체', cycle: 10, rate: 25 },
  { layer: 'services', part: '변전설비', work: '변압기', method: '전면교체', cycle: 25, rate: 100 },
  { layer: 'services', part: '변전설비', work: '전력케이블', method: '전면교체', cycle: 30, rate: 100 },
  { layer: 'services', part: '화재감지', work: '감지기', method: '부분수리', cycle: 5, rate: 20 },
  { layer: 'services', part: '화재감지', work: '감지기', method: '전면교체', cycle: 20, rate: 100 },
  { layer: 'services', part: '화재감지', work: '유도등', method: '전면교체', cycle: 10, rate: 100 },
  { layer: 'services', part: '소화설비', work: '소화펌프', method: '전면교체', cycle: 20, rate: 100 },
  { layer: 'services', part: '소화설비', work: '스프링클러', method: '전면교체', cycle: 25, rate: 100 },
  { layer: 'services', part: '보안', work: 'CCTV·침입탐지', method: '전면교체', cycle: 5, rate: 100 },
  { layer: 'services', part: '급수설비', work: '급수펌프', method: '전면교체', cycle: 10, rate: 100 },
  { layer: 'services', part: '급수설비', work: '급수관(강관)', method: '전면교체', cycle: 15, rate: 100 },
  { layer: 'services', part: '배수설비', work: '배수관(강관)', method: '전면교체', cycle: 15, rate: 100 },
  { layer: 'services', part: '위생기구', work: '대변기·소변기·세면기', method: '전면교체', cycle: 20, rate: 100 },
  { layer: 'services', part: '환기설비', work: '환기팬', method: '전면교체', cycle: 10, rate: 100 },
  { layer: 'services', part: '난방설비', work: '보일러', method: '부분수선', cycle: 5, rate: 10 },
  { layer: 'services', part: '난방설비', work: '보일러', method: '전면교체', cycle: 15, rate: 100 },
  { layer: 'services', part: '난방설비', work: '난방순환펌프', method: '전면교체', cycle: 10, rate: 100 },
  { layer: 'services', part: '난방설비', work: '난방관(강관)', method: '전면교체', cycle: 15, rate: 100 },
  { layer: 'services', part: '난방설비', work: '자동제어 기기', method: '전면교체', cycle: 20, rate: 20 },
  { layer: 'services', part: '급탕설비', work: '급탕조', method: '전면교체', cycle: 15, rate: 100 },

  // ── Site 옥외 ──────────────────────────────────────────────
  { layer: 'site', part: '옥외부대', work: '보도블록', method: '전면수리', cycle: 10, rate: 100 },
  { layer: 'site', part: '옥외부대', work: '조경시설물', method: '전면교체', cycle: 15, rate: 100 },
  { layer: 'site', part: '옥외부대', work: '안내표지판', method: '전면교체', cycle: 5, rate: 100 },
]

/**
 * 법정 점검 — 수선과 달리 「안 하면 위법」인 항목.
 * first: 준공 후 최초 시행까지의 연수 / every: 이후 반복 주기(년)
 */
export const LEGAL_INSPECTIONS = [
  {
    key: 'periodic',
    label: '정기점검',
    law: '건축물관리법 제13조',
    first: 5,
    every: 3,
    note: '사용승인 후 5년 이내 최초, 이후 3년마다',
  },
  {
    key: 'precise',
    label: '정밀점검',
    law: '시설물안전법',
    first: 4,
    every: 3,
    note: '건축물은 준공·사용승인 후 4년 이내 최초',
    scope: '1·2종 시설물',
  },
  {
    key: 'diagnosis',
    label: '정밀안전진단',
    law: '시설물안전법',
    first: 10,
    every: 5,
    note: '준공 10년 경과 후 1년 이내 최초',
    scope: '1종 시설물',
  },
]

/**
 * 층별 성격 — 어디까지가 「바꿀 수 있는 것」인가.
 * Structure 가 이 표에 없다는 사실 자체가 근거다: 수선 대상이 아니라 곧 교체 불가.
 */
export const LAYER_META = {
  site: { label: 'Site 대지', order: 0, fixed: true },
  structure: { label: 'Structure 구조', order: 1, fixed: true, noRepair: true },
  skin: { label: 'Skin 외피', order: 2, fixed: false },
  services: { label: 'Services 설비', order: 3, fixed: false },
  space: { label: 'Space plan 평면', order: 4, fixed: false },
}

/** 전면교체·전면수리만 큰 공사로 본다 — 부분수리는 일상 유지관리 */
export const MAJOR_METHODS = ['전면교체', '전면수리', '전면도장']
