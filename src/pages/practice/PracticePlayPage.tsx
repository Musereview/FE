// 연습 플레이 페이지 - 61건반/88건반
import { useCallback, useEffect, useRef, useState } from 'react';
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
import { ALL_TRACKS, RECOMMENDED_TRACKS } from '@/pages/practice/mockTracks';
import { buildFallbackProgression, MODE_LABEL } from '@/pages/practice/trackDisplay';
import PlayIcon from '@/assets/practice/play.svg?react';
import StopIcon from '@/assets/practice/stop.svg?react';
import RefreshIcon from '@/assets/restart.svg?react';
import CheckIcon from '@/assets/check.svg?react';
import ChangeIcon from '@/assets/change.svg?react';
import SettingsIcon from '@/assets/setting.svg?react';
import DeviceDisconnectedModal from '@/components/common/DeviceDisconnectedModal';

const PX_PER_BEAT = 120; // 노트바 길이 환산: 1박 = 120px

function PracticePlayPage() {
  const navigate = useNavigate();
  const { practiceId } = useParams();
  const { keyCount, inputId, latencyByDevice } = useSettingStore();
  const { start, stop, pause, resume } = useMetronome();
  const { noteOn: playNote, noteOff: stopNote, releaseAll } = usePianoSound();
  const setResult = usePracticeResultStore((s) => s.setResult);

  const track = [...ALL_TRACKS, ...RECOMMENDED_TRACKS].find((t) => t.id === practiceId) ?? RECOMMENDED_TRACKS[0];
  const beatsPerBar = Number(track.timeSignature.split('/')[0]); // '4/4' → 4
  const measures = track.chordProgression ?? buildFallbackProgression(track.chords, beatsPerBar);
  const totalCells = measures.length * beatsPerBar;
  const pxPerMs = (PX_PER_BEAT * track.bpm) / 60000; // 노트바 길이: 1박 = PX_PER_BEAT px

  const [isPlaying, setIsPlaying] = useState(false);
  const [beatInBar, setBeatInBar] = useState(-1); // 진행점 (마디 내 0-based)
  const [currentBeat, setCurrentBeat] = useState(-1); // 백킹트랙 전체 진행 박
  const [showStart, setShowStart] = useState(true); // 진입 시 START 안내 (1초)
  const [noteBars, setNoteBars] = useState<LiveNoteBar[]>([]); // 연습 노트바 (가변 길이)
  const totalBeatRef = useRef(0);
  const barIdRef = useRef(0);
  const heldRef = useRef<Map<number, number>>(new Map()); // midi → 진행 중 노트바 id
  const recordingRef = useRef<PlayedNote[]>([]); // 연주 녹음 (Transport 시각 기준)
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null); // 진입 시 자동재생 예약
  const pauseStartRef = useRef(performance.now()); // 정지 시각 (노트바 얼림 기준 + 재개 시 보정)

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

  // 예약된 자동재생(START 타이머) 취소
  const cancelAutoStart = () => {
    if (startTimerRef.current) {
      clearTimeout(startTimerRef.current);
      startTimerRef.current = null;
    }
  };

  const stopPlayback = () => {
    cancelAutoStart(); // 재시작/분석 등으로 정지 시 대기 중인 자동재생 취소
    finalizeOpenNotes(performance.now()); // stop() 전에 (stop이 transport 위치를 0으로 리셋하므로)
    stop();
    Tone.getDraw().cancel();
    setIsPlaying(false);
    setBeatInBar(-1);
    setCurrentBeat(-1);
  };

  const startPlayback = async () => {
    cancelAutoStart(); // 대기 중인 자동재생 취소 (중복 시작 방지)
    setShowStart(false); // 수동 재생/자동재생 모두 START 숨김
    await Tone.start(); // 오디오 잠금 해제 (클릭 핸들러 안에서만 가능)
    totalBeatRef.current = 0;
    recordingRef.current = []; // 처음부터 재생 시 녹음 초기화
    setIsPlaying(true);
    start(track.bpm, beatsPerBar, (time, bib) => {
      const beat = totalBeatRef.current % totalCells;
      Tone.getDraw().schedule(() => {
        setBeatInBar(bib);
        setCurrentBeat(beat);
      }, time);
      totalBeatRef.current += 1;
    });
  };

  // 정지: 화면 그대로 멈춤(진행 상태 유지) / 재생: 이어서
  const pausePlayback = () => {
    pause();
    pauseStartRef.current = performance.now();
    finalizeOpenNotes(pauseStartRef.current); // 정지 시점에 열린 노트 확정 (정지 시간이 길이에 안 껴들게)
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
    setNoteBars([]); // 노트바 초기화
    heldRef.current.clear();
    // transport 정지가 반영된 뒤 재시작 (연속 stop→start 글리치 방지)
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
    restartTimerRef.current = setTimeout(() => startPlayback(), 80);
  };

  // 분석: 녹음 + 레이턴시 보정값을 스토어에 저장하고 분석 화면으로 이동
  const handleAnalyze = () => {
    stopPlayback();
    const raw = inputId ? latencyByDevice[inputId] : undefined;
    const latencyMs = typeof raw === 'number' ? raw : 0; // 미측정/실패면 0
    setResult({ trackId: practiceId, recording: recordingRef.current, latencyMs });
    navigate(`/practice/${practiceId}/analysis`);
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
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
    };
  }, [stop]);

  // 진입 시 START 1초 표시 후 자동 재생 (startPlayback이 START 숨김·중복 취소 처리)
  useEffect(() => {
    startTimerRef.current = setTimeout(() => startPlayback(), 1000);
    return () => cancelAutoStart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-full flex-col bg-gray-950">
      {/* 헤더 */}
      <header className="flex h-[154px] w-full items-center justify-between bg-gray-900 px-[160px] py-[28px]">
        {/* Track Title: 재생 버튼(좌) + 제목/칩 컬럼 — 칩은 제목 아래 */}
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
            className="button-large2 bg-primary-400 flex h-[60px] w-[175px] items-center justify-center gap-2 rounded-[6px] px-3 py-[6px] text-gray-950">
            분석하기
            <CheckIcon className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* 본문 */}
      <div className="relative flex flex-1 flex-col px-[160px] pt-8">
        {/* 백킹트랙 + 진행점 (중앙 정렬, 반응형) — 진행점은 본문 기준 top-113, 백킹트랙 오른쪽 끝에 정렬 */}
        <div className="relative mx-auto flex w-full max-w-[1510px] flex-col">
          <BackingTrack measures={measures} currentBeat={currentBeat} beatsPerBar={beatsPerBar} />
          {/* top-[81px] = 본문 top-[113px] - pt-8(32px) */}
          <div className="absolute top-[81px] right-0 flex">
            <MetronomeDots total={beatsPerBar} current={beatInBar} />
          </div>
        </div>

        {/* 진입 시 START (본문 기준 고정) */}
        {showStart && (
          <span className="display-large absolute top-[158px] left-1/2 -translate-x-1/2 text-center text-gray-700">
            START
          </span>
        )}

        {/* 백킹트랙 현재 코드명 (배경) */}
        {!showStart && currentChord && (
          <span className="display-large absolute top-[158px] left-1/2 -translate-x-1/2 text-center text-gray-700">
            {currentChord}
          </span>
        )}

        {/* 노트바 클리핑 영역: 위(백킹트랙 밑)에서만 자르고 좌우는 열어둠(설정 버튼이 안 잘리도록) */}
        <div className="relative flex flex-1 flex-col justify-end [clip-path:inset(0_-100vw_-100vw_-100vw)]">
          {/* 건반 + 노트바 (누른 시간만큼 길이가 그려짐) */}
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
