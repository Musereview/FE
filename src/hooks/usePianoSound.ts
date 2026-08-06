// 건반 입력 → 신디 사운드 재생 훅
// Tone.immediate()로 lookAhead(기본 0.1s)를 우회해, 누른 시점과 소리 시점 차이를 최소화한다.
// (메트로놈 Transport의 lookAhead는 건드리지 않으므로 반주 스케줄링은 영향 없음)
import { useEffect, useRef } from 'react';
import * as Tone from 'tone';

export function usePianoSound() {
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamDestRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const chunksRef = useRef<Blob[]>([]);

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
      if (recorderRef.current && recorderRef.current.state !== 'inactive') recorderRef.current.stop();
      recorderRef.current = null;
      streamDestRef.current?.disconnect();
      streamDestRef.current = null;
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

  // 녹음 시작: 신디 출력을 스피커 출력과 별개로 MediaStream으로 뽑아 MediaRecorder에 연결
  // (이전 녹음이 남아있으면 먼저 정리하고 새로 시작)
  const startRecording = () => {
    // 서버에 업로드 가능한 포맷(webm/ogg)만 후보로 두고, 지원되는 것만 명시적으로 전달
    // (mp3/wav는 브라우저가 녹음 시점에 직접 만들어주지 않아 후보에서 제외)
    const supportedMimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/ogg'].find(
      (type) => MediaRecorder.isTypeSupported(type),
    );
    if (!supportedMimeType) {
      throw new Error('현재 브라우저는 오디오 녹음을 지원하지 않습니다.');
    }

    if (recorderRef.current && recorderRef.current.state !== 'inactive') recorderRef.current.stop();
    streamDestRef.current?.disconnect();

    const synth = getSynth();
    const rawContext = Tone.getContext().rawContext as AudioContext;
    const dest = rawContext.createMediaStreamDestination();
    synth.connect(dest);
    streamDestRef.current = dest;

    const recorder = new MediaRecorder(dest.stream, { mimeType: supportedMimeType });
    chunksRef.current = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.start();
    recorderRef.current = recorder;
  };

  const pauseRecording = () => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.pause();
  };

  const resumeRecording = () => {
    if (recorderRef.current?.state === 'paused') recorderRef.current.resume();
  };

  // 녹음 종료: 지금까지 모은 청크를 하나의 webm Blob으로 합쳐 반환 (녹음 중이 아니었으면 null)
  const stopRecording = (): Promise<Blob | null> => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === 'inactive') return Promise.resolve(null);

    return new Promise((resolve) => {
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        chunksRef.current = [];
        streamDestRef.current?.disconnect();
        streamDestRef.current = null;
        recorderRef.current = null;
        resolve(blob);
      };
      recorder.stop();
    });
  };

  return { noteOn, noteOff, releaseAll, startRecording, pauseRecording, resumeRecording, stopRecording };
}
