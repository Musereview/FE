// 건반 입력 → 신디 사운드 재생 훅
// Tone.immediate()로 lookAhead(기본 0.1s)를 우회해, 누른 시점과 소리 시점 차이를 최소화한다.
// (메트로놈 Transport의 lookAhead는 건드리지 않으므로 반주 스케줄링은 영향 없음)
import { useEffect, useRef } from 'react';
import * as Tone from 'tone';

export function usePianoSound() {
  const synthRef = useRef<Tone.PolySynth | null>(null);

  // 신디는 한 번만 생성 (지연 초기화)
  const getSynth = () => {
    if (!synthRef.current) {
      synthRef.current = new Tone.PolySynth(Tone.Synth).toDestination();
      synthRef.current.volume.value = -4; // 화음 시 클리핑 방지
    }
    return synthRef.current;
  };

  useEffect(() => {
    return () => {
      synthRef.current?.releaseAll();
      synthRef.current?.dispose();
      synthRef.current = null;
    };
  }, []);

  // 누름: 즉시 소리 시작 (velocity 0~127 → 0~1)
  const noteOn = (midi: number, velocity = 100) => {
    const note = Tone.Frequency(midi, 'midi').toNote();
    getSynth().triggerAttack(note, Tone.immediate(), velocity / 127);
  };

  // 뗌: 즉시 소리 끝 (홀드 길이 반영)
  const noteOff = (midi: number) => {
    const note = Tone.Frequency(midi, 'midi').toNote();
    getSynth().triggerRelease(note, Tone.immediate());
  };

  // 울리고 있는 모든 소리 즉시 끊기 (정지/일시정지 등)
  const releaseAll = () => synthRef.current?.releaseAll(Tone.immediate());

  return { noteOn, noteOff, releaseAll };
}
