// 연주 세션 생성 mutation — 트랙 상세 모달 "연습 시작" 클릭 시 호출
import { useMutation } from '@tanstack/react-query';
import { createPlaying } from '@/apis/practice';

export const useCreatePlaying = () =>
  useMutation({
    mutationFn: (backingTrackId: number) => createPlaying(backingTrackId),
  });
