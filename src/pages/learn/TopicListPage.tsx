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

  const { data: topics = [] } = useTheoryTopics(difficulty);

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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibleTopics.map((topic) => (
              <TopicCard key={topic.id} topic={topic} onClick={() => navigate(`/learn/topics/${topic.id}`)} />
            ))}
          </div>

          {hasMoreTopics && <div ref={loadMoreRef} className="h-px w-full" />}
        </div>
      </section>
    </BackNavLayout>
  );
}

export default TopicListPage;
