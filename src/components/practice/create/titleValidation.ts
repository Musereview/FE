export const TITLE_MAX_LENGTH = 30;
const TITLE_PATTERN = /^[a-zA-Z0-9가-힣\s]*$/;

export function isValidTitle(value: string) {
  return value.length <= TITLE_MAX_LENGTH && TITLE_PATTERN.test(value);
}
