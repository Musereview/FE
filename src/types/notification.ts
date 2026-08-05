import type { ApiResponse } from './api';

// 알림 타입 (ANALYSIS: 연주 분석 완료 / DEFAULT: 그 외)
export type NotificationType = 'DEFAULT' | 'ANALYSIS';

// 화면 표시용
export interface NotiItem {
  notiId: number;
  type: NotificationType;
  title: string;
  content: string;
  timeLabel: string;
  isRead: boolean;
  // ANALYSIS 알림의 분석 ID, 그 외에는 null
  targetId: number | null;
}

// 알림 목록 조회
export interface NotificationItem {
  notificationId: number;
  type: NotificationType;
  title: string;
  content: string;
  isRead: boolean;
  targetId: number | null;
  createdAt: string;
}

export interface NotificationListData {
  notificationList: NotificationItem[];
  listSize: number;
  hasNext: boolean;
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
