import { axiosInstance } from './axiosInstance';
import type { ApiResponse } from '@/types/api';
import type { BackingTrackDetail, BackingTrackListResponse } from '@/types/track';

const BACKING_TRACKS_ENDPOINT = '/api/backing-tracks';

// 백킹트랙 목록 조회 (커서 기반 페이지네이션) — GET /api/backing-tracks
export async function getBackingTracks(cursor?: number): Promise<BackingTrackListResponse> {
  const { data } = await axiosInstance.get<ApiResponse<BackingTrackListResponse>>(BACKING_TRACKS_ENDPOINT, {
    params: cursor === undefined ? undefined : { cursor },
  });
  return data.data;
}

// 백킹트랙 상세 조회 — GET /api/backing-tracks/{backingTrackId}
export async function getBackingTrackDetail(backingTrackId: number): Promise<BackingTrackDetail> {
  const { data } = await axiosInstance.get<ApiResponse<BackingTrackDetail>>(
    `${BACKING_TRACKS_ENDPOINT}/${backingTrackId}`,
  );
  return data.data;
}
