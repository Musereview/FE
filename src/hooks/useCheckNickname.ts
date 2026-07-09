import { useMutation } from '@tanstack/react-query';
// import { checkNicknameDuplicate } from '@/apis/member';
import type { CheckNicknameResponse } from '@/types/member';

// 임시 MOCK 데이터 추가
const MOCK_TAKEN_NICKNAMES = ['김나윤', '이민서', '안다현', '배서윤'];

async function mockCheckNickname(nickname: string): Promise<CheckNicknameResponse> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return { available: !MOCK_TAKEN_NICKNAMES.includes(nickname) };
}

// 닉네임 중복확인 mutation
export function useCheckNickname() {
  return useMutation({
    mutationFn: (nickname: string) => mockCheckNickname(nickname),
    // mutationFn: (nickname: string) => checkNicknameDuplicate(nickname),
  });
}
