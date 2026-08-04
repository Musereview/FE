import { axiosInstance } from './axiosInstance';
import type { ApiResponse } from '@/types/api';
import type { PlayingSession } from '@/types/practice';

const PLAYINGS_ENDPOINT = '/api/playings';

// 연주 세션 생성 — POST /api/playings
// 상세 모달 "연습 시작" 클릭 시 호출. playingId와 연습 화면 구성용 백킹트랙 정보를 반환한다.
export async function createPlaying(backingTrackId: number): Promise<PlayingSession> {
  const { data } = await axiosInstance.post<ApiResponse<PlayingSession>>(PLAYINGS_ENDPOINT, { backingTrackId });
  return data.data;
}
