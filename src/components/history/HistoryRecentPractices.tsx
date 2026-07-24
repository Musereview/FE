// // src/components/history/HistoryRecentPractices.tsx

// import { useNavigate } from 'react-router-dom';

// interface HistoryPracticeItem {
//   practiceId: number;
//   title: string;
//   scoreChange: string;
//   scoreType: 'up' | 'down' | 'neutral';
//   description: string;
//   timeLabel: string;
//   date: string;
// }

// interface HistoryRecentPracticesProps {
//   data: HistoryPracticeItem[];
// }

// export default function HistoryRecentPractices({ data }: HistoryRecentPracticesProps) {
//   const navigate = useNavigate();

//   return (
//     <div className="flex w-full flex-col gap-[12px]">
//       {data?.map((item) => {
//         return (
//           <div
//             key={item.practiceId}
//             onClick={() => navigate(`/history/${item.practiceId}`)}
//             className="cursor-pointer text-white transition-colors select-none hover:border-[#3A3F4A]"
//             style={{
//               display: 'flex',
//               width: '100%',
//               maxWidth: '1196px',
//               padding: '24px',
//               justifyContent: 'space-between',
//               alignItems: 'center',
//               borderRadius: '6px',
//               background: '#161B22',
//               border: '1px solid #2E3142',
//               boxSizing: 'border-box',
//             }}>
//             {/* 좌측 구역 */}
//             <div className="flex flex-1 flex-col gap-[8px] pr-[24px]">
//               <div className="flex items-center">
//                 <span
//                   style={{
//                     color: '#FFF',
//                     fontFamily: 'Pretendard',
//                     fontSize: '20px',
//                     fontStyle: 'normal',
//                     fontWeight: 400,
//                     lineHeight: '30px',
//                     letterSpacing: '-0.4px',
//                   }}>
//                   {item.title}
//                 </span>

//                 <div className="ml-[24px] flex items-center gap-[4px]">
//                   {item.scoreType === 'down' ? (
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       width="24"
//                       height="24"
//                       viewBox="0 0 24 24"
//                       fill="none"
//                       style={{ width: '24px', height: '24px', flexShrink: 0, aspectRatio: '1/1' }}>
//                       <path
//                         d="M20.9502 18C21.3918 17.9998 21.7499 17.6418 21.75 17.2002V12C21.75 11.7239 21.526 11.5001 21.25 11.5C20.9738 11.5 20.75 11.7239 20.75 12V16.2744L15.332 9.98926C14.7626 9.32875 13.7514 9.29157 13.1347 9.9082L10.1035 12.9395C9.90826 13.1346 9.59171 13.1346 9.39645 12.9395L2.85348 6.39648C2.65822 6.20123 2.34171 6.20124 2.14645 6.39648C1.95118 6.59175 1.95119 6.90825 2.14645 7.10352L8.68941 13.6465C9.27521 14.2321 10.2248 14.2322 10.8105 13.6465L13.8418 10.6152C14.0472 10.4098 14.3843 10.4217 14.5742 10.6416L20.0556 17H16.25C15.9738 17 15.75 17.2239 15.75 17.5C15.75 17.7761 15.9738 18 16.25 18H20.9502Z"
//                         fill="#FF5D6B"
//                       />
//                     </svg>
//                   ) : item.scoreType === 'up' ? (
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       width="24"
//                       height="24"
//                       viewBox="0 0 24 24"
//                       fill="none"
//                       style={{ width: '24px', height: '24px', flexShrink: 0, aspectRatio: '1/1' }}>
//                       <path
//                         d="M20.9502 6.25C21.3918 6.25019 21.7499 6.60819 21.75 7.0498V12.25C21.75 12.5261 21.526 12.7499 21.25 12.75C20.9738 12.75 20.75 12.5261 20.75 12.25V7.97559L15.332 14.2607C14.7626 14.9212 13.7514 14.9584 13.1347 14.3418L10.1035 11.3105C9.90826 11.1154 9.59171 11.1154 9.39645 11.3105L2.85348 17.8535C2.65822 18.0488 2.34171 18.0488 2.14645 17.8535C1.95118 17.6583 1.95119 17.3417 2.14645 17.1465L8.68941 10.6035C9.27521 10.0179 10.2248 10.0178 10.8105 10.6035L13.8418 13.6348C14.0472 13.8402 14.3843 13.8283 14.5742 13.6084L20.0556 7.25H16.25C15.9738 7.25 15.75 7.02614 15.75 6.75C15.75 6.47386 15.9738 6.25 16.25 6.25H20.9502Z"
//                         fill="#69FFC0"
//                       />
//                     </svg>
//                   ) : (
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       width="24"
//                       height="24"
//                       viewBox="0 0 24 24"
//                       fill="none"
//                       style={{ width: '24px', height: '24px', flexShrink: 0, aspectRatio: '1/1' }}>
//                       <path d="M6 12H18" stroke="#CECFD1" strokeLinecap="round" />
//                     </svg>
//                   )}

