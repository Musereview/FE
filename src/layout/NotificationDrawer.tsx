// src/layout/NotificationDrawer.tsx
import { useNavigate } from 'react-router-dom';

import type { NotiItem } from '@/types/notification';

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
                  onReadItem(item.notiId);
                  onClose();
                  if (item.historyId) {
                    navigate(`/history/${item.historyId}`);
                  } else {
                    navigate(`/history`);
                  }
                }}
                className={`relative flex w-full cursor-pointer flex-col items-start gap-3 rounded-lg p-5 transition-all duration-200 select-none ${
                  item.isRead ? 'bg-[#151720] opacity-55 hover:bg-[#1C1E2A]' : 'bg-[#151720] hover:bg-[#1C1E2A]'
                }`}>
                {!item.isRead && <span className="absolute top-6 right-6 h-2 w-2 rounded-full bg-[#10B981]" />}

                <div className="flex w-full flex-col items-start gap-2 pr-6">
                  <p className="text-left text-[15px] leading-relaxed text-[#E5E7EB]">
                    <span className="font-semibold text-[#10B981]">{item.title}</span>
                    {item.type === 'analysis' ? (
                      <span> 연주 분석이 완료되었습니다.</span>
                    ) : item.type === 'achievement' ? (
                      <span> 님, 이번 주 연습 10시간을 달성했습니다!</span>
                    ) : item.type === 'complete' ? (
                      <span> 학습을 모두 완료했습니다.</span>
                    ) : (
                      <span> 에 코멘트가 작성되었습니다.</span>
                    )}
                  </p>

                  {(!item.type || item.type === 'comment') && (
                    <p className="text-left text-sm leading-relaxed text-gray-400">
                      {item.content ||
                        '길동님, 이번 연주에서 까다로운 리디안 스케일을 아주 잘 살려주셨네요! 특히 귀에 걸리기 쉬운 텐션음들을 자연스럽고...'}
                    </p>
                  )}
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
