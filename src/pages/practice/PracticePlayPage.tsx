// 연습 플레이 페이지 - 61건반/88건반
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as Tone from 'tone';
import Piano from '@/components/piano/Piano';
import PracticeNoteBars, { type LiveNoteBar } from '@/components/piano/PracticeNoteBars';
import { noteCenterFraction } from '@/constants/piano';
import MetronomeDots from '@/components/metronome/MetronomeDots';
import BackingTrack from '@/components/practice/BackingTrack';
import { useActiveNotes } from '@/hooks/useActiveNotes';
import { useDeviceConnection } from '@/hooks/useDeviceConnection';
import { useMetronome } from '@/hooks/useMetronome';
import { usePianoSound } from '@/hooks/usePianoSound';
import { useSettingStore } from '@/stores/settingsStore';
import { usePracticeResultStore, type PlayedNote } from '@/stores/practiceResultStore';
import { usePlayingSessionStore } from '@/stores/playingSessionStore';
import { getRecordingUploadUrl, saveMidiEvents } from '@/apis/practice';
import { uploadRecordingToS3 } from '@/utils/s3Upload';
import { toMidiEventPayload } from '@/utils/midiEventPayload';
import { isAudioUnlocked } from '@/utils/audioUnlock';
import { buildFallbackProgression, mapDetailToTrack, MODE_LABEL } from '@/pages/practice/trackDisplay';
import PlayIcon from '@/assets/practice/play.svg?react';
import StopIcon from '@/assets/practice/stop.svg?react';
import RefreshIcon from '@/assets/restart.svg?react';
import CheckIcon from '@/assets/check.svg?react';
import ChangeIcon from '@/assets/change.svg?react';
import SettingsIcon from '@/assets/setting.svg?react';
import DeviceDisconnectedModal from '@/components/common/DeviceDisconnectedModal';
import LoadingPage from '@/pages/common/LoadingPage';

const PX_PER_BEAT = 120; // 노트바 길이 환산: 1박 = 120px
const COUNTDOWN_BEATS = 4; // 재생 전 카운트다운 박 수 (4,3,2,1)

