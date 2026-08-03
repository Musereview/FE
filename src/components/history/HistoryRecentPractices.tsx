import { useNavigate } from 'react-router-dom';
import ClickableCard from '@/components/common/ClickableCard';
import { isValidHistoryId } from '@/utils/historyId';
import type { HistoryListItem } from '@/types/history';

interface HistoryRecentPracticesProps {
  data?: HistoryListItem[];
}

export default function HistoryRecentPractices({ data = [] }: HistoryRecentPracticesProps) {
  const navigate = useNavigate();

  return (

    <div className="flex w-full flex-col gap-[12px]">
      {data.map((item) => {
        // 점수 변화가 없거나(null) 0이면 중립 처리
        const scoreType =
          item.scoreChange === null || item.scoreChange === 0 ? 'neutral' : item.scoreChange > 0 ? 'up' : 'down';


        const handleClick = () => {
          if (!isValidHistoryId(item.playingId)) return;
          navigate(`/history/${item.playingId}`);
        };

        return (
          <ClickableCard
            key={item.playingId}
            onClick={handleClick}

            className="box-border flex w-full cursor-pointer flex-col gap-4 rounded-[6px] border border-gray-800 bg-gray-900 p-6 text-white transition-colors select-none hover:border-gray-700 md:flex-row md:items-center md:justify-between md:gap-0">
            {/* 좌측 구역 */}
            <div className="flex flex-1 flex-col gap-2 md:pr-6">
              <div className="flex flex-wrap items-center gap-3">
                {/* 곡명 */}
                <span className="text-xl font-normal tracking-tight text-white">{item.title}</span>

                {/* 점수 변화 아이콘 및 텍스트 영역 */}

                <div className="ml-[24px] flex items-center gap-[4px]">
                  {scoreType === 'down' ? (

                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="h-6 w-6 shrink-0">
                        <path
                          d="M20.9502 18C21.3918 17.9998 21.7499 17.6418 21.75 17.2002V12C21.75 11.7239 21.526 11.5001 21.25 11.5C20.9738 11.5 20.75 11.7239 20.75 12V16.2744L15.332 9.98926C14.7626 9.32875 13.7514 9.29157 13.1347 9.9082L10.1035 12.9395C9.90826 13.1346 9.59171 13.1346 9.39645 12.9395L2.85348 6.39648C2.65822 6.20123 2.34171 6.20124 2.14645 6.39648C1.95118 6.59175 1.95119 6.90825 2.14645 7.10352L8.68941 13.6465C9.27521 14.2321 10.2248 14.2322 10.8105 13.6465L13.8418 10.6152C14.0472 10.4098 14.3843 10.4217 14.5742 10.6416L20.0556 17H16.25C15.9738 17 15.75 17.2239 15.75 17.5C15.75 17.7761 15.9738 18 16.25 18H20.9502Z"
                          fill="#FF5D6B"
                        />
                      </svg>


                      <span className="text-[14px] leading-[20px] font-medium text-[#FF5D6B]">{item.scoreChange}</span>

                    </>
                  ) : scoreType === 'up' ? (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="h-6 w-6 shrink-0">
                        <path
                          d="M20.9502 6.25C21.3918 6.25019 21.7499 6.60819 21.75 7.0498V12.25C21.75 12.5261 21.526 12.7499 21.25 12.75C20.9738 12.75 20.75 12.5261 20.75 12.25V7.97559L15.332 14.2607C14.7626 14.9212 13.7514 14.9584 13.1347 14.3418L10.1035 11.3105C9.90826 11.1154 9.59171 11.1154 9.39645 11.3105L2.85348 17.8535C2.65822 18.0488 2.34171 18.0488 2.14645 17.8535C1.95118 17.6583 1.95119 17.3417 2.14645 17.1465L8.68941 10.6035C9.27521 10.0179 10.2248 10.0178 10.8105 10.6035L13.8418 13.6348C14.0472 13.8402 14.3843 13.8283 14.5742 13.6084L20.0556 7.25H16.25C15.9738 7.25 15.75 7.02614 15.75 6.75C15.75 6.47386 15.9738 6.25 16.25 6.25H20.9502Z"
                          fill="#69FFC0"
                        />
                      </svg>


                      <span className="text-primary-400 text-[14px] leading-[20px] font-medium">
                        +{item.scoreChange}
                      </span>

                    </>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-6 w-6 shrink-0">
                      <path d="M6 12H18" stroke="#CECFD1" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  )}
                </div>
              </div>

              {/* 상세 설명 */}

              <p className="m-0 text-[18px] leading-[30px] font-medium tracking-[-0.36px] whitespace-pre-line text-gray-500">
                {item.summary}
              </p>

            </div>

            {/* 우측 구역 */}
            <div className="flex shrink-0 items-center justify-between gap-4 md:justify-end md:gap-6">
              {/* 소요 시간 */}
              <div className="flex items-center gap-1.5 text-sm font-normal text-gray-500 md:w-[120px]">
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

                <span>소요시간 {item.durationMinutes}분</span>
              </div>

              {/* 날짜 */}

              <div className="mr-[24px] w-[90px] text-right text-[14px] leading-[20px] font-normal text-gray-500">
                {item.relativeDate}
              </div>


              {/* 우측 단일 화살표 아이콘 */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className="aspect-square h-6 w-6 shrink-0">
                <path
                  d="M8.5 19.5L16.5 12L8.5 4.5"
                  stroke="#CECFD1"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </ClickableCard>
        );
      })}
    </div>
  );
}
