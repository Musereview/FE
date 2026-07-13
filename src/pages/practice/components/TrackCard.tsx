import type { Track, TrackDifficulty } from '@/types/track';
import ClockIcon from '@/assets/practice/clock.svg?react';
import ChordDividerIcon from '@/assets/practice/chord-divider.svg?react';

const DIFFICULTY_LABEL: Record<TrackDifficulty, string> = {
  beginner: '초급',
  intermediate: '중급',
  advanced: '고급',
};

const DIFFICULTY_COLOR: Record<TrackDifficulty, string> = {
  beginner: 'border-level-bgn text-level-bgn',
  intermediate: 'border-level-int text-level-int',
  advanced: 'border-level-mjr text-level-mjr',
};

const MODE_LABEL = {
  major: 'Major',
  minor: 'Minor',
};

interface TrackCardProps {
  track: Track;
  onClick?: () => void;
}

function TrackCard({ track, onClick }: TrackCardProps) {
  const { title, key, mode, timeSignature, chords, genre, bpm, difficulty, duration } = track;

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={`flex w-full flex-col gap-4 rounded-[10px] bg-gray-800 p-6 ${onClick ? 'cursor-pointer' : ''}`}>
      <div className="flex w-full flex-col gap-4">
        <div className="flex w-full flex-col gap-0.5">
          <h3 className="button-large1 truncate text-gray-100">{title}</h3>
          <p className="button-label2 text-gray-300">
            {key} {MODE_LABEL[mode]} · {timeSignature}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {chords.map((chord, index) => (
            <div key={`${chord}-${index}`} className="flex items-center gap-1.5">
              <ChordDividerIcon />
              <span className="button-label2 text-gray-300">{chord}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="button-label2 rounded-[6px] bg-gray-700 px-2.5 py-0.5 text-gray-200">{genre}</span>
          <span className="button-label2 rounded-[6px] border-[0.5px] border-gray-300 px-2.5 py-0.5 text-gray-400">
            {bpm} BPM
          </span>
          <span className={`button-label2 rounded-[6px] border-[0.5px] px-2.5 py-0.5 ${DIFFICULTY_COLOR[difficulty]}`}>
            {DIFFICULTY_LABEL[difficulty]}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <ClockIcon className="size-6" />
          <span className="button-label2 text-gray-400">{duration}</span>
        </div>
      </div>
    </div>
  );
}

export default TrackCard;
