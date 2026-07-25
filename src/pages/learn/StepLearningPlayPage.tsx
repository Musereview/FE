// 단계별 학습 진행(시작) 페이지
// 레이아웃 구조는 연습 플레이 화면과 동일하되, 중앙 노트바 대신 악보(OSMD, 다음 단계)를 넣는다.
// - 헤더: 진행률(진입 시 DB 값, 실시간 아님) + BPM
// - 백킹트랙/진행점/건반/소리/메트로놈은 연습화면과 동일
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as Tone from 'tone';
import Piano from '@/components/piano/Piano';
import LearningScoreView, { type LearningScoreHandle } from '@/components/score/LearningScoreView';
import MetronomeDots from '@/components/metronome/MetronomeDots';
import BackingTrack from '@/pages/practice/components/BackingTrack';
import { buildFallbackProgression } from '@/pages/practice/trackDisplay';
import { useActiveNotes } from '@/hooks/useActiveNotes';
import { useMetronome } from '@/hooks/useMetronome';
import { usePianoSound } from '@/hooks/usePianoSound';
import { useSettingStore } from '@/stores/settingsStore';
import { useLearningScoreStore } from '@/stores/learningScoreStore';
import type { PlayedNote } from '@/stores/practiceResultStore';
import { getCurriculum, getCurriculumProgress, getScorePath, getLearningIds } from './mockCurriculum';
import { usePracticeData } from '@/hooks/usePracticeData';
import PlayIcon from '@/assets/practice/play.svg?react';
import StopIcon from '@/assets/practice/stop.svg?react';
import RefreshIcon from '@/assets/restart.svg?react';
import SettingsIcon from '@/assets/setting.svg?react';

// TODO(mock): 백킹트랙 코드 진행 — 추후 학습 데이터로 교체
const MOCK_CHORDS = ['Cm7(#11)', 'CM7(#11)', 'Dm7', 'Am7'];

