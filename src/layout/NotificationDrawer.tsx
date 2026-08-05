import type { NotiItem } from '@/types/notification';
import { isClickableNoti } from '@/hooks/useNotification';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notiList: NotiItem[];
  onReadAll: () => void;
  onNotificationClick: (item: NotiItem) => void;
}

export default function NotificationDrawer({
  isOpen,
  onClose,
  notiList,
  onReadAll,
  onNotificationClick,
}: NotificationDrawerProps) {
  if (!isOpen) return null;

  const hasUnread = notiList.some((item) => !item.isRead);

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 left-[90px] z-40 bg-black/60 backdrop-blur-[2px] transition-opacity"
      />

      <div className="fixed top-0 bottom-0 left-[90px] z-45 flex h-full w-[400px] flex-col bg-[#0B0D14] shadow-2xl transition-all duration-300 ease-in-out">
        <div className="flex items-center justify-between px-6 pt-7 pb-4">
          <h2 className="text-xl font-bold text-white">알림</h2>
          <button onClick={onClose} className="text-gray-400 transition-colors hover:text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {hasUnread && (
          <div className="flex justify-end px-6 pb-4">
            <button
              onClick={onReadAll}
              className="text-sm font-medium text-[#10B981] transition-colors hover:text-[#059669]">
              모두 읽음 처리
            </button>
          </div>
        )}

        <div className="flex-1 space-y-4 overflow-y-auto px-6 pb-6">
          {notiList.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-20 text-sm text-gray-500">
              새로운 알림이 없습니다.
            </div>
          ) : (
            notiList.map((item) => (
              <div
                key={item.notiId}
                onClick={() => {
                  onNotificationClick(item);
                  // 이동하는 알림만 드로어를 닫음
                  if (isClickableNoti(item)) onClose();
                }}
                className={`relative flex w-full cursor-pointer flex-col items-start gap-3 rounded-lg p-5 transition-all duration-200 select-none ${
                  item.isRead ? 'bg-[#151720] opacity-55 hover:bg-[#1C1E2A]' : 'bg-[#151720] hover:bg-[#1C1E2A]'
                }`}>
                {!item.isRead && <span className="absolute top-6 right-6 h-2 w-2 rounded-full bg-[#10B981]" />}

                <div className="flex w-full flex-col items-start gap-2 pr-6">
                  <p className="text-left text-[15px] leading-relaxed font-semibold text-[#10B981]">{item.title}</p>

                  {item.content && <p className="text-left text-sm leading-relaxed text-gray-400">{item.content}</p>}
                </div>

                <span className="text-xs text-gray-500">{item.timeLabel}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
