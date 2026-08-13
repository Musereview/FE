import { useNavigate } from 'react-router-dom';
import DifficultyBadge from '@/components/common/DifficultyBadge';
import type { Difficulty } from '@/constants/difficulty';

interface RecommendationItem {
  learningId: number;
  title: string;
  subtitle: string;
  level: string;
  nextStepId: number;
}

interface RecommendedLearningsProps {
  data: RecommendationItem[];
}

export default function RecommendedLearnings({ data }: RecommendedLearningsProps) {
  const navigate = useNavigate();

  return (
    <div className="flex w-full flex-col">
      <div className="flex w-full gap-4">
        {data.map((item) => (
          <div
            key={item.learningId}
            onClick={() => navigate(`/learn/curriculum/${item.learningId}?step=${item.nextStepId}`)}
            className="flex h-[198px] flex-1 cursor-pointer flex-col items-start rounded-[6px] bg-gray-800 p-8 text-left transition-colors select-none hover:opacity-90">
            {/* ── 상단: 제목과 뱃지 ── */}
            <div className="flex w-full items-center gap-[12px]">
              <span className="w-0 min-w-0 flex-1 truncate font-['Pretendard'] text-[24px] leading-[36px] font-semibold tracking-[-0.02em] text-white">
                {item.title}
              </span>

              <DifficultyBadge difficulty={item.level.toLowerCase() as Difficulty} variant="pill" size="sm" />
            </div>

            {/* ── 하단: 설명 텍스트  ── */}
            <p className="mt-[38px] w-full truncate font-['Pretendard'] text-[20px] leading-[30px] font-normal tracking-[-0.02em] whitespace-pre-line text-gray-500">
              {item.subtitle}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
