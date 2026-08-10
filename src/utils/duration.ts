// 총 초를 '0분 0초' 형태로 표기.
// 1분 미만 연주도 기록이 남도록 분과 초를 항상 함께 노출한다.
export function formatDurationText(totalSec?: number | null): string {
  const safeSec = Number.isFinite(totalSec) ? Math.max(0, Math.floor(totalSec as number)) : 0;
  return `${Math.floor(safeSec / 60)}분 ${safeSec % 60}초`;
}
