// 연습 플레이 페이지 - 61건반/88건반
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as Tone from 'tone';
import Piano from '@/components/piano/Piano';
import PracticeNoteBars, { type LiveNoteBar } from '@/components/piano/PracticeNoteBars';
import { noteCenterFraction } from '@/constants/piano';
import MetronomeDots from '@/components/metronome/MetronomeDots';
import BackingTrack from '@/pages/practice/components/BackingTrack';
import { useActiveNotes } from '@/hooks/useActiveNotes';
import { useMetronome } from '@/hooks/useMetronome';
import { usePianoSound } from '@/hooks/usePianoSound';
import { useSettingStore } from '@/stores/settingsStore';
import { ALL_TRACKS, RECOMMENDED_TRACKS } from '@/pages/practice/mockTracks';
import { buildFallbackProgression, MODE_LABEL } from '@/pages/practice/trackDisplay';
import PlayIcon from '@/assets/practice/play.svg?react';
import StopIcon from '@/assets/practice/stop.svg?react';
import RefreshIcon from '@/assets/restart.svg?react';
import CheckIcon from '@/assets/check.svg?react';
import ChangeIcon from '@/assets/change.svg?react';
import SettingsIcon from '@/assets/setting.svg?react';

const PX_PER_BEAT = 120; // 노트바 길이 환산: 1박 = 120px

function PracticePlayPage() {
  const navigate = useNavigate();
  const { practiceId } = useParams();
  const { keyCount } = useSettingStore();
  const { start, stop, pause, resume } = useMetronome();
  const { noteOn: playNote, noteOff: stopNote } = usePianoSound();

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
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 친 음: 소리 재생 + 노트바 생성(성장 시작) → 뗄 때 소리·길이 확정 후 위로 사라짐
  const handleNoteOn = (note: number, velocity = 100) => {
    playNote(note, velocity); // 즉시 소리 (범위와 무관하게 실제 친 음)
    if (noteCenterFraction(note, keyCount) < 0) return; // 노트바는 건반 범위 안만
    const id = barIdRef.current++;
    heldRef.current.set(note, id);
    setNoteBars((prev) => [...prev, { id, midi: note, startTime: performance.now(), endTime: null }]);
  };
  const handleNoteOff = (note: number) => {
    stopNote(note); // 즉시 소리 끝
    const id = heldRef.current.get(note);
    if (id === undefined) return;
    heldRef.current.delete(note);
    setNoteBars((prev) => prev.map((b) => (b.id === id ? { ...b, endTime: performance.now() } : b)));
  };
  const handleBarDone = useCallback((id: number) => setNoteBars((prev) => prev.filter((b) => b.id !== id)), []);

  const { activeNotes } = useActiveNotes(handleNoteOn, handleNoteOff, isPlaying); // 정지 중엔 입력 무시

  // 백킹트랙에서 지금 차례인 코드 (null은 직전 코드 유지)
  const flatChords = measures.flat();
  const currentChord =
    currentBeat < 0
      ? null
      : (flatChords
          .slice(0, currentBeat + 1)
          .filter(Boolean)
          .pop() ?? null);

  const stopPlayback = () => {
    stop();
    Tone.getDraw().cancel();
    setIsPlaying(false);
    setBeatInBar(-1);
    setCurrentBeat(-1);
  };

  const startPlayback = async () => {
    await Tone.start(); // 오디오 잠금 해제 (클릭 핸들러 안에서만 가능)
    totalBeatRef.current = 0;
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
    setIsPlaying(false);
  };
  const resumePlayback = () => {
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

  // 언마운트 시 정리
  useEffect(() => {
    return () => {
      stop();
      Tone.getDraw().cancel();
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
    };
  }, [stop]);

  // 진입 시 START 1초 표시 후 자동 재생
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowStart(false);
      startPlayback();
    }, 1000);
    return () => clearTimeout(timer);
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
            className="button-large2 flex h-[60px] w-[175px] items-center justify-center gap-2 rounded-[6px] bg-gray-800 px-3 py-[6px] text-gray-300">
            재시작
            <RefreshIcon className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={() => navigate('/practice')}
            className="button-large2 flex h-[60px] w-[175px] items-center justify-center gap-2 rounded-[6px] bg-gray-800 px-3 py-[6px] text-gray-300">
            트랙 변경
            <ChangeIcon className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={() => navigate(`/practice/${practiceId}/analysis`)}
            className="button-large2 bg-primary-400 flex h-[60px] w-[175px] items-center justify-center gap-2 rounded-[6px] px-3 py-[6px] text-gray-950">
            분석하기
            <CheckIcon className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* 본문 */}
      <div className="relative flex flex-1 flex-col px-[160px] pt-8">
        {/* 백킹트랙 + 진행점 */}
        <div className="flex flex-col gap-4">
          <BackingTrack measures={measures} currentBeat={currentBeat} beatsPerBar={beatsPerBar} />
          <div className="absolute top-[113px] right-[160px] flex">
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
            <PracticeNoteBars bars={noteBars} keyCount={keyCount} pxPerMs={pxPerMs} onBarDone={handleBarDone} />
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
    </div>
  );
}

export default PracticePlayPage;
