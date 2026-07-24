import type { ChapterProgress, ChapterStatus, Curriculum, CurrentLearningInfo, TopicChapter } from '@/types/topic';

const STEP_TEMPLATES: Pick<TopicChapter, 'title' | 'description'>[] = [
  { title: 'Chapter 1', description: '코드에 자연스럽게 색채를 더하는 9th를 학습합니다.' },
  { title: 'Chapter 2', description: '코드에 따라 안정적인 11th와 피해야 할 11th를 구분합니다.' },
  { title: 'Chapter 3', description: '13th가 코드의 색채와 진행감을 어떻게 바꾸는지 학습합니다.' },
];

function buildSteps(statuses: ChapterStatus[]): TopicChapter[] {
  return STEP_TEMPLATES.map((template, index) => ({
    id: `step-${index + 1}`,
    ...template,
    durationLabel: '소요시간 10분',
    status: statuses[index],
    score: statuses[index] === 'completed' ? 93 : undefined,
  }));
}

const STEPS_READY = buildSteps(['ready', 'ready', 'ready']);
const STEPS_COMPLETED = buildSteps(['completed', 'completed', 'completed']);
const STEPS_MIXED = buildSteps(['completed', 'learning', 'ready']);

const CURRICULUM_INFO: Omit<Curriculum, 'steps'> = {
  title: 'Tension Notes',
  difficulty: 'advanced',
  description: '코드에 9th, 11th, 13th를 더해 더 풍부한 화성을 만드는 방법을 배웁니다.',
  bpm: 120,
  timeSignature: '4/4',
  stepDescription: '-11th 텐션 노트 활용하기',
  example: {
    title: '11th Tension Notes Practice - 11th 텐션 활용 예제',
    subtitle: '프로 연주자의 응용 사례',
    durationLabel: '2:34',
  },
  theory:
    '11th 텐션은 기본 코드톤 위에 쌓이는 확장음으로, 옥타브 위의 4도 음을 의미합니다. 코드의 색채를 풍부하게 만들지만, 메이저 코드에서는 3도와의 반음 충돌 때문에 주의가 필요합니다. 따라서 Available Tension인지, Avoid Note 성격인지 구분해서 듣는 것이 중요합니다.',
  theorySummary: {
    title: '11th = 4도 + 옥타브',
    subtitle: '텐션 계열: 9th(2도), 11th(4도), 13th(6도)',
  },
  tips: [
    'Cmaj7에서 11th(F)를 눌러보고 E와의 충돌을 직접 들어보세요.',
    'Cm7에서는 같은 F가 어떻게 더 자연스럽게 들리는지 비교해보세요.',
    '11th는 도미넌트, sus 계열 코드에서 더 잘 살아나는 경우가 많습니다.',
  ],
  tipHighlight: '11th는 항상 나쁜 음이 아니라, 코드 맥락에 따라 다르게 들립니다.',
};

const DEFAULT_CURRICULUM_ID = 'chapter-1';

/** 진행률 0/100/중간 3가지 케이스를 확인할 수 있도록 목데이터 chapter-id마다 다른 steps 구성 매칭 */
export const MOCK_CURRICULA: Record<string, Curriculum> = {
  'chapter-1': { ...CURRICULUM_INFO, steps: STEPS_READY },
  'chapter-2': { ...CURRICULUM_INFO, steps: STEPS_COMPLETED },
  'chapter-3': { ...CURRICULUM_INFO, steps: STEPS_MIXED },
};

export function getCurriculum(curriculumId: string): Curriculum {
  return MOCK_CURRICULA[curriculumId] ?? MOCK_CURRICULA[DEFAULT_CURRICULUM_ID];
}

export function getCurriculumProgress(steps: TopicChapter[]): number {
  if (steps.length === 0) return 0;
  const completedCount = steps.filter((step) => step.status === 'completed').length;
  return Math.round((completedCount / steps.length) * 100);
}

export function getPackageStatus(progress: number): ChapterStatus {
  if (progress === 0) return 'ready';
  if (progress === 100) return 'completed';
  return 'learning';
}

export function getChapterProgressList(chapters: TopicChapter[]): ChapterProgress[] {
  return chapters.map((chapter) => {
    const curriculum = getCurriculum(chapter.id);
    return { chapter, curriculum, progress: getCurriculumProgress(curriculum.steps) };
  });
}

export function getCurrentLearningPackage(chapterProgressList: ChapterProgress[]): CurrentLearningInfo | null {
  for (const { chapter, curriculum, progress } of chapterProgressList) {
    const learningStepIndex = curriculum.steps.findIndex((step) => step.status === 'learning');
    if (learningStepIndex === -1) continue;

    return {
      curriculumId: chapter.id,
      title: curriculum.title,
      difficulty: curriculum.difficulty,
      stepLabel: `${learningStepIndex + 1}단계 - ${curriculum.stepDescription.replace(/^-\s*/, '')}`,
      progress,
    };
  }
  return null;
}
