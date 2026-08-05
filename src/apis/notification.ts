import {
  type NotificationReadResponse,
  type NotificationListResponse,
  type NotificationUnreadStatusResponse,
  type NotificationReadAllResponse,
} from '@/types/notification';
import { axiosInstance } from './axiosInstance';

// 알림 목록 조회
export async function notificationList(page = 0, size = 10) {
  const { data } = await axiosInstance.get<NotificationListResponse>('/api/notifications', {
    params: { page, size },
  });
  return data.data;
}

// 알림 읽음 처리
export async function readNotification(notificationId: number) {
  const { data } = await axiosInstance.patch<NotificationReadResponse>(`/api/notifications/${notificationId}/read`);
  return data.data;
}

// 알림 전체 읽음 처리
export async function readAllNotifications() {
  const { data } = await axiosInstance.patch<NotificationReadAllResponse>('/api/notifications/read-all');
  return data.data;
}

// 읽지 않은 알림 여부 확인
export async function notificationUnreadStatus() {
  const { data } = await axiosInstance.get<NotificationUnreadStatusResponse>('/api/notifications/unread-status');
  return data.data;
}
