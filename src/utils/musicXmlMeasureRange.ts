/**
 * "분석하기" 버튼 클릭 시 단 1회 호출되는 구간 추출 유틸리티.
 * 화면 표시/슬라이딩과는 완전히 분리되어 있다 (렌더링 경로에서 절대 호출되지 않음).
 */
export function extractMeasureRange(xmlText: string, startMeasureNumber: number, endMeasureNumber: number): string {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlText, 'application/xml');
  const part = xml.querySelector('part');
  if (!part) return xmlText;

  const measures = [...part.querySelectorAll('measure')];

  // 원본에서 attributes(음자리표, 박자표 등)가 포함된 요소를 미리 찾아둡니다 (보통 첫 마디에 있음)
  const firstMeasureWithAttributes = measures.find((m) => m.querySelector('attributes'));
  const originalAttributes = firstMeasureWithAttributes
    ? firstMeasureWithAttributes.querySelector('attributes')?.cloneNode(true)
    : null;

  // 템포(<sound tempo>)도 함께 옮김
  //  구간 시작 마디 이전에 선언돼 있으면 잘라낼 때 사라지고 computeMeasureTimings가 기본값 120bpm으로 마디 시각을 계산해 오디오와 어긋
  let activeTempo: Node | null = null;
  for (const m of measures) {
    if (parseInt(m.getAttribute('number') ?? '0', 10) > startMeasureNumber) break;
    const tempoEl = m.querySelector('sound[tempo]');
    if (tempoEl) activeTempo = tempoEl.cloneNode(true);
  }

  const keep = measures.filter((m) => {
    const num = parseInt(m.getAttribute('number') ?? '0', 10);
    return num >= startMeasureNumber && num <= endMeasureNumber;
  });

  if (keep.length > 0) {
    // 만약 잘라낸 첫 번째 마디에 attributes가 없다면, 원본의 attributes를 강제로 넣어줍니다.
    const firstKeepMeasure = keep[0];
    if (!firstKeepMeasure.querySelector('attributes') && originalAttributes) {
      const backupLayer = firstKeepMeasure.querySelector('note') || firstKeepMeasure.firstChild;
      if (backupLayer) {
        firstKeepMeasure.insertBefore(originalAttributes, backupLayer);
      } else {
        firstKeepMeasure.appendChild(originalAttributes);
      }
    }

    // 템포는 attributes 바로 뒤에 넣어 마디 시작부터 적용
    if (!firstKeepMeasure.querySelector('sound[tempo]') && activeTempo) {
      const attrEl = firstKeepMeasure.querySelector('attributes');
      firstKeepMeasure.insertBefore(activeTempo, attrEl ? attrEl.nextSibling : firstKeepMeasure.firstChild);
    }
  }

  measures.forEach((m) => m.remove());
  keep.forEach((m) => part.appendChild(m));

  const serializer = new XMLSerializer();
  return '<?xml version="1.0" encoding="UTF-8"?>\n' + serializer.serializeToString(xml).replace(/<!DOCTYPE[^>]*>/, '');
}
