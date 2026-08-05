// 단계별 학습 페이지 (커리큘럼 상세)
import { useNavigate, useParams } from 'react-router-dom';
import { useLearningCurriculum } from '@/hooks/useLearningCurriculum';
import BackNavLayout from '@/components/learn/BackNavLayout';
import ChapterCard from '@/components/learn/ChapterCard';
import CurriculumBanner from '@/components/learn/CurriculumBanner';
import MarkdownContent from '@/components/learn/MarkdownContent';

function StepLearningPage() {
  const navigate = useNavigate();
  const { curriculumId = '' } = useParams<{ curriculumId: string }>();
  const { data } = useLearningCurriculum(curriculumId);
  const {
    title = '',
    difficulty = 'beginner',
    description = '',
    theoryContent = '',
    practiceTip = '',
    steps = [],
    progress = { completedStepCount: 0, totalStepCount: 0, progressRate: 0 },
  } = data ?? {};

  return (
    <BackNavLayout>
      <section className="flex flex-col gap-12 py-[76px]">
        <div className="flex flex-col gap-4">
          <CurriculumBanner title={title} difficulty={difficulty} description={description} />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex h-[270px] flex-col justify-between overflow-y-auto rounded-[6px] bg-gray-800 px-6 py-8">
              <div className="body-large-b flex items-center gap-2 text-gray-200">
                <span className="text-primary-400">📚</span>
                이론 설명
              </div>
              <MarkdownContent content={theoryContent} />
            </div>

            <div className="flex h-[270px] flex-col justify-between overflow-y-auto rounded-[6px] bg-gray-800 px-6 py-8">
              <div className="body-large-b flex items-center gap-2 text-gray-200">
                <span className="text-primary-400">💡</span>
                연습 팁
              </div>
              <MarkdownContent content={practiceTip} />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-12">
          <div className="flex items-center justify-between">
            <div className="flex items-end gap-4">
              <h2 className="heading-small-b text-primary-400">단계별 학습</h2>
              <span className="body-regular2 text-gray-500">
                ({progress.completedStepCount}/{progress.totalStepCount})
              </span>
            </div>

            <div className="flex w-96 flex-col gap-4">
              <p className="body-regular2 text-gray-300">진행률 {progress.progressRate}%</p>
              <div className="h-1 w-full rounded-full bg-gray-700">
                <div className="bg-primary-400 h-1 rounded-full" style={{ width: `${progress.progressRate}%` }} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {steps.map((step) => (
              <ChapterCard
                key={step.id}
                chapter={step}
                onActionClick={() => navigate(`/learn/curriculum/${curriculumId}/theory`)}
              />
            ))}
          </div>
        </div>
      </section>
    </BackNavLayout>
  );
}

export default StepLearningPage;
