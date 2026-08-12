interface AnalysisItem {
  analysisId: number;
  startBar: number;
  endBar: number;
  title: string;
  oneLineSummary: string;
  status: string;
  estimatedSeconds: number | null;
  createdAt: string;
}

interface AnalysisReportListProps {
  analyses: AnalysisItem[];
  onSelectReport: (startBar: number, endBar: number, analysisId: number) => void;
}

export default function AnalysisReportList({ analyses, onSelectReport }: AnalysisReportListProps) {
  if (!analyses || analyses.length === 0) {
    return <div className="py-8 text-center text-gray-500">연결된 분석 리포트가 없습니다.</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      {analyses.map((analysis) => (
        <div
          key={analysis.analysisId}
          className="flex h-[152px] w-full items-center justify-between rounded-[6px] bg-gray-800 px-10 py-6">
          {/* 왼쪽 정보 영역 */}
          <div className="flex flex-col gap-2">
            <span className="text-[20px] leading-[30px] font-normal tracking-[-0.4px] text-white">
              {analysis.title}
            </span>
            <div className="flex items-center gap-4">
              <span className="text-[18px] leading-[30px] font-medium tracking-[-0.36px] text-gray-600">1줄 정리</span>
              <div className="flex max-w-[500px] items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="aspect-square shrink-0">
                  <path
                    d="M12 2.5C17.2467 2.5 21.5 6.75329 21.5 12C21.5 17.2467 17.2467 21.5 12 21.5C6.75329 21.5 2.5 17.2467 2.5 12C2.5 6.75329 6.75329 2.5 12 2.5ZM12 3.5C7.30558 3.5 3.5 7.30558 3.5 12C3.5 16.6944 7.30558 20.5 12 20.5C16.6944 20.5 20.5 16.6944 20.5 12C20.5 7.30558 16.6944 3.5 12 3.5ZM11.5 8C11.7759 8.00026 11.9999 8.22407 12 8.5V13.002H14.5049C14.7806 13.0022 15.0046 13.2262 15.0049 13.502C15.0049 13.7779 14.7808 14.0017 14.5049 14.002H11.7998C11.3581 14.0018 11 13.6439 11 13.2021V8.5C11.0001 8.22391 11.2239 8 11.5 8Z"
                    className="fill-gray-400"
                  />
                </svg>
                <span className="line-clamp-2 min-w-0 text-[14px] leading-[22px] font-medium tracking-[-0.28px] text-gray-400">
                  {analysis.oneLineSummary || '분석 요약 내용이 없습니다.'}
                </span>
              </div>
            </div>
          </div>

          {/* 오른쪽 영역 (마디 표기와 리포트 보기 버튼) */}
          <div className="flex shrink-0 items-center gap-8">
            <span className="text-center text-[22px] leading-[32px] font-medium tracking-[-0.44px] text-gray-600">
              {analysis.startBar}마디-{analysis.endBar}마디
            </span>

            <button
              type="button"
              onClick={() => onSelectReport(analysis.startBar, analysis.endBar, analysis.analysisId)}
              className="border-primary-400 flex h-[60px] w-[193px] shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[6px] border-[0.5px] bg-transparent px-[14px] py-[6px] transition-all hover:bg-white/5 active:scale-[0.98]">
              <span className="text-primary-400 text-center text-[16px] leading-[28px] font-medium tracking-[-0.32px]">
                리포트보기
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className="aspect-square shrink-0">
                <path
                  d="M8.5 19.5L16.5 12L8.5 4.5"
                  className="stroke-primary-400"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
