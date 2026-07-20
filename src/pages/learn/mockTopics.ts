import type { Topic, TopicChapter } from '@/types/topic';

const MOCK_TOPIC_COUNT = 5;

export const MOCK_TOPICS: Topic[] = [
  ...Array.from({ length: MOCK_TOPIC_COUNT }, (_, index) => ({
    id: `beginner-${index + 1}`,
    title: 'Diatonic Chords',
    difficulty: 'beginner' as const,
    description: '스케일 안에서 만들어지는 코드의 관계를 이해합니다.',
  })),
  ...Array.from({ length: MOCK_TOPIC_COUNT }, (_, index) => ({
    id: `intermediate-${index + 1}`,
    title: 'Pentatonic Scale',
    difficulty: 'intermediate' as const,
    description: '5중 음계로 블루스, 록, 팝에서 광범위하게 사용됩니다.',
  })),
  ...Array.from({ length: MOCK_TOPIC_COUNT }, (_, index) => ({
    id: `advanced-${index + 1}`,
    title: 'Lydian Scale',
    difficulty: 'advanced' as const,
    description: '밝고 몽환적인 색채를 가진 모드. #4도 음정이 특징입니다.',
  })),
];

/**
 * 임시 값(placeholder) — 실제 진행률은 TopicDetailPage에서
 * 각 chapter.id에 매칭되는 커리큘럼 데이터(getCurriculumProgress)로 계산 후 덮어써짐.
 */
export const MOCK_CHAPTERS: TopicChapter[] = [
  {
    id: 'chapter-1',
    title: 'Chapter 1',
    description: '코드에 자연스럽게 색채를 더하는 9th를 학습합니다.',
    durationLabel: '소요시간 10분',
    status: 'ready',
  },
  {
    id: 'chapter-2',
    title: 'Chapter 2',
    description: '코드에 따라 안정적인 11th와 피해야 할 11th를 구분합니다.',
    durationLabel: '소요시간 10분',
    status: 'ready',
  },
  {
    id: 'chapter-3',
    title: 'Chapter 3',
    description: '13th가 코드의 색채와 진행감을 어떻게 바꾸는지 학습합니다.',
    durationLabel: '소요시간 10분',
    status: 'ready',
  },
];
