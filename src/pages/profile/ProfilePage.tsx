// 프로필 페이지
import { useNavigate } from 'react-router-dom';
import ProfileImage from '@/assets/profile/profile.svg?react';
import PianoIcon from '@/assets/profile/piano.svg?react';
import { useProfile } from '@/hooks/useProfile';
import { INSTRUMENT_LABEL, SKILL_LEVEL_LABEL, SUBSCRIPTION_LABEL } from '@/types/profile';

function ProfilePage() {
  const navigate = useNavigate();
  const { data: profile, isLoading, isError, refetch } = useProfile();

  if (isLoading) {
    return <div className="body-medium flex min-h-screen items-center justify-center text-gray-500">불러오는 중…</div>;
  }

  if (isError || !profile) {
    return (
      <div className="body-medium flex min-h-screen flex-col items-center justify-center gap-4 text-gray-500">
        <p>프로필을 불러오지 못했어요.</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="button-small bg-primary-400 cursor-pointer rounded-[6px] px-4 py-2 text-gray-950">
          다시 시도
        </button>
      </div>
    );
  }

  const stats = [
    { label: '연습 세션', value: profile.statistics.practiceSessionCount },
    { label: '총 연습 시간(분)', value: profile.statistics.totalPracticeMinutes },
    { label: '학습한 이론', value: profile.statistics.completedLearningCount },
  ];

  return (
    <div className="mx-auto flex w-full max-w-[747px] flex-col items-center px-6 py-20">
      {/* 프로필 */}
      <div className="flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2">
          {profile.profileImgUrl ? (
            <img src={profile.profileImgUrl} alt="프로필 이미지" className="size-24 rounded-full object-cover" />
          ) : (
            <ProfileImage className="size-24" />
          )}
          <p className="heading-medium-b text-primary-400">{profile.nickname}</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/profile/edit')}
          className="button-small cursor-pointer rounded-[6px] bg-gray-500 px-3 py-2 text-gray-950">
          내 정보 수정
        </button>
      </div>

      {/* 연습 통계 */}
      <div className="mt-16 flex overflow-hidden rounded-[6px]">
        {stats.map((stat) => (
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
              <PianoIcon className="text-primary-400 size-6 shrink-0" />
              <p className="body-large-m text-gray-100">{INSTRUMENT_LABEL[profile.instrumentType]}</p>
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <p className="body-small text-gray-300">숙련도</p>
            <div className="flex items-center rounded-[6px] bg-gray-800 px-5 py-4">
              <p className="body-large-m text-gray-100">{SKILL_LEVEL_LABEL[profile.skillLevel]}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="body-small text-gray-300">요금제</p>
          <div className="flex w-1/2 items-center justify-between rounded-[6px] bg-gray-800 px-5 py-4">
            <p className="body-large-m text-gray-100">{SUBSCRIPTION_LABEL[profile.subscriptionTier]}</p>
            <button
              type="button"
              onClick={() => navigate('/onboarding/student/plan')}
              className="button-medium bg-primary-400 cursor-pointer rounded-[4px] px-4 py-2 text-gray-950">
              플랜 변경
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
