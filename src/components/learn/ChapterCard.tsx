import type { ChapterStatus, TopicChapter } from '@/types/topic';
import { CHAPTER_STATUS_LABEL, CHAPTER_STATUS_COLOR } from '@/pages/learn/topicDisplay';
import ClockIcon from '@/assets/clock.svg?react';
import CardActionButton from './CardActionButton';
import ClickableCard from '@/components/common/ClickableCard';

interface ChapterCardProps {
  chapter: TopicChapter;
  /** false면 상태 텍스트만 표시 (학습 주제 패키지 목록용), true면 점수 + 액션 버튼까지 표시 (커리큘럼 상세용) */
  showAction?: boolean;
  onClick?: () => void;
  onActionClick?: () => void;
}

const SCORED_STATUSES: ChapterStatus[] = ['completed', 'retry'];

function ChapterCard({ chapter, showAction = true, onClick, onActionClick }: ChapterCardProps) {
  const { title, description, durationLabel, status, score } = chapter;

  const statusLabel =
    showAction && SCORED_STATUSES.includes(status) && score !== undefined
      ? `${CHAPTER_STATUS_LABEL[status]} · ${score}점`
      : CHAPTER_STATUS_LABEL[status];

  return (
    <ClickableCard
      onClick={onClick}
      className="flex h-[152px] w-full items-center justify-between rounded-[6px] bg-gray-800 px-10 py-6">
      <div className="flex w-[483px] flex-col gap-3">
        <div className="flex flex-col gap-1">
          <p className="body-medium text-gray-100">{title}</p>
          <p className="body-regular2 text-gray-600">{description}</p>
        </div>

        <div className="flex items-center gap-1">
          <ClockIcon className="size-6" />
          <p className="button-label1 text-gray-500">{durationLabel}</p>
        </div>
      </div>

      {showAction ? (
        <div className="flex w-[385px] shrink-0 items-center justify-between">
          <span className={`body-large-m text-center whitespace-nowrap ${CHAPTER_STATUS_COLOR[status]}`}>
            {statusLabel}
          </span>

          <CardActionButton
            status={status}
            onClick={(event) => {
              event.stopPropagation();
              onActionClick?.();
            }}
          />
        </div>
      ) : (
        <div className="flex w-[100px] shrink-0 items-center justify-center">
          <span className={`body-large-m text-center whitespace-nowrap ${CHAPTER_STATUS_COLOR[status]}`}>
            {statusLabel}
          </span>
        </div>
      )}
    </ClickableCard>
  );
}

export default ChapterCard;
