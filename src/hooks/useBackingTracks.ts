// 백킹트랙 목록 조회 (커서 기반 무한스크롤)
import { useInfiniteQuery } from '@tanstack/react-query';
import { getBackingTracks } from '@/apis/backingTrack';

export const BACKING_TRACKS_QUERY_KEY = ['backingTracks'] as const;

export function useBackingTracks() {
  return useInfiniteQuery({
    queryKey: BACKING_TRACKS_QUERY_KEY,
    queryFn: ({ pageParam }: { pageParam: number | undefined }) => getBackingTracks(pageParam),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? (lastPage.nextCursor ?? undefined) : undefined),
  });
}
