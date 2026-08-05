// 학습 주제 전체보기 페이지
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { TopicDifficulty } from '@/types/topic';
import { useTheoryTopics } from '@/hooks/useTheoryTopics';
import { DIFFICULTY_ORDER } from './topicDisplay';
import BackNavLayout from '@/components/learn/BackNavLayout';
import DifficultyTabs from '@/components/learn/DifficultyTabs';
import TopicCard from '@/components/learn/TopicCard';

const PAGE_SIZE = 9;

function TopicListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const difficultyParam = searchParams.get('difficulty');
  const difficulty: TopicDifficulty = DIFFICULTY_ORDER.includes(difficultyParam as TopicDifficulty)
    ? (difficultyParam as TopicDifficulty)
    : 'beginner';

  const handleDifficultyChange = (next: TopicDifficulty) => {
    setSearchParams({ difficulty: next }, { replace: true });
  };

  const { data: topics = [], isLoading, isError, refetch } = useTheoryTopics(difficulty);

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const hasMoreTopics = visibleCount < topics.length;

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [difficulty]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasMoreTopics) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, topics.length));
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMoreTopics, topics.length]);

  const visibleTopics = topics.slice(0, visibleCount);

  return (
    <BackNavLayout>
      <section className="flex flex-col gap-[74px] py-[76px]">
        <h1 className="heading-medium-b text-gray-200">학습 주제</h1>

        <div className="flex flex-col gap-[100px]">
          <DifficultyTabs value={difficulty} onChange={handleDifficultyChange} />

          {isLoading ? (
            <div className="body-medium flex min-h-[300px] items-center justify-center text-gray-500">불러오는 중…</div>
          ) : isError ? (
            <div className="body-medium flex min-h-[300px] flex-col items-center justify-center gap-4 text-gray-500">
              <p>학습 주제를 불러오지 못했어요.</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="button-small bg-primary-400 rounded-[6px] px-4 py-2 text-gray-950">
                다시 시도
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {visibleTopics.map((topic) => (
                  <TopicCard key={topic.id} topic={topic} onClick={() => navigate(`/learn/topics/${topic.id}`)} />
                ))}
              </div>

              {hasMoreTopics && <div ref={loadMoreRef} className="h-px w-full" />}
            </>
          )}
        </div>
      </section>
    </BackNavLayout>
  );
}

export default TopicListPage;
