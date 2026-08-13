import { useNavigate } from 'react-router-dom';

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
        {data.map((item) => {
          //레벨 상태 판별
          const isBeginner = item.level === 'BEGINNER';
          const isAdvanced = item.level === 'ADVANCED';

          // ── 난이도별 뱃지 스타일 분기 (초급, 중급, 고급 색상 적용) ──
          const badgeBorderColor = isBeginner
            ? 'border-[#60E272]'
            : isAdvanced
              ? 'border-[#F0ABFF]' // 고급 색상
              : 'border-[#A2ACFF]'; // 중급 색상

          const badgeTextColor = isBeginner
            ? 'text-[#60E272]'
            : isAdvanced
              ? 'text-[#F0ABFF]' // 고급 색상
              : 'text-[#A2ACFF]'; // 중급 색상

          const badgeText = isBeginner ? '초급' : isAdvanced ? '고급' : '중급';

          return (
            <div
              key={item.learningId}
              onClick={() => navigate(`/learn/curriculum/${item.learningId}?step=${item.nextStepId}`)}
              className="flex h-[198px] flex-1 cursor-pointer flex-col items-start rounded-[6px] bg-gray-800 p-8 text-left transition-colors select-none hover:opacity-90">
              {/* ── 상단: 제목과 뱃지 ── */}
              <div className="flex w-full items-center gap-[12px]">
                <span className="w-0 min-w-0 flex-1 truncate font-['Pretendard'] text-[24px] leading-[36px] font-semibold tracking-[-0.02em] text-white">
                  {item.title}
                </span>

                <div
                  className={`flex w-[40px] shrink-0 items-center justify-center gap-[6px] rounded-full border-[0.5px] bg-gray-900 px-[6px] py-1 ${badgeBorderColor}`}>
                  <span className={`font-['Pretendard'] text-[12px] font-semibold ${badgeTextColor}`}>{badgeText}</span>
                </div>
              </div>

              {/* ── 하단: 설명 텍스트  ── */}
              <p className="mt-[38px] w-full truncate font-['Pretendard'] text-[20px] leading-[30px] font-normal tracking-[-0.02em] whitespace-pre-line text-gray-500">
                {item.subtitle}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
