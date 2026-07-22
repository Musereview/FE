// 연습 플레이 페이지 - 61건반/88건반
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as Tone from 'tone';
import Piano from '@/components/piano/Piano';
import MetronomeDots from '@/components/metronome/MetronomeDots';
import BackingTrack from '@/pages/practice/components/BackingTrack';
import { useActiveNotes } from '@/hooks/useActiveNotes';
import { useMetronome } from '@/hooks/useMetronome';
import { useSettingStore } from '@/stores/settingsStore';
import { ALL_TRACKS, RECOMMENDED_TRACKS } from '@/pages/practice/mockTracks';
import { buildFallbackProgression, MODE_LABEL } from '@/pages/practice/trackDisplay';
import PlayIcon from '@/assets/practice/play.svg?react';
import StopIcon from '@/assets/practice/stop.svg?react';
import RefreshIcon from '@/assets/restart.svg?react';
import CheckIcon from '@/assets/check.svg?react';
import ChangeIcon from '@/assets/change.svg?react';

function PracticePlayPage() {
  const navigate = useNavigate();
  const { practiceId } = useParams();
  const { keyCount } = useSettingStore();
  const { activeNotes } = useActiveNotes();
  const { start, stop } = useMetronome();

  const track = [...ALL_TRACKS, ...RECOMMENDED_TRACKS].find((t) => t.id === practiceId) ?? RECOMMENDED_TRACKS[0];
  const beatsPerBar = Number(track.timeSignature.split('/')[0]); // '4/4' → 4
  const measures = track.chordProgression ?? buildFallbackProgression(track.chords, beatsPerBar);
  const totalCells = measures.length * beatsPerBar;

  const [isPlaying, setIsPlaying] = useState(false);
  const [beatInBar, setBeatInBar] = useState(-1); // 진행점 (마디 내 0-based)
  const [currentBeat, setCurrentBeat] = useState(-1); // 백킹트랙 전체 진행 박
  const totalBeatRef = useRef(0);

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

  const handlePlayToggle = () => (isPlaying ? stopPlayback() : startPlayback());
  const handleRestart = () => {
    stopPlayback();
    startPlayback();
  };

  // 언마운트 시 정리
  useEffect(() => {
    return () => {
      stop();
      Tone.getDraw().cancel();
    };
  }, [stop]);

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
      <div className="relative flex flex-1 flex-col px-[135px] pt-8">
        {/* 백킹트랙 + 진행점 */}
        <div className="flex flex-col gap-4">
          <BackingTrack measures={measures} currentBeat={currentBeat} beatsPerBar={beatsPerBar} />
          <div className="flex justify-end">
            <MetronomeDots total={beatsPerBar} current={beatInBar} />
          </div>
        </div>

        {/* 노트바 / 코드명 영역 (다음 단계) */}
        <div className="flex-1" />

        <Piano keyCount={keyCount} activeNotes={activeNotes} />
      </div>
    </div>
  );
}

export default PracticePlayPage;
