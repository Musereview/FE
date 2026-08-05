// 학습 홈 조회 훅 — LearnPage에서 사용
import { useQuery } from '@tanstack/react-query';
import { getLearningHome } from '@/apis/learning';
import {
  derivePackageStatus,
  formatEstimatedMinutes,
  mapDifficulty,
  retryExceptClientError,
} from '@/apis/learningMappers';
import { getAccessToken } from '@/utils/authStorage';
import type { CurrentLearningInfo, Topic, TopicChapter } from '@/types/topic';

export interface LearningHomeView {
  currentLearning: CurrentLearningInfo | null;
  theoryPackages: Topic[];
  accompanimentPackages: TopicChapter[];
}

export const useLearningHome = () =>
  useQuery({
    // currentLearning/progressRate가 사용자별 데이터라 계정 전환 시 캐시가 섞이지 않도록 토큰을 키에 포함
    queryKey: ['learningHome', getAccessToken()],
    queryFn: async (): Promise<LearningHomeView> => {
      const home = await getLearningHome();
      return {
        currentLearning: home.currentLearning
          ? {
              curriculumId: String(home.currentLearning.learningId),
              nextStepId: home.currentLearning.nextStepId,
              title: home.currentLearning.title,
              difficulty: mapDifficulty(home.currentLearning.difficulty),
              stepLabel: home.currentLearning.stepTitle,
              progress: home.currentLearning.progressRate,
            }
          : null,
        theoryPackages: home.theoryPackages.map((item) => ({
          id: String(item.learningId),
          title: item.title,
          difficulty: mapDifficulty(item.difficulty),
          description: item.summary,
        })),
        accompanimentPackages: home.accompanimentPackages.map((item) => ({
          id: String(item.learningId),
          title: item.title,
          description: item.description,
          durationLabel: formatEstimatedMinutes(item.estimatedMinutes),
          status: derivePackageStatus(item.progressRate),
        })),
      };
    },
    staleTime: Infinity,
    retry: retryExceptClientError,
  });
