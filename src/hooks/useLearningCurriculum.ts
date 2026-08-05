// 학습 커리큘럼 조회 훅 — StepLearningPage/StepTheoryPage에서 사용
import { useQuery } from '@tanstack/react-query';
import { getLearningCurriculum } from '@/apis/learning';
import { formatEstimatedMinutes, mapDifficulty, mapStepStatus, retryExceptClientError } from '@/apis/learningMappers';
import { getLearningIds } from '@/utils/learningId';
import type { ProgressInfoDTO } from '@/types/learning';
import type { TopicChapter, TopicDifficulty } from '@/types/topic';

export interface LearningCurriculumView {
  title: string;
  description: string; // subtitle
  difficulty: TopicDifficulty;
  theoryContent: string; // 마크다운 원문
  practiceTip: string; // 마크다운 원문
  progress: ProgressInfoDTO;
  steps: TopicChapter[];
}

export const useLearningCurriculum = (curriculumId: string) => {
  const { learningId } = getLearningIds(curriculumId);

  return useQuery({
    queryKey: ['learningCurriculum', learningId],
    queryFn: async (): Promise<LearningCurriculumView> => {
      const curriculum = await getLearningCurriculum(learningId);
      return {
        title: curriculum.title,
        description: curriculum.subtitle,
        difficulty: mapDifficulty(curriculum.difficulty),
        theoryContent: curriculum.theoryContent,
        practiceTip: curriculum.practiceTip,
        progress: curriculum.progress,
        steps: curriculum.steps.map((step) => ({
          id: `step-${step.learningStepId}`,
          title: step.title,
          description: step.description,
          durationLabel: formatEstimatedMinutes(step.estimatedMinutes),
          status: mapStepStatus(step.status),
          score: step.score ?? undefined,
        })),
      };
    },
    enabled: learningId > 0,
    staleTime: Infinity,
    retry: retryExceptClientError,
  });
};
