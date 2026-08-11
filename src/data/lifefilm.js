/**
 * 05 생애주기 필름 — 곡선을 눌러 여는, 스크롤로 넘기는 영상.
 *
 * ValueCurve 는 잔존 수명을 선으로 말한다. 선은 정확하지만 「그래서 무엇이 낡는가」를
 * 보여 주지 못한다. 같은 이야기를 건물 자체로 한 번 더 한다 — 창이 먼저 늙고,
 * 문이 그다음이고, 37년이 지나면 층이 아니라 뼈대를 본다.
 *
 * 세 장(章)은 영상의 세 구간에 그대로 붙는다. 스크롤 한 칸이 한 프레임이므로
 * 읽는 사람이 시간을 직접 쥔다 — 재생 버튼을 누르고 기다리는 것과 다르다.
 *
 * 금액은 확인한 것만 적는다. 창호·문 단가는 조달청 표준시장단가에서 아직 확보하지
 * 못했으므로 「미확보」라고 쓴다 (costs-junggye.json 과 같은 원칙).
 * 시점은 전부 lib/clocks 에서 온다 — 여기서 다시 계산하지 않는다.
 */

import {
  ACCOUNTING_LIFE, COMPOSITE_END, COMPOSITE_END_V, LIFE_LEFT, NOW,
} from '../lib/clocks'
import { BUILT } from './timeline'

const K = (ko, it, en) => ({ ko, it, en })

/**
 * 영상 제원 — 인코딩 결과와 같아야 한다. 1280×720 · 24fps · 241프레임.
 *
 * 스크럽은 키프레임 간격이 전부다. 보통 인코딩(2초마다 키프레임)이면 어느 지점을
 * 찍든 앞 키프레임까지 되감아 디코딩해야 해서 스크롤이 끈적해진다. 4프레임마다
 * 박아 두면 어느 프레임이든 10ms 안에 뜬다. 영상을 갈아 끼울 때 같은 옵션을 쓴다:
 *
 *   ffmpeg -i <원본> -an -vf scale=1280:720:flags=lanczos \
 *     -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 23 -preset slow \
 *     -g 4 -keyint_min 4 -sc_threshold 0 -movflags +faststart public/lifefilm.mp4
 *
 * 바꾸면 frames 도 함께 고친다 — ffprobe 의 nb_frames 다.
 */
export const FILM = {
  src: '/lifefilm.mp4',
  poster: '/lifefilm.jpg',
  fps: 24,
  frames: 241,
}

export const AGE = NOW - BUILT
export const ACC_END = BUILT + ACCOUNTING_LIFE

const layer = (id) => LIFE_LEFT.find((l) => l.id === id)
const fit = layer('fit')
const svc = layer('svc')
const str = layer('str')

const pc = (v) => Math.round(v * 100)

/**
 * 장(章) — a·b 는 영상에서 차지하는 구간(초)이다.
 * 셋이 영상 전체(0 → 10.04초)를 빈틈없이 나눠 갖는다. 남는 꼬리를 두면
 * 마지막에 아무 말도 없는 스크롤이 생긴다.
 *
 * 경계는 초를 균등하게 자른 것이 아니라 화면이 바뀌는 자리에서 끊었다 —
 * 3.0 에 간판이 들어오고, 5.0 에 외피가 벗겨지며 골조가 드러난다.
 * 길이가 제각각이어도 스크롤은 장마다 똑같이 한 화면씩 준다(LifeFilm).
 * 그래야 짧은 장의 자막을 읽기도 전에 지나가 버리지 않는다.
 */
