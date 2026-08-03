import type { ApiResponse } from './api';

export interface NotiItem {
  notiId: number;
  title: string;
  timeLabel: string;
  isRead: boolean;
  historyId?: number;
  content?: string;
  type?: 'comment' | 'analysis' | 'achievement' | 'complete';
}

// 알림 목록 조회
export interface NotificationItem {
  notificationId: number;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationListData {
  notificationList: NotificationItem[];
  listSize: number;
  totalPage: number;
  totalElements: number;
  isFirst: boolean;
  isLast: boolean;
}

export type NotificationListResponse = ApiResponse<NotificationListData>;

// 알림 읽음 처리
export interface NotificationReadData {
  id: number;
  createdAt: string;
}

export type NotificationReadResponse = ApiResponse<NotificationReadData>;

// 전체 읽음 처리
export type NotificationReadAllResponse = ApiResponse<boolean>;

// 읽지 않은 알림 여부
export type NotificationUnreadStatusResponse = ApiResponse<boolean>;
