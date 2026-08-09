// 백킹트랙 재생 수 증가 — 백킹트랙 기반 연주 후 AI 분석 응답 생성 완료 시 호출
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { increasePlayCount } from '@/apis/backingTrack';
import { backingTrackDetailQueryKey } from '@/hooks/useBackingTrackDetail';
import { RECOMMENDED_BACKING_TRACKS_QUERY_KEY } from '@/hooks/useRecommendedBackingTracks';
import type { IncreasePlayCountRequest } from '@/types/track';

export function useIncreasePlayCount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ backingTrackId, body }: { backingTrackId: number; body: IncreasePlayCountRequest }) =>
      increasePlayCount(backingTrackId, body),
    onSuccess: (_data, { backingTrackId }) => {
      queryClient.invalidateQueries({ queryKey: backingTrackDetailQueryKey(backingTrackId) });
      queryClient.invalidateQueries({ queryKey: RECOMMENDED_BACKING_TRACKS_QUERY_KEY });
    },
  });
}
