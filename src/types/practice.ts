import type { BackingTrackDetail } from './track';

// 스펙상 확인된 값은 READY뿐 — 이후 상태가 추가되면 여기에 union 확장
export type PlayingStatus = 'READY';

// POST /api/playings 응답 data
export interface PlayingSession {
  playingId: number;
  status: PlayingStatus;
  backingTrack: BackingTrackDetail;
  startedAt: string;
}

// POST /api/playings/{playingId}/recording-upload-url 요청 바디
export interface RecordingUploadUrlRequest {
  fileName: string;
  contentType: string;
  fileSize: number;
}

// POST /api/playings/{playingId}/recording-upload-url 응답 data
// uploadUrl로 S3에 직접 PUT하며, requiredHeaders를 그 요청에 그대로 실어야 한다.
export interface RecordingUploadUrlResponse {
  objectKey: string;
  uploadUrl: string;
  expiresAt: string;
  requiredHeaders: Record<string, string>;
}
