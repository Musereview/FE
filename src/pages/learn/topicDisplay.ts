import type { ChapterStatus, TopicDifficulty } from '@/types/topic';

export { DIFFICULTY_LABEL, DIFFICULTY_COLOR } from '@/constants/difficulty';

export const DIFFICULTY_ORDER: TopicDifficulty[] = ['beginner', 'intermediate', 'advanced'];

export const CHAPTER_STATUS_LABEL: Record<ChapterStatus, string> = {
  completed: '완료',
  learning: '학습 중',
  ready: '학습 전',
  retry: '재도전',
};

export const CHAPTER_STATUS_COLOR: Record<ChapterStatus, string> = {
  completed: 'text-primary-400',
  learning: 'text-secondary-300',
  ready: 'text-gray-600',
  retry: 'text-warning',
};
