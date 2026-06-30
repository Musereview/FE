// 사이드바
import { NavLink } from 'react-router-dom';
import PracticeIcon from '@/assets/layout/practice.svg?react';
import LearnIcon from '@/assets/layout/learn.svg?react';
import HistoryIcon from '@/assets/layout/history.svg?react';
import LogoIcon from '@/assets/layout/logo.svg?react';
import NotificationIcon from '@/assets/layout/notification.svg?react';
import ProfileIcon from '@/assets/layout/profile.svg?react';
import MoreIcon from '@/assets/layout/more.svg?react';

interface NavItem {
  Icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  label: string;
  to: string;
}

const STUDENT_MENU: NavItem[] = [
  { Icon: PracticeIcon, label: '연습', to: '/practice' },
  { Icon: LearnIcon, label: '학습', to: '/learn' },
  { Icon: HistoryIcon, label: '히스토리', to: '/history' },
];

function Navbar() {
  return (
    <div className="flex h-screen w-[90px] shrink-0 flex-col items-center justify-between border-r border-gray-700 bg-gray-950 px-[18px] py-6">
      {/* 상단: 로고 / 메뉴 */}
      <div className="flex flex-col items-center gap-[42px]">
        {/* 로고 */}
        <NavLink to="/main" className="flex h-[54px] items-center justify-center p-1.5 opacity-80" aria-label="홈">
          <LogoIcon className="text-primary-400 w-[41px]" />
        </NavLink>

        {/* 메뉴 */}
        <nav className="flex flex-col gap-[38px]">
          {STUDENT_MENU.map(({ Icon, label, to }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `button-label2 flex flex-col items-center gap-1 transition-colors ${
                  isActive ? 'text-primary-400' : 'text-gray-300'
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
          <button type="button" aria-label="알림">
            <NotificationIcon className="size-7" />
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
        <div className="relative flex h-[54px] items-center justify-center">
          <button type="button" aria-label="더보기">
            <MoreIcon className="size-9" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
