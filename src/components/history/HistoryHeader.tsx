import { formatDurationText } from '@/utils/duration';

interface HistoryHeaderProps {
  title?: string;
  genre?: string;
  keySig?: string;
  bpm: number;
  timeSignature?: string;
  durationSec?: number;
  playedAt?: string;
}

export default function HistoryHeader({
  title,
  genre,
  keySig,
  bpm,
  timeSignature,
  durationSec,
  playedAt,
}: HistoryHeaderProps) {
  const formatPlayedAt = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${month}월 ${day}일 · ${hours}:${minutes}`;
  };

  const badges = [genre?.toUpperCase(), keySig, timeSignature, `${bpm}BPM`].filter(Boolean) as string[];

  return (
    <div className="flex items-start justify-between">
      <div className="flex flex-col">
        <h1 className="text-[32px] leading-tight font-bold tracking-tight text-white">{title ?? ''}</h1>

        {/* 장르 / 조성 / 박자 / BPM 뱃지 영역 */}
        <div className="mt-4 flex w-fit items-center gap-6 rounded-[4px] bg-gray-400 px-3 py-1">
          {badges.map((badge) => (
            <span key={badge} className="text-center text-[14px] font-normal tracking-[-0.28px] text-gray-900">
              {badge}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-end gap-1">
        <span className="text-[15px] font-medium text-gray-400">{formatPlayedAt(playedAt)}</span>
        {durationSec !== undefined && (
          <span className="text-[14px] font-medium text-gray-500">연주 시간 {formatDurationText(durationSec)}</span>
        )}
      </div>
    </div>
  );
}
