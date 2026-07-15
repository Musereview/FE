import { useNavigate } from 'react-router-dom';

interface NotiItem {
  notiId: number;
  title: string;
  timeLabel: string;
  isRead: boolean;

  historyId?: number;
}

interface DashboardNotiProps {
  data: NotiItem[];
}

export default function DashboardNoti({ data }: DashboardNotiProps) {
  const navigate = useNavigate();

  return (
    <div className="flex w-full flex-col">
      <div className="flex w-full flex-col gap-2">
        {data.map((item) => (
          <div
            key={item.notiId}
            onClick={() => {
              if (item.historyId) {
                navigate(`/history/${item.historyId}`);
              } else {
                navigate(`/history`);
              }
            }}
            className="flex w-full cursor-pointer items-center justify-between transition-colors select-none hover:opacity-90"
            style={{
              display: 'flex',
              height: '86px',
              padding: '12px 24px',
              justifyContent: 'space-between',
              alignItems: 'center',
              alignSelf: 'stretch',
              borderRadius: '4px',
              background: '#1B1E27',
            }}>
            {/* 좌측 영역: 아이콘 + 메시지 */}
            <div className="flex min-w-0 flex-1 items-center gap-4">
              {/* 알림 상태 아이콘 (읽음/안읽음 분기) */}
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                style={{ background: item.isRead ? '#31353F' : '#A855F7' }}>
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
                <p
                  style={{
                    color: '#FFFFFF',
                    fontFamily: 'Pretendard',
                    fontSize: '15px',
                    fontWeight: 500,
                    letterSpacing: '-0.3px',
                    lineHeight: '22px',
                  }}
                  className="w-full truncate text-left">
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
