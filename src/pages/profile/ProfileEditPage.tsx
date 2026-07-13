// 프로필 수정 페이지
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileImage from '@/assets/profile/profile.svg?react';
import PianoIcon from '@/assets/profile/piano.svg?react';
import ChevronDownIcon from '@/assets/practice/chevron-down.svg?react';
import { useCheckNickname } from '@/hooks/useCheckNickname';
import { validateNicknameFormat } from '@/utils/validateNickname';

const LEVEL_OPTIONS = ['입문', '중급', '전공'];

type NicknameStatus = 'idle' | 'length' | 'format' | 'duplicate' | 'available';

const NICKNAME_MESSAGE: Record<Exclude<NicknameStatus, 'idle'>, { text: string; tone: 'error' | 'success' }> = {
  length: { text: '2~10자의 닉네임을 입력해 주세요.', tone: 'error' },
  format: { text: '공백 및 특수문자는 사용할 수 없습니다.', tone: 'error' },
  duplicate: { text: '사용 중인 닉네임입니다.', tone: 'error' },
  available: { text: '사용 가능한 닉네임입니다.', tone: 'success' },
};

function ProfileEditPage() {
  const navigate = useNavigate();

  const [nickname, setNickname] = useState('김뮤즈');
  const [nicknameStatus, setNicknameStatus] = useState<NicknameStatus>('idle');
  const [level, setLevel] = useState('중급');
  const [levelOpen, setLevelOpen] = useState(false);
  const levelRef = useRef<HTMLDivElement>(null);

  const { mutate: checkNickname, isPending } = useCheckNickname();

  // 닉네임 수정 시 이전 검증 결과 초기화
  const handleNicknameChange = (value: string) => {
    setNickname(value);
    setNicknameStatus('idle');
  };

  // 중복확인
  const handleCheckNickname = () => {
    const formatError = validateNicknameFormat(nickname);
    if (formatError) {
      setNicknameStatus(formatError);
      return;
    }
    checkNickname(nickname, {
      onSuccess: (data) => setNicknameStatus(data.available ? 'available' : 'duplicate'),
    });
  };

  useEffect(() => {
    if (!levelOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (levelRef.current && !levelRef.current.contains(event.target as Node)) {
        setLevelOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [levelOpen]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[747px] flex-col items-center px-6 pt-[78px] pb-[76px]">
      {/* 프로필 이미지 */}
      <ProfileImage className="size-24" />

      {/* 입력 폼 */}
      <div className="mt-[168px] flex w-full flex-col gap-8">
        {/* 닉네임 */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label htmlFor="nickname" className="body-small text-gray-300">
              닉네임
            </label>
            {nicknameStatus !== 'idle' && (
              <p
                className={`body-small text-right ${
                  NICKNAME_MESSAGE[nicknameStatus].tone === 'error' ? 'text-error' : 'text-primary-400'
                }`}>
                {NICKNAME_MESSAGE[nicknameStatus].text}
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
              onClick={handleCheckNickname}
              disabled={!nickname || isPending}
              className={`button-medium shrink-0 rounded-[4px] px-4 py-2 ${
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
              <p className="body-large-m text-gray-100">Piano</p>
            </div>
          </div>

          {/* 숙련도 드롭다운 */}
          <div className="flex flex-1 flex-col gap-2">
            <p className="body-small text-gray-300">숙련도</p>
            <div ref={levelRef} className="relative">
              <button
                type="button"
                onClick={() => setLevelOpen((prev) => !prev)}
                aria-haspopup="listbox"
                aria-expanded={levelOpen}
                className="flex h-[76px] w-full items-center gap-2 rounded-[6px] bg-gray-800 px-5 py-4 text-left">
                <span className="body-large-m flex-1 text-gray-100">{level}</span>
                <ChevronDownIcon className={`size-6 shrink-0 text-gray-400 ${levelOpen ? 'rotate-180' : ''}`} />
              </button>

              {levelOpen && (
                <ul
                  role="listbox"
                  className="absolute top-[calc(100%+15px)] left-0 z-10 flex w-full flex-col overflow-hidden rounded-[6px] border-[0.5px] border-gray-600">
                  {LEVEL_OPTIONS.map((option) => {
                    const selected = option === level;
                    return (
                      <li key={option}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={selected}
                          onClick={() => {
                            setLevel(option);
                            setLevelOpen(false);
                          }}
                          className={`button-large2 hover:bg-primary-300 flex h-[76px] w-full items-center px-5 text-left hover:text-gray-900 ${
                            selected ? 'bg-primary-500 text-gray-950' : 'bg-gray-700 text-gray-300'
                          }`}>
                          {option}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="mt-auto flex w-full items-center justify-between gap-4 pt-16">
        <button
          type="button"
          onClick={() => navigate('/profile')}
          className="button-large1 flex h-[76px] flex-1 items-center justify-center rounded-[6px] border-[0.5px] border-gray-600 text-gray-300">
          뒤로 가기
        </button>
        <button
          type="button"
          onClick={() => navigate('/profile')}
          className="button-large1 bg-primary-400 flex h-[76px] flex-1 items-center justify-center rounded-[4px] text-gray-950">
          수정 완료
        </button>
      </div>
    </div>
  );
}

export default ProfileEditPage;
