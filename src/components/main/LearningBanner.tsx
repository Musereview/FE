import { useNavigate } from 'react-router-dom';
import bannerBg from '@/assets/main/image-mesh-gradient.png';

interface LearningBannerProps {
  data: {
    learningId: number;
    title: string;
    subtitle: string;
    level: string;
    progressRate: number;
    nextStepId: number;
  } | null;
}

export default function LearningBanner({ data }: LearningBannerProps) {
  const navigate = useNavigate();

  if (!data) {
    return (
      <div className="flex h-[198px] w-full flex-col items-center justify-center self-stretch rounded-[6px] bg-gray-800 p-8 text-center select-none">
        <h4 className="mb-2 font-['pretendard'] text-[24px] leading-[36px] font-semibold tracking-[-0.02em] text-white">
          진행 중인 학습이 없습니다.
        </h4>
        <p className="font-sans text-[14px] leading-[22px] tracking-wide text-gray-400">
          새로운 학습을 시작하면 이곳에 표시됩니다.
        </p>
      </div>
    );
  }

  const { learningId, title, subtitle, level, progressRate, nextStepId } = data;
  const isAdvanced = level === 'ADVANCED';

  return (
    <div
      onClick={() => navigate(`/learn/curriculum/${learningId}?step=${nextStepId}`)}
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(11, 15, 25, 0.00) 44.7%, rgba(11, 15, 25, 0.70) 100%), url(${bannerBg})`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: '0.132px 0px',
        backgroundSize: '100% 100%',
      }}
      className="flex h-[198px] w-full cursor-pointer items-end justify-between self-stretch rounded-[6px] bg-gray-700 p-8 text-white transition-colors select-none hover:opacity-90">
      <div className="flex shrink-0 flex-col items-start gap-2 text-left">
        <div className="flex items-center gap-[6px]">
          <span className="font-sans text-2xl font-bold tracking-tight">{title}</span>
          <div
            className={`flex w-[40px] shrink-0 items-center justify-center gap-[10px] rounded-full border-[0.5px] bg-gray-900 px-[6px] py-1 ${isAdvanced ? 'border-secondary-300' : 'border-secondary-400'}`}>
            <span
              className={`font-['Pretendard'] text-[12px] font-semibold ${isAdvanced ? 'text-secondary-300' : 'text-secondary-400'}`}>
              {isAdvanced ? '고급' : '중급'}
            </span>
          </div>
        </div>
        <p className="font-sans text-sm tracking-wide text-gray-300">{subtitle}</p>
      </div>
      <span className="font-['Pretendard'] text-[20px] leading-[30px] font-normal tracking-[-0.4px] whitespace-nowrap text-gray-300">
        진행률 {progressRate}%
      </span>
    </div>
  );
}
