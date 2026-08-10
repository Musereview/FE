import type { ChapterStatus } from '@/types/topic';
import ReviewIcon from '@/assets/learn/review.svg?react';
import ResumeIcon from '@/assets/learn/chevron-right-resume.svg?react';
import StartIcon from '@/assets/learn/chevron-right-start.svg?react';
import TryAgainIcon from '@/assets/restart.svg?react';

interface CardActionButtonProps {
  status: ChapterStatus;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const BUTTON_CONFIG: Record<
  ChapterStatus,
  { label: string; Icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>; className: string }
> = {
  completed: { label: '복습하기', Icon: ReviewIcon, className: 'border-primary-400 border-[0.5px] text-primary-400' },
  learning: { label: '이어서 학습', Icon: ResumeIcon, className: 'bg-primary-400 text-gray-950' },
  ready: { label: '학습하기', Icon: StartIcon, className: 'bg-primary-400 text-gray-950' },
  retry: { label: '다시하기', Icon: TryAgainIcon, className: 'border-gray-500 border-[0.5px] text-gray-300' },
};

function CardActionButton({ status, onClick }: CardActionButtonProps) {
  const { label, Icon, className } = BUTTON_CONFIG[status];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`button-small flex h-[60px] w-[193px] shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[6px] py-1.5 pr-3 pl-3.5 ${className}`}>
      {label}
      <Icon className="size-6" />
    </button>
  );
}

export default CardActionButton;
