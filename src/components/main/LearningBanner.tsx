import { useNavigate } from 'react-router-dom';
import bannerBg from '@/assets/main/image-mesh-gradient.png';

interface LearningBannerProps {
  data: {
    learningId: number;
    title: string;
    subtitle: string;
    level: string;
    progressRate: number;
  } | null;
}

export default function LearningBanner({ data }: LearningBannerProps) {
  const navigate = useNavigate();

  // ── 데이터가 없거나 모두 완료해서 진행 중인 학습이 없을 때 ──
  if (!data) {
    return (
      <div className="flex h-[198px] w-full flex-col items-center justify-center self-stretch rounded-[6px] bg-[#1C1E24] p-8 text-center select-none">
        <h4 className="mb-2 font-sans text-[20px] leading-[30px] font-bold tracking-wide text-white">
          진행 중인 학습이 없습니다.
        </h4>
        <p className="font-sans text-[14px] leading-[22px] tracking-wide text-gray-400">
          새로운 학습을 시작하면 이곳에 표시됩니다.
        </p>
      </div>
    );
  }

  // ── 데이터가 있을 때 (기존 디자인 유지) ──
  const { learningId, title, subtitle, level, progressRate } = data;
  const isAdvanced = level === 'ADVANCED';

  return (
    <div
      onClick={() => navigate(`/learn/curriculum/${learningId}`)}
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(11, 15, 25, 0.00) 44.7%, rgba(11, 15, 25, 0.70) 100%), url(${bannerBg})`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: '0.132px 0px',
        backgroundSize: '100% 100%',
      }}
      className="flex h-[198px] w-full cursor-pointer items-end justify-between self-stretch rounded-[6px] bg-[lightgray] p-8 text-white transition-colors select-none hover:opacity-90">
      {/* 좌측 영역: 타이틀 & 설명 */}
      <div className="flex shrink-0 flex-col items-start gap-2 text-left">
        <div className="flex items-center gap-[6px]">
          <span className="font-sans text-2xl font-bold tracking-tight">{title}</span>

          {/* 난이도 뱃지 */}
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
        <p className="font-sans text-sm tracking-wide text-gray-300">{subtitle}</p>
      </div>

      {/* 우측 영역: 진행률 */}
      <span className="font-['Pretendard'] text-[20px] leading-[30px] font-normal tracking-[-0.4px] whitespace-nowrap text-[#E7E7E8]">
        진행률 {progressRate}%
      </span>
    </div>
  );
}
