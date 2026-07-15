// src/layout/AppLayout.tsx
import { useState, useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import NotificationDrawer from './NotificationDrawer';

// 다른 파일(MainPage 등)에서 타입을 재사용할 수 있도록 export 해줍니다.
export interface NotiItem {
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

  // 불필요한 하위 렌더링을 막기 위해 context 객체를 useMemo로 감싸 전달합니다.
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
      {/* 2. Navbar에게는 알림창을 여는 함수와 안읽은 알림 여부를 전달해 줍니다. */}
      <Navbar onOpenNotification={() => setIsNotiOpen(true)} notiList={notiList} />

      <main className="min-w-0 flex-1 overflow-y-auto">
        {/* 3. contextValue를 전달하여 MainPage가 notiList를 읽을 수 있게 합니다. */}
        <Outlet context={contextValue} />
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
