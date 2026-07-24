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
  const keep = measures.filter((m) => {
    const num = parseInt(m.getAttribute('number') ?? '0', 10);
    return num >= startMeasureNumber && num <= endMeasureNumber;
  });

  measures.forEach((m) => m.remove());
  keep.forEach((m) => part.appendChild(m));

  const serializer = new XMLSerializer();
  return '<?xml version="1.0" encoding="UTF-8"?>\n' + serializer.serializeToString(xml).replace(/<!DOCTYPE[^>]*>/, '');
}
