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
          const isAdvanced = item.level === 'ADVANCED';

          return (
            <div
              key={item.learningId}
              onClick={() => navigate(`/learn/curriculum/${item.learningId}?step=${item.nextStepId}`)}
              className="flex h-[198px] flex-1 cursor-pointer flex-col items-start rounded-[6px] bg-gray-800 p-8 text-left transition-colors select-none hover:opacity-90">
              {/* ── 상단: 제목과 뱃지 ── */}
              <div className="flex w-full items-center gap-[12px]">
                <span className="font-['Pretendard'] text-[24px] leading-[36px] font-semibold tracking-[-0.02em] text-white">
                  {item.title}
                </span>

                <div
                  className={`flex w-[40px] shrink-0 items-center justify-center gap-[6px] rounded-full border-[0.5px] bg-gray-900 px-[6px] py-1 ${isAdvanced ? 'border-secondary-300' : 'border-secondary-400'}`}>
                  <span
                    className={`font-['Pretendard'] text-[12px] font-semibold ${isAdvanced ? 'text-secondary-300' : 'text-secondary-400'}`}>
                    {isAdvanced ? '고급' : '중급'}
                  </span>
                </div>
              </div>

              {/* ── 하단: 설명 텍스트  ── */}
              <p className="mt-[38px] w-full font-['Pretendard'] text-[20px] leading-[30px] font-normal tracking-[-0.02em] whitespace-pre-line text-gray-500">
                {item.subtitle}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
