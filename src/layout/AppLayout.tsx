// src/layout/AppLayout.tsx
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import NotificationDrawer from './NotificationDrawer';

interface NotiItem {
  notiId: number;
  title: string;
  timeLabel: string;
  isRead: boolean;
  historyId?: number;
}

export default function AppLayout() {
  // 1. Navbar에 있던 알림 관련 상태들을 여기(부모)로 가져왔습니다.
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

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950 text-gray-300">
      {/* 2. Navbar에게는 알림창을 여는 함수와 안읽은 알림 여부를 전달해 줍니다. */}
      <Navbar onOpenNotification={() => setIsNotiOpen(true)} notiList={notiList} />

      <main className="min-w-0 flex-1 overflow-y-auto">
        {/* 3. React Router의 context 기능을 사용해 하위 페이지(MainPage)에 알림창 열기 함수를 안전하게 배달합니다. */}
        <Outlet context={{ onOpenNotification: () => setIsNotiOpen(true) }} />
      </main>

      {/* 4. 알림 드로어는 레이아웃 최상단에서 상태에 맞춰 열리고 닫힙니다. */}
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
