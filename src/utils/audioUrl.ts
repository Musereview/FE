// 서버가 더미 문자열이나 빈 값을 내려보내는 경우가 있어 재생 가능한 URL만 통과
export function toPlayableUrl(url?: string | null): string | null {
  return url && /^https?:\/\//.test(url) ? url : null;
}
