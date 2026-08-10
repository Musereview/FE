import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import ChevronLeftIcon from '@/assets/practice/chevron-left.svg?react';

interface BackNavLayoutProps {
  children: ReactNode;
}

function BackNavLayout({ children }: BackNavLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="button-small absolute top-[76px] left-6 flex cursor-pointer items-center gap-2 text-gray-400">
        <ChevronLeftIcon className="size-5" />
        뒤로가기
      </button>

      <div className="mx-auto flex w-full max-w-[1128px] flex-col px-6">{children}</div>
    </div>
  );
}

export default BackNavLayout;
