interface HistoryHeaderProps {
  title?: string;
  genre?: string;
  keySig?: string;
  bpm: number;
  playedAt?: string;
}

export default function HistoryHeader({ title, genre, keySig, bpm, playedAt }: HistoryHeaderProps) {
  const formatPlayedAt = (isoString?: string) => {
    if (!isoString) return '5월 4일 · 14:32';
    const date = new Date(isoString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${month}월 ${day}일 · ${hours}:${minutes}`;
  };

  return (
    <div className="flex items-start justify-between">
      <div className="flex flex-col">
        <h1 className="text-[32px] leading-tight font-bold tracking-tight text-white">
          {title || 'Jazz Standard Practice'}
        </h1>

        {/* 장르 및 BPM 뱃지 영역  */}
        <div className="mt-4 flex w-fit items-center gap-6 rounded-[4px] bg-gray-400 px-3 py-1">
          <span className="text-center text-[14px] font-normal tracking-[-0.28px] text-gray-900">
            {genre ? genre.toUpperCase() : 'JAZZ'}
          </span>
          <span className="text-center text-[14px] font-normal tracking-[-0.28px] text-gray-900">
            {keySig || 'C Major'}
          </span>
          <span className="text-center text-[14px] font-normal tracking-[-0.28px] text-gray-900">{bpm}BPM</span>
        </div>
      </div>

      <span className="text-[15px] font-medium text-gray-400">{formatPlayedAt(playedAt)}</span>
    </div>
  );
}
