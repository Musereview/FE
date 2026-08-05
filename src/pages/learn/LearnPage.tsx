// 학습 홈 페이지
import { useNavigate } from 'react-router-dom';
import { useLearningHome } from '@/hooks/useLearningHome';
import RecentStudyBanner from '@/components/learn/RecentStudyBanner';
import TopicCard from '@/components/learn/TopicCard';
import ChapterCard from '@/components/learn/ChapterCard';

function LearnPage() {
  const navigate = useNavigate();
  const { data } = useLearningHome();

  return (
    <section className="mx-auto flex w-full max-w-[1128px] flex-col gap-[100px] px-6 py-[76px]">
      <div className="flex flex-col gap-2">
        <h1 className="heading-medium-b text-gray-200">화성학 이론 학습</h1>
        <p className="body-medium text-gray-600">
          음악 이론의 핵심 개념을 체계적으로 학습하고, 연습을 통해 실력을 키워보세요.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <h2 className="heading-small-b text-gray-300">최근 학습 이어서 하기</h2>
        <RecentStudyBanner data={data?.currentLearning ?? null} />
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex items-end justify-between">
          <div className="flex items-end gap-6">
            <h2 className="heading-small-b text-gray-300">학습 주제</h2>
            <p className="body-medium text-gray-600">필요한 개념을 자유롭게 선택하여 학습해보세요.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/learn/topics')}
            className="body-small cursor-pointer text-gray-600">
            전체보기
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {(data?.theoryPackages ?? []).map((topic) => (
            <TopicCard key={topic.id} topic={topic} onClick={() => navigate(`/learn/curriculum/${topic.id}`)} />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex items-end justify-between">
          <h2 className="heading-small-b text-gray-300">실전 반주법 패키지</h2>
          <button
            type="button"
            onClick={() => navigate('/learn/curriculum')}
            className="body-small cursor-pointer text-gray-600">
            전체보기
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {(data?.accompanimentPackages ?? []).map((chapter) => (
            <ChapterCard
              key={chapter.id}
              chapter={chapter}
              onClick={() => navigate(`/learn/curriculum/${chapter.id}`)}
              onActionClick={() => navigate(`/learn/curriculum/${chapter.id}`)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default LearnPage;
