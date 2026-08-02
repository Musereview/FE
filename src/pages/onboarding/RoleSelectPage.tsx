// 역할 선택 페이지 - 학생/강사 공용
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoTypo from '@/assets/landing/logo.svg?react';
import StudentIcon from '@/assets/onboarding/student.svg?react';
import TeacherIcon from '@/assets/onboarding/teacher.svg?react';

type Role = 'student' | 'teacher';

const ROLES: {
  key: Role;
  Icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  title: string;
  desc: string;
}[] = [
  { key: 'student', Icon: StudentIcon, title: '학생', desc: '연주를 배우고 성장하고 있어요.' },
  { key: 'teacher', Icon: TeacherIcon, title: '강사', desc: '학생의 성장을 지도하고 있어요.' },
];

function RoleSelectPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>('student');

  const handleNext = () => navigate(`/onboarding/${role}/profile`);

  return (
    <div className="relative flex min-h-screen flex-col bg-gray-950 px-6">
      {/* 상단 로고 */}
      <header className="flex h-[124px] shrink-0 items-center justify-center px-2.5 py-1">
        <LogoTypo className="text-primary-400 h-[29px] w-[174px]" aria-label="MUSE REVIEW" />
      </header>

      {/* 본문 */}
      <main className="mx-auto flex w-full max-w-[1196px] flex-1 flex-col pb-[160px]">
        <h1 className="heading-large mt-[100px] text-gray-200">
          어떤 방식으로
          <br />
          뮤즈리뷰를 이용하시나요?
        </h1>

        {/* 역할 카드 */}
        <div className="mt-20 flex flex-col gap-4 md:flex-row">
          {ROLES.map(({ key, Icon, title, desc }) => {
            const selected = role === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setRole(key)}
                aria-pressed={selected}
                className={`flex min-h-[164px] flex-1 cursor-pointer items-center gap-11 rounded-md p-10 text-left transition-colors ${
                  selected ? 'bg-primary-400 text-gray-950' : 'border-[0.5px] border-gray-600 text-gray-400'
                }`}>
                <Icon className={`size-14 shrink-0 ${selected ? 'text-gray-950' : 'text-gray-300'}`} />
                <span className="flex flex-col gap-6">
                  <span className="heading-medium-b">{title}</span>
                  <span className="body-large-b">{desc}</span>
                </span>
              </button>
            );
          })}
        </div>
      </main>

      {/* 다음 버튼 */}
      <div className="absolute inset-x-6 bottom-[58px] mx-auto flex w-auto max-w-[1196px] justify-end">
        <button
          type="button"
          onClick={handleNext}
          className="button-large1 bg-primary-400 flex h-[76px] w-full max-w-[388px] cursor-pointer items-center justify-center rounded-md text-gray-950">
          다음
        </button>
      </div>
    </div>
  );
}

export default RoleSelectPage;
