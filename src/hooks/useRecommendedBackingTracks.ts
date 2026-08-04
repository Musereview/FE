// 추천 백킹트랙 목록 조회 (재생수 TOP3)
import { useQuery } from '@tanstack/react-query';
import { getRecommendedBackingTracks } from '@/apis/backingTrack';

export const RECOMMENDED_BACKING_TRACKS_QUERY_KEY = ['recommendedBackingTracks'] as const;

export function useRecommendedBackingTracks() {
  return useQuery({
    queryKey: RECOMMENDED_BACKING_TRACKS_QUERY_KEY,
    queryFn: getRecommendedBackingTracks,
  });
}
