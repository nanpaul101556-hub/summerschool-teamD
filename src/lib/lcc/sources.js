/**
 * 각 비용을 「어느 법·기관에서」 가져오는가 — 논문 5.3 의 조달 근거를 그대로 옮긴다.
 *
 * 이 파일은 값이 아니라 「값의 출처」다. 단가를 지어내지 않기 위해,
 * 각 비용 항목이 어떤 문서를 확보하면 채워지는지를 코드가 기억하게 한다.
 * costModel 의 leaf.key 와 여기 키가 1:1로 맞물린다.
 */

const K = (ko, it, en) => ({ ko, it, en })

/**
 * status 의 뜻 — 화면은 이 값으로 확보/미확보를 색으로 가른다.
 *   confirmed  법정·공표 자료로 지금 산정 가능
 *   estimate   참조값만 있음 (다른 용도·건물 기준). '추정' 이라 반드시 표기
 *   missing    아직 근거 없음. 지어내지 않고 비워 둔다
 */
export const STATUS = {
  confirmed: { label: K('확보', 'Disponibile'), tone: 'ok' },
  estimate: { label: K('참조값', 'Riferimento'), tone: 'warn' },
  missing: { label: K('미확보', 'Mancante'), tone: 'gap' },
}

/** leaf.key → 조달 근거 */
export const SOURCE = {
  // 초기공사비 — 사업자 제시 또는 표준시장단가
  plan: { status: 'missing', doc: K('사업자 제시 / 조달청 표준시장단가', 'Committente / prezziario PPS') },
  design: { status: 'missing', doc: K('사업자 제시 / 조달청 표준시장단가', 'Committente / prezziario PPS') },
  construction: { status: 'missing', doc: K('용도별 ㎡당 공사비 — 조달청 표준시장단가 / 유사 공공건축 실적', 'Costo al m² per uso — prezziario PPS') },
  supervision: { status: 'missing', doc: K('사업자 제시', 'Committente') },

  // 유지관리 — 법정 근거가 있어 산정 가능
  checkDiagnosis: { status: 'confirmed', doc: K('시설물의 안전 및 유지관리에 관한 특별법 (점검·진단 주기·비용)', 'Legge speciale sulla sicurezza delle strutture') },
  generalManagement: { status: 'confirmed', doc: K('공동주택관리법 등 법정관리비 기준', 'Costi di gestione di legge') },
  generalRepair: { status: 'estimate', doc: K('전등교체·공구·소모품 실비 (논문 5.3 일상수선비)', 'Riparazioni correnti (voce del paper)') },
  preventive: { status: 'estimate', doc: K('청소·수질·공기질·조경·승강기 실비', 'Manutenzione preventiva a costi reali') },
  repairReinforced: { status: 'estimate', doc: K('주택법 시행규칙 장기수선계획 수립기준 (주기) × 물량 × 단가', 'Criteri del piano di manutenzione a lungo termine') },

  // 에너지 — EUI + 요금으로 확보
  electric: { status: 'confirmed', doc: K('국토부 건물에너지 EUI × 한전 전기요금', 'EUI del Ministero × tariffa elettrica KEPCO') },
  water: { status: 'confirmed', doc: K('상수도 요금', 'Tariffa idrica') },
  gas: { status: 'confirmed', doc: K('도시가스 요금 × 난방 EUI', 'Tariffa gas × EUI riscaldamento') },

  // 해체·폐기
  demolitionCost: { status: 'missing', doc: K('해체 폐기물량 × 처리단가', 'Volume demolito × costo di smaltimento') },
  recycling: { status: 'missing', doc: K('재활용 물량 × 단가', 'Volume riciclato × prezzo') },

  // 위험도 — 우리 건물(1989)의 핵심. 논문 식(4)(5)
  expectRestoration: { status: 'missing', doc: K('재해 발생빈도 νL × 파괴확률 P × 복구단가 (지진·화재)', 'Frequenza × probabilità di collasso × costo di ripristino') },
  expectIndirect: { status: 'missing', doc: K('이용자 수 × 대체시설 거리 × 중단일수 (업무지연·이용불편·사회손실)', 'Utenti × distanza alternativa × giorni di chiusura') },

  // 우리만의 항목 — 용도전환
  conversion: { status: 'estimate', doc: K('개보수(적응형) vs 신축·이전(고정형) 차액 — 장수명주택 +18% 참조값', 'Differenza adattivo/fisso — riferimento +18%') },
}

/** 미확보 항목만 추려 「무엇을 더 구해야 하는가」를 화면에 띄운다 */
export const missingKeys = () => Object.entries(SOURCE)
  .filter(([, s]) => s.status === 'missing')
  .map(([key]) => key)
