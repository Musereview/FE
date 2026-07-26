import * as Tone from 'tone';

export function createMetronome() {
  const transport = Tone.getTransport();

  // 음원 버퍼를 미리 로드 (파일은 한 번만 받음)
  const hiBuffer = new Tone.ToneAudioBuffer('/sounds/click1.mp3');
  const loBuffer = new Tone.ToneAudioBuffer('/sounds/click2.mp3');

  return {
    start(bpm: number, beatsPerBar: number, onBeat: (time: number, beatInBar: number) => void) {
      transport.stop();
      transport.cancel();

      let beat = 0;
      transport.bpm.value = bpm;
      transport.scheduleRepeat((time) => {
        const beatInBar = beat % beatsPerBar;
        const buffer = beatInBar === 0 ? hiBuffer : loBuffer;

        if (buffer.loaded) {
          // 매 박마다 새 Player 생성 → 겹침 없음, 재생 후 자동 정리
          const player = new Tone.Player(buffer).toDestination();
          player.start(time);
          player.onstop = () => player.dispose();
        }
        onBeat(time, beatInBar);
        beat += 1;
      }, '4n');
      transport.start();
    },
    stop() {
      transport.stop();
      transport.cancel();
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
