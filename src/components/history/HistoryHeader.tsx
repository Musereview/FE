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

        <div
          style={{
            display: 'flex',
            padding: '4px 12px',
            alignItems: 'center',
            gap: '24px',
            borderRadius: '4px',
            background: '#CECFD1',
            marginTop: '16px',
            width: 'fit-content',
          }}>
          <span className="text-center text-[14px] font-normal tracking-[-0.28px] text-[#1B1E27]">
            {genre ? genre.toUpperCase() : 'JAZZ'}
          </span>
          <span className="text-center text-[14px] font-normal tracking-[-0.28px] text-[#1B1E27]">
            {keySig || 'C Major'}
          </span>
          <span className="text-center text-[14px] font-normal tracking-[-0.28px] text-[#1B1E27]">{bpm}BPM</span>
        </div>
      </div>

      <span className="text-[15px] font-medium text-gray-400">{formatPlayedAt(playedAt)}</span>
    </div>
  );
}