function StepLearningPlayPage() {
  const navigate = useNavigate();
  const { curriculumId = '' } = useParams();
  const { keyCount } = useSettingStore();
  const { start, stop, pause, resume } = useMetronome();
  const { noteOn: playNote, noteOff: stopNote, releaseAll } = usePianoSound();
  const setScore = useLearningScoreStore((s) => s.setScore); // 채점 결과 → 점수 화면 전달

  const curriculum = getCurriculum(curriculumId);
  const chapterNo = curriculumId.match(/\d+/)?.[0] ?? ''; // 'chapter-1' → '1'
  const title = chapterNo ? `${curriculum.title}-chapter ${chapterNo}` : curriculum.title;

  // 실습 데이터(bpm/keySignature/midiData) — '이 이론으로 실습하기'에서 조회. 지금은 mock.
  // TODO: midiData를 채점 정답 데이터로 사용(현재는 악보(OSMD)에서 추출). keySignature도 필요 시 활용.
  const { learningId, learningStepId } = getLearningIds(curriculumId);
  const { data: practiceData } = usePracticeData(learningId, learningStepId);
  const bpm = practiceData?.bpm ?? curriculum.bpm; // 실습 데이터 우선, 로딩 중엔 커리큘럼 값
  const beatsPerBar = Number(curriculum.timeSignature.split('/')[0]); // '4/4' → 4
  const measures = buildFallbackProgression(MOCK_CHORDS, beatsPerBar);
  const totalCells = measures.length * beatsPerBar;

  // 진행률: 화면 진입 시 DB에서 받는 값(실시간 아님). 스텝 완료/다음 스텝 이동 시 현재 진행률을 DB에 반영.
  // TODO: 진행률 GET API로 교체(현재는 mock 커리큘럼에서 스냅샷). 저장(PATCH)은 채점/완료 플로우 배선 시 추가.
  const [progress] = useState(() => getCurriculumProgress(curriculum.steps));

  const [isPlaying, setIsPlaying] = useState(false);
  const [beatInBar, setBeatInBar] = useState(-1); // 진행점 (마디 내 0-based)
  const [currentBeat, setCurrentBeat] = useState(-1); // 백킹트랙 전체 진행 박
  const [measureIndex, setMeasureIndex] = useState(0); // 악보 현재 진행 마디 (가운데 정렬 기준)
  const [playheadBeat, setPlayheadBeat] = useState(-1); // 곡 시작 기준 현재 박 (악보 현재 음 하이라이트)
  const [showStart, setShowStart] = useState(true); // 진입 시 START 안내
  const totalBeatRef = useRef(0);
  const recordingRef = useRef<PlayedNote[]>([]); // 연주 녹음 — 채점(다음 단계)에서 정답 음과 비교
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null); // 진입 시 자동재생 예약
  const scoreRef = useRef<LearningScoreHandle>(null); // 악보 판정·색칠 핸들

  // 친 음: 소리 재생 + 녹음(Transport 시각 = 곡 박자 기준) + 악보 판정 색칠
  const handleNoteOn = (note: number, velocity = 100) => {
    playNote(note, velocity);
    const atSec = Tone.getTransport().seconds;
    recordingRef.current.push({ midi: note, velocity, onSec: atSec, offSec: null });
    scoreRef.current?.judge(note, atSec); // 현재 음과 대조해 Excellent/Good/Bad 색칠
  };
  const handleNoteOff = (note: number) => {
    stopNote(note);
    for (let i = recordingRef.current.length - 1; i >= 0; i--) {
      const rec = recordingRef.current[i];
      if (rec.midi === note && rec.offSec === null) {
        rec.offSec = Tone.getTransport().seconds;
        break;
      }
    }
  };

  const { activeNotes, reset: resetInput } = useActiveNotes(handleNoteOn, handleNoteOff, isPlaying); // 정지 중엔 입력 무시

  // 정지/일시정지 시점에 아직 눌린(열린) 음을 그 순간으로 확정·해제 (stuck 방지)
  const finalizeOpenNotes = () => {
    const atSec = Tone.getTransport().seconds;
    for (const rec of recordingRef.current) {
      if (rec.offSec === null) rec.offSec = atSec;
    }
    releaseAll(); // 홀드된 소리 즉시 끊기
    resetInput(); // 눌린 건반 표시 초기화
  };

  // 예약된 자동재생(START 타이머) 취소
  const cancelAutoStart = () => {
    if (startTimerRef.current) {
      clearTimeout(startTimerRef.current);
      startTimerRef.current = null;
    }
  };

  const stopPlayback = () => {
    cancelAutoStart();
    finalizeOpenNotes(); // stop() 전에 (stop이 transport 위치를 0으로 리셋하므로)
    stop();
    Tone.getDraw().cancel();
    setIsPlaying(false);
    setBeatInBar(-1);
    setCurrentBeat(-1);
    setMeasureIndex(0);
    setPlayheadBeat(-1);
    // 정지 시엔 색칠·판정을 지우지 않음(끝/분석 시 결과 유지). 새 재생(startPlayback)에서 초기화한다.
  };

  const startPlayback = async () => {
    cancelAutoStart(); // 대기 중인 자동재생 취소 (중복 시작 방지)
    setShowStart(false);
    await Tone.start(); // 오디오 잠금 해제 (제스처 핸들러 안에서만 가능)
    totalBeatRef.current = 0;
    recordingRef.current = []; // 처음부터 재생 시 녹음 초기화
    setIsPlaying(true);
    setMeasureIndex(0);
    setPlayheadBeat(-1);
    scoreRef.current?.reset(); // 처음부터 재생 시 색칠 초기화
    start(bpm, beatsPerBar, (time, bib) => {
      const pbeat = totalBeatRef.current; // 곡 시작 기준 현재 박(언랩)
      // 악보 한 바퀴(totalCells 박)를 모두 지나면 루프 대신 정지 (mock: 백킹트랙·악보 모두 8마디)
      if (pbeat >= totalCells) {
        Tone.getDraw().schedule(() => stopPlayback(), time);
        return;
      }
      const beat = pbeat % totalCells;
      const measure = Math.floor(pbeat / beatsPerBar); // 곡 진행 마디(언랩) — 악보 슬라이드 기준
      Tone.getDraw().schedule(() => {
        setBeatInBar(bib);
        setCurrentBeat(beat);
        setMeasureIndex(measure);
        setPlayheadBeat(pbeat);
      }, time);
      totalBeatRef.current += 1;
    });
  };

  // 정지: 화면 그대로 멈춤(진행 상태 유지) / 재생: 이어서
  const pausePlayback = () => {
    pause();
    finalizeOpenNotes();
    setIsPlaying(false);
  };
  const resumePlayback = () => {
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
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
    restartTimerRef.current = setTimeout(() => startPlayback(), 80); // 연속 stop→start 글리치 방지
  };

  // 분석하기: 지금까지의 판정을 집계해 점수 스토어에 담고 점수 화면으로 이동
  const handleAnalyze = () => {
    const result = scoreRef.current?.getScore();
    if (result) setScore(result);
    stopPlayback();
    navigate(`/learn/curriculum/${curriculumId}/score`);
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
    startTimerRef.current = setTimeout(() => startPlayback(), 1000);
    return () => cancelAutoStart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-full flex-col bg-gray-950">
      {/* 헤더 */}
      <header className="flex h-[154px] w-full items-center justify-between bg-gray-900 px-[160px] py-[28px]">
        {/* 재생 버튼(좌) + 제목/칩 컬럼 — 칩은 제목 아래(진행률 + BPM) */}
        <div className="flex w-[403px] items-start gap-4">
          <button
            type="button"
            onClick={handlePlayToggle}
            aria-label={isPlaying ? '정지' : '재생'}
            className="text-primary-400 flex cursor-pointer items-center">
            {isPlaying ? <StopIcon className="h-[52px] w-[52px]" /> : <PlayIcon className="h-[52px] w-[52px]" />}
          </button>
          <div className="flex flex-col items-start gap-6">
            <div className="heading-medium-b w-[500px] text-gray-200">{title}</div>
            <div className="inline-flex w-fit items-center gap-[24px] rounded-[4px] bg-gray-400 px-3 py-1">
              <span className="button-label2 text-gray-900">진행률 {progress}%</span>
              <span className="button-label2 text-gray-900">{bpm}BPM</span>
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
            onClick={handleAnalyze}
            className="button-large2 bg-primary-400 flex h-[60px] w-[175px] cursor-pointer items-center justify-center gap-2 rounded-[6px] px-3 py-[6px] text-gray-950">
            분석하기
          </button>
        </div>
      </header>

      {/* 본문 */}
      <div className="relative flex flex-1 flex-col px-[160px] pt-8">
        {/* 백킹트랙 + 진행점 (중앙 정렬, 반응형) */}
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

        {/* 악보 영역 — 현재 마디를 가운데 두고 이전/다음 마디가 좌우에 보이도록 슬라이딩 */}
        <div className="mx-auto mt-8 flex w-full max-w-[1510px] flex-1 items-center">
          <LearningScoreView
            ref={scoreRef}
            xmlPath={getScorePath(curriculumId)}
            currentMeasureIndex={measureIndex}
            playheadBeat={playheadBeat}
            bpm={bpm}
            difficulty={curriculum.difficulty}
            visibleMeasures={3}
            height={600}
            className="w-full"
          />
        </div>

        {/* 건반 */}
        <div className="relative mx-auto w-full max-w-[1560px]">
          <Piano
            keyCount={keyCount}
            activeNotes={activeNotes}
            rightSlot={
              <button
                onClick={() => navigate(`/learn/curriculum/${curriculumId}/settings`)}
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
  );
}

export default StepLearningPlayPage;
