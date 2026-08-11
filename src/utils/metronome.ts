import * as Tone from 'tone';

// 버퍼 로딩이 이 시간 안에 끝나지 않으면 실패로 간주 (fetch가 응답 없이 멈추는 경우 대비 — onerror만으론 못 잡음)
const BUFFER_LOAD_TIMEOUT_MS = 10000;

// ToneAudioBuffer는 onerror를 인스턴스 프로퍼티가 아니라 생성자 인자로만 받으므로(내부적으로
// load(url).catch(onerror)에 연결됨), 생성과 동시에 성공/실패/타임아웃을 모두 반영하는 ready
// 프로미스를 만들어 반환한다. 요청 실패나 무응답 시 reject로 명시적으로 settle되어야 호출 측
// await가 영원히 걸려있지 않고 실패를 감지해 카운트다운 등을 취소할 수 있다.
const loadBuffer = (url: string) => {
  let buffer!: Tone.ToneAudioBuffer;
  const ready = new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('클릭음 버퍼 로딩 시간 초과')), BUFFER_LOAD_TIMEOUT_MS);
    buffer = new Tone.ToneAudioBuffer(
      url,
      () => {
        clearTimeout(timer);
        resolve();
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
  return { buffer, ready };
};

export function createMetronome() {
  const transport = Tone.getTransport();

  // 음원 버퍼를 미리 로드 (파일은 한 번만 받음)
  // 두 버퍼 로드가 모두 끝난 뒤에야 resolve — 로딩 도중 재생을 시작하면 첫 박 클릭음이
  // buffer.loaded===false라 소리 없이 스킵되므로, 호출 측에서 이 프로미스를 기다린 뒤 start()해야 한다.
  const hi = loadBuffer('/sounds/click1.mp3');
  const lo = loadBuffer('/sounds/click2.mp3');
  const hiBuffer = hi.buffer;
  const loBuffer = lo.buffer;
  const ready = Promise.all([hi.ready, lo.ready]).then(() => undefined);
  // ready는 버퍼 생성 즉시(호출 측이 await하기 전부터) 로딩을 시작하므로, 실패가 await 이전에 먼저
  // settle되면 콘솔에 unhandled rejection 경고가 뜬다. 실제 오류 처리는 각 호출부의 await ready()에서
  // 하므로, 여기선 경고만 막기 위한 빈 catch를 별도로 붙여둔다 (원본 ready는 그대로 반환해 정상 reject됨).
  ready.catch(() => {});

  return {
    ready,
    /**
     * @param startOffsetSec 이미 진행 중인 오디오에 맞춰 시작할 위치(초).
     *   0이 아니면 그 지점부터 Transport를 돌려 마디 첫 박이 제자리에 떨어지게 한다.
     *   (일시정지 후 재생처럼 오디오만 이어지는 경우 0에서 다시 시작하면 박이 어긋난다)
     */
    start(
      bpm: number,
      beatsPerBar: number,
      onBeat: (time: number, beatInBar: number) => boolean | void,
      startOffsetSec = 0,
    ) {
      transport.stop();
      transport.cancel();

      transport.bpm.value = bpm;

      // Tone.start()로 막 resume된 AudioContext는 state가 "running"으로 바뀐 뒤에도 실제 오디오
      // 출력 파이프라인이 샘플을 내보내기 시작하기까지 브라우저/OS별로 짧은 지연이 있어, 이 시점에
      // 예약되는 첫 클릭음이 씹히는 경우가 있다(WebAudio/Tone.js 공통으로 보고되는 현상,
      // https://github.com/Tonejs/Tone.js/issues/893). 무음에 가까운 클릭을 하나 먼저 즉시 재생해
      // 파이프라인을 깨워두면 바로 뒤에 예약되는 실제 첫 박이 그 공백에 걸리지 않는다.
      if (startOffsetSec === 0 && loBuffer.loaded) {
        const primer = new Tone.Player(loBuffer).toDestination();
        primer.volume.value = -60;
        primer.start();
        primer.onstop = () => primer.dispose();
      }

      // scheduleRepeat은 0, 1박, 2박... 위치에 예약되므로 오프셋 이후 처음 울릴 박부터 세기 시작한다
      const secondsPerBeat = 60 / bpm;
      let beat = startOffsetSec > 0 ? Math.ceil(startOffsetSec / secondsPerBeat) : 0;
      transport.scheduleRepeat((time) => {
        const beatInBar = beat % beatsPerBar;
        // onBeat이 false를 반환하면(곡이 끝난 박) 클릭 소리를 재생하지 않음
        const shouldClick = onBeat(time, beatInBar) !== false;

        if (shouldClick) {
          const buffer = beatInBar === 0 ? hiBuffer : loBuffer;
          if (buffer.loaded) {
            // 매 박마다 새 Player 생성 → 겹침 없음, 재생 후 자동 정리
            const player = new Tone.Player(buffer).toDestination();
            player.start(time);
            player.onstop = () => player.dispose();
          }
        }
        beat += 1;
      }, '4n');
      transport.start(undefined, startOffsetSec);
    },
    stop(time?: number) {
      transport.stop(time);
      transport.cancel(time);
    },
    pause() {
      transport.pause(); // 현재 위치 유지하고 멈춤
    },
    resume() {
      transport.start(); // 일시정지 지점부터 이어서 재생
    },
    dispose() {
      hiBuffer.dispose();
      loBuffer.dispose();
    },
  };
}

export type Metronome = ReturnType<typeof createMetronome>;
