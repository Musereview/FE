// 학습 주제 상세(패키지) 페이지
import { useNavigate } from 'react-router-dom';
import { useAccompanimentList } from '@/hooks/useAccompanimentList';
import BackNavLayout from '@/components/learn/BackNavLayout';
import ChapterCard from '@/components/learn/ChapterCard';

function TopicDetailPage() {
  const navigate = useNavigate();
  const { data: chapters = [] } = useAccompanimentList();

  return (
    <BackNavLayout>
      <section className="flex flex-col gap-16 py-[76px]">
        <h1 className="heading-medium-b text-gray-200">실전 반주법 패키지</h1>

        <div className="flex flex-col gap-6">
          <p className="heading-small-b text-gray-300">전체 ({chapters.length})</p>

          <div className="flex flex-col gap-3">
            {chapters.map((chapter) => (
              <ChapterCard
                key={chapter.id}
                chapter={chapter}
                showAction={false}
                onClick={() => navigate(`/learn/curriculum/${chapter.id}`)}
              />
            ))}
          </div>
        </div>
      </section>
    </BackNavLayout>
  );
}

export default TopicDetailPage;
