/**
 * 비용분류체계 — 백병훈·조중연(2014) Fig.1 을 트리로 옮긴다.
 *
 * 이 파일은 「어떤 비용 항목이 있는가」의 뼈대일 뿐, 값은 담지 않는다.
 * 실제 금액은 public/data/costs-junggye.json 에서 leaf.key 로 붙는다.
 * 뼈대와 값을 갈라 두는 이유: 값이 아직 없어도 구조는 완성되어 있어야
 * 화면이 「무엇이 비어 있는지」를 보일 수 있기 때문이다.
 *
 * timing — 이 비용이 시간축 어디에 떨어지는가. LCC 는 시점이 곧 현재가치이므로 필수다.
 *   once    초기 1회 (t=0, 할인 안 함)
 *   annual  매년 반복
 *   cycle   주기적 (period 년마다)
 *   event   위험사건 발생 시 (확률로 기대값 산정)
 */

const K = (ko, it) => ({ ko, it })
const leaf = (key, ko, it, timing, extra = {}) => ({ key, label: K(ko, it), timing, ...extra })

/** 관리주체비용 — 초기공사 + 유지관리 + 에너지 + 해체폐기 */
const MANAGING = {
  key: 'managing',
  label: K('관리주체비용', 'Costo del gestore'),
  groups: [
    {
      key: 'initial', label: K('초기공사비', 'Costo iniziale'), timing: 'once',
      items: [
        leaf('plan', '계획비', 'Pianificazione', 'once'),
        leaf('design', '설계비', 'Progettazione', 'once'),
        leaf('construction', '공사비', 'Costruzione', 'once'),
        leaf('supervision', '감리비', 'Direzione lavori', 'once'),
      ],
    },
    {
      key: 'maintenance', label: K('유지관리비', 'Manutenzione'),
      items: [
        leaf('checkDiagnosis', '점검·진단비', 'Ispezione e diagnosi', 'cycle', { period: 3 }),
        leaf('generalManagement', '일반관리비', 'Gestione generale', 'annual'),
        leaf('generalRepair', '일반수선비', 'Riparazioni correnti', 'annual'),
        leaf('preventive', '예방수선비', 'Manutenzione preventiva', 'annual'),
        leaf('repairReinforced', '보수·보강비', 'Riparazione e rinforzo', 'cycle', { period: 15 }),
      ],
    },
    {
      key: 'energy', label: K('에너지비용', 'Energia'), timing: 'annual',
      items: [
        leaf('electric', '전기', 'Elettricità', 'annual'),
        leaf('water', '수도', 'Acqua', 'annual'),
        leaf('gas', '가스', 'Gas', 'annual'),
      ],
    },
    {
      key: 'demolition', label: K('해체·폐기비', 'Demolizione'), timing: 'once',
      items: [
        leaf('demolitionCost', '해체비', 'Demolizione', 'once'),
        leaf('recycling', '재활용비', 'Riciclo', 'once'),
      ],
    },
  ],
}

/** 위험도비용 — 1989 준공 건물이라 실제 의미가 있다. 논문 식(4)(5) */
const RISK = {
  key: 'risk',
  label: K('위험도비용', 'Costo di rischio'),
  groups: [
    {
      key: 'riskCost', label: K('기대 위험비용', 'Costo atteso di rischio'), timing: 'event',
      items: [
        leaf('expectRestoration', '기대복구비', 'Ripristino atteso', 'event'),
        leaf('expectIndirect', '기대간접비', 'Indiretto atteso', 'event'),
      ],
    },
  ],
}

/** 우리만의 항목 — 논문엔 없다(신축 대안 비교라). 용도전환이 이 프로젝트의 핵심 변수다 */
const CONVERSION = {
  key: 'conversion',
  label: K('용도전환비', 'Costo di riconversione'),
  groups: [
    {
      key: 'conversionCost', label: K('용도전환', 'Riconversione'), timing: 'event',
      items: [
        leaf('conversion', '개보수 vs 신축·이전 차액', 'Adattivo vs nuovo', 'event'),
      ],
    },
  ],
}

/** 전체 트리 */
export const COST_MODEL = [MANAGING, RISK, CONVERSION]

/** 모든 leaf 를 평평하게 — 값 붙이기·집계에 쓴다 */
export const allLeaves = () => COST_MODEL.flatMap(
  (b) => b.groups.flatMap((g) => g.items.map((it) => ({ ...it, branch: b.key, group: g.key }))),
)