function PracticePlayPage() {
  const navigate = useNavigate();
  const { practiceId } = useParams();
  const { keyCount, inputId, latencyByDevice } = useSettingStore();
  const { start, stop, pause, resume, ready } = useMetronome();
  const {
    noteOn: playNote,
    noteOff: stopNote,
    releaseAll,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
  } = usePianoSound();
  const setResult = usePracticeResultStore((s) => s.setResult);
  const backingTrack = usePlayingSessionStore((s) => s.backingTrack);
  const playingId = usePlayingSessionStore((s) => s.playingId);

  const track = useMemo(() => (backingTrack ? mapDetailToTrack(backingTrack) : null), [backingTrack]);
  const beatsPerBar = track ? Number(track.timeSignature.split('/')[0]) : 4; // '4/4' → 4
  const measures = track ? (track.chordProgression ?? buildFallbackProgression(track.chords, beatsPerBar)) : [];
  const totalCells = measures.length * beatsPerBar;
  const pxPerMs = (PX_PER_BEAT * (track?.bpm ?? 0)) / 60000; // 노트바 길이: 1박 = PX_PER_BEAT px

  const [isPlaying, setIsPlaying] = useState(false);
  const [beatInBar, setBeatInBar] = useState(-1); // 진행점 (마디 내 0-based)
  const [currentBeat, setCurrentBeat] = useState(-1); // 백킹트랙 전체 진행 박
  const [countdown, setCountdown] = useState<number | null>(null); // 재생 전 카운트다운(4→1), null이면 비표시
  const [noteBars, setNoteBars] = useState<LiveNoteBar[]>([]); // 연습 노트바 (가변 길이)
  const [isAnalyzing, setIsAnalyzing] = useState(false); // 분석하기 클릭 후 업로드·저장 대기 중 로딩 화면
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const totalBeatRef = useRef(0);
  const barIdRef = useRef(0);
  const heldRef = useRef<Map<number, number>>(new Map()); // midi → 진행 중 노트바 id
  const recordingRef = useRef<PlayedNote[]>([]); // 연주 녹음 (Transport 시각 기준)
  const recordingFinalizedRef = useRef(false); // 분석 재시도 시 stopRecording을 중복 호출하지 않도록(오디오 유실 방지)
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null); // 진입 시 자동재생 예약
  const finishTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null); // 곡 끝 → 분석 화면 이동 예약
  const pauseStartRef = useRef(performance.now()); // 정지 시각 (노트바 얼림 기준 + 재개 시 보정)
  const countdownEndedRef = useRef(false); // 카운트다운 종료 중복 예약 방지
  const isMountedRef = useRef(true); // 언마운트 후 await 재개 시 재생 시작 방지
  const countdownTokenRef = useRef(0); // 클릭음 버퍼 로딩 대기 중 재시작/언마운트가 끼어들면 이전 대기를 무효화

  // 반주 음원(audioFileUrl)을 메트로놈/녹음과 같은 Tone.Transport 타임라인에 동기화해 함께 재생
  // (카운트인 중엔 sync하지 않음 — 실제 곡 재생이 시작되는 startPlayback()에서만 sync)
  const playerRef = useRef<Tone.Player | null>(null);
  const isPlaybackActiveRef = useRef(false); // 카운트인이 아닌 '실제 곡 재생' 중인지 (지연 로딩 콜백이 카운트인 중엔 끼어들지 않도록)
  useEffect(() => {
    const url = track?.audioFileUrl;
    if (!url) return;
    // 로딩(fetch+decode)이 카운트다운보다 늦게 끝나는 경우를 대비 — 이미 재생이 시작된 뒤라면 그 시점에 뒤늦게라도 동기화해 재생
    const player = new Tone.Player(url, () => {
      if (playerRef.current === player && isPlaybackActiveRef.current) {
        player.sync().start(0);
        // MR 실제 길이만큼 지난 시점(=MR이 스스로 끝나는 시점)에 정지 예약 — 백킹트랙 박 수와 무관하게 MR 종료가 기준
        Tone.getTransport().scheduleOnce(() => finishPlayback(), player.buffer.duration);
      }
    }).toDestination();
    playerRef.current = player;
    return () => {
      player.unsync();
      player.dispose();
      playerRef.current = null;
    };
  }, [track?.audioFileUrl]);

  // 친 음: 소리 재생 + 노트바 생성(성장 시작) → 뗄 때 소리·길이 확정 후 위로 사라짐
  const handleNoteOn = (note: number, velocity = 100) => {
    playNote(note, velocity); // 즉시 소리 (범위와 무관하게 실제 친 음)
    // 녹음: 실제 친 음 전부 기록 (Transport 시각 = 곡 박자 기준)
    recordingRef.current.push({ midi: note, velocity, onSec: Tone.getTransport().seconds, offSec: null });
    if (noteCenterFraction(note, keyCount) < 0) return; // 노트바는 건반 범위 안만
    const id = barIdRef.current++;
    heldRef.current.set(note, id);
    setNoteBars((prev) => [...prev, { id, midi: note, startTime: performance.now(), endTime: null }]);
  };
  const handleNoteOff = (note: number) => {
    stopNote(note); // 즉시 소리 끝
    // 녹음: 같은 음의 마지막 열린 노트에 뗀 시각 기록
    for (let i = recordingRef.current.length - 1; i >= 0; i--) {
      const rec = recordingRef.current[i];
      if (rec.midi === note && rec.offSec === null) {
        rec.offSec = Tone.getTransport().seconds;
        break;
      }
    }
    const id = heldRef.current.get(note);
    if (id === undefined) return;
    heldRef.current.delete(note);
    setNoteBars((prev) => prev.map((b) => (b.id === id ? { ...b, endTime: performance.now() } : b)));
  };
  const handleBarDone = useCallback((id: number) => setNoteBars((prev) => prev.filter((b) => b.id !== id)), []);

  const triggerToast = useCallback((msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 3000);
  }, []);

  const { activeNotes, inputs, reset: resetInput } = useActiveNotes(handleNoteOn, handleNoteOff, isPlaying); // 정지 중엔 입력 무시
  const { disconnected } = useDeviceConnection(inputs); // 선택 기기 연결 끊김 감지

  // 백킹트랙에서 지금 차례인 코드 (null은 직전 코드 유지)
  const flatChords = measures.flat();
  const currentChord =
    currentBeat < 0
      ? null
      : (flatChords
          .slice(0, currentBeat + 1)
          .filter(Boolean)
          .pop() ?? null);

  // 정지/일시정지 시점에 아직 눌린(열린) 노트를 그 순간으로 확정·해제
  // → 이후 비활성 중 들어오는 note-off는 이미 닫힌 노트라 이벤트에 영향 없음(하이라이트 해제만)
  const finalizeOpenNotes = (atWall: number) => {
    const atSec = Tone.getTransport().seconds; // 정지 지점 (transport 시각, 정지 중 멈춰 있음)
    for (const rec of recordingRef.current) {
      if (rec.offSec === null) rec.offSec = atSec; // 녹음: 열린 노트 종료
    }
    setNoteBars((prev) => prev.map((b) => (b.endTime === null ? { ...b, endTime: atWall } : b))); // 노트바 종료
    heldRef.current.clear();
    releaseAll(); // 홀드된 소리 즉시 끊기
    resetInput(); // 눌린 건반 표시 초기화 (stuck 방지)
  };

  // 예약된 자동재생(START 타이머) + 곡 끝 분석 이동 타이머 취소
  const cancelAutoStart = () => {
    if (startTimerRef.current) {
      clearTimeout(startTimerRef.current);
      startTimerRef.current = null;
    }
    if (finishTimerRef.current) {
      clearTimeout(finishTimerRef.current);
      finishTimerRef.current = null;
    }
  };

  const stopPlayback = () => {
    cancelAutoStart(); // 재시작/분석 등으로 정지 시 대기 중인 자동재생 취소
    countdownTokenRef.current += 1; // 버퍼 로딩 대기 중이던 이전 runCountdown 무효화
    isPlaybackActiveRef.current = false; // 지연 로딩 onload가 이후엔 재생을 시작하지 않도록
    finalizeOpenNotes(performance.now()); // stop() 전에 (stop이 transport 위치를 0으로 리셋하므로)
    stop();
    Tone.getDraw().cancel();
    const player = playerRef.current;
    if (player) {
      player.unsync();
      if (player.state === 'started') player.stop();
    }
    setIsPlaying(false);
    setBeatInBar(-1);
    setCurrentBeat(-1);
    setCountdown(null); // 카운트다운 도중 정지 시 화면에 숫자가 멈춰 남지 않도록
  };

  // MR 종료(실제 오디오 길이 도달) 시 호출됨 — 백킹트랙/메트로놈도 그 시점에 맞춰 함께 정지.
  // 진행점·노트바는 끝 지점 그대로 두고(정지 버튼과 달리 위치 리셋 안 함) 2초 후 "분석하기"와 동일한 플로우로 자동 진행
  const finishPlayback = () => {
    isPlaybackActiveRef.current = false; // 지연 로딩 onload가 이후엔 재생을 시작하지 않도록
    finalizeOpenNotes(performance.now());
    pauseRecording(); // 곡이 끝난 시점에 녹음도 함께 멈춤 (분석 화면 이동 대기 중 무음 구간이 섞이지 않도록)
    stop();
    Tone.getDraw().cancel();
    const player = playerRef.current;
    if (player) {
      player.unsync();
      if (player.state === 'started') player.stop();
    }
    setIsPlaying(false);
    // beatInBar/currentBeat/노트바 모두 유지 (끝 지점 상태 그대로)
    finishTimerRef.current = setTimeout(() => handleAnalyze(), 2000);
  };

  // 카운트다운(4,3,2,1): 메트로놈 박에 맞춰 숫자를 표시하고, 끝나면 START 안내 후 실제 재생 시작
  const runCountdown = async () => {
    cancelAutoStart(); // 대기 중인 자동재생 취소 (중복 시작 방지)
    const token = ++countdownTokenRef.current;
    setCountdown(COUNTDOWN_BEATS); // await 전에 먼저 반영 — 재시작 시 이전 숫자가 멈춰 보이지 않도록
    countdownEndedRef.current = false;
    await Tone.start(); // 오디오 잠금 해제 (클릭 핸들러 안에서만 가능)
    try {
      await ready(); // 클릭음 버퍼 로딩이 끝난 뒤에야 카운트다운(소리+화면)을 시작 — 첫 박 소리 유실 방지
    } catch (error) {
      if (!isMountedRef.current || token !== countdownTokenRef.current) return; // 언마운트/재시작 시 무시
      console.error('클릭음 버퍼 로딩 실패', error);
      setCountdown(null); // 숫자가 멈춰 남지 않도록 취소 — 재생 버튼으로 다시 시도 가능한 상태로 복귀
      return;
    }

    if (!isMountedRef.current || token !== countdownTokenRef.current) return; // 언마운트/재시작 시 중단

    let cbeat = 0;
    // 카운트다운 중엔 진행점을 채우지 않는다(setBeatInBar 호출 안 함) — 실제 재생은 startPlayback()에서 시작
    // 곡 박자(3/4 등)와 무관하게 카운트인은 항상 4박 "1(강)-2-3-4"로 들리게 beatsPerBar 대신 COUNTDOWN_BEATS 사용
    start(track?.bpm ?? 0, COUNTDOWN_BEATS, (time) => {
      if (cbeat >= COUNTDOWN_BEATS) {
        if (countdownEndedRef.current) return false; // 중복 예약 방지
        countdownEndedRef.current = true;
        Tone.getDraw().schedule(() => {
          stop();
          Tone.getDraw().cancel();
          setCountdown(null);
          startPlayback();
        }, time);
        return false;
      }
      const current = cbeat;
      Tone.getDraw().schedule(() => {
        setCountdown(COUNTDOWN_BEATS - current);
      }, time);
      cbeat += 1;
    });
  };

  const startPlayback = async () => {
    cancelAutoStart(); // 대기 중인 자동재생 취소 (중복 시작 방지)
    // 카운트다운 종료 콜백에서 호출된 경우, await 도중 재시작(stopPlayback)이 끼어들면 토큰이 바뀌어 무효화된다 —
    // 안 그러면 새로 시작한 카운트다운을 이 stale 호출이 뒤늦게 가로채 곧장 재생을 시작시켜버린다
    const token = ++countdownTokenRef.current;
    setCountdown(null);
    await Tone.start(); // 오디오 잠금 해제 (클릭 핸들러 안에서만 가능)
    if (!isMountedRef.current || token !== countdownTokenRef.current) return; // 언마운트/재시작 시 중단
    totalBeatRef.current = 0;
    recordingRef.current = []; // 처음부터 재생 시 녹음 초기화
    await stopRecording(); // 이전 녹음(있다면) 정리 후 새로 시작
    if (!isMountedRef.current || token !== countdownTokenRef.current) return; // 언마운트/재시작 시 중단
    try {
      startRecording();
    } catch {
      // 브라우저가 녹음을 지원하지 않아도 연주 자체는 계속 진행 (분석 저장만 불가)
      triggerToast('현재 브라우저에서는 연주 녹음을 지원하지 않습니다.');
    }
    setIsPlaying(true);
    isPlaybackActiveRef.current = true; // 실제 곡 재생 시작 — 이 시점부턴 지연 로딩 onload도 재생을 시작해도 됨
    // 메트로놈 start()가 내부적으로 transport.stop()/cancel()을 먼저 실행하므로 그보다 먼저 반주를 sync하면
    // 방금 건 예약(0초 재생)이 cancel()에 지워짐 — 그래서 metronome start()가 끝난 뒤에 sync().start(0)를 건다.
    start(track?.bpm ?? 0, beatsPerBar, (time, bib) => {
      // MR이 끝날 때까지는 코드 진행을 반복 순환시켜 백킹트랙을 계속 진행 (정지는 MR 종료 예약이 담당)
      const beat = totalBeatRef.current % totalCells;
      Tone.getDraw().schedule(() => {
        setBeatInBar(bib);
        setCurrentBeat(beat);
      }, time);
      totalBeatRef.current += 1;
    });
    const player = playerRef.current;
    if (player?.loaded) {
      player.sync().start(0);
      // MR 실제 길이만큼 지난 시점(=MR이 스스로 끝나는 시점)에 정지 예약 — 백킹트랙 박 수와 무관하게 MR 종료가 기준
      Tone.getTransport().scheduleOnce(() => finishPlayback(), player.buffer.duration);
    }
  };

  // 정지: 화면 그대로 멈춤(진행 상태 유지) / 재생: 이어서
  const pausePlayback = () => {
    pause();
    pauseStartRef.current = performance.now();
    finalizeOpenNotes(pauseStartRef.current); // 정지 시점에 열린 노트 확정 (정지 시간이 길이에 안 껴들게)
    pauseRecording();
    setIsPlaying(false);
  };
  const resumePlayback = () => {
    // 정지한 시간만큼 노트바 시각을 밀어 이어서 그려지게 (튐 방지)
    const pausedMs = performance.now() - pauseStartRef.current;
    setNoteBars((prev) =>
      prev.map((b) => ({
        ...b,
        startTime: b.startTime + pausedMs,
        endTime: b.endTime !== null ? b.endTime + pausedMs : null,
      })),
    );
    // 재개 시 입력·사운드 상태 리셋 — 누른 채 정지했을 때 남는 stuck/먹통 방지
    heldRef.current.clear();
    releaseAll();
    resetInput();
    resume();
    resumeRecording();
    setIsPlaying(true);
  };
  const handlePlayToggle = () => {
    if (isPlaying) pausePlayback();
    else if (Tone.getTransport().state === 'paused')
      resumePlayback(); // 일시정지 상태면 이어서
    else startPlayback(); // 처음부터
  };
  const handleRestart = () => {
    stopPlayback();
    const recordingStopped = stopRecording(); // 이전 오디오 녹음 폐기 (완료를 기다린 뒤 다음 녹음 시작)
    recordingFinalizedRef.current = false; // 재시작으로 새 녹음 세션이 시작되므로 다음 분석 시 다시 stopRecording 필요
    setNoteBars([]); // 노트바 초기화
    heldRef.current.clear();
    // transport 정지가 반영된 뒤 재시작 (연속 stop→start 글리치 방지) + 이전 녹음 정리가 끝난 뒤 재시작
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
    restartTimerRef.current = setTimeout(() => {
      recordingStopped.then(() => runCountdown());
    }, 80);
  };

  // 분석: MIDI 녹음 + 레이턴시 보정값을 스토어에 저장하고, 오디오 녹음(webm)을 확정한 뒤
  // Presigned URL 발급 → S3 업로드 → MIDI 이벤트 저장(최종 완료 처리) 순으로 연동 후 분석 화면으로 이동
  // 업로드/저장 실패 시에는 분석 화면으로 넘어가지 않고 토스트로 안내 → "분석하기"를 다시 눌러 재시도
  const handleAnalyze = async () => {
    stopPlayback();
    setIsAnalyzing(true);

    // stopRecording은 최초 1회만: 재시도 시 다시 부르면 이미 정지된 recorder라 null이 나와 기존 audioBlob을 잃음
    if (!recordingFinalizedRef.current) {
      const audioBlob = await stopRecording();
      const raw = inputId ? latencyByDevice[inputId] : undefined;
      const latencyMs = typeof raw === 'number' ? raw : 0; // 미측정/실패면 0
      setResult({ trackId: practiceId, recording: recordingRef.current, latencyMs, audioBlob });
      recordingFinalizedRef.current = true;
    }
    const { audioBlob } = usePracticeResultStore.getState();

    if (audioBlob && playingId) {
      try {
        const contentType = audioBlob.type || 'audio/webm';
        const extension = contentType.includes('ogg') ? 'ogg' : 'webm'; // startRecording이 고르는 실제 포맷과 맞춤
        const { uploadUrl, objectKey, requiredHeaders } = await getRecordingUploadUrl(playingId, {
          fileName: `recording-${playingId}.${extension}`,
          contentType,
          fileSize: audioBlob.size,
        });
        await uploadRecordingToS3(uploadUrl, audioBlob, requiredHeaders);
        await saveMidiEvents(playingId, {
          events: toMidiEventPayload(recordingRef.current),
          recordingObjectKey: objectKey,
        });
      } catch (err) {
        console.error('연주 녹음 업로드/저장 실패', err);
        setIsAnalyzing(false);
        triggerToast('연주 기록 저장에 실패했습니다. 다시 시도해주세요.');
        return; // 저장이 끝날 때까지 분석 화면으로 이동하지 않음
      }
    }

    const targetId = playingId ?? practiceId;
    navigate(`/practice/${targetId}/analysis`);
  };

  // 연습 중 기기 연결이 끊기면 재생을 멈추고 모달을 띄운다
  useEffect(() => {
    if (disconnected && isPlaying) pausePlayback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disconnected]);

  // 언마운트 시 정리
  useEffect(() => {
    return () => {
      stop();
      Tone.getDraw().cancel();
      const player = playerRef.current;
      if (player) {
        player.unsync();
        if (player.state === 'started') player.stop();
      }
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, [stop]);

  // 세션 자체가 없으면(직접 진입) 목록으로, 세션은 있는데 오디오 잠금만 안 풀린 채(새로고침) 들어왔으면
  // 설정 화면으로 되돌려 "시작하기"를 다시 누르게 한다 (세션은 그대로 살아있으니 재생성 안 함).
  // Tone.start()는 클릭 제스처 안에서만 성공하는데, 새로고침 직후엔 그 제스처가 없어 재생을 시작할 수 없음.
  useEffect(() => {
    if (!backingTrack) {
      navigate('/practice', { replace: true });
    } else if (!isAudioUnlocked()) {
      navigate(`/practice/${backingTrack.backingTrackId}/settings`, { replace: true });
    }
  }, [backingTrack, navigate]);

  // 진입 시 카운트다운(4,3,2,1) → 자동 재생
  useEffect(() => {
    if (!backingTrack || !isAudioUnlocked()) return;
    isMountedRef.current = true;
    runCountdown();
    return () => {
      isMountedRef.current = false;
      countdownTokenRef.current += 1; // 버퍼 로딩 대기 중이던 runCountdown 무효화 (StrictMode 이중 마운트 포함)
      cancelAutoStart();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backingTrack]);

  if (!track) return null;

  return (
    <div className="flex h-full flex-col bg-gray-950">
      {/* 분석하기 클릭 후 업로드·저장 대기 중 (전체 화면 로딩) */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-50 bg-gray-950">
          <LoadingPage message="연주 기록을 저장하고 있습니다.." />
        </div>
      )}

      {/* 상단 알림 토스트 메시지 */}
      {toastMessage && (
        <div
          role="alert"
          className="bg-error body-small fixed top-[40px] left-1/2 z-50 flex -translate-x-1/2 items-center gap-[12px] rounded-[12px] px-[24px] py-[16px] text-gray-100 shadow-2xl">
          <span>⚠️</span> {toastMessage}
        </div>
      )}

      {/* 헤더 */}
      <header className="relative flex h-[154px] w-full items-center justify-between bg-gray-900 px-[160px] py-[28px]">
        {/* 카운트다운 중 배경 블러 + 클릭 차단 */}
        {countdown !== null && <div className="absolute inset-0 z-20 bg-gray-900/60 backdrop-blur-md" />}
        {/* Track Title*/}
        <div className="flex w-[403px] items-start gap-4">
          <button
            type="button"
            onClick={handlePlayToggle}
            aria-label={isPlaying ? '정지' : '재생'}
            className="text-primary-400 flex cursor-pointer items-center">
            {isPlaying ? <StopIcon className="h-[52px] w-[52px]" /> : <PlayIcon className="h-[52px] w-[52px]" />}
          </button>
          <div className="flex flex-col items-start gap-6">
            <div className="heading-medium-b w-[328px] text-gray-200">{track.title}</div>
            <div className="inline-flex w-fit items-center gap-[24px] rounded-[4px] bg-gray-400 px-3 py-1">
              <span className="button-label2 text-gray-900">{track.genre.toUpperCase()}</span>
              <span className="button-label2 text-gray-900">
                {track.key} {MODE_LABEL[track.mode]}
              </span>
              <span className="button-label2 text-gray-900">{track.bpm}BPM</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRestart}
            className="button-large2 flex h-[60px] w-[175px] cursor-pointer items-center justify-center gap-2 rounded-[6px] bg-gray-800 px-3 py-[6px] text-gray-300">
            재시작
            <RefreshIcon className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={() => navigate('/practice')}
            className="button-large2 flex h-[60px] w-[175px] cursor-pointer items-center justify-center gap-2 rounded-[6px] bg-gray-800 px-3 py-[6px] text-gray-300">
            트랙 변경
            <ChangeIcon className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={handleAnalyze}
            className="button-large2 bg-primary-400 flex h-[60px] w-[175px] cursor-pointer items-center justify-center gap-2 rounded-[6px] px-3 py-[6px] text-gray-950">
            분석하기
            <CheckIcon className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* 본문 */}
      <div className="relative flex flex-1 flex-col px-[160px] pt-8">
        {/* 백킹트랙 + 메트로놈 진행점 (중앙 정렬, 반응형)*/}
        <div className="relative mx-auto flex w-full max-w-[1510px] flex-col">
          <BackingTrack measures={measures} currentBeat={currentBeat} beatsPerBar={beatsPerBar} />
          <div className="absolute top-[81px] right-0 flex">
            <MetronomeDots total={beatsPerBar} current={beatInBar} />
          </div>
        </div>

        {/* 재생 전 카운트다운(4,3,2,1): 배경 블러 + 숫자/문구 (본문 기준 고정) */}
        {countdown !== null && <div className="absolute inset-0 z-20 bg-gray-950/60 backdrop-blur-md" />}
        {countdown !== null && (
          <span className="display-large absolute top-[158px] left-1/2 z-20 -translate-x-1/2 text-center text-gray-700">
            {countdown}
          </span>
        )}

        {/* 백킹트랙 현재 코드명 (배경) */}
        {currentChord && (
          <span className="display-large absolute top-[158px] left-1/2 -translate-x-1/2 text-center text-gray-700">
            {currentChord}
          </span>
        )}

        {/* 노트바 클리핑 영역: 위(백킹트랙 밑)에서만 자르고 좌우는 열어둠(설정 버튼이 안 잘리도록) */}
        <div className="relative flex flex-1 flex-col justify-end [clip-path:inset(0_-100vw_-100vw_-100vw)]">
          {/* 건반 + 노트바*/}
          <div className="relative mx-auto w-full max-w-[1560px]">
            <PracticeNoteBars
              bars={noteBars}
              keyCount={keyCount}
              pxPerMs={pxPerMs}
              onBarDone={handleBarDone}
              paused={!isPlaying}
              frozenAt={pauseStartRef.current}
            />
            <Piano
              keyCount={keyCount}
              activeNotes={activeNotes}
              rightSlot={
                <button
                  onClick={() => navigate(`/practice/${practiceId}/settings`)}
                  className="flex cursor-pointer flex-col items-center gap-1"
                  aria-label="설정">
                  <SettingsIcon className="h-10 w-10" />
                  <span className="button-small text-gray-600">설정</span>
                </button>
              }
            />
          </div>
        </div>
      </div>

      {/* 모달 임시로 확인 disconnected -> (true || disconnected) 변경해서 확인 가능 */}
      {disconnected && (
        <DeviceDisconnectedModal
          onEndPractice={() => navigate('/practice')}
          onGoSettings={() => navigate(`/practice/${practiceId}/settings`)}
        />
      )}
    </div>
  );
}

export default PracticePlayPage;
