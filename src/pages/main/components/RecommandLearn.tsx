// 추천 학습 카드들
// src/pages/main/components/RecommendedLearnings.tsx
import { useNavigate } from 'react-router-dom';

interface LearningCard {
  learningId: number;
  title: string;
  level: string; // "ADVANCED" | "INTERMEDIATE" | "BEGINNER"
  description: string;
}

interface RecommendedLearningsProps {
  data: LearningCard[];
}

export default function RecommendedLearnings({ data }: RecommendedLearningsProps) {
  const navigate = useNavigate();

  return (
    <div className="flex w-full flex-col gap-3.5 text-left">
      {/* 1. 섹션 타이틀 라벨  */}
      <h2 className="text-xl font-bold tracking-tight text-white">추천 학습</h2>

      {/* 2. 추천 학습 카드 리스트
       */}
      <div className="grid w-full grid-cols-2 gap-6">
        {data.map((card) => {
          const levelLabel = card.level === 'ADVANCED' ? '고급' : card.level === 'INTERMEDIATE' ? '중급' : '초급';

          return (
            <div
              key={card.learningId}
              onClick={() => navigate(`/learn/curriculum/${card.learningId}`)}

              className="flex cursor-pointer flex-col gap-3 rounded-[16px] border border-gray-800 bg-[#161B22] p-6 transition-all duration-300 select-none hover:border-gray-700 active:scale-[0.995]">
              {/* 카드 상단 헤더: 타이틀 & 배지 */}
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg leading-none font-bold tracking-tight text-white">{card.title}</h3>
                {/* 추천학습 전용 둥근 미니 배지 */}
                <span className="rounded bg-gray-800 px-2 py-0.5 text-xs leading-none font-semibold text-gray-400">
                  {levelLabel}
                </span>
              </div>

              {/* 카드 본문: 상세 설명 파트 
                 
              */}
              <p className="text-sm leading-relaxed font-normal tracking-tight whitespace-pre-line text-gray-400">
                {card.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
