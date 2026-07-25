import type { TopicDifficulty } from '@/types/topic';
import { DIFFICULTY_LABEL, DIFFICULTY_COLOR } from '@/pages/learn/topicDisplay';

interface DifficultyBadgeProps {
  difficulty: TopicDifficulty;
}

function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  return (
    <span
      className={`button-label2 flex items-center justify-center rounded-full border-[0.5px] bg-gray-900 px-2.5 py-0.5 ${DIFFICULTY_COLOR[difficulty]}`}>
      {DIFFICULTY_LABEL[difficulty]}
    </span>
  );
}

export default DifficultyBadge;
