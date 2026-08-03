import { useState, useMemo, useRef, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import NotificationDrawer from './NotificationDrawer';
import type { NotiItem } from '@/types/notification';

export default function AppLayout() {
  const [isNotiOpen, setIsNotiOpen] = useState(false);
  const [notiList, setNotiList] = useState<NotiItem[]>([]);

  // 1. main 태그를 타겟팅할 ref 생성
  const mainScrollRef = useRef<HTMLElement>(null);
  const { pathname } = useLocation();

  // 2. 주소(pathname)가 바뀔 때마다 main 컨테이너의 스크롤을 맨 위(0)로 강제 이동
  useEffect(() => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo(0, 0);
    }
  }, [pathname]);

  const handleReadAll = () => {
    setNotiList((prev) => prev.map((item) => ({ ...item, isRead: true })));
  };

  const handleReadItem = (id: number) => {
    setNotiList((prev) => prev.map((item) => (item.notiId === id ? { ...item, isRead: true } : item)));
  };

  const handleToggleNotification = () => {
    setIsNotiOpen((prev) => !prev);
  };

  const contextValue = useMemo(
    () => ({
      onToggleNotification: handleToggleNotification,
      notiList,
      onReadItem: handleReadItem,
    }),
    [notiList, isNotiOpen],
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950 text-gray-300">
      <Navbar
        onToggleNotification={handleToggleNotification}
        notiList={notiList}
        onCloseNoti={() => setIsNotiOpen(false)}
        isOpen={isNotiOpen}
      />

      {/* 3. ref 연결 */}
      <main ref={mainScrollRef} className="min-w-0 flex-1 overflow-y-auto">
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