//                   {item.scoreType !== 'neutral' && (
//                     <span
//                       style={{
//                         fontFamily: 'Pretendard',
//                         fontSize: '14px',
//                         fontWeight: 500,
//                         lineHeight: '20px',
//                         color: item.scoreType === 'down' ? '#FF5D6B' : '#69FFC0',
//                       }}>
//                       {item.scoreChange}
//                     </span>
//                   )}
//                 </div>
//               </div>

//               <p
//                 className="m-0 whitespace-pre-line"
//                 style={{
//                   color: 'var(--Color-Gray-Scale-500, #AEB1B6)',
//                   fontFamily: 'Pretendard',
//                   fontSize: '18px',
//                   fontStyle: 'normal',
//                   fontWeight: 500,
//                   lineHeight: '30px',
//                   letterSpacing: '-0.36px',
//                 }}>
//                 {item.description}
//               </p>
//             </div>

//             {/* 우측 구역 */}
//             <div className="flex shrink-0 items-center">
//               {/* 소요 시간 */}
//               <div
//                 className="flex items-center gap-[6px]"
//                 style={{
//                   width: '120px',
//                   fontFamily: 'Pretendard',
//                   fontSize: '14px',
//                   fontWeight: 400,
//                   lineHeight: '20px',
//                   color: '#AEB1B6',
//                 }}>
//                 <svg
//                   width="16"
//                   height="16"
//                   viewBox="0 0 16 16"
//                   fill="none"
//                   xmlns="http://www.w3.org/2000/svg"
//                   className="shrink-0">
//                   <circle cx="8" cy="8" r="6.5" stroke="#AEB1B6" strokeWidth="1.2" />
//                   <path d="M8 4.5V8H11" stroke="#AEB1B6" strokeWidth="1.2" strokeLinecap="round" />
//                 </svg>
//                 <span>{item.timeLabel}</span>
//               </div>

//               {/* 날짜 */}
//               <div
//                 className="text-right"
//                 style={{
//                   width: '90px',
//                   marginRight: '24px',
//                   fontFamily: 'Pretendard',
//                   fontSize: '14px',
//                   fontWeight: 400,
//                   lineHeight: '20px',
//                   color: '#AEB1B6',
//                 }}>
//                 {item.date}
//               </div>

//               {/* > 아이콘 */}
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 width="24"
//                 height="24"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 style={{ width: '24px', height: '24px', flexShrink: 0, aspectRatio: '1/1' }}>
//                 <path
//                   d="M8.5 19.5L16.5 12L8.5 4.5"
//                   stroke="#CECFD1"
//                   strokeWidth="1.5"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                 />
//               </svg>
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// }
import { useNavigate } from 'react-router-dom';

interface HistoryPracticeItem {
  practiceId: number;
  title: string;
  scoreChange: string;
  scoreType: 'up' | 'down' | 'neutral';
  description: string;
  timeLabel: string;
  date: string;
}

interface HistoryRecentPracticesProps {
  data: HistoryPracticeItem[];
}

