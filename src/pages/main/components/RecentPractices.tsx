// // src/pages/main/components/RecentPractices.tsx
// import { useNavigate } from 'react-router-dom';

// interface PracticeItem {
//   practiceId: number;
//   title: string;
//   genre: string;
//   keySignature: string;
//   bpm: number;
//   timeLabel: string;
// }

// interface RecentPracticesProps {
//   data: PracticeItem[];
// }

// export default function RecentPractices({ data }: RecentPracticesProps) {
//   const navigate = useNavigate();

//   return (
//     <div className="flex w-full flex-col">
//       <div className="flex w-full flex-col gap-2">
//         {data.map((item) => (
//           <div
//             key={item.practiceId}
//             onClick={() => navigate(`/practice/${item.practiceId}`)}
//             className="cursor-pointer text-white transition-colors select-none hover:opacity-90"
//             style={{
//               display: 'flex',
//               width: '100%',
//               height: '86px',
//               padding: '12px 24px',
//               justifyContent: 'space-between',
//               alignItems: 'center',
//               alignSelf: 'stretch',
//               borderRadius: '4px',
//               background: '#1B1E27',
//               borderTop: '0.3px solid rgba(255, 255, 255, 0.05)',
//               borderBottom: '0.3px solid rgba(255, 255, 255, 0.05)',
//             }}>
//             {/* ── 1) [좌측 구역]: 정지 바 아이콘 + 곡 타이틀  ── */}
//             <div className="mr-4 flex w-0 flex-1 items-center gap-4">
//               <div
//                 className="flex shrink-0 items-center justify-center gap-[4px]"
//                 style={{ width: '28px', height: '28px' }}>
//                 <div className="h-[18px] w-[4px] rounded-sm bg-[#69FFC0]" />
//                 <div className="h-[18px] w-[4px] rounded-sm bg-[#69FFC0]" />
//               </div>

//               <span
//                 className="truncate font-sans"
//                 style={{
//                   fontFamily: 'Pretendard',
//                   fontSize: '18px',
//                   fontWeight: 500,
//                   lineHeight: '30px',
//                   letterSpacing: '-0.36px',
//                   color: '#FFFFFF',
//                 }}>
//                 {item.title}
//               </span>
//             </div>

//             {/* ── 2) [우측 구역]: 메타 정보 & 화살표 ── */}
//             <div className="flex shrink-0 items-center gap-8">
//               <div
//                 className="flex items-center text-[#AEB1B6]"
//                 style={{
//                   fontFamily: 'Pretendard',
//                   fontSize: '14px',
//                   fontWeight: 400,
//                   lineHeight: '22px',
//                   letterSpacing: '-0.28px',
//                 }}>
//                 <span className="w-[50px] shrink-0 text-left font-medium text-gray-500 uppercase">{item.genre}</span>
//                 <span className="w-[70px] shrink-0 text-left whitespace-nowrap">{item.keySignature}</span>
//                 <span className="w-[75px] shrink-0 text-left whitespace-nowrap">{item.bpm}BPM</span>

//                 <span className="w-[100px] shrink-0 text-right whitespace-nowrap">{item.timeLabel}</span>
//               </div>

//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 width="24"
//                 height="24"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 className="shrink-0 text-gray-500">
//                 <path
//                   d="M9 18L15 12L9 6"
//                   stroke="currentColor"
//                   strokeWidth="2"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                 />
//               </svg>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
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
    e.stopPropagation(); // 💥 이벤트 버블링 차단 (카드 상세 이동 방어)

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
          // 현재 루프를 도는 아이템이 재생 중인 상태인지 판별
          const isCurrentlyPlaying = currentPlayingId === item.practiceId;

          return (
            <div
              key={item.practiceId}
              // 카드의 > 아이콘 포함 그 주변을 누르면 해당 연습 상세 페이지로 라우팅
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
              {/* ── 1) [좌측 구역]: 정지/재생 아이콘 + 곡 타이틀 ── */}
              <div className="mr-4 flex w-0 flex-1 items-center gap-4">
                {/* - 기본 정지 상태(!isCurrentlyPlaying): 기존 순정 초록색 바 2개 아이콘
                  - 클릭하여 재생 상태(isCurrentlyPlaying): 재생 세모 아이콘으로 토글
                */}
                <button
                  onClick={(e) => handlePlayToggle(e, item.practiceId)}
                  className="flex shrink-0 items-center justify-center transition-transform active:scale-95"
                  style={{
                    width: '28px',
                    height: '28px',
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                  }}
                  aria-label={isCurrentlyPlaying ? '정지하기' : '재생하기'}>
                  {isCurrentlyPlaying ? (
                    // 재생 상태일 때 노출되는 재생 세모 아이콘 (원래의 정지 아이콘 컬러 #69FFC0 유지)
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
                  ) : (
                    // 기본 정지 상태일 때 노출되는 순정 정지 바 2개 아이콘 [cite: 2021]
                    <div
                      className="flex shrink-0 items-center justify-center gap-[4px]"
                      style={{ width: '28px', height: '28px' }}>
                      <div className="h-[18px] w-[4px] rounded-sm bg-[#69FFC0]" />
                      <div className="h-[18px] w-[4px] rounded-sm bg-[#69FFC0]" />
                    </div>
                  )}
                </button>

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
