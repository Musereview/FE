// 약관 페이지
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoTypo from '@/assets/landing/logo.svg?react';
import CheckIcon from '@/assets/onboarding/check.svg?react';
import ChevronDownIcon from '@/assets/practice/chevron-down.svg?react';
import { TERMS, type TermKey } from '@/constants/terms';

const INITIAL_AGREED = Object.fromEntries(TERMS.map(({ key }) => [key, false])) as Record<TermKey, boolean>;

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span className="flex size-6 shrink-0 items-center justify-center">
      <span
        className={`flex size-5 items-center justify-center rounded-[2px] border transition-colors ${
          checked ? 'border-primary-400 bg-primary-400' : 'border-gray-400'
        }`}>
        {checked && <CheckIcon className="h-[9px] w-[11px]" />}
      </span>
    </span>
  );
}

function TermPage() {
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState<Record<TermKey, boolean>>(INITIAL_AGREED);
  const [openKeys, setOpenKeys] = useState<Set<TermKey>>(new Set());

  const allChecked = TERMS.every(({ key }) => agreed[key]);
  const requiredChecked = TERMS.every(({ key, required }) => !required || agreed[key]);

  const toggleAll = () => {
    const next = !allChecked;
    setAgreed(Object.fromEntries(TERMS.map(({ key }) => [key, next])) as Record<TermKey, boolean>);
  };

  const toggleOne = (key: TermKey) => {
    setAgreed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleOpen = (key: TermKey) => {
    setOpenKeys((prev) => {
      const next = new Set(prev);
      if (!next.delete(key)) next.add(key);
      return next;
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-950 px-6">
      {/* 상단 로고 */}
      <header className="flex h-[124px] shrink-0 items-center justify-center px-2.5 py-1">
        <LogoTypo className="text-primary-400 h-[29px] w-[174px]" aria-label="MUSE REVIEW" />
      </header>

      {/* 본문 */}
      <main className="mx-auto flex w-full max-w-[792px] flex-col gap-[68px] py-[76px]">
        <h1 className="heading-medium-b text-gray-200">
          원활한 서비스 이용을 위해
          <br />
          약관에 동의해 주세요.
        </h1>

        <div className="flex flex-col items-end gap-25">
          <div className="flex w-full flex-col gap-6">
            {/* 전체 동의 */}
            <button
              type="button"
              onClick={toggleAll}
              role="checkbox"
              aria-checked={allChecked}
              className="flex cursor-pointer items-center gap-3 p-5">
              <Checkbox checked={allChecked} />
              <span className="heading-small-b text-gray-300">전체 동의</span>
            </button>

            {/* 개별 약관 */}
            <div className="flex flex-col">
              {TERMS.map(({ key, label, content }) => {
                const isOpen = openKeys.has(key);
                return (
                  <div key={key} className="flex flex-col">
                    <div className="flex items-center justify-between bg-gray-800 p-5">
                      <button
                        type="button"
                        onClick={() => toggleOne(key)}
                        role="checkbox"
                        aria-checked={agreed[key]}
                        className="flex cursor-pointer items-center gap-3">
                        <Checkbox checked={agreed[key]} />
                        <span className="body-medium text-gray-300">{label}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleOpen(key)}
                        aria-expanded={isOpen}
                        aria-controls={`term-panel-${key}`}
                        aria-label={`${label} ${isOpen ? '접기' : '펼치기'}`}
                        className="cursor-pointer">
                        <ChevronDownIcon
                          className={`size-6 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                          aria-hidden
                        />
                      </button>
                    </div>

                    {isOpen && (
                      <div id={`term-panel-${key}`} className="button-small bg-gray-700 px-14 py-3 text-gray-200">
                        {content.map((line) => (
                          <p key={line}>{line}</p>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 다음 버튼 */}
          {requiredChecked && (
            <button
              type="button"
              onClick={() => navigate('/onboarding/role')}
              className="button-large1 bg-primary-400 flex h-[76px] w-[388px] cursor-pointer items-center justify-center rounded-md text-gray-950">
              다음
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

export default TermPage;
