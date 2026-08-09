// 백킹트랙 생성
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createBackingTrack } from '@/apis/backingTrack';
import { BACKING_TRACKS_QUERY_KEY } from '@/hooks/useBackingTracks';
import type { SaveBackingTrackRequest } from '@/types/track';

export function useCreateBackingTrack() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: SaveBackingTrackRequest) => createBackingTrack(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BACKING_TRACKS_QUERY_KEY });
    },
  });
}
