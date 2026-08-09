interface AnalysisReportViewProps {
  resolvedSummary: string;
  mainDesc: string;
  sections: Array<{ title: string; text: string }>;
}

export default function AnalysisReportView({ resolvedSummary, mainDesc, sections }: AnalysisReportViewProps) {
  return (
    <div className="flex w-full flex-col">
      {/* 요약 타이틀 및 메인 콘텐츠 */}
      <div className="mb-[52px] flex w-full flex-col gap-4">
        <div className="flex items-start gap-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="36"
            height="36"
            viewBox="0 0 36 36"
            fill="none"
            className="mt-1 shrink-0">
            <path
              d="M17.0614 3.05463C17.3823 2.18114 18.6177 2.18114 18.9386 3.05463L22.5427 12.8635C22.6439 13.139 22.861 13.3561 23.1365 13.4573L32.9454 17.0614C33.8189 17.3823 33.8189 18.6177 32.9454 18.9386L23.1365 22.5427C22.861 22.6439 22.6439 22.861 22.5427 23.1365L18.9386 32.9454C18.6177 33.8189 17.3823 33.8189 17.0614 32.9454L13.4573 23.1365C13.3561 22.861 13.139 22.6439 12.8635 22.5427L3.05463 18.9386C2.18114 18.6177 2.18114 17.3823 3.05463 17.0614L12.8635 13.4573C13.139 13.3561 13.3561 13.139 13.4573 12.8635L17.0614 3.05463Z"
              fill="#9CFFD6"
            />
          </svg>
          <h2
            className="text-2xl leading-snug font-semibold tracking-[-0.64px] sm:text-[32px] sm:leading-[44px]"
            style={{ color: 'var(--Color-Primary-300, #9CFFD6)', fontFamily: 'Pretendard' }}>
            {resolvedSummary}
          </h2>
        </div>

        <p
          className="pl-0 text-lg leading-relaxed font-normal tracking-[-0.4px] whitespace-pre-line sm:pl-[52px] sm:text-[20px] sm:leading-[30px]"
          style={{ color: 'var(--Color-Gray-Scale-200, #F0F1F1)', fontFamily: 'Pretendard' }}>
          {mainDesc}
        </p>
      </div>

      {/* 상세 분석 섹션들 */}
      {sections.map((sec, idx) => (
        <div key={idx} className={`flex w-full flex-col gap-2 ${idx === sections.length - 1 ? 'mb-0' : 'mb-[52px]'}`}>
          <h4
            className="pl-0 text-xl leading-snug font-semibold tracking-[-0.44px] sm:pl-[52px] sm:text-[22px] sm:leading-[32px]"
            style={{ color: 'var(--Color-Gray-Scale-200, #F0F1F1)', fontFamily: 'Pretendard' }}>
            {sec.title}
          </h4>
          <p
            className="pl-0 text-base leading-relaxed font-normal tracking-[-0.36px] whitespace-pre-line sm:pl-[52px] sm:text-[18px] sm:leading-[30px]"
            style={{ color: 'var(--Color-Gray-Scale-200, #F0F1F1)', fontFamily: 'Pretendard' }}>
            {sec.text}
          </p>
        </div>
      ))}
    </div>
  );
}
