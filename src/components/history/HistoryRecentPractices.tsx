// // src/components/history/HistoryRecentPractices.tsx

import { useNavigate } from 'react-router-dom';

export interface HistoryPracticeItem {
  practiceId?: number;
  playingId?: number;
  title: string;
  scoreChange: string | number;
  scoreType: 'up' | 'down' | 'neutral';
  description?: string;
  summary?: string;
  timeLabel?: string;
  durationMinutes?: number;
  date?: string;
  relativeDate?: string;
}

interface HistoryRecentPracticesProps {
  data?: HistoryPracticeItem[];
}

const FALLBACK_MOCK_ITEMS: HistoryPracticeItem[] = [
  {
    practiceId: 1,
    title: 'Jazz Standard Practice',
    scoreChange: '+8점',
    scoreType: 'up',
    description:
      '리디안 스케일 활용이 우수하며, 텐션음 해결이 자연스러웠습니다.\n박자 안정성을 더 개선하면 좋겠습니다.',
    timeLabel: '소요시간 10분',
    date: '오늘',
  },
  {
    practiceId: 2,
    title: 'Modal Interchange Practice',
    scoreChange: '+6점',
    scoreType: 'up',
    description: '모달 인터체인지 개념을 잘 적용했으나, 전조 구간에서 약간의 불안정함이 있었습니다.',
    timeLabel: '소요시간 10분',
    date: '어제',
  },
  {
    practiceId: 3,
    title: 'Voice Leading Exercise',
    scoreChange: '-5점',
    scoreType: 'down',
    description: '보이스 리딩이 매끄럽지 못했고, 코드 톤 간 연결이 부자연스러웠습니다.\n더 많은 연습이 필요합니다.',
    timeLabel: '소요시간 10분',
    date: '4월 30일',
  },
  {
    practiceId: 4,
    title: 'Blues Scale Improvisation',
    scoreChange: '—',
    scoreType: 'neutral',
    description: '블루스 스케일을 효과적으로 사용했고, 리듬감이 뛰어났습니다.',
    timeLabel: '소요시간 10분',
    date: '4월 29일',
  },
];

export default function HistoryRecentPractices({ data }: HistoryRecentPracticesProps) {
  const navigate = useNavigate();
  const practiceList = data && data.length > 0 ? data : FALLBACK_MOCK_ITEMS;

  return (
    <div className="flex w-full flex-col gap-[12px]">
      {practiceList.map((item) => {
        const id = item.practiceId ?? item.playingId ?? 1;
        const desc = item.description ?? item.summary ?? '';
        const time = item.timeLabel ?? (item.durationMinutes ? `소요시간 ${item.durationMinutes}분` : '');
        const when = item.date ?? item.relativeDate ?? '';

        return (
          <div
            key={id}
            onClick={() => navigate(`/history/${id}`)}
            className="box-border flex w-full max-w-[1196px] cursor-pointer items-center justify-between rounded-[6px] border border-[#2E3142] bg-[#161B22] p-[24px] text-white transition-colors select-none hover:border-[#3A3F4A]">
            {/* 좌측 구역 */}
            <div className="flex flex-1 flex-col gap-[8px] pr-[24px]">
              <div className="flex items-center">
                {/* 곡명 */}
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

                {/* 점수 변화 아이콘 및 텍스트 영역 */}
                <div className="ml-[24px] flex items-center gap-[4px]">
                  {item.scoreType === 'down' ? (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        style={{ width: '24px', height: '24px', flexShrink: 0 }}>
                        <path
                          d="M20.9502 18C21.3918 17.9998 21.7499 17.6418 21.75 17.2002V12C21.75 11.7239 21.526 11.5001 21.25 11.5C20.9738 11.5 20.75 11.7239 20.75 12V16.2744L15.332 9.98926C14.7626 9.32875 13.7514 9.29157 13.1347 9.9082L10.1035 12.9395C9.90826 13.1346 9.59171 13.1346 9.39645 12.9395L2.85348 6.39648C2.65822 6.20123 2.34171 6.20124 2.14645 6.39648C1.95118 6.59175 1.95119 6.90825 2.14645 7.10352L8.68941 13.6465C9.27521 14.2321 10.2248 14.2322 10.8105 13.6465L13.8418 10.6152C14.0472 10.4098 14.3843 10.4217 14.5742 10.6416L20.0556 17H16.25C15.9738 17 15.75 17.2239 15.75 17.5C15.75 17.7761 15.9738 18 16.25 18H20.9502Z"
                          fill="#FF5D6B"
                        />
                      </svg>
                      <span
                        style={{
                          fontFamily: 'Pretendard',
                          fontSize: '14px',
                          fontWeight: 500,
                          lineHeight: '20px',
                          color: '#FF5D6B',
                        }}>
                        {item.scoreChange}
                      </span>
                    </>
                  ) : item.scoreType === 'up' ? (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        style={{ width: '24px', height: '24px', flexShrink: 0 }}>
                        <path
                          d="M20.9502 6.25C21.3918 6.25019 21.7499 6.60819 21.75 7.0498V12.25C21.75 12.5261 21.526 12.7499 21.25 12.75C20.9738 12.75 20.75 12.5261 20.75 12.25V7.97559L15.332 14.2607C14.7626 14.9212 13.7514 14.9584 13.1347 14.3418L10.1035 11.3105C9.90826 11.1154 9.59171 11.1154 9.39645 11.3105L2.85348 17.8535C2.65822 18.0488 2.34171 18.0488 2.14645 17.8535C1.95118 17.6583 1.95119 17.3417 2.14645 17.1465L8.68941 10.6035C9.27521 10.0179 10.2248 10.0178 10.8105 10.6035L13.8418 13.6348C14.0472 13.8402 14.3843 13.8283 14.5742 13.6084L20.0556 7.25H16.25C15.9738 7.25 15.75 7.02614 15.75 6.75C15.75 6.47386 15.9738 6.25 16.25 6.25H20.9502Z"
                          fill="#69FFC0"
                        />
                      </svg>
                      <span
                        style={{
                          fontFamily: 'Pretendard',
                          fontSize: '14px',
                          fontWeight: 500,
                          lineHeight: '20px',
                          color: '#69FFC0',
                        }}>
                        {item.scoreChange}
                      </span>
                    </>
                  ) : (
                    /* neutral(중립)일 때는 텍스트를 숨기고 수평 바 SVG 아이콘만 깔끔하게 출력 */
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      style={{ width: '24px', height: '24px', flexShrink: 0 }}>
                      <path d="M6 12H18" stroke="#CECFD1" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  )}
                </div>
              </div>

              {/* 상세 설명 */}
              <p
                className="m-0 whitespace-pre-line"
                style={{
                  color: '#AEB1B6',
                  fontFamily: 'Pretendard',
                  fontSize: '18px',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  lineHeight: '30px',
                  letterSpacing: '-0.36px',
                }}>
                {desc}
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
                <span>{time}</span>
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
                {when}
              </div>

              {/* 우측 단일 화살표 아이콘 */}
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
