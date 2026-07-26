//사이드바
// src/layout/Navbar.tsx
import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import PracticeIcon from '@/assets/layout/practice.svg?react';
import LearnIcon from '@/assets/layout/learn.svg?react';
import HistoryIcon from '@/assets/layout/history.svg?react';
import LogoIcon from '@/assets/layout/logo.svg?react';
import NotificationIcon from '@/assets/layout/notification.svg?react';
import ProfileIcon from '@/assets/layout/profile.svg?react';
import MoreIcon from '@/assets/layout/more.svg?react';
import type { NotiItem } from '@/types/notification';
import WithdrawModal from '@/components/common/WithdrawModal';
import { useClickOutside } from '@/hooks/useClickOutside';

interface NavItem {
  Icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  label: string;
  to: string;
  matchFrom?: string;
}

interface NavbarProps {
  onOpenNotification: () => void;
  notiList: NotiItem[];
}

const STUDENT_MENU: NavItem[] = [
  { Icon: PracticeIcon, label: '연주', to: '/practice', matchFrom: 'practice' },
  { Icon: LearnIcon, label: '학습', to: '/learn', matchFrom: 'learn' },
  { Icon: HistoryIcon, label: '히스토리', to: '/history' },
];

function Navbar({ onOpenNotification, notiList }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const hasUnread = notiList.some((item) => !item.isRead);
  const latencyCheckFrom =
    location.pathname === '/latency-check' ? new URLSearchParams(location.search).get('from') : null;

  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useClickOutside(moreRef, () => setIsMoreOpen(false), isMoreOpen);

  // 팝업이 열려 있을 때 ESC 로 닫기
  useEffect(() => {
    if (!isMoreOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMoreOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMoreOpen]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setIsMoreOpen(false);
    navigate('/login');
  };

  const handleWithdraw = () => {
    setIsMoreOpen(false);
    setIsWithdrawOpen(true);
  };

  const handleConfirmWithdraw = () => {
    setIsWithdrawOpen(false);
    // 회원탈퇴 API
    // 탈퇴 완료 후: 토큰 제거 + 로그인 페이지 이동
    localStorage.removeItem('accessToken');
    navigate('/login');
  };

  return (
    <div className="flex h-screen w-[90px] shrink-0 flex-col items-center justify-between border-r border-gray-700 bg-gray-950 px-[18px] py-6">
      {/* 상단: 로고 / 메뉴 */}
      <div className="flex flex-col items-center gap-[42px]">
        {/* 로고 */}
        <NavLink
          to="/main"
          className={({ isActive }) =>
            `flex h-[54px] items-center justify-center p-1.5 transition-colors ${
              isActive ? 'text-primary-400' : 'text-gray-400'
            }`
          }
          aria-label="홈">
          <LogoIcon className="w-[41px]" />
        </NavLink>

        {/* 메뉴 */}
        <nav className="flex flex-col gap-[38px]">
          {STUDENT_MENU.map(({ Icon, label, to, matchFrom }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `button-label2 flex flex-col items-center gap-1 transition-colors ${
                  isActive || (matchFrom && latencyCheckFrom === matchFrom) ? 'text-primary-400' : 'text-gray-300'
                }`
              }>
              <Icon className="size-7" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* 하단: 알림 / 프로필 / 더보기 */}
      <div className="flex flex-col items-center gap-6 text-gray-400">
        {/* 알림 */}
        <div className="relative flex h-[54px] items-center justify-center">
          <button
            type="button"
            aria-label="알림"
            onClick={onOpenNotification}
            className="relative flex items-center justify-center transition-opacity hover:opacity-80">
            <NotificationIcon className="size-7" />
            {hasUnread && (
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[#10B981] ring-2 ring-gray-950" />
            )}
          </button>
        </div>

        {/* 프로필 */}
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex h-[54px] items-center justify-center ${isActive ? 'text-primary-400' : ''}`
          }
          aria-label="프로필">
          <ProfileIcon className="size-7" />
        </NavLink>

        {/* 더보기 */}
        <div ref={moreRef} className="relative flex h-[54px] items-center justify-center">
          <button
            type="button"
            aria-label="더보기"
            aria-haspopup="menu"
            aria-expanded={isMoreOpen}
            onClick={() => setIsMoreOpen((v) => !v)}
            className={`transition-colors hover:opacity-80 ${isMoreOpen ? 'text-primary-400' : ''}`}>
            <MoreIcon className="size-9" />
          </button>

          {/* 더보기 팝업 (로그아웃/회원탈퇴) */}
          {isMoreOpen && (
            <div
              role="menu"
              className="absolute bottom-[19px] left-full z-50 ml-[35px] flex w-max flex-col gap-3 rounded-[4px] bg-gray-900 py-4">
              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="body-medium flex w-full items-center justify-center px-6 py-1 whitespace-nowrap text-gray-300 transition-opacity hover:opacity-80">
                로그아웃
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={handleWithdraw}
                className="body-medium text-error flex w-full items-center justify-center px-6 py-1 whitespace-nowrap transition-opacity hover:opacity-80">
                회원탈퇴
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 회원탈퇴 확인 모달 */}
      {isWithdrawOpen && <WithdrawModal onCancel={() => setIsWithdrawOpen(false)} onConfirm={handleConfirmWithdraw} />}
    </div>
  );
}

export default Navbar;
