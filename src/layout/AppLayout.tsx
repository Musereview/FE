// src/layout/AppLayout.tsx
import { useState, useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import NotificationDrawer from './NotificationDrawer';
import type { NotiItem } from '@/types/notification';

export default function AppLayout() {
  const [isNotiOpen, setIsNotiOpen] = useState(false);
  const [notiList, setNotiList] = useState<NotiItem[]>([
    { notiId: 1, title: '피칭 연습 12', timeLabel: '방금 전', isRead: false, historyId: 101 },
    { notiId: 2, title: '발표 준비 연습', timeLabel: '2시간 전', isRead: false, historyId: 102 },
    { notiId: 3, title: '기획서 스피치', timeLabel: '어제', isRead: true, historyId: 103 },
  ]);

  const handleReadAll = () => {
    setNotiList((prev) => prev.map((item) => ({ ...item, isRead: true })));
  };

  const handleReadItem = (id: number) => {
    setNotiList((prev) => prev.map((item) => (item.notiId === id ? { ...item, isRead: true } : item)));
  };

  const contextValue = useMemo(
    () => ({
      onOpenNotification: () => setIsNotiOpen(true),
      notiList,
      onReadItem: handleReadItem,
    }),
    [notiList],
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950 text-gray-300">
      <Navbar onOpenNotification={() => setIsNotiOpen(true)} notiList={notiList} />

      <main className="min-w-0 flex-1 overflow-y-auto">
        <Outlet context={contextValue} />
      </main>

      <NotificationDrawer
        isOpen={isNotiOpen}
        onClose={() => setIsNotiOpen(false)}
        notiList={notiList}
        onReadAll={handleReadAll}
        onReadItem={handleReadItem}
      />
    </div>
  );
}
