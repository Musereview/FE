import { useNavigate } from 'react-router-dom';
import type { CurrentLearningInfo } from '@/types/topic';
import DifficultyBadge from '@/components/common/DifficultyBadge';
import bannerBg from '@/assets/main/image-mesh-gradient.png';
import ResumeIcon from '@/assets/learn/chevron-right-resume.svg?react';

interface RecentStudyBannerProps {
  data: CurrentLearningInfo | null;
}

function RecentStudyBanner({ data }: RecentStudyBannerProps) {
  const navigate = useNavigate();

  if (!data) {
    return (
      <div className="flex min-h-[198px] w-full flex-col items-center justify-center gap-2 rounded-[4px] bg-gray-900 text-center">
        <p className="body-regular1 text-gray-100">진행 중인 학습이 없습니다.</p>
        <p className="button-label1 text-gray-500">새로운 학습을 시작하면 이곳에 표시됩니다.</p>
      </div>
    );
  }

  const { curriculumId, title, difficulty, stepLabel, progress } = data;

  return (
    <div
      className="relative flex min-h-[198px] w-full items-end justify-between overflow-hidden rounded-[4px] bg-cover bg-center px-10 py-7"
      style={{ backgroundImage: `url(${bannerBg})` }}>
      <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 to-transparent" />

      <div className="relative flex w-[384px] flex-col gap-8">
        <div className="flex flex-col items-center gap-2">
          <div className="flex w-full items-center gap-3">
            <h2 className="heading-medium-b text-gray-100">{title}</h2>
            <DifficultyBadge difficulty={difficulty} />
          </div>
          <p className="body-medium w-full text-gray-200">{stepLabel}</p>
        </div>

        <div className="flex flex-col gap-4">
          <p className="body-regular2 text-gray-200">진행률 {progress}%</p>
          <div
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            className="h-1 w-full overflow-hidden rounded-full bg-gray-700">
            <div className="bg-primary-400 h-full rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigate(`/learn/curriculum/${curriculumId}`)}
        className="button-large2 bg-primary-400 relative flex h-[60px] w-[186px] shrink-0 items-center justify-center gap-2 rounded-[6px] text-gray-950">
        이어서 학습하기
        <ResumeIcon className="size-6" />
      </button>
    </div>
  );
}

export default RecentStudyBanner;
