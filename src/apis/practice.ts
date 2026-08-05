import { axiosInstance } from './axiosInstance';
import type { ApiResponse } from '@/types/api';
import type {
  PlayingSession,
  RecordingUploadUrlRequest,
  RecordingUploadUrlResponse,
  SaveMidiEventsRequest,
  SaveMidiEventsResponse,
} from '@/types/practice';

const PLAYINGS_ENDPOINT = '/api/playings';

// 연주 세션 생성 — POST /api/playings
// 상세 모달 "연습 시작" 클릭 시 호출. playingId와 연습 화면 구성용 백킹트랙 정보를 반환한다.
export async function createPlaying(backingTrackId: number): Promise<PlayingSession> {
  const { data } = await axiosInstance.post<ApiResponse<PlayingSession>>(PLAYINGS_ENDPOINT, { backingTrackId });
  return data.data;
}

// 업로드용 Presigned URL 발급 — POST /api/playings/{playingId}/recording-upload-url
// "분석하기" 클릭 시 호출. 응답의 uploadUrl로 S3에 직접 PUT하고, requiredHeaders를 그 요청에 그대로 실어야 한다.
export async function getRecordingUploadUrl(
  playingId: number,
  body: RecordingUploadUrlRequest,
): Promise<RecordingUploadUrlResponse> {
  const { data } = await axiosInstance.post<ApiResponse<RecordingUploadUrlResponse>>(
    `${PLAYINGS_ENDPOINT}/${playingId}/recording-upload-url`,
    body,
  );
  return data.data;
}

// MIDI 이벤트 저장 + 최종 완료 처리 — POST /api/playings/{playingId}/midi-events
// S3 업로드 성공 후 호출. 백엔드가 objectKey로 파일 존재를 검증하고 MIDI 데이터를 저장, 연주 상태를 COMPLETED로 변경한다.
export async function saveMidiEvents(playingId: number, body: SaveMidiEventsRequest): Promise<SaveMidiEventsResponse> {
  const { data } = await axiosInstance.post<ApiResponse<SaveMidiEventsResponse>>(
    `${PLAYINGS_ENDPOINT}/${playingId}/midi-events`,
    body,
  );
  return data.data;
}
