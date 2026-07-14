import { useNavigate } from 'react-router-dom';

// 알림 아이템 타입 정의
interface NotiItem {
  notiId: number;
  title: string;
  timeLabel: string;
  isRead: boolean;
  historyId?: number;
}

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notiList: NotiItem[];
  onReadAll: () => void;
  onReadItem: (id: number) => void;
}

export default function NotificationDrawer({
  isOpen,
  onClose,
  notiList,
  onReadAll,
  onReadItem,
}: NotificationDrawerProps) {
  const navigate = useNavigate();

  return (
    <>
      {/* 1. 어두운 배경 오버레이 (Dim) - 열려있을 때만 렌더링 */}
      {isOpen && (
        <div onClick={onClose} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] transition-opacity" />
      )}

      {/* 2. 우측 슬라이드 인 드로어 본체 */}
      <div
        className={`fixed top-0 right-0 z-50 flex h-full w-[400px] flex-col border-l border-[#2E3340] bg-[#12141A] shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
        {/* 헤더 영역 */}
        <div className="flex items-center justify-between border-b border-[#2E3340] px-6 py-5">
          <h2 className="text-lg font-bold text-white">알림</h2>

          <div className="flex items-center gap-4">
            {/* 전체 읽음 처리 */}
            <button
              onClick={onReadAll}
              className="text-xs font-medium text-gray-400 transition-colors hover:text-white">
              전체 읽음
            </button>
            {/* 닫기 버튼 */}
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* 컨텐츠 영역 (스크롤 가능) */}
        <div className="flex-1 space-y-2 overflow-y-auto p-4">
          {notiList.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-20 text-sm text-gray-500">
              새로운 알림이 없습니다.
            </div>
          ) : (
            notiList.map((item) => (
              <div
                key={item.notiId}
                onClick={() => {
                  onReadItem(item.notiId);
                  onClose();
                  if (item.historyId) {
                    navigate(`/history/${item.historyId}`);
                  } else {
                    navigate(`/history`);
                  }
                }}
                className={`flex w-full cursor-pointer items-start gap-3 rounded-lg p-4 transition-colors select-none ${
                  item.isRead ? 'bg-[#12141A] opacity-60' : 'bg-[#1B1E27] hover:bg-[#252936]'
                }`}>
                {/* 읽음/안읽음 상태 아이콘 */}
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    item.isRead ? 'bg-[#2E3340]' : 'bg-[#A855F7]'
                  }`}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={item.isRead ? '#AEB1B6' : '#FFFFFF'}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>

                {/* 알림 본문 */}
                <div className="flex min-w-0 flex-col items-start gap-1">
                  <p className="text-left text-sm leading-relaxed text-white">
                    <span className="font-semibold text-[#A855F7]">{item.title}</span>에 코멘트가 작성되었습니다.
                  </p>
                  <span className="text-xs text-gray-500">{item.timeLabel}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
