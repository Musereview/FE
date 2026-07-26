import type { Difficulty } from '@/constants/difficulty';
import { DIFFICULTY_LABEL, DIFFICULTY_COLOR } from '@/constants/difficulty';

type DifficultyBadgeVariant = 'pill' | 'tag';
type DifficultyBadgeSize = 'sm' | 'md';

interface DifficultyBadgeProps {
  difficulty: Difficulty;
  variant?: DifficultyBadgeVariant;
  size?: DifficultyBadgeSize;
}

const VARIANT_SHAPE_CLASSNAME: Record<DifficultyBadgeVariant, string> = {
  pill: 'rounded-full bg-gray-900',
  tag: 'rounded-[6px]',
};

const SIZE_CLASSNAME: Record<DifficultyBadgeSize, string> = {
  sm: 'caption-regular px-2 py-0.5',
  md: 'button-label2 px-2.5 py-0.5',
};

function DifficultyBadge({ difficulty, variant = 'pill', size = 'md' }: DifficultyBadgeProps) {
  return (
    <span
      className={`flex items-center justify-center border-[0.5px] ${VARIANT_SHAPE_CLASSNAME[variant]} ${SIZE_CLASSNAME[size]} ${DIFFICULTY_COLOR[difficulty]}`}>
      {DIFFICULTY_LABEL[difficulty]}
    </span>
  );
}

export default DifficultyBadge;
