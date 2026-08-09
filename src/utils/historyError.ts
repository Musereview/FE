import { isAxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types/api';

const DEFAULT_MESSAGE = '연주 히스토리를 불러오지 못했습니다.';

// 히스토리 상세 조회 에러 코드 → 사용자 문구
// 401(COMMON_401_01)은 axiosInstance가 토큰 재발급/로그인 이동으로 처리하므로 제외
const MESSAGE_BY_CODE: Record<string, string> = {
  HISTORY_400_02: '연주 히스토리가 없습니다.',
  HISTORY_403_01: '내 연주 기록만 조회할 수 있습니다.',
  HISTORY_404_01: '연주 히스토리가 없습니다.',
  HISTORY_409_01: '완료된 연주만 조회할 수 있습니다.',
};

export function historyDetailErrorMessage(error: unknown): string {
  if (!isAxiosError(error)) return DEFAULT_MESSAGE;

  const code = (error.response?.data as ApiErrorResponse | undefined)?.code;
  if (code && MESSAGE_BY_CODE[code]) return MESSAGE_BY_CODE[code];

  // 에러 코드가 없거나 모르는 코드면 status로 폴백
  return error.response?.status === 404 ? '연주 히스토리가 없습니다.' : DEFAULT_MESSAGE;
}
