import type { TopicDifficulty } from '@/types/topic';
import { DIFFICULTY_LABEL, DIFFICULTY_ORDER } from '@/pages/learn/topicDisplay';

interface DifficultyTabsProps {
  value: TopicDifficulty;
  onChange: (difficulty: TopicDifficulty) => void;
}

function DifficultyTabs({ value, onChange }: DifficultyTabsProps) {
  return (
    <div className="flex items-center gap-2">
      {DIFFICULTY_ORDER.map((difficulty) => {
        const isActive = difficulty === value;
        return (
          <button
            key={difficulty}
            type="button"
            onClick={() => onChange(difficulty)}
            className={`flex w-16 items-center justify-center border-b p-2 ${
              isActive
                ? 'body-large-b border-primary-400 text-primary-300'
                : 'body-large-m border-transparent text-gray-500'
            }`}>
            {DIFFICULTY_LABEL[difficulty]}
          </button>
        );
      })}
    </div>
  );
}

export default DifficultyTabs;
