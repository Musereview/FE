// src/types/notification.ts
export interface NotiItem {
  notiId: number;
  title: string;
  timeLabel: string;
  isRead: boolean;
  historyId?: number;
  content?: string;
  type?: 'comment' | 'analysis' | 'achievement' | 'complete';
}
