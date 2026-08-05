// 학습 홈 조회 훅 — LearnPage에서 사용
import { useQuery } from '@tanstack/react-query';
import { getLearningHome } from '@/apis/learning';
import {
  derivePackageStatus,
  formatEstimatedMinutes,
  mapDifficulty,
  retryExceptClientError,
} from '@/apis/learningMappers';
import type { CurrentLearningInfo, Topic, TopicChapter } from '@/types/topic';

export interface LearningHomeView {
  currentLearning: CurrentLearningInfo | null;
  theoryPackages: Topic[];
  accompanimentPackages: TopicChapter[];
}

export const useLearningHome = () =>
  useQuery({
    queryKey: ['learningHome'],
    queryFn: async (): Promise<LearningHomeView> => {
      const home = await getLearningHome();
      return {
        currentLearning: home.currentLearning
          ? {
              curriculumId: String(home.currentLearning.learningId),
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
