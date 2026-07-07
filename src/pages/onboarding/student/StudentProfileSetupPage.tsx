// 학생 프로필 초기 설정 페이지
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoTypo from '@/assets/landing/logo.svg?react';
import BeginnerIcon from '@/assets/onboarding/beginner.svg?react';
import IntermediateIcon from '@/assets/onboarding/intermediate.svg?react';
import MajorIcon from '@/assets/onboarding/major.svg?react';

type Level = 'beginner' | 'intermediate' | 'major';

const LEVELS: {
  key: Level;
  Icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  title: string;
  subtitle: string;
  desc: string;
}[] = [
  { key: 'beginner', Icon: BeginnerIcon, title: '입문', subtitle: '도레미부터', desc: '화성학을 처음 시작합니다.' },
  {
    key: 'intermediate',
    Icon: IntermediateIcon,
    title: '중급',
    subtitle: '코드 반주 가능',
    desc: '기본 코드 진행을 이해합니다.',
  },
  { key: 'major', Icon: MajorIcon, title: '전공', subtitle: '텐션/모드 정복', desc: '고급 화성학 이론을 활용합니다.' },
];

function StudentProfileSetupPage() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [level, setLevel] = useState<Level | null>(null);

  return (
    <div className="flex min-h-screen flex-col bg-gray-950 px-[202px]">
      {/* 상단 로고 */}
      <header className="flex h-[124px] shrink-0 items-center justify-center px-2.5 py-1">
        <LogoTypo className="text-primary-400 h-[29px] w-[174px]" aria-label="MUSE REVIEW" />
      </header>

      {/* 본문 */}
      <main className="mx-auto flex w-full max-w-[1196px] flex-1 flex-col px-6 pb-[76px]">
        <h1 className="heading-large mt-[100px] text-gray-200">
          더 정확한 분석을 위한
          <br />
          마지막 단계예요.
        </h1>

        <div className="mt-[220px] flex flex-col gap-[120px]">
          {/* 닉네임 */}
          <div className="flex flex-col gap-4">
            <label htmlFor="nickname" className="body-large-b text-gray-300">
              닉네임*
            </label>
            <div className="flex h-[76px] items-center gap-10 rounded-md bg-gray-800 p-5">
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="2~10자의 한글, 영문, 숫자만 사용해 주세요. (공백/특수문자 불가)"
                className="body-medium min-w-0 flex-1 bg-transparent text-gray-300 outline-none placeholder:text-gray-300"
              />
              <button
                type="button"
                className="button-medium shrink-0 rounded border-[0.5px] border-gray-300 px-4 py-2 text-gray-300">
                중복확인
              </button>
            </div>
          </div>

          {/* 화성학 숙련도 */}
          <div className="flex flex-col gap-4">
            <p className="body-large-b text-gray-300">화성학 숙련도*</p>
            <div className="flex justify-center gap-[76px]">
              {LEVELS.map(({ key, Icon, title, subtitle, desc }) => {
                const selected = level === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setLevel(key)}
                    aria-pressed={selected}
                    className={`flex size-[348px] flex-col items-center justify-center gap-10 rounded-md px-6 py-10 text-center drop-shadow-[0px_4px_2px_rgba(0,0,0,0.25)] transition-colors ${
                      selected
                        ? 'border-primary-400 border bg-gray-900'
                        : 'border-[0.5px] border-gray-600 bg-gray-950'
                    }`}>
                    <Icon className="size-14 shrink-0 text-gray-400" />
                    <span className="flex flex-col gap-[25px]">
                      <span className="flex flex-col gap-2">
                        <span className="heading-medium-b text-primary-400">{title}</span>
                        <span className="body-regular1 text-gray-300">{subtitle}</span>
                      </span>
                      <span className="body-large-m text-gray-100">{desc}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 이전 버튼 */}
        <div className="mt-[200px] flex">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="button-large1 flex h-[76px] w-[388px] items-center justify-center rounded-md border-[0.5px] border-gray-600 text-gray-300">
            이전
          </button>
        </div>
      </main>
    </div>
  );
}

export default StudentProfileSetupPage;
