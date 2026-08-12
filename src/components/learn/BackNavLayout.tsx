import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import ChevronLeftIcon from '@/assets/practice/chevron-left.svg?react';

interface BackNavLayoutProps {
  children: ReactNode;
  /** 지정하면 브라우저 히스토리(navigate(-1)) 대신 이 경로로 이동한다 (예: 다른 화면에서 진입해도 항상 정해진 곳으로 돌아가야 할 때) */
  backTo?: string;
}

function BackNavLayout({ children, backTo }: BackNavLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
        className="button-small absolute top-[76px] left-6 flex cursor-pointer items-center gap-2 text-gray-400">
        <ChevronLeftIcon className="size-5" />
        뒤로가기
      </button>

      <div className="mx-auto flex w-full max-w-[1128px] flex-col px-6">{children}</div>
    </div>
  );
}

export default BackNavLayout;
