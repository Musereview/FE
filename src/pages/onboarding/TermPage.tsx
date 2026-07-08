// 약관 페이지
import { useState } from 'react';
import LogoTypo from '@/assets/landing/logo.svg?react';
import CheckIcon from '@/assets/onboarding/check.svg?react';

const TERMS = [
  { key: 'term1', label: '약관 1' },
  { key: 'term2', label: '약관 2' },
  { key: 'term3', label: '약관 3' },
] as const;

type TermKey = (typeof TERMS)[number]['key'];

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span className="flex size-6 shrink-0 items-center justify-center">
      <span
        className={`flex size-4 items-center justify-center rounded-[1px] border transition-colors ${
          checked ? 'border-primary-400 bg-primary-400' : 'border-gray-400'
        }`}>
        {checked && <CheckIcon className="size-3.5 text-gray-950" />}
      </span>
    </span>
  );
}

function TermPage() {
  const [agreed, setAgreed] = useState<Record<TermKey, boolean>>({
    term1: false,
    term2: false,
    term3: false,
  });

  const allChecked = TERMS.every(({ key }) => agreed[key]);

  const toggleAll = () => {
    const next = !allChecked;
    setAgreed({ term1: next, term2: next, term3: next });
  };

  const toggleOne = (key: TermKey) => {
    setAgreed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 px-6">
      <div className="flex w-full max-w-[618px] flex-col items-start gap-[110px]">
        {/* 로고 */}
        <LogoTypo className="text-primary-400 h-auto w-full" aria-label="MUSE REVIEW" />

        {/* 약관 동의 */}
        <div className="flex flex-col gap-15">
          <h1 className="heading-small-b text-gray-200">서비스 약관에 동의해 주세요.</h1>

          <div className="flex flex-col gap-8">
            {/* 전체 동의 */}
            <button type="button" onClick={toggleAll} className="flex cursor-pointer items-center gap-3">
              <Checkbox checked={allChecked} />
              <span className="heading-small-m text-gray-300">전체 동의하기</span>
            </button>

            {/* 개별 약관 */}
            <div className="flex flex-col gap-3 pl-6">
              {TERMS.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleOne(key)}
                  className="flex cursor-pointer items-center gap-3">
                  <Checkbox checked={agreed[key]} />
                  <span className="body-medium text-gray-300">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TermPage;
