// src/pages/main/components/RecentPractices.tsx
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

  return (
    <div className="flex w-full flex-col">
      <div className="flex w-full flex-col gap-2">
        {data.map((item) => (
          <div
            key={item.practiceId}
            onClick={() => navigate(`/practice/${item.practiceId}`)}
            className="cursor-pointer text-white transition-colors select-none hover:opacity-90"
            style={{
              display: 'flex',
              width: '100%',
              height: '86px',
              padding: '12px 24px',
              justifyContent: 'space-between',
              alignItems: 'center',
              alignSelf: 'stretch',
              borderRadius: '4px',
              background: '#1B1E27',
              borderTop: '0.3px solid rgba(255, 255, 255, 0.05)',
              borderBottom: '0.3px solid rgba(255, 255, 255, 0.05)',
            }}>
            {/* ── 1) [좌측 구역]: 정지 바 아이콘 + 곡 타이틀  ── */}
            <div className="mr-4 flex w-0 flex-1 items-center gap-4">
              <div
                className="flex shrink-0 items-center justify-center gap-[4px]"
                style={{ width: '28px', height: '28px' }}>
                <div className="h-[18px] w-[4px] rounded-sm bg-[#69FFC0]" />
                <div className="h-[18px] w-[4px] rounded-sm bg-[#69FFC0]" />
              </div>

              <span
                className="truncate font-sans"
                style={{
                  fontFamily: 'Pretendard',
                  fontSize: '18px',
                  fontWeight: 500,
                  lineHeight: '30px',
                  letterSpacing: '-0.36px',
                  color: '#FFFFFF',
                }}>
                {item.title}
              </span>
            </div>

            {/* ── 2) [우측 구역]: 메타 정보 & 화살표 ── */}
            <div className="flex shrink-0 items-center gap-8">
              <div
                className="flex items-center text-[#AEB1B6]"
                style={{
                  fontFamily: 'Pretendard',
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '22px',
                  letterSpacing: '-0.28px',
                }}>
                <span className="w-[50px] shrink-0 text-left font-medium text-gray-500 uppercase">{item.genre}</span>
                <span className="w-[70px] shrink-0 text-left whitespace-nowrap">{item.keySignature}</span>
                <span className="w-[75px] shrink-0 text-left whitespace-nowrap">{item.bpm}BPM</span>

                <span className="w-[100px] shrink-0 text-right whitespace-nowrap">{item.timeLabel}</span>
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
        ))}
      </div>
    </div>
  );
}
