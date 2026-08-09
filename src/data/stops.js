/**
 * 대상지 둘레의 통행 — 어디서, 얼마나, 얼마나 돌아왔는가.
 *
 * 승하차는 전부 실측이다. 서울 열린데이터광장 OA-12913 (노선별 정류장별 승하차),
 * 노원구 536개 정류장 중 다섯을 뽑았다. 계절성을 없애려 7월끼리만 비교했고
 * 2019년 7월을 100 으로 둔다. 원자료와 산출은 03-data/signals/recovery_result.md.
 *
 * 좌표는 V-World 장소검색의 「(버스정류장)」 POI 다. 정류장은 양방향에 하나씩
 * 있으므로 지도의 점은 위치를 가리키는 것이지 승강장 하나를 가리키지 않는다.
 *
 * 다섯을 이렇게 고른 이유 — 성격이 갈리는 것끼리 붙여야 차이가 읽힌다.
 *   대상지 앞 · 미술관 앞   문화시설로 가는 통행
 *   주민센터 · 주공2단지    주거지 통행
 *   중계역 2번출구          역세권 통행
 */

const K = (ko, it) => ({ ko, it })

/** 2026년 7월 기준. raw 는 그 달 승차+하차 합계, idx 는 2019.07=100 */
export const STOPS = [
  {
    ars: '11367', kind: 'site', lead: true,
    label: K('대상지 앞', 'Davanti al sito'),
    sub: K('노원구민회관', 'Auditorium di Nowon'),
    lat: 37.639366, lng: 127.066466, m: 46,
    raw: 77438, idx: 82.5,
  },
  {
    ars: '11374', kind: 'culture',
    label: K('북서울미술관 앞', 'Davanti al museo'),
    sub: K('문화시설', 'Struttura culturale'),
    lat: 37.640599, lng: 127.066333, m: 182,
    raw: 66430, idx: 72.0,
  },
  {
    ars: '11376', kind: 'transit',
    label: K('중계역 2번출구', 'Stazione Junggye, uscita 2'),
    sub: K('역세권', 'Area stazione'),
    lat: 37.645617, lng: 127.064939, m: 750,
    raw: 63345, idx: 97.0,
  },
  {
    ars: '11348', kind: 'resid',
    label: K('중계1동주민센터', 'Centro civico Junggye 1'),
    sub: K('주거지', 'Area residenziale'),
    lat: 37.651725, lng: 127.076938, m: 1698,
    raw: 116255, idx: 99.2,
  },
  {
    ars: '11395', kind: 'resid',
    label: K('중계주공2단지', 'Junggye Jugong 2'),
    sub: K('주거지', 'Area residenziale'),
    lat: 37.657048, lng: 127.077830, m: 2251,
    raw: 48588, idx: 93.6,
  },
]

/** 대조군 — 노원구 정류장 전체 평균. 지도에 점이 없으므로 기준선으로만 쓴다. */
export const CONTROL = { idx: 91.1, n: 536, label: K('노원구 평균', 'Media di Nowon') }

export const STOP_MAX = Math.max(...STOPS.map((s) => s.raw))

/**
 * 원 반지름 — 대상지 앞과 미술관 앞이 182 m 라 이 축척에서 30 px 안쪽이다.
 * 원이 그보다 커지면 두 개가 한 덩어리로 보인다.
 */
export const rOf = (raw) => 5 + 15 * Math.sqrt(raw / STOP_MAX)

export const STOP_META = {
  month: '2026.07',
  base: '2019.07 = 100',
  src: K('서울 열린데이터광장 OA-12913 · 노원구 536개 정류장',
    'Open Data Seoul OA-12913 · 536 fermate del distretto'),
}
