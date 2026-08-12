import type { NotiItem } from '@/types/notification';

// 홈 대시보드에서는 최신 알림 5개까지만 노출 (전체는 '전체 보기'에서 확인)
const MAX_NOTI_COUNT = 5;

interface DashboardNotiProps {
  data: NotiItem[];
  onNotificationClick: (item: NotiItem) => void;
}

export default function DashboardNoti({ data, onNotificationClick }: DashboardNotiProps) {
  // 알림 데이터가 없을때 초기 상태
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[356px] w-full flex-col items-center justify-center self-stretch rounded-[6px] bg-gray-800 p-[32px] text-center select-none">
        <p className="font-['Pretendard'] text-[24px] leading-[36px] font-semibold tracking-[-0.02em] text-white">
          새로운 알림이 없습니다.
        </p>
      </div>
    );
  }

  const visibleNotis = data.slice(0, MAX_NOTI_COUNT);

  return (
    <div className="flex w-full flex-col">
      <div className="flex w-full flex-col gap-2">
        {visibleNotis.map((item) => (
          <div
            key={item.notiId}
            onClick={() => onNotificationClick(item)}
            className="flex h-[86px] w-full cursor-pointer items-center justify-between rounded bg-gray-900 px-6 py-3 transition-colors select-none hover:opacity-90">
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  item.isRead ? 'bg-[#868A91]' : 'bg-secondary-400'
                }`}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="15"
                  viewBox="0 0 18 15"
                  fill="none"
                  className="block shrink-0">
                  <g transform="translate(1, 1)">
                    <path
                      d="M0 1C0 0.447716 0.447715 0 1 0H17C17.5523 0 18 0.447715 18 1V11.3938C18 11.9461 17.5523 12.3938 17 12.3938H3.71616C3.49498 12.3938 3.28004 12.4672 3.10498 12.6023L0.161118 14.8756C0.0953826 14.9263 0 14.8795 0 14.7964V12.3938V1Z"
                      fill={item.isRead ? '#F0F1F1' : '#EBD3FF'}
                    />
                    {/* 내부 위쪽 선 (긴 선) */}
                    <rect x="4" y="4" width="8" height="1" fill={item.isRead ? '#868A91' : '#AF5DF1'} />
                    {/* 내부 아래쪽 선 (짧은 선) */}
                    <rect x="4" y="7.5" width="4.5" height="1" fill={item.isRead ? '#868A91' : '#AF5DF1'} />
                  </g>
                </svg>
              </div>

              <div className="flex min-w-0 flex-col items-start gap-1">
                <p className="w-full truncate text-left font-sans text-[15px] leading-[22px] font-semibold tracking-[-0.3px] text-white">
                  {item.title}
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
