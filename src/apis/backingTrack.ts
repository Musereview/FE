import { axiosInstance } from './axiosInstance';
import type { ApiResponse } from '@/types/api';
import type {
  AudioUploadUrlRequest,
  AudioUploadUrlResponse,
  BackingTrackDetail,
  BackingTrackListResponse,
  CreateBackingTrackResponse,
  IncreasePlayCountRequest,
  IncreasePlayCountResponse,
  RecommendedBackingTrackItem,
  RecommendedBackingTracksResponse,
  SaveBackingTrackRequest,
  UpdateBackingTrackResponse,
} from '@/types/track';

const BACKING_TRACKS_ENDPOINT = '/api/backing-tracks';
const RECOMMENDED_BACKING_TRACKS_ENDPOINT = '/api/backing-tracks/recommended';
const AUDIO_UPLOAD_URL_ENDPOINT = '/api/backing-tracks/audio-upload-url';

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

// 추천 백킹트랙 목록 조회 (최근 1주일 분석 완료, 재생수 TOP3) — GET /api/backing-tracks/recommended
export async function getRecommendedBackingTracks(): Promise<RecommendedBackingTrackItem[]> {
  const { data } = await axiosInstance.get<ApiResponse<RecommendedBackingTracksResponse>>(
    RECOMMENDED_BACKING_TRACKS_ENDPOINT,
  );
  return data.data.recommendedTracks;
}

// 백킹트랙 오디오 파일 업로드용 Presigned URL 발급 — POST /api/backing-tracks/audio-upload-url
// 응답의 uploadUrl로 S3에 직접 PUT하고, requiredHeaders를 그 요청에 그대로 실어야 한다.
// 업로드 성공 후 반환된 objectKey를 생성 요청의 audioObjectKey로 전달한다.
export async function createAudioUploadUrl(payload: AudioUploadUrlRequest): Promise<AudioUploadUrlResponse> {
  const { data } = await axiosInstance.post<ApiResponse<AudioUploadUrlResponse>>(AUDIO_UPLOAD_URL_ENDPOINT, payload);
  return data.data;
}

// 백킹트랙 생성 — POST /api/backing-tracks
export async function createBackingTrack(payload: SaveBackingTrackRequest): Promise<CreateBackingTrackResponse> {
  const { data } = await axiosInstance.post<ApiResponse<CreateBackingTrackResponse>>(BACKING_TRACKS_ENDPOINT, payload);
  return data.data;
}

// 백킹트랙 수정 — PUT /api/backing-tracks/{backingTrackId}
export async function updateBackingTrack(
  backingTrackId: number,
  payload: SaveBackingTrackRequest,
): Promise<UpdateBackingTrackResponse> {
  const { data } = await axiosInstance.put<ApiResponse<UpdateBackingTrackResponse>>(
    `${BACKING_TRACKS_ENDPOINT}/${backingTrackId}`,
    payload,
  );
  return data.data;
}

// 백킹트랙 재생 수 증가 (AI 분석 완료 시 1 증가) — PATCH /api/backing-tracks/{backingTrackId}/play-count
export async function increasePlayCount(
  backingTrackId: number,
  payload: IncreasePlayCountRequest,
): Promise<IncreasePlayCountResponse> {
  const { data } = await axiosInstance.patch<ApiResponse<IncreasePlayCountResponse>>(
    `${BACKING_TRACKS_ENDPOINT}/${backingTrackId}/play-count`,
    payload,
  );
  return data.data;
}
