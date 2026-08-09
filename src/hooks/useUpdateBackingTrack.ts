// 백킹트랙 수정
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateBackingTrack } from '@/apis/backingTrack';
import { BACKING_TRACKS_QUERY_KEY } from '@/hooks/useBackingTracks';
import { backingTrackDetailQueryKey } from '@/hooks/useBackingTrackDetail';
import type { SaveBackingTrackRequest } from '@/types/track';

export function useUpdateBackingTrack() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ backingTrackId, body }: { backingTrackId: number; body: SaveBackingTrackRequest }) =>
      updateBackingTrack(backingTrackId, body),
    onSuccess: (_data, { backingTrackId }) => {
      queryClient.invalidateQueries({ queryKey: BACKING_TRACKS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: backingTrackDetailQueryKey(backingTrackId) });
    },
  });
}
