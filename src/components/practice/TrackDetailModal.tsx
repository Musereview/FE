import { useEffect, useMemo, useRef, useState } from 'react';
import * as Tone from 'tone';
import type { Track } from '@/types/track';
import { useMetronome } from '@/hooks/useMetronome';
import { useProfile } from '@/hooks/useProfile';
import PlayIcon from '@/assets/practice/play.svg?react';
import StopIcon from '@/assets/practice/stop.svg?react';
import ReplayIcon from '@/assets/practice/replay.svg?react';
import CloseIcon from '@/assets/practice/close.svg?react';
import DifficultyBadge from '@/components/common/DifficultyBadge';
import Modal from '@/components/common/Modal';
import { MODE_LABEL, buildFallbackProgression } from '@/pages/practice/trackDisplay';
import { getChordsPerMeasure } from './create/chordGrid';

const MEASURES_PER_ROW = 2;

interface TrackDetailModalProps {
  track: Track;
  onClose: () => void;
  onStartPractice: () => void;
  onEditTrack: () => void;
  isStartingPractice?: boolean;
  startError?: boolean;
}

function TrackDetailModal({
  track,
  onClose,
  onStartPractice,
  onEditTrack,
  isStartingPractice = false,
  startError = false,
}: TrackDetailModalProps) {
  const { id, title, key, mode, timeSignature, genre, bpm, difficulty, creator, chords, audioFileUrl } = track;
  const numerator = getChordsPerMeasure(timeSignature);
  const { data: profile } = useProfile();
  const isOwnTrack = !!profile && creator === profile.nickname;

  const measures = useMemo(
    () => track.chordProgression ?? buildFallbackProgression(chords, numerator),
    [track.chordProgression, chords, numerator],
  );
  const totalBeats = measures.length * numerator;

  const { start, stop } = useMetronome();
  const beatCountRef = useRef(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  const [beatCursor, setBeatCursor] = useState(0);

  // 반주 음원(audioFileUrl)을 메트로놈과 같은 Tone.Transport 타임라인에 동기화해 함께 재생
  const playerRef = useRef<Tone.Player | null>(null);
  const isPlaybackActiveRef = useRef(false); // 실제 재생 중인지 (지연 로딩 콜백이 재생 중이 아닐 때 끼어들지 않도록)
  useEffect(() => {
    if (!audioFileUrl) return;
    // 로딩(fetch+decode)이 재생 시작보다 늦게 끝나는 경우를 대비 — 이미 재생 중이라면 그 시점에 뒤늦게라도 동기화해 재생
    const player = new Tone.Player(audioFileUrl, () => {
      if (playerRef.current === player && isPlaybackActiveRef.current) player.sync().start(0);
    }).toDestination();
    playerRef.current = player;
    return () => {
      player.unsync();
      player.dispose();
      playerRef.current = null;
    };
  }, [audioFileUrl]);

  const stopAll = () => {
    isPlaybackActiveRef.current = false; // 지연 로딩 onload가 이후엔 재생을 시작하지 않도록
    stop();
    Tone.getDraw().cancel();
    const player = playerRef.current;
    if (player) {
      player.unsync();
      if (player.state === 'started') player.stop();
    }
  };

  useEffect(() => {
    stopAll();
    beatCountRef.current = 0;
    setIsPlaying(false);
    setHasFinished(false);
    setBeatCursor(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    return () => stopAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTogglePlay = () => {
    if (isPlaying) {
      stopAll();
      setIsPlaying(false);
      setBeatCursor(0);
      return;
    }
    if (totalBeats === 0) return;

    setHasFinished(false);
    beatCountRef.current = 0;
    setBeatCursor(0);
    setIsPlaying(true);
    isPlaybackActiveRef.current = true; // 실제 재생 시작 — 이 시점부턴 지연 로딩 onload도 재생을 시작해도 됨

    // 메트로놈 start()가 내부적으로 transport.stop()/cancel()을 먼저 실행하므로 그보다 먼저 반주를 sync하면
    // 방금 건 예약(0초 재생)이 cancel()에 지워짐 — 그래서 metronome start()가 끝난 뒤에 sync().start(0)를 건다.
    start(bpm, numerator, (time) => {
      const current = beatCountRef.current;
      const next = current + 1;

      if (next >= totalBeats) {
        stopAll();
        beatCountRef.current = 0;
        setIsPlaying(false);
        setHasFinished(true);
        setBeatCursor(0);
        return;
      }

      beatCountRef.current = next;
      Tone.getDraw().schedule(() => setBeatCursor(current), time);
    });

    const player = playerRef.current;
    if (player?.loaded) player.sync().start(0);
  };

  const activeBeatIndex = isPlaying ? beatCursor : -1;
  const metronomeBeat = beatCursor % numerator;

  return (
    <Modal
      onClose={onClose}
      overlayClassName="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/70 p-6 backdrop-blur-sm"
      dialogClassName="relative flex max-h-[90vh] w-[672px] max-w-full flex-col overflow-y-auto rounded-[10px] border-[0.3px] border-gray-600 bg-gray-900 px-[59px] py-[42px]"
      dialogAriaLabelledby="track-detail-modal-title"
      lockBodyScroll>
      <button
        type="button"
        onClick={onClose}
        aria-label="상세정보 닫기"
        className="absolute top-[22px] right-[22px] cursor-pointer">
        <CloseIcon className="size-5" />
      </button>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <h2 id="track-detail-modal-title" className="heading-small-b truncate text-gray-300">
            {title}
          </h2>
          <p className="body-small text-gray-300">
            {key} {MODE_LABEL[mode]} · {timeSignature}
          </p>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="caption-regular rounded-[6px] bg-gray-700 px-2 py-0.5 text-gray-200">{genre}</span>
            <span className="caption-regular rounded-[6px] border-[0.5px] border-gray-300 px-2 py-0.5 text-gray-400">
              {bpm} BPM
            </span>
            <DifficultyBadge difficulty={difficulty} variant="tag" size="sm" />
          </div>
          <p className="caption-medium text-gray-300">Creator: {creator}</p>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleTogglePlay}
            aria-pressed={isPlaying}
            className="flex cursor-pointer items-center gap-1">
            <span className="caption-medium text-gray-300">미리 듣기</span>
            {isPlaying ? (
              <StopIcon className="text-primary-400 size-5" />
            ) : hasFinished ? (
              <ReplayIcon className="size-5 text-gray-400" />
            ) : (
              <PlayIcon className="text-primary-400 size-5" />
            )}
          </button>

          <div className="flex items-center gap-3">
            {Array.from({ length: numerator }, (_, beat) => (
              <span
                key={beat}
                className={`border-secondary-400 size-4 rounded-full border ${
                  isPlaying && metronomeBeat === beat ? 'bg-secondary-400' : 'bg-transparent'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <p className="caption-regular text-gray-500">코드 진행</p>

          <div className="flex flex-col gap-4">
            {Array.from({ length: Math.ceil(measures.length / MEASURES_PER_ROW) }, (_, rowIndex) => {
              const rowMeasures = measures.slice(
                rowIndex * MEASURES_PER_ROW,
                rowIndex * MEASURES_PER_ROW + MEASURES_PER_ROW,
              );

              return (
                <div key={rowIndex} className="flex items-center gap-9">
                  {rowMeasures.map((measure, measureInRow) => {
                    const measureIndex = rowIndex * MEASURES_PER_ROW + measureInRow;
                    const isSecondHalf = measureInRow > 0;

                    return (
                      <div key={measureIndex} className="contents">
                        {isSecondHalf && <div className="h-11 w-px shrink-0 bg-gray-700" />}
                        <div
                          className={`flex w-[242px] shrink-0 items-center ${
                            numerator === 4 ? 'justify-between' : `gap-11 ${isSecondHalf ? 'justify-end' : ''}`
                          }`}>
                          {measure.map((chord, beatIndex) => {
                            const globalBeatIndex = measureIndex * numerator + beatIndex;
                            const isActive = globalBeatIndex === activeBeatIndex;
                            return (
                              <div
                                key={beatIndex}
                                className={`button-label1 flex size-11 shrink-0 items-center justify-center rounded-[4px] text-center text-gray-950 ${
                                  isActive ? 'bg-secondary-400' : 'bg-gray-600'
                                }`}>
                                <span className={chord ? '' : 'invisible'}>{chord ?? '-'}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-32 flex items-center">
        {isOwnTrack && (
          <button
            type="button"
            onClick={onEditTrack}
            className="button-label1 bg-error flex h-[42px] w-[133px] shrink-0 cursor-pointer items-center justify-center rounded-[6px] text-gray-100">
            수정하기
          </button>
        )}
        <div className="ml-auto flex flex-col items-end gap-1.5">
          {startError && <p className="caption-regular text-error">세션 생성에 실패했어요. 다시 시도해주세요.</p>}
          <button
            type="button"
            onClick={onStartPractice}
            disabled={isStartingPractice}
            className={`button-label1 bg-primary-400 flex h-[42px] shrink-0 cursor-pointer items-center justify-center rounded-[6px] text-gray-950 disabled:cursor-not-allowed disabled:opacity-60 ${
              numerator === 4 ? 'w-[272px]' : 'w-[242px]'
            }`}>
            {isStartingPractice ? '시작하는 중…' : '연습 시작'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default TrackDetailModal;
