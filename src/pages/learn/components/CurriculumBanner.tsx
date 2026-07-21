import type { TopicDifficulty } from '@/types/topic';
import { DIFFICULTY_LABEL, DIFFICULTY_COLOR } from '../topicDisplay';

interface CurriculumBannerProps {
  title: string;
  difficulty: TopicDifficulty;
  description: string;
}

function CurriculumBanner({ title, difficulty, description }: CurriculumBannerProps) {
  return (
    <div className="from-secondary-800 via-secondary-600 to-primary-300 relative flex w-full flex-col gap-3 overflow-hidden rounded-[6px] bg-gradient-to-tr px-10 py-7">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-950/80" />

      <div className="relative flex items-center gap-3">
        <h1 className="heading-medium-b text-gray-200">{title}</h1>
        <span
          className={`caption-medium flex w-10 items-center justify-center rounded-full border-[0.5px] bg-gray-900 py-1 ${DIFFICULTY_COLOR[difficulty]}`}>
          {DIFFICULTY_LABEL[difficulty]}
        </span>
      </div>
      <p className="body-medium relative text-gray-300">{description}</p>
    </div>
  );
}

export default CurriculumBanner;
