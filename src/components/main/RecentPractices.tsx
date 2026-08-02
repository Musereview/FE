import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface PracticeItem {
  practiceId: number;
  title: string;
  genre: string;
  keySignature: string;
  bpm: number;
  timeLabel: string;
}

interface RecentPracticesProps {
  data: PracticeItem[];
}

export default function RecentPractices({ data }: RecentPracticesProps) {
  const navigate = useNavigate();

  // 현재 재생 중인 곡의 practiceId를 관리하는 상태 (아무것도 재생 안 될 때는 null)
  const [currentPlayingId, setCurrentPlayingId] = useState<number | null>(null);

  // 재생/정지 토글 시 상세 페이지 이동(부모 클릭)을 막기 위한 클릭 핸들러
  const handlePlayToggle = (e: React.MouseEvent, practiceId: number) => {
    e.stopPropagation();

    if (currentPlayingId === practiceId) {
      setCurrentPlayingId(null); // 이미 재생 중이면 일시정지 (다시 정지 마크로)
    } else {
      setCurrentPlayingId(practiceId); // 새로운 곡 재생 시작
    }
  };

  return (
    <div className="flex w-full flex-col">
      <div className="flex w-full flex-col gap-2">
        {data.map((item) => {
          const isCurrentlyPlaying = currentPlayingId === item.practiceId;

          return (
            <div
              key={item.practiceId}
              onClick={() => navigate(`/practice/${item.practiceId}`)}
              className="flex h-[86px] w-full cursor-pointer items-center justify-between self-stretch rounded-[4px] border-y-[0.3px] border-y-white/[0.05] bg-[#1B1E27] px-6 py-3 text-white transition-colors select-none hover:opacity-90">
              {/* ── 1) [좌측 구역]: 정지/재생 아이콘 + 곡 타이틀 ── */}
              <div className="mr-4 flex w-0 flex-1 items-center gap-4">
                <button
                  type="button"
                  onClick={(e) => handlePlayToggle(e, item.practiceId)}
                  className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center border-none bg-transparent p-0 transition-transform active:scale-95"
                  aria-label={isCurrentlyPlaying ? '정지하기' : '재생하기'}>
                  {isCurrentlyPlaying ? (
                    // 재생 중(isCurrentlyPlaying === true)일 때는 일시정지 아이콘을 렌더링합니다.
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center gap-[4px]">
                      <div className="h-[18px] w-[4px] rounded-sm bg-[#69FFC0]" />
                      <div className="h-[18px] w-[4px] rounded-sm bg-[#69FFC0]" />
                    </div>
                  ) : (
                    // 정지 상태(isCurrentlyPlaying === false)일 때는 재생 아이콘을 렌더링합니다.
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

              {/* ── 2) [우측 구역]: 메타 정보 & 화살표 ── */}
              <div className="flex shrink-0 items-center gap-8">
                <div className="flex items-center font-sans text-[14px] leading-[22px] font-normal tracking-[-0.28px] text-[#AEB1B6]">
                  <span className="w-[50px] shrink-0 text-left font-medium text-gray-500 uppercase">{item.genre}</span>
                  <span className="w-[70px] shrink-0 text-left whitespace-nowrap">{item.keySignature}</span>
                  <span className="w-[75px] shrink-0 text-left whitespace-nowrap">{item.bpm}BPM</span>
                  <span className="w-[100px] shrink-0 text-right whitespace-nowrap">{item.timeLabel}</span>
                </div>

                {/* 우측 이동 꺾쇠 (>) 아이콘 */}
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
