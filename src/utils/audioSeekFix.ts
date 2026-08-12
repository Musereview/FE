// MediaRecorder로 만든 webm/opus 녹음 파일은 컨테이너에 duration/탐색(seek) 메타데이터가 없어서
// (duration이 Infinity거나 실제보다 짧게 나옴) 크롬 계열 브라우저가 currentTime을 파일 중간의
// 임의 지점(0이 아닌 곳)으로 정확히 이동시키지 못하는 경우가 있다 — 분석 화면에서 특정 마디부터
// 재생하려고 그 마디의 시각으로 seek할 때처럼, 처음이 아닌 위치로 이동해야 하는 곳에서 문제가 된다.
//
// 아주 먼 시각으로 한 번 seek하면 브라우저가 파일 전체를 스캔하며 duration/탐색 정보를 다시 계산하는데,
// 이 과정을 거친 뒤에는 원하는 시각으로 정확히 seek할 수 있게 된다.
const FAR_SEEK_SEC = 24 * 60 * 60; // 실제 녹음보다 항상 큰, 임의의 "아주 먼 미래" 시각

/** duration/탐색 메타데이터가 깨진 녹음 파일에서도 정확히 targetSec으로 이동한다. */
export function seekAudio(audio: HTMLAudioElement, targetSec: number): Promise<void> {
  return new Promise((resolve) => {
    const run = () => {
      const applyTarget = () => {
        audio.currentTime = targetSec;
        resolve();
      };

      // duration이 이미 유한값이어도 크롬이 "틀린(짧은)" 값을 보고하는 경우가 있어 신뢰하지 않고
      // 매번 먼 시각으로 한 번 seek해 브라우저가 duration/탐색 범위를 다시 계산하게 강제한다.
      const onTimeUpdate = () => {
        audio.removeEventListener('timeupdate', onTimeUpdate);
        applyTarget();
      };
      audio.addEventListener('timeupdate', onTimeUpdate);
      audio.currentTime = FAR_SEEK_SEC;
    };

    // readyState 0(메타데이터 미로딩)일 땐 currentTime 대입이 무시되므로 로딩을 먼저 기다린다
    if (audio.readyState > 0) {
      run();
    } else {
      audio.addEventListener('loadedmetadata', run, { once: true });
    }
  });
}
