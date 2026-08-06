export function formatRelativeTime(isoDate: string): string {
  const target = new Date(isoDate);
  if (Number.isNaN(target.getTime())) return '';

  const diffMinutes = Math.floor((Date.now() - target.getTime()) / 60_000);
  if (diffMinutes < 1) return '방금 전';
  if (diffMinutes < 60) return `${diffMinutes}분 전`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return '어제';
  if (diffDays < 7) return `${diffDays}일 전`;

  return target.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
}
