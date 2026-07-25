// 학습 홈 페이지
import { useNavigate } from 'react-router-dom';
import type { Topic } from '@/types/topic';
import { MOCK_TOPICS, MOCK_CHAPTERS } from './mockTopics';
import { getChapterProgressList, getCurrentLearningPackage, getPackageStatus } from './mockCurriculum';
import { DIFFICULTY_ORDER } from './topicDisplay';
import RecentStudyBanner from '@/components/learn/RecentStudyBanner';
import TopicCard from '@/components/learn/TopicCard';
import ChapterCard from '@/components/learn/ChapterCard';

const FEATURED_TOPICS = DIFFICULTY_ORDER.map((difficulty) =>
  MOCK_TOPICS.find((topic) => topic.difficulty === difficulty),
).filter((topic): topic is Topic => topic !== undefined);

/**
 * TODO: /learn/curriculum(패키지 전체 목록 페이지)가 아직 스텁이라 임시로 연결.
 * TopicDetailPage가 topicId를 무시하고 항상 같은 패키지 목록을 보여주는 현재 동작에 기대고 있어서,
 * TopicDetailPage가 topicId별 실제 콘텐츠를 보여주도록 바뀌면 이 경로는 더 이상 유효하지 않음.
 * /learn/curriculum 구현되면 그쪽으로 교체할 것.
 */
const PACKAGE_LIST_PATH = '/learn/topics/intermediate-1';

function LearnPage() {
  const navigate = useNavigate();
  const chapterProgressList = getChapterProgressList(MOCK_CHAPTERS);
  const currentLearning = getCurrentLearningPackage(chapterProgressList);

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
        <RecentStudyBanner data={currentLearning} />
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
          {FEATURED_TOPICS.map((topic) => (
            <TopicCard key={topic.id} topic={topic} onClick={() => navigate(`/learn/topics/${topic.id}`)} />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex items-end justify-between">
          <h2 className="heading-small-b text-gray-300">실전 반주법 패키지</h2>
          <button
            type="button"
            onClick={() => navigate(PACKAGE_LIST_PATH)}
            className="body-small cursor-pointer text-gray-600">
            전체보기
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {chapterProgressList.map(({ chapter, progress }) => (
            <ChapterCard
              key={chapter.id}
              chapter={{ ...chapter, status: getPackageStatus(progress) }}
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
