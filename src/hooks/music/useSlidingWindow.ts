import { useEffect, useState } from 'react';

const WINDOW_SIZE = 4; // 화면에 항상 보이는 마디 수
const STEP_SIZE = 3; // 한 번에 이동하는 마디 수 (1~4 -> 4~7 -> 7~10 ...)

export function useSlidingWindow(measureXPositions: number[], currentMeasureIndex: number) {
  const [windowStart, setWindowStart] = useState(0);

  useEffect(() => {
    setWindowStart((prev) => {
      const windowLastMeasure = prev + WINDOW_SIZE - 1;
      if (currentMeasureIndex >= windowLastMeasure) {
        return prev + STEP_SIZE;
      }
      return prev;
    });
  }, [currentMeasureIndex]);

  if (measureXPositions.length === 0) {
    return { windowStart: 0, translateX: 0, viewportWidth: 0 };
  }

  const maxStart = Math.max(0, measureXPositions.length - 1 - WINDOW_SIZE);
  const clampedStart = Math.min(windowStart, maxStart);

  const startX = measureXPositions[clampedStart] ?? 0;
  const endX = measureXPositions[Math.min(clampedStart + WINDOW_SIZE, measureXPositions.length - 1)] ?? startX;

  return {
    windowStart: clampedStart,
    translateX: startX,
    viewportWidth: endX - startX,
  };
}
