// 학습 주제 상세(패키지) 페이지
import { useNavigate } from 'react-router-dom';
import { MOCK_CHAPTERS } from './mockTopics';
import { getCurriculum, getCurriculumProgress, getPackageStatus } from './mockCurriculum';
import BackNavLayout from './components/BackNavLayout';
import ChapterCard from './components/ChapterCard';

function TopicDetailPage() {
  const navigate = useNavigate();

  return (
    <BackNavLayout>
      <section className="flex flex-col gap-16 py-[76px]">
        <h1 className="heading-medium-b text-gray-200">실전 반주법 패키지</h1>

        <div className="flex flex-col gap-6">
          <p className="heading-small-b text-gray-300">전체 ({MOCK_CHAPTERS.length})</p>

          <div className="flex flex-col gap-3">
            {MOCK_CHAPTERS.map((chapter) => {
              const progress = getCurriculumProgress(getCurriculum(chapter.id).steps);
              return (
                <ChapterCard
                  key={chapter.id}
                  chapter={{ ...chapter, status: getPackageStatus(progress) }}
                  showAction={false}
                  onClick={() => navigate(`/learn/curriculum/${chapter.id}`)}
                />
              );
            })}
          </div>
        </div>
      </section>
    </BackNavLayout>
  );
}

export default TopicDetailPage;
