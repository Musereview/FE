import { useEffect, useMemo, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import NotificationDrawer from './NotificationDrawer';
import {
  useNotificationClick,
  useNotificationList,
  useNotificationUnreadStatus,
  useReadAllNotifications,
} from '@/hooks/useNotification';

export default function AppLayout() {
  const [isNotiOpen, setIsNotiOpen] = useState(false);
  const { data: notiList = [] } = useNotificationList();
  const { data: hasUnread = false } = useNotificationUnreadStatus();

  // 주소가 바뀔 때마다 main 컨테이너 스크롤을 맨 위로 (develop)
  const mainScrollRef = useRef<HTMLElement>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    mainScrollRef.current?.scrollTo(0, 0);
  }, [pathname]);

  const handleNotificationClick = useNotificationClick();
  const { mutate: readAll } = useReadAllNotifications();

  const handleToggleNotification = () => {
    setIsNotiOpen((prev) => !prev);
  };

  const contextValue = useMemo(
    () => ({
      onToggleNotification: handleToggleNotification,
      notiList,
      onNotificationClick: handleNotificationClick,
    }),
    [notiList, handleNotificationClick],
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950 text-gray-300">
      <Navbar
        onToggleNotification={handleToggleNotification}
        onCloseNoti={() => setIsNotiOpen(false)}
        isOpen={isNotiOpen}
        hasUnread={hasUnread}
      />

      <main ref={mainScrollRef} className="min-w-0 flex-1 overflow-y-auto">
        <Outlet context={contextValue} />
      </main>

      <NotificationDrawer
        isOpen={isNotiOpen}
        onClose={() => setIsNotiOpen(false)}
        notiList={notiList}
        onReadAll={() => readAll()}
        onNotificationClick={handleNotificationClick}
      />
    </div>
  );
}
