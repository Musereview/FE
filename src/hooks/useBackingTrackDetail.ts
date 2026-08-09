// 백킹트랙 상세 조회 — 트랙 카드 클릭 시 상세 모달용
import { useQuery } from '@tanstack/react-query';
import { getBackingTrackDetail } from '@/apis/backingTrack';

export const backingTrackDetailQueryKey = (backingTrackId: number | null) =>
  ['backingTrackDetail', backingTrackId] as const;

export function useBackingTrackDetail(backingTrackId: number | null) {
  return useQuery({
    queryKey: backingTrackDetailQueryKey(backingTrackId),
    queryFn: () => getBackingTrackDetail(backingTrackId as number),
    enabled: backingTrackId !== null,
  });
}
