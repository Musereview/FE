export interface ScoreTimingMap {
  /** index = 0-based 마디 인덱스, value = 그 마디가 시작하는 시각(초) */
  measureStartTimes: number[];
  totalDuration: number;
}

/**
 * MusicXML 원문에서 <time>(박자), <sound tempo="">(템포) 변화를 추적하며
 * 각 마디의 시작 시각(초)을 계산한다.
 * OSMD 인스턴스에 의존하지 않으므로 XML을 fetch한 직후 바로 계산 가능하다.
 */
export function computeMeasureTimings(xmlText: string): ScoreTimingMap {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlText, 'application/xml');
  const part = xml.querySelector('part');
  if (!part) return { measureStartTimes: [0], totalDuration: 0 };

  const measures = [...part.querySelectorAll('measure')];

  let beats = 4;
  let beatType = 4;
  let bpm = 120;

  const measureStartTimes: number[] = [];
  let currentTime = 0;

  measures.forEach((measure) => {
    const timeEl = measure.querySelector('attributes > time');
    if (timeEl) {
      const b = timeEl.querySelector('beats')?.textContent;
      const bt = timeEl.querySelector('beat-type')?.textContent;
      if (b) beats = parseInt(b, 10);
      if (bt) beatType = parseInt(bt, 10);
    }

    // <direction><sound tempo="120"/></direction> 형태로 마디 안 어디에나 존재 가능
    const tempoEl = measure.querySelector('sound[tempo]');
    if (tempoEl) {
      const t = tempoEl.getAttribute('tempo');
      if (t) bpm = parseFloat(t);
    }

    measureStartTimes.push(currentTime);

    const quarterNotesInMeasure = beats * (4 / beatType);
    const secondsPerQuarter = 60 / bpm;
    currentTime += quarterNotesInMeasure * secondsPerQuarter;
  });

  return { measureStartTimes, totalDuration: currentTime };
}

/** 이진 탐색: time 이하인 마지막 시작 시각의 인덱스(=현재 마디) 반환 */
export function findMeasureIndexAtTime(measureStartTimes: number[], time: number): number {
  let lo = 0;
  let hi = measureStartTimes.length - 1;
  let result = 0;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (measureStartTimes[mid] <= time) {
      result = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return result;
}
