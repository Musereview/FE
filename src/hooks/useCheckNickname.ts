import { useMutation } from '@tanstack/react-query';
import { checkNicknameDuplicate } from '@/apis/member';

// 닉네임 중복확인 mutation
export function useCheckNickname() {
  return useMutation({
    mutationFn: (nickname: string) => checkNicknameDuplicate(nickname),
  });
}
