import { useRef, useState } from 'react';
import { isAxiosError } from 'axios';
import { useCheckNickname } from './useCheckNickname';
import { validateNicknameFormat } from '@/utils/validateNickname';
import type { ApiResponse } from '@/types/api';

// 닉네임 검증 상태
export type NicknameStatus = 'idle' | 'length' | 'format' | 'duplicate' | 'available' | 'error';

export const NICKNAME_MESSAGE: Record<Exclude<NicknameStatus, 'idle'>, { text: string; tone: 'error' | 'success' }> = {
  length: { text: '2~10자의 닉네임을 입력해 주세요.', tone: 'error' },
  format: { text: '형식에 맞지 않는 닉네임입니다.', tone: 'error' },
  duplicate: { text: '사용 중인 닉네임입니다.', tone: 'error' },
  available: { text: '사용 가능한 닉네임입니다.', tone: 'success' },
  error: { text: '확인에 실패했어요. 잠시 후 다시 시도해 주세요.', tone: 'error' },
};

// 서버 에러 코드 → 검증 상태
const ERROR_CODE_STATUS: Record<string, NicknameStatus> = {
  USER_400_01: 'length', // 닉네임 누락/빈 값
  USER_400_02: 'format', // 형식 규칙 위반
  USER_409_01: 'duplicate', // 이미 사용 중
};

// 공용으로 쓰는 닉네임 중복확인 로직
export function useNicknameCheck(initialNickname = '') {
  const [nickname, setNickname] = useState(initialNickname);
  const [status, setStatus] = useState<NicknameStatus>('idle');
  // 서버가 내려준 안내 문구
  const [serverText, setServerText] = useState<string | null>(null);
  // 최신 요청 식별용 순번 (입력 변경/요청 시작마다 증가)
  const requestSeqRef = useRef(0);

  const { mutate: checkNickname, isPending } = useCheckNickname();

  const applyStatus = (next: NicknameStatus, text: string | null = null) => {
    setStatus(next);
    setServerText(text);
  };

  // 닉네임 수정 시 이전 검증 결과 초기화 + 진행 중인 요청 무효화
  const handleNicknameChange = (value: string) => {
    requestSeqRef.current += 1;
    setNickname(value);
    applyStatus('idle');
  };

  // 형식 검증만 수행하고 실패 시 상태에 반영 / 통과하면 true.
  const validateFormat = () => {
    const formatError = validateNicknameFormat(nickname);
    if (formatError) {
      applyStatus(formatError);
      return false;
    }
    return true;
  };

  // 중복확인
  const checkDuplicate = () => {
    // 이전 요청의 늦은 응답이 최신 상태를 덮어쓰지 않도록 순번을 올린다
    const seq = (requestSeqRef.current += 1);
    if (!validateFormat()) return;
    checkNickname(nickname, {
      onSuccess: (data) => {
        if (seq !== requestSeqRef.current) return;
        applyStatus(data.available ? 'available' : 'duplicate', data.message);
      },
      onError: (error) => {
        if (seq !== requestSeqRef.current) return;
        const data = isAxiosError<ApiResponse<null>>(error) ? error.response?.data : undefined;
        const mapped = data?.code ? ERROR_CODE_STATUS[data.code] : undefined;
        applyStatus(mapped ?? 'error', mapped ? (data?.message ?? null) : null);
      },
    });
  };

  // 최종 저장 시점에 서버가 중복(409)을 반환하면 중복 상태로 표시
  // 진행 중인 중복확인 응답이 이 결과를 덮어쓰지 않도록 순번 증가
  const markDuplicate = () => {
    requestSeqRef.current += 1;
    applyStatus('duplicate');
  };

  const message =
    status === 'idle' ? null : { ...NICKNAME_MESSAGE[status], text: serverText ?? NICKNAME_MESSAGE[status].text };
  const isConfirmed = status === 'available';

  return {
    nickname,
    status,
    message,
    isPending,
    isConfirmed,
    handleNicknameChange,
    checkDuplicate,
    markDuplicate,
    validateFormat,
  };
}
