// 닉네임 형식 검증 유틸
export const NICKNAME_MIN_LENGTH = 2;
export const NICKNAME_MAX_LENGTH = 10;

// 공백/특수문자 없이 한글, 영문, 숫자만 허용
const NICKNAME_CHAR_REGEX = /^[가-힣a-zA-Z0-9]+$/;

export type NicknameFormatError = 'length' | 'format';

// 형식 오류 종류 반환, 통과 시 null 반환
export function validateNicknameFormat(nickname: string): NicknameFormatError | null {
  if (nickname.length < NICKNAME_MIN_LENGTH || nickname.length > NICKNAME_MAX_LENGTH) {
    return 'length';
  }
  if (!NICKNAME_CHAR_REGEX.test(nickname)) {
    return 'format';
  }
  return null;
}
