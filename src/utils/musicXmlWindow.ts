export interface WindowScore {
  startMeasure: number;
  endMeasure: number;
  xml: string;
}

export async function createSlidingWindows(xmlText: string, windowSize = 4, step = 1): Promise<WindowScore[]> {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlText, 'application/xml');

  const serializer = new XMLSerializer();

  const part = xml.querySelector('part');
  if (!part) return [];

  const measures = [...part.querySelectorAll('measure')];

  const windows: WindowScore[] = [];

  for (let start = 0; start < measures.length; start += step) {
    const cloned = xml.cloneNode(true) as XMLDocument;

    const clonedPart = cloned.querySelector('part')!;

    clonedPart.querySelectorAll('measure').forEach((m) => m.remove());

    const end = Math.min(start + windowSize, measures.length);

    for (let i = start; i < end; i++) {
      clonedPart.appendChild(measures[i].cloneNode(true));
    }

    const xmlString =
      '<?xml version="1.0" encoding="UTF-8"?>\n' + serializer.serializeToString(cloned).replace(/<!DOCTYPE[^>]*>/, '');

    windows.push({
      startMeasure: start + 1,
      endMeasure: end,
      xml: xmlString,
    });

    if (end === measures.length) break;
  }

  return windows;
}
