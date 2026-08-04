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
