import { useNavigate } from 'react-router-dom';

interface RecommendationItem {
  learningId: number;
  title: string;
  level: string;
  description: string;
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
              onClick={() => navigate(`/learn/curriculum/${item.learningId}`)}
              className="flex h-[198px] flex-1 cursor-pointer flex-col items-start justify-between rounded-[6px] bg-[#2B2E36] p-8 text-left transition-colors select-none hover:opacity-90">
              {/* ── 1) 상단 레이어: 노래 제목 & 난이도 뱃지  ── */}
              <div className="flex w-full items-center gap-[6px]">
                <span className="font-sans text-[24px] leading-[36px] font-semibold tracking-[-0.48px] text-white">
                  {item.title}
                </span>

                {/* 난이도 뱃지 스타일 */}
                <div
                  className={`flex w-[40px] shrink-0 items-center justify-center gap-[10px] rounded-full border-[0.5px] bg-[#1B1E27] px-[6px] py-1 ${
                    isAdvanced ? 'border-[#F0ABFF]' : 'border-[#A2ACFF]'
                  }`}>
                  <span
                    className={`font-['Pretendard'] text-[12px] font-semibold ${
                      isAdvanced ? 'text-[#F0ABFF]' : 'text-[#A2ACFF]'
                    }`}>
                    {isAdvanced ? '고급' : '중급'}
                  </span>
                </div>
              </div>

              {/* ── 2) 하단 레이어: 설명 텍스트  ── */}
              <p className="w-full font-['Pretendard'] text-[20px] leading-[30px] font-normal tracking-[-0.4px] whitespace-pre-line text-[#E7E7E8]">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
