import type { BackingTrackDetail } from './track';
import type { MidiEventPayload } from '@/utils/midiEventPayload';

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

// POST /api/playings/{playingId}/midi-events 요청 바디
// S3 업로드 성공 후 호출 — 백엔드가 objectKey로 파일 존재를 검증하고 MIDI 데이터를 저장, 연주 상태를 COMPLETED로 변경한다.
export interface SaveMidiEventsRequest {
  events: MidiEventPayload[];
  recordingObjectKey: string;
}

// POST /api/playings/{playingId}/midi-events 응답 data
export interface SaveMidiEventsResponse {
  playingId: number;
  savedCount: number;
}