export default function HistoryRecentPractices({ data }: HistoryRecentPracticesProps) {
  const navigate = useNavigate();

  return (
    <div className="flex w-full flex-col gap-[12px]">
      {data?.map((item) => {
        return (
          <div
            key={item.practiceId}
            onClick={() => navigate(`/history/${item.practiceId}`)}
            className="box-border flex w-full max-w-[1196px] cursor-pointer items-center justify-between rounded-[6px] border border-[#2E3142] bg-[#161B22] p-[24px] text-white transition-colors select-none hover:border-[#3A3F4A]">
            {/* 좌측 구역 */}
            <div className="flex flex-1 flex-col gap-[8px] pr-[24px]">
              <div className="flex items-center">
                <span
                  style={{
                    color: '#FFF',
                    fontFamily: 'Pretendard',
                    fontSize: '20px',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    lineHeight: '30px',
                    letterSpacing: '-0.4px',
                  }}>
                  {item.title}
                </span>

                <div className="ml-[24px] flex items-center gap-[4px]">
                  {item.scoreType === 'down' ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      style={{ width: '24px', height: '24px', flexShrink: 0, aspectRatio: '1/1' }}>
                      <path
                        d="M20.9502 18C21.3918 17.9998 21.7499 17.6418 21.75 17.2002V12C21.75 11.7239 21.526 11.5001 21.25 11.5C20.9738 11.5 20.75 11.7239 20.75 12V16.2744L15.332 9.98926C14.7626 9.32875 13.7514 9.29157 13.1347 9.9082L10.1035 12.9395C9.90826 13.1346 9.59171 13.1346 9.39645 12.9395L2.85348 6.39648C2.65822 6.20123 2.34171 6.20124 2.14645 6.39648C1.95118 6.59175 1.95119 6.90825 2.14645 7.10352L8.68941 13.6465C9.27521 14.2321 10.2248 14.2322 10.8105 13.6465L13.8418 10.6152C14.0472 10.4098 14.3843 10.4217 14.5742 10.6416L20.0556 17H16.25C15.9738 17 15.75 17.2239 15.75 17.5C15.75 17.7761 15.9738 18 16.25 18H20.9502Z"
                        fill="#FF5D6B"
                      />
                    </svg>
                  ) : item.scoreType === 'up' ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      style={{ width: '24px', height: '24px', flexShrink: 0, aspectRatio: '1/1' }}>
                      <path
                        d="M20.9502 6.25C21.3918 6.25019 21.7499 6.60819 21.75 7.0498V12.25C21.75 12.5261 21.526 12.7499 21.25 12.75C20.9738 12.75 20.75 12.5261 20.75 12.25V7.97559L15.332 14.2607C14.7626 14.9212 13.7514 14.9584 13.1347 14.3418L10.1035 11.3105C9.90826 11.1154 9.59171 11.1154 9.39645 11.3105L2.85348 17.8535C2.65822 18.0488 2.34171 18.0488 2.14645 17.8535C1.95118 17.6583 1.95119 17.3417 2.14645 17.1465L8.68941 10.6035C9.27521 10.0179 10.2248 10.0178 10.8105 10.6035L13.8418 13.6348C14.0472 13.8402 14.3843 13.8283 14.5742 13.6084L20.0556 7.25H16.25C15.9738 7.25 15.75 7.02614 15.75 6.75C15.75 6.47386 15.9738 6.25 16.25 6.25H20.9502Z"
                        fill="#69FFC0"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      style={{ width: '24px', height: '24px', flexShrink: 0, aspectRatio: '1/1' }}>
                      <path d="M6 12H18" stroke="#CECFD1" strokeLinecap="round" />
                    </svg>
                  )}

                  {item.scoreType !== 'neutral' && (
                    <span
                      style={{
                        fontFamily: 'Pretendard',
                        fontSize: '14px',
                        fontWeight: 500,
                        lineHeight: '20px',
                        color: item.scoreType === 'down' ? '#FF5D6B' : '#69FFC0',
                      }}>
                      {item.scoreChange}
                    </span>
                  )}
                </div>
              </div>

              <p
                className="m-0 whitespace-pre-line"
                style={{
                  color: 'var(--Color-Gray-Scale-500, #AEB1B6)',
                  fontFamily: 'Pretendard',
                  fontSize: '18px',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  lineHeight: '30px',
                  letterSpacing: '-0.36px',
                }}>
                {item.description}
              </p>
            </div>

            {/* 우측 구역 */}
            <div className="flex shrink-0 items-center">
              {/* 소요 시간 */}
              <div
                className="flex items-center gap-[6px]"
                style={{
                  width: '120px',
                  fontFamily: 'Pretendard',
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '20px',
                  color: '#AEB1B6',
                }}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="shrink-0">
                  <circle cx="8" cy="8" r="6.5" stroke="#AEB1B6" strokeWidth="1.2" />
                  <path d="M8 4.5V8H11" stroke="#AEB1B6" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                <span>{item.timeLabel}</span>
              </div>

              {/* 날짜 */}
              <div
                className="text-right"
                style={{
                  width: '90px',
                  marginRight: '24px',
                  fontFamily: 'Pretendard',
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '20px',
                  color: '#AEB1B6',
                }}>
                {item.date}
              </div>

              {/* > 아이콘 */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                style={{ width: '24px', height: '24px', flexShrink: 0, aspectRatio: '1/1' }}>
                <path
                  d="M8.5 19.5L16.5 12L8.5 4.5"
                  stroke="#CECFD1"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        );
      })}
    </div>
  );
}
