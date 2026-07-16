import type { Topic } from '@/types/topic';
import { DIFFICULTY_LABEL, DIFFICULTY_COLOR } from '../topicDisplay';

interface TopicCardProps {
  topic: Topic;
  onClick?: () => void;
}

function TopicCard({ topic, onClick }: TopicCardProps) {
  const { title, difficulty, description } = topic;

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={`flex h-[198px] w-full flex-col justify-between gap-4 rounded-[6px] bg-gray-800 p-8 ${onClick ? 'cursor-pointer' : ''}`}>
      <div className="flex items-center gap-3">
        <h3 className="button-large1 text-gray-100">{title}</h3>
        <span
          className={`button-label2 flex items-center justify-center rounded-full border-[0.5px] bg-gray-900 px-2.5 py-0.5 ${DIFFICULTY_COLOR[difficulty]}`}>
          {DIFFICULTY_LABEL[difficulty]}
        </span>
      </div>

      <p className="body-regular2 text-gray-300">{description}</p>
    </div>
  );
}

export default TopicCard;
