// 프로필 페이지
import { useNavigate } from 'react-router-dom';
import ProfileImage from '@/assets/profile/profile.svg?react';
import PianoIcon from '@/assets/profile/piano.svg?react';

const PRACTICE_STATS = [
  { label: '연습 세션', value: '24' },
  { label: '총 연습 시간(분)', value: '350' },
  { label: '학습한 이론', value: '8' },
];

function ProfilePage() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto flex w-full max-w-[747px] flex-col items-center px-6 py-20">
      {/* 프로필 */}
      <div className="flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <ProfileImage className="size-24" />
          <p className="heading-medium-b text-primary-400">김뮤즈</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/profile/edit')}
          className="button-small rounded-[6px] bg-gray-500 px-3 py-2 text-gray-950">
          내 정보 수정
        </button>
      </div>

      {/* 연습 통계 */}
      <div className="mt-16 flex overflow-hidden rounded-[6px]">
        {PRACTICE_STATS.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center gap-2 bg-gray-900 px-6 py-5 text-center">
            <p className="body-small whitespace-nowrap text-gray-300">{stat.label}</p>
            <p className="heading-medium-b text-primary-300">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* 정보 필드 */}
      <div className="mt-24 flex w-full flex-col gap-8">
        <div className="flex gap-4">
          <div className="flex flex-1 flex-col gap-2">
            <p className="body-small text-gray-300">악기</p>
            <div className="flex items-center gap-2 rounded-[6px] bg-gray-800 px-5 py-4">
              <PianoIcon className="size-6 shrink-0" />
              <p className="body-large-m text-gray-100">Piano</p>
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <p className="body-small text-gray-300">숙련도</p>
            <div className="flex items-center rounded-[6px] bg-gray-800 px-5 py-4">
              <p className="body-large-m text-gray-100">중급</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="body-small text-gray-300">요금제</p>
          <div className="flex w-1/2 items-center justify-between rounded-[6px] bg-gray-800 px-5 py-4">
            <p className="body-large-m text-gray-100">Free Plan</p>
            <button type="button" className="button-medium bg-primary-400 rounded-[4px] px-4 py-2 text-gray-950">
              플랜 변경
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