export const CHAPTERS = [
  {
    id: 'skin',
    a: 0,
    b: 3.0,
    kicker: K('축 A · 외피', 'Asse A · Involucro', 'Axis A · Envelope'),
    title: K(
      '창이 가장 먼저 늙는다',
      'La finestra invecchia per prima',
      'The window ages first',
    ),
    body: K(
      `유리와 창틀은 건물에서 값이 가장 빨리 떨어지는 층이다. 내장 층으로 묶으면 `
      + `주기가 ${fit.life}년, 마지막으로 손댄 ${fit.last}년부터 세면 ${fit.due}년에 만기가 온다. `
      + `주기는 확정이고, 갈아 끼우는 값은 아직 비어 있다.`,
      `Vetri e telai sono lo strato che perde valore più in fretta. Contati con le finiture, `
      + `il ciclo è di ${fit.life} anni: dall'ultimo intervento del ${fit.last}, la scadenza cade nel ${fit.due}. `
      + `Il ciclo è fissato; il costo della sostituzione è ancora vuoto.`,
      `Glass and frames lose value faster than anything else in the building. Counted with the `
      + `fit-out layer, the cycle is ${fit.life} years — from the last work in ${fit.last}, it comes due in ${fit.due}. `
      + `The cycle is settled; the replacement cost is still blank.`,
    ),
    rows: [
      {
        k: K('교체 주기', 'Ciclo', 'Cycle'),
        v: K(`${fit.life}년`, `${fit.life} anni`, `${fit.life} yrs`),
      },
      { k: K('마지막 개입', 'Ultimo intervento', 'Last work'), v: `${fit.last}` },
      { k: K('만기', 'Scadenza', 'Due'), v: `${fit.due}` },
      { k: K('㎡당 단가', 'Costo al m²', 'Cost per m²'), v: null },
    ],
    foot: K(
      '창호 교체 단가는 조달청 표준시장단가에서 확보하지 못했다 — 시점은 말할 수 있고 '
      + '금액은 말할 수 없다.',
      'Il prezzario pubblico per la sostituzione dei serramenti non è stato reperito: '
      + 'possiamo dire quando, non quanto.',
      'No unit rate for window replacement has been secured from the public price schedule — '
      + 'we can say when, not how much.',
    ),
  },
  {
    id: 'door',
    a: 3.0,
    b: 5.0,
    kicker: K('노원구민회관 · 1989 준공', 'Centro civico di Nowon · 1989', 'Nowon Civic Hall · built 1989'),
    title: K(
      '문에는 건물 이름이 달려 있다',
      'Sulla porta c’è il nome dell’edificio',
      'The door carries the building’s name',
    ),
    body: K(
      `출입구는 내장과 설비가 만나는 자리다. 설비 층 주기는 ${svc.life}년인데 마지막 교체일을 `
      + `확인하지 못해 준공(${BUILT})부터 센다 — ${svc.due}년이다. 확인된 개입은 2018 · 2022 · 2025 `
      + `셋뿐이고, 그 이름 아래 ${AGE}년이 지났다.`,
      `L'ingresso è il punto in cui finiture e impianti si incontrano. Il ciclo degli impianti è di `
      + `${svc.life} anni ma, non avendo verificato l'ultima sostituzione, si conta dall'agibilità (${BUILT}): `
      + `${svc.due}. Gli interventi verificati sono tre — 2018, 2022, 2025 — e sotto quel nome sono passati ${AGE} anni.`,
      `The entrance is where fit-out meets plant. The plant cycle is ${svc.life} years, but with no verified `
      + `replacement date it is counted from completion (${BUILT}) — ${svc.due}. Three interventions are `
      + `verified — 2018, 2022, 2025 — and ${AGE} years have passed under that name.`,
    ),
    rows: [
      {
        k: K('건물', 'Edificio', 'Building'),
        v: K('노원구민회관', 'Centro civico di Nowon', 'Nowon Civic Hall'),
      },
      {
        k: K('준공', 'Agibilità', 'Completed'),
        v: K(`${BUILT} · ${AGE}년`, `${BUILT} · ${AGE} anni`, `${BUILT} · ${AGE} yrs`),
      },
      { k: K('설비 만기', 'Scadenza impianti', 'Plant due'), v: `${svc.due}` },
      {
        k: K('2022 사무동 실집행', 'Uffici 2022, speso', '2022 office wing, spent'),
        v: K('0.98억', '0,098 mld', '0.098 bn KRW'),
      },
    ],
    foot: K(
      '2018년 신축을 포기하고 리모델링으로 돌렸다. 총사업비 약 50억 — 기금 28 + 특교세 10 + '
      + '시 특별교부금 10. (노원구의회 제245회 행정재경위 회의록, 2018.08.22)',
      'Nel 2018 si rinuncia al nuovo edificio e si ristruttura: circa 5 mld in tutto — 2,8 dal fondo, '
      + '1,0 dal trasferimento statale, 1,0 da quello comunale. (Verbale del consiglio distrettuale di '
      + 'Nowon, 245ª sessione, 22.08.2018)',
      'In 2018 the new-build was abandoned for a refurbishment: about 5 bn KRW in all — 2.8 from the '
      + 'reserve fund, 1.0 state grant, 1.0 city grant. (Nowon District Council, 245th session minutes, '
      + '22 Aug 2018)',
    ),
  },
  {
    id: 'bone',
    a: 5.0,
    b: 10.0417,
    kicker: K('축 A · 구조', 'Asse A · Struttura', 'Axis A · Structure'),
    title: K(
      `${AGE}년이 지나면 층이 아니라 뼈대를 본다`,
      `Dopo ${AGE} anni non si guardano più gli strati, ma l’ossatura`,
      `After ${AGE} years you stop looking at layers and look at the frame`,
    ),
    body: K(
      `구조 수명 ${str.life}년은 ${str.due}년에 닿는다. 회계로는 ${ACC_END}년에 이미 다 상각된다. `
      + `그 사이에서 존치냐 대수선이냐 재건축이냐가 갈리고, 여기서부터 들어가는 돈의 자릿수가 바뀐다. `
      + `손대지 않으면 ${COMPOSITE_END}년에 ${pc(COMPOSITE_END_V.none)}, 판정대로 손대면 ${pc(COMPOSITE_END_V.plan)}이다.`,
      `La vita strutturale di ${str.life} anni arriva nel ${str.due}; sul piano fiscale l'ammortamento si chiude `
      + `già nel ${ACC_END}. In mezzo si decide se conservare, ristrutturare a fondo o ricostruire — ed è qui che `
      + `cambia l'ordine di grandezza della spesa. Senza interventi nel ${COMPOSITE_END} si è a ${pc(COMPOSITE_END_V.none)}, `
      + `seguendo il giudizio a ${pc(COMPOSITE_END_V.plan)}.`,
      `The ${str.life}-year structural life lands in ${str.due}; on the books it is fully depreciated by ${ACC_END}. `
      + `Between those two years the choice is keep, refurbish deeply, or rebuild — and that is where the order of `
      + `magnitude of the spend changes. Left alone, ${COMPOSITE_END} reads ${pc(COMPOSITE_END_V.none)}; following the `
      + `verdict, ${pc(COMPOSITE_END_V.plan)}.`,
    ),
    rows: [
      { k: K('구조 수명', 'Vita strutturale', 'Structural life'), v: `${str.due}` },
      { k: K('회계 상각 종료', 'Fine ammortamento', 'Fully depreciated'), v: `${ACC_END}` },
      { k: K('손대지 않으면', 'Senza interventi', 'Left alone'), v: `${pc(COMPOSITE_END_V.none)}%` },
      { k: K('판정대로 손대면', 'Con gli interventi', 'With the works'), v: `${pc(COMPOSITE_END_V.plan)}%` },
    ],
    foot: K(
      `대수선이 구조 수명을 얼마나 되돌리는지는 우리가 정할 값이 아니다. 곡선은 ${COMPOSITE_END}년에서 `
      + '끊고, 그 해를 반등이 아니라 결정 지점으로 둔다.',
      `Di quanto una grande ristrutturazione riporti indietro la vita strutturale non spetta a noi deciderlo: `
      + `la curva si ferma al ${COMPOSITE_END}, che resta un punto di decisione, non un rimbalzo.`,
      `How far a major refurbishment sets structural life back is not ours to decide. The curve stops at `
      + `${COMPOSITE_END}, and that year is a decision point, not a rebound.`,
    ),
  },
]
