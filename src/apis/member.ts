import { axiosInstance } from './axiosInstance';
import type { CheckNicknameResponse } from '@/types/member';

// TODO: 백엔드 스펙 확정 시 이 경로만 수정
const CHECK_NICKNAME_ENDPOINT = '/members/nickname/check';

// 닉네임 중복 여부를 조회한다.
export async function checkNicknameDuplicate(nickname: string): Promise<CheckNicknameResponse> {
  const { data } = await axiosInstance.get<CheckNicknameResponse>(CHECK_NICKNAME_ENDPOINT, {
    params: { nickname },
  });
  return data;
}
