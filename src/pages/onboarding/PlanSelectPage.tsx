// 요금제 선택 페이지 - 학생/강사 공용 사용
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoTypo from '@/assets/landing/logo.svg?react';
import CheckIcon from '@/assets/onboarding/planCheck.svg?react';

interface Plan {
  name: string;
  price: string;
  tagline: string;
  features: string[];
}

const PLANS: Plan[] = [
  {
    name: 'Free',
    price: '무료',
    tagline: '시작을 위한 플랜',
    features: ['일일 3회 연주 분석', '기초 가이드 제공'],
  },
  {
    name: 'Standard',
    price: '00,000₩',
    tagline: '꾸준한 성장을 위한 플랜',
    features: ['무제한 연주 분석', '백킹 트랙 무제한 활용'],
  },
  {
    name: 'Pro',
    price: '00,000₩',
    tagline: '가장 깊이 있는 분석 경험',
    features: ['전문 텐션 분석 리포트', 'AI 챗봇 무제한 질문'],
  },
];

function PlanSelectPage() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="flex min-h-screen flex-col bg-gray-950">
      {/* 상단 로고 */}
      <header className="flex h-[124px] shrink-0 items-center justify-center px-2.5 py-1">
        <LogoTypo className="text-primary-400 h-[29px] w-[174px]" aria-label="MUSE REVIEW" />
      </header>

      {/* 본문 */}
      <main className="mx-auto flex w-full max-w-[1196px] flex-1 flex-col items-center gap-[84px] px-6 pt-[100px] pb-[76px]">
        <h1 className="heading-large text-center text-gray-200">나에게 맞는 플랜을 선택해 보세요.</h1>

        {/* 플랜 카드 */}
        <div className="flex w-full justify-between">
          {PLANS.map(({ name, price, tagline, features }) => {
            const isHovered = hovered === name;
            return (
              <div
                key={name}
                onMouseEnter={() => setHovered(name)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(name)}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) {
                    setHovered(null);
                  }
                }}
                className={`flex w-[361px] cursor-pointer flex-col gap-[68px] rounded-[10px] p-9 text-left transition-colors ${
                  isHovered ? 'border-primary-400 border bg-gray-900' : 'border-[0.5px] border-gray-600 bg-gray-950'
                }`}>
                {/* 이름 / 가격 */}
                <div className="flex flex-col gap-[15px]">
                  <p className="heading-medium-b text-primary-400">{name}</p>
                  <div className="flex items-center gap-[7px]">
                    <span className="heading-medium-b whitespace-nowrap text-gray-100">{price}</span>
                    <span className="body-large-m pt-1.5 text-gray-200">/월</span>
                  </div>
                </div>

                {/* 소개 / 기능 */}
                <div className="flex flex-col gap-8">
                  <p className="body-regular1 text-gray-300">{tagline}</p>
                  <ul className="flex flex-col">
                    {features.map((feature) => (
                      <li key={feature} className="flex items-center">
                        <CheckIcon className="size-10 shrink-0 text-gray-400" />
                        <span className="body-regular1 whitespace-nowrap text-gray-400">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 시작하기 버튼 */}
                <button
                  type="button"
                  onClick={() => navigate('/main')}
                  className={`flex h-[60px] w-full cursor-pointer items-center justify-center rounded-md transition-colors ${
                    isHovered
                      ? 'button-large1 bg-primary-400 text-gray-950'
                      : 'button-large2 border-primary-400 text-primary-400 border-[0.5px]'
                  }`}>
                  시작하기
                </button>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default PlanSelectPage;
