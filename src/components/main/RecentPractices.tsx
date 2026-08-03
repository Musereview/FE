import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface RecentPlayingItem {
  playingId: number;
  title: string;
  genre: string | null;
  key: string | null;
  bpm: number;
  playedAt: string;
  relativeTime: string;
  durationMinutes: number;
}

interface RecentPracticesProps {
  data: RecentPlayingItem[];
}

export default function RecentPractices({ data }: RecentPracticesProps) {
  const navigate = useNavigate();
  const [currentPlayingId, setCurrentPlayingId] = useState<number | null>(null);

  //최근연습 데이터가 없을때 초기상태

  if (!data || data.length === 0) {
    return (
      <div className="flex h-[356px] w-full flex-col items-center justify-center self-stretch rounded-[6px] bg-gray-800 p-[32px] text-center select-none">
        <p className="font-['Pretendard'] text-[24px] leading-[36px] font-semibold tracking-[-0.02em] text-white">
          최근 진행한 연주가 없습니다
        </p>
      </div>
    );
  }

  const handlePlayToggle = (e: React.MouseEvent, playingId: number) => {
    e.stopPropagation();
    setCurrentPlayingId(currentPlayingId === playingId ? null : playingId);
  };

  return (
    <div className="flex w-full flex-col">
      <div className="flex w-full flex-col gap-2">
        {data.map((item) => {
          const isCurrentlyPlaying = currentPlayingId === item.playingId;

          return (
            <div
              key={item.playingId}
              onClick={() => navigate(`/practice/${item.playingId}`)}
              className="flex h-[86px] w-full cursor-pointer items-center justify-between self-stretch rounded-[4px] border-y-[0.3px] border-y-white/[0.05] bg-[#1B1E27] px-6 py-3 text-white transition-colors select-none hover:opacity-90">
              <div className="mr-4 flex w-0 flex-1 items-center gap-4">
                <button
                  type="button"
                  onClick={(e) => handlePlayToggle(e, item.playingId)}
                  className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center border-none bg-transparent p-0 transition-transform active:scale-95"
                  aria-label={isCurrentlyPlaying ? '정지하기' : '재생하기'}>
                  {isCurrentlyPlaying ? (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center gap-[4px]">
                      <div className="h-[18px] w-[4px] rounded-sm bg-[#69FFC0]" />
                      <div className="h-[18px] w-[4px] rounded-sm bg-[#69FFC0]" />
                    </div>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="#69FFC0"
                      stroke="#69FFC0"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round">
                      <polygon points="6 3 20 12 6 21 6 3" />
                    </svg>
                  )}
                </button>
                <span className="truncate font-sans text-[18px] leading-[30px] font-medium tracking-[-0.36px] text-white">
                  {item.title}
                </span>
              </div>

              <div className="flex shrink-0 items-center gap-8">
                <div className="flex items-center font-sans text-[14px] leading-[22px] font-normal tracking-[-0.28px] text-[#AEB1B6]">
                  <span className="w-[50px] shrink-0 text-left font-medium text-gray-500 uppercase">
                    {item.genre || 'ETC'}
                  </span>
                  <span className="w-[70px] shrink-0 text-left whitespace-nowrap">{item.key || '-'}</span>
                  <span className="w-[75px] shrink-0 text-left whitespace-nowrap">{item.bpm}BPM</span>
                  <span className="w-[100px] shrink-0 text-right whitespace-nowrap">
                    {item.relativeTime} · {item.durationMinutes}분
                  </span>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="shrink-0 text-gray-500">
                  <path
                    d="M9 18L15 12L9 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
