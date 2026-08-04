import { useMutation } from '@tanstack/react-query';
import { checkNicknameDuplicate } from '@/apis/profile';

// 닉네임 중복 확인 mutation
export function useCheckNickname() {
  return useMutation({
    mutationFn: (nickname: string) => checkNicknameDuplicate(nickname),
  });
}
