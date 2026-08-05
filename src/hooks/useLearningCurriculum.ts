// 학습 커리큘럼 조회 훅 — StepLearningPage/StepTheoryPage에서 사용
import { useQuery } from '@tanstack/react-query';
import { getLearningCurriculum } from '@/apis/learning';
import { formatEstimatedMinutes, mapDifficulty, mapStepStatus, retryExceptClientError } from '@/apis/learningMappers';
import { getLearningIds } from '@/utils/learningId';
import { getAccessToken } from '@/utils/authStorage';
import type { ProgressInfoDTO } from '@/types/learning';
import type { TopicChapter, TopicDifficulty } from '@/types/topic';

// steps[].id는 ChapterCard 등 기존 컴포넌트 호환용 문자열 key. 실제 라우팅에는 learningStepId(숫자)를 사용.
export interface CurriculumStepView extends TopicChapter {
  learningStepId: number;
}

export interface LearningCurriculumView {
  title: string;
  description: string; // subtitle
  difficulty: TopicDifficulty;
  theoryContent: string; // 마크다운 원문
  practiceTip: string; // 마크다운 원문
  progress: ProgressInfoDTO;
  steps: CurriculumStepView[];
}

export const useLearningCurriculum = (curriculumId: string) => {
  const { learningId } = getLearningIds(curriculumId);

  return useQuery({
    // progress/steps가 사용자별 진행 상황을 담고 있어 계정 전환 시 캐시가 섞이지 않도록 토큰을 키에 포함
    queryKey: ['learningCurriculum', learningId, getAccessToken()],
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
          learningStepId: step.learningStepId,
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
