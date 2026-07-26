import { useRef, useState } from 'react';
import { useCheckNickname } from './useCheckNickname';
import { validateNicknameFormat } from '@/utils/validateNickname';

// 닉네임 검증 상태
export type NicknameStatus = 'idle' | 'length' | 'format' | 'duplicate' | 'available';

export const NICKNAME_MESSAGE: Record<Exclude<NicknameStatus, 'idle'>, { text: string; tone: 'error' | 'success' }> = {
  length: { text: '2~10자의 닉네임을 입력해 주세요.', tone: 'error' },
  format: { text: '형식에 맞지 않는 닉네임입니다.', tone: 'error' },
  duplicate: { text: '사용 중인 닉네임입니다.', tone: 'error' },
  available: { text: '사용 가능한 닉네임입니다.', tone: 'success' },
};

// 공용으로 쓰는 닉네임 중복확인 로직
export function useNicknameCheck(initialNickname = '') {
  const [nickname, setNickname] = useState(initialNickname);
  const [status, setStatus] = useState<NicknameStatus>('idle');
  const latestNicknameRef = useRef(nickname);
  latestNicknameRef.current = nickname;

  const { mutate: checkNickname, isPending } = useCheckNickname();

  // 닉네임 수정 시 이전 검증 결과 초기화
  const handleNicknameChange = (value: string) => {
    setNickname(value);
    setStatus('idle');
  };

  // 형식 검증만 수행하고 실패 시 상태에 반영 / 통과하면 true.
  const validateFormat = () => {
    const formatError = validateNicknameFormat(nickname);
    if (formatError) {
      setStatus(formatError);
      return false;
    }
    return true;
  };

  // 중복확인
  const checkDuplicate = () => {
    if (!validateFormat()) return;
    const requested = nickname;
    checkNickname(requested, {
      onSuccess: (data) => {
        if (requested !== latestNicknameRef.current) return;
        setStatus(data.available ? 'available' : 'duplicate');
      },
    });
  };

  // 최종 저장 시점에 서버가 중복(409)을 반환하면 중복 상태로 표시
  const markDuplicate = () => setStatus('duplicate');

  const message = status === 'idle' ? null : NICKNAME_MESSAGE[status];
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
