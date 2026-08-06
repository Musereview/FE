// 이 브라우저 탭 세션에서 Tone.start()가 사용자 제스처로 이미 풀렸는지 여부.
// 새로고침(하드 리로드)하면 자동으로 false로 리셋된다.
let unlocked = false;

export function markAudioUnlocked() {
  unlocked = true;
}

export function isAudioUnlocked() {
  return unlocked;
}
