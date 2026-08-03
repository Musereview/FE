// src/layout/AppLayout.tsx
import { useMemo, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import NotificationDrawer from './NotificationDrawer';
import {
  useNotificationList,
  useNotificationUnreadStatus,
  useReadAllNotifications,
  useReadNotification,
} from '@/hooks/useNotification';

export default function AppLayout() {
  const [isNotiOpen, setIsNotiOpen] = useState(false);
  const { data: notiList = [] } = useNotificationList();
  const { data: hasUnread = false } = useNotificationUnreadStatus();

  const { mutate: readItem } = useReadNotification();
  const { mutate: readAll } = useReadAllNotifications();

  const contextValue = useMemo(
    () => ({
      onOpenNotification: () => setIsNotiOpen(true),
      notiList,
      onReadItem: readItem,
    }),
    [notiList, readItem],
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950 text-gray-300">
      <Navbar onOpenNotification={() => setIsNotiOpen(true)} hasUnread={hasUnread} />

      <main className="min-w-0 flex-1 overflow-y-auto">
        <Outlet context={contextValue} />
      </main>

      <NotificationDrawer
        isOpen={isNotiOpen}
        onClose={() => setIsNotiOpen(false)}
        notiList={notiList}
        onReadAll={() => readAll()}
        onReadItem={readItem}
      />
    </div>
  );
}
