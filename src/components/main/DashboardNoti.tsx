import { useNavigate } from 'react-router-dom';

import type { NotiItem } from '@/types/notification';

interface DashboardNotiProps {
  data: NotiItem[];
  onReadItem: (id: number) => void;
}

export default function DashboardNoti({ data, onReadItem }: DashboardNotiProps) {
  const navigate = useNavigate();

  //알림 데이터가 없을떄 초기 상태
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[198px] w-full flex-col items-center justify-center self-stretch rounded-[6px] bg-[#1C1E24] p-8 text-center select-none">
        <p className="font-['Pretendard'] text-[24px] leading-[36px] font-semibold tracking-[-0.02em] text-white">
          새로운 알림이 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col">
      <div className="flex w-full flex-col gap-2">
        {data.map((item) => (
          <div
            key={item.notiId}
            onClick={() => {
              onReadItem(item.notiId);
              if (item.historyId) {
                navigate(`/history/${item.historyId}`);
              } else {
                navigate(`/history`);
              }
            }}
            className="flex h-[86px] w-full cursor-pointer items-center justify-between rounded bg-[#1B1E27] px-6 py-3 transition-colors select-none hover:opacity-90">
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  item.isRead ? 'bg-[#31353F]' : 'bg-[#A855F7]'
                }`}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={item.isRead ? '#AEB1B6' : '#FFFFFF'}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>

              <div className="flex min-w-0 flex-col items-start gap-1">
                <p className="w-full truncate text-left font-sans text-[15px] leading-[22px] font-medium tracking-[-0.3px] text-white">
                  <span className="font-semibold">{item.title}</span>에 코멘트가 작성되었습니다.
                </p>
                <span className="font-sans text-xs text-gray-400">{item.timeLabel}</span>
              </div>
            </div>

            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="ml-4 shrink-0 text-gray-500">
              <path
                d="M6 12L10 8L6 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}
