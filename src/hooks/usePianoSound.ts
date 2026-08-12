// 건반 입력 → 신디 사운드 재생 훅
// Tone.immediate()로 lookAhead(기본 0.1s)를 우회해, 누른 시점과 소리 시점 차이를 최소화한다.
// (메트로놈 Transport의 lookAhead는 건드리지 않으므로 반주 스케줄링은 영향 없음)
import { useEffect, useRef } from 'react';
import * as Tone from 'tone';

// 진행 중인 녹음 하나를 이루는 recorder/destination/청크 묶음
// (recorder별로 묶어서 관리해야 늦게 도착한 이전 recorder의 onstop이 이미 시작된 새 녹음을 건드리지 않음)
interface RecordingSession {
  recorder: MediaRecorder;
  dest: MediaStreamAudioDestinationNode;
  chunks: Blob[];
  keepAlive: Tone.Oscillator; // 아래 startRecording 주석 참고 — 완전한 디지털 무음이 되는 걸 막기 위한 신호원
}

export function usePianoSound() {
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const sessionRef = useRef<RecordingSession | null>(null);
  const disposedRef = useRef(false); // 언마운트 후 지연 초기화로 신디가 되살아나는 것 방지

  // 신디는 한 번만 생성 (지연 초기화)
  const getSynth = () => {
    if (disposedRef.current) return null; // 늦게 도착한 입력이 새 신디를 만들어 소리내지 않도록
    if (!synthRef.current) {
      synthRef.current = new Tone.PolySynth(Tone.Synth).toDestination();
      synthRef.current.volume.value = -4; // 화음 시 클리핑 방지
    }
    return synthRef.current;
  };

  useEffect(() => {
    disposedRef.current = false; // StrictMode 이중 마운트 대비
    return () => {
      disposedRef.current = true;
      const session = sessionRef.current;
      if (session) {
        if (session.recorder.state !== 'inactive') session.recorder.stop();
        session.keepAlive.dispose();
        synthRef.current?.disconnect(session.dest); // dest.disconnect()는 dest 쪽 연결만 끊을 뿐, synth가 물고 있는 엣지는 남는다
        session.dest.disconnect();
        sessionRef.current = null;
      }
      synthRef.current?.releaseAll();
      synthRef.current?.dispose();
      synthRef.current = null;
    };
  }, []);

  // 누름: 즉시 소리 시작 (velocity 0~127 → 0~1)
  const noteOn = (midi: number, velocity = 100) => {
    const note = Tone.Frequency(midi, 'midi').toNote();
    getSynth()?.triggerAttack(note, Tone.immediate(), velocity / 127);
  };

  // 뗌: 즉시 소리 끝 (홀드 길이 반영)
  const noteOff = (midi: number) => {
    const note = Tone.Frequency(midi, 'midi').toNote();
    getSynth()?.triggerRelease(note, Tone.immediate());
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

    // 직전 세션이 stopRecording()을 거치지 않고 남아있는 경우를 위한 안전망 (정상 경로는 항상 stopRecording 이후 호출됨)
    const prevSession = sessionRef.current;
    if (prevSession) {
      if (prevSession.recorder.state !== 'inactive') prevSession.recorder.stop();
      prevSession.keepAlive.dispose();
      synthRef.current?.disconnect(prevSession.dest); // dest.disconnect()는 dest 쪽 연결만 끊을 뿐, synth가 물고 있는 엣지는 남는다
      prevSession.dest.disconnect();
    }

    const synth = getSynth();
    if (!synth) return; // 언마운트된 훅에서는 녹음을 시작 X
    const rawContext = Tone.getContext().rawContext as AudioContext;
    const dest = rawContext.createMediaStreamDestination();
    synth.connect(dest);

    // MediaStreamAudioDestinationNode의 스트림이 완전한 디지털 무음(값이 계속 정확히 0)만 흐르면
    // 크롬이 트랙을 muted 상태로 판단해 MediaRecorder가 그 구간을 아예 기록하지 않는 경우가 있다 —
    // 연주 시작 전 사용자가 가만히 있는 무음 구간이 녹음 파일에서 통째로 사라지는 원인.
    // 사람이 들을 수 없는(-100dB) 신호를 계속 흘려보내 스트림이 항상 "활성" 상태를 유지하게 한다.
    const keepAlive = new Tone.Oscillator(20, 'sine').connect(dest);
    keepAlive.volume.value = -100;
    keepAlive.start();

    const recorder = new MediaRecorder(dest.stream, { mimeType: supportedMimeType });
    const chunks: Blob[] = [];
    const session: RecordingSession = { recorder, dest, chunks, keepAlive };
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    recorder.start();
    sessionRef.current = session;
  };

  const pauseRecording = () => {
    const recorder = sessionRef.current?.recorder;
    if (recorder?.state === 'recording') recorder.pause();
  };

  const resumeRecording = () => {
    const recorder = sessionRef.current?.recorder;
    if (recorder?.state === 'paused') recorder.resume();
  };

  // 녹음 종료: 지금까지 모은 청크를 하나의 webm Blob으로 합쳐 반환 (녹음 중이 아니었으면 null)
  const stopRecording = (): Promise<Blob | null> => {
    const session = sessionRef.current;
    if (!session || session.recorder.state === 'inactive') return Promise.resolve(null);

    const { recorder, dest, chunks, keepAlive } = session;
    return new Promise((resolve) => {
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
        keepAlive.dispose();
        synthRef.current?.disconnect(dest); // dest.disconnect()는 dest 쪽 연결만 끊을 뿐, synth가 물고 있는 엣지는 남는다
        dest.disconnect();
        // 이 recorder가 여전히 "현재" 세션일 때만 공유 ref 정리 (그 사이 새 녹음이 시작됐다면 건드리지 않음)
        if (sessionRef.current === session) sessionRef.current = null;
        resolve(blob);
      };
      recorder.stop();
    });
  };

  return { noteOn, noteOff, releaseAll, startRecording, pauseRecording, resumeRecording, stopRecording };
}
