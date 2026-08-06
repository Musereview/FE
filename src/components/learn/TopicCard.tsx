import type { Topic } from '@/types/topic';
import DifficultyBadge from '@/components/common/DifficultyBadge';
import ClickableCard from '@/components/common/ClickableCard';

interface TopicCardProps {
  topic: Topic;
  onClick?: () => void;
}

function TopicCard({ topic, onClick }: TopicCardProps) {
  const { title, difficulty, description } = topic;

  return (
    <ClickableCard
      onClick={onClick}
      className="flex h-[198px] w-full flex-col justify-between gap-4 rounded-[6px] bg-gray-800 p-8">
      <div className="flex items-center gap-3">
        <h3 className="button-large1 min-w-0 flex-1 truncate text-gray-100">{title}</h3>
        <div className="shrink-0">
          <DifficultyBadge difficulty={difficulty} />
        </div>
      </div>

      <p className="body-regular2 line-clamp-2 text-gray-300">{description}</p>
    </ClickableCard>
  );
}

export default TopicCard;
