// 프로필 수정 페이지
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import ProfileImage from '@/assets/profile/profile.svg?react';
import PianoIcon from '@/assets/profile/piano.svg?react';
import ChevronDownIcon from '@/assets/practice/chevron-down.svg?react';
import Dropdown from '@/components/common/Dropdown';
import { useNicknameCheck } from '@/hooks/useNicknameCheck';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { INSTRUMENT_LABEL, SKILL_LEVEL_LABEL, SKILL_LEVEL_OPTIONS } from '@/types/profile';
import type { Profile, SkillLevel } from '@/types/profile';

function ProfileEditPage() {
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

  return <ProfileEditForm profile={profile} />;
}

function ProfileEditForm({ profile }: { profile: Profile }) {
  const navigate = useNavigate();

  const { nickname, message, isPending, handleNicknameChange, checkDuplicate, markDuplicate, validateFormat } =
    useNicknameCheck(profile.nickname);
  const [level, setLevel] = useState<SkillLevel>(profile.skillLevel);
  const [levelOpen, setLevelOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { mutate: updateProfile, isPending: isSaving } = useUpdateProfile();

  const handleSubmit = () => {
    if (!validateFormat()) return;
    setSubmitError(null);
    updateProfile(
      { nickname, skillLevel: level },
      {
        onSuccess: () => navigate('/profile'),
        onError: (error) => {
          // 중복 확인을 통과했어도 최종 저장 시 다른 사용자가 선점하면 409 USER_409_01
          if (isAxiosError<{ code?: string }>(error) && error.response?.data?.code === 'USER_409_01') {
            markDuplicate();
            return;
          }
          // 그 외 오류는 일반 오류 메시지로 피드백
          setSubmitError('저장에 실패했어요. 잠시 후 다시 시도해 주세요.');
        },
      },
    );
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[747px] flex-col items-center px-6 pt-[78px] pb-[76px]">
      {/* 프로필 이미지 */}
      {profile.profileImgUrl ? (
        <img src={profile.profileImgUrl} alt="프로필 이미지" className="size-24 rounded-full object-cover" />
      ) : (
        <ProfileImage className="size-24" />
      )}

      {/* 입력 폼 */}
      <div className="mt-[168px] flex w-full flex-col gap-8">
        {/* 닉네임 */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label htmlFor="nickname" className="body-small text-gray-300">
              닉네임
            </label>
            {message && (
              <p className={`body-small text-right ${message.tone === 'error' ? 'text-error' : 'text-primary-400'}`}>
                {message.text}
              </p>
            )}
          </div>
          <div className="flex h-[76px] w-full items-center gap-2 rounded-[6px] bg-gray-800 px-5 py-4">
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(event) => handleNicknameChange(event.target.value)}
              placeholder="2~10자의 한글, 영문, 숫자만 사용해 주세요. (공백/특수문자 불가)"
              className="body-large-m min-w-0 flex-1 bg-transparent text-gray-100 outline-none placeholder:text-gray-500"
            />
            <button
              type="button"
              onClick={checkDuplicate}
              disabled={!nickname || isPending}
              className={`button-medium shrink-0 cursor-pointer rounded px-4 py-2 disabled:cursor-not-allowed ${
                nickname ? 'bg-primary-400 text-gray-950' : 'border-[0.5px] border-gray-300 text-gray-300'
              }`}>
              중복확인
            </button>
          </div>
        </div>

        {/* 악기 & 숙련도 */}
        <div className="flex items-start gap-4">
          <div className="flex flex-1 flex-col gap-2">
            <p className="body-small text-gray-300">악기</p>
            <div className="flex h-[76px] items-center gap-2 rounded-[6px] bg-gray-800 px-5 py-4">
              <PianoIcon className="text-primary-400 size-6 shrink-0" />
              <p className="body-large-m text-gray-100">{INSTRUMENT_LABEL[profile.instrumentType]}</p>
            </div>
          </div>

          {/* 숙련도 드롭다운 */}
          <div className="flex flex-1 flex-col gap-2">
            <p className="body-small text-gray-300">숙련도</p>
            <Dropdown
              isOpen={levelOpen}
              onOpenChange={setLevelOpen}
              containerClassName="relative"
              triggerAriaHasPopup="listbox"
              triggerClassName="flex h-[76px] w-full items-center gap-2 rounded-[6px] bg-gray-800 px-5 py-4 text-left"
              trigger={
                <>
                  <span className="body-large-m flex-1 text-gray-100">{SKILL_LEVEL_LABEL[level]}</span>
                  <ChevronDownIcon className={`size-6 shrink-0 text-gray-400 ${levelOpen ? 'rotate-180' : ''}`} />
                </>
              }
              panelRole="listbox"
              panelClassName="absolute top-[calc(100%+15px)] left-0 z-10 flex w-full flex-col overflow-hidden rounded-[6px] border-[0.5px] border-gray-600">
              {SKILL_LEVEL_OPTIONS.map((option) => {
                const selected = option === level;
                return (
                  <button
                    key={option}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => {
                      setLevel(option);
                      setLevelOpen(false);
                    }}
                    className={`button-large2 hover:bg-primary-300 flex h-[76px] w-full cursor-pointer items-center px-5 text-left hover:text-gray-900 ${
                      selected ? 'bg-primary-500 text-gray-950' : 'bg-gray-700 text-gray-300'
                    }`}>
                    {SKILL_LEVEL_LABEL[option]}
                  </button>
                );
              })}
            </Dropdown>
          </div>
        </div>
      </div>

      {/* 저장 실패 안내 */}
      {submitError && <p className="body-small text-error mt-auto w-full text-center">{submitError}</p>}

      {/* 하단 버튼 */}
      <div className={`flex w-full items-center justify-between gap-4 pt-16 ${submitError ? '' : 'mt-auto'}`}>
        <button
          type="button"
          onClick={() => navigate('/profile')}
          className="button-large1 flex h-[76px] flex-1 cursor-pointer items-center justify-center rounded-[6px] border-[0.5px] border-gray-600 text-gray-300">
          뒤로 가기
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!nickname || isSaving}
          className="button-large1 bg-primary-400 flex h-[76px] flex-1 cursor-pointer items-center justify-center rounded-[4px] text-gray-950 disabled:cursor-not-allowed disabled:opacity-50">
          수정 완료
        </button>
      </div>
    </div>
  );
}

export default ProfileEditPage;
