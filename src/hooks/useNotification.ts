import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { notificationList, readAllNotifications, readNotification } from '@/apis/notification';
import type { NotiItem, NotificationItem } from '@/types/notification';
import { formatRelativeTime } from '@/utils/relativeTime';

function retryExceptClientError(failureCount: number, error: Error) {
  const status = isAxiosError(error) ? error.response?.status : undefined;
  if (status && status >= 400 && status < 500) return false;
  return failureCount < 3;
}

export const NOTIFICATION_QUERY_KEY = ['notification'] as const;
export const notificationListQueryKey = (page: number, size: number) => ['notification', 'list', page, size] as const;

function toNotiItem(item: NotificationItem): NotiItem {
  return {
    notiId: item.notificationId,
    title: item.title,
    content: item.content,
    isRead: item.isRead,
    timeLabel: formatRelativeTime(item.createdAt),
  };
}

// 알림 목록 조회
export function useNotificationList(page = 0, size = 10) {
  return useQuery({
    queryKey: notificationListQueryKey(page, size),
    queryFn: () => notificationList(page, size),
    select: (data) => data.notificationList.map(toNotiItem),
    retry: retryExceptClientError,
  });
}

// 알림 읽음 처리
export function useReadNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: number) => readNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEY });
    },
  });
}

// 알림 전체 읽음 처리
export function useReadAllNotifications() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: readAllNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEY });
    },
  });
}
