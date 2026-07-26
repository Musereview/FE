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
    <div className="flex flex-col gap-[16px]">
      {analyses.map((analysis) => (
        <div
          key={analysis.analysisId}
          style={{
            display: 'flex',
            height: '152px',
            padding: '24px 40px',
            justifyContent: 'space-between',
            alignItems: 'center',
            alignSelf: 'stretch',
            borderRadius: '6px',
            background: '#2B2E36',
          }}>
          {/* 왼쪽 정보 영역 */}
          <div className="flex flex-col gap-[8px]">
            <span
              style={{
                alignSelf: 'stretch',
                color: '#FFF',
                fontFamily: 'Pretendard',
                fontSize: '20px',
                fontStyle: 'normal',
                fontWeight: 400,
                lineHeight: '30px',
                letterSpacing: '-0.4px',
              }}>
              {analysis.title}
            </span>
            <div className="flex items-center gap-[16px]">
              <span
                style={{
                  alignSelf: 'stretch',
                  color: '#868A91',
                  fontFamily: 'Pretendard',
                  fontSize: '18px',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  lineHeight: '30px',
                  letterSpacing: '-0.36px',
                }}>
                1줄 정리
              </span>
              <div className="flex items-center gap-[4px]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="aspect-square shrink-0">
                  <path
                    d="M12 2.5C17.2467 2.5 21.5 6.75329 21.5 12C21.5 17.2467 17.2467 21.5 12 21.5C6.75329 21.5 2.5 17.2467 2.5 12C2.5 6.75329 6.75329 2.5 12 2.5ZM12 3.5C7.30558 3.5 3.5 7.30558 3.5 12C3.5 16.6944 7.30558 20.5 12 20.5C16.6944 20.5 20.5 16.6944 20.5 12C20.5 7.30558 16.6944 3.5 12 3.5ZM11.5 8C11.7759 8.00026 11.9999 8.22407 12 8.5V13.002H14.5049C14.7806 13.0022 15.0046 13.2262 15.0049 13.502C15.0049 13.7779 14.7808 14.0017 14.5049 14.002H11.7998C11.3581 14.0018 11 13.6439 11 13.2021V8.5C11.0001 8.22391 11.2239 8 11.5 8Z"
                    fill="#AEB1B6"
                  />
                </svg>
                <span
                  style={{
                    color: '#AEB1B6',
                    fontFamily: 'Pretendard',
                    fontSize: '14px',
                    fontStyle: 'normal',
                    fontWeight: 500,
                    lineHeight: '22px',
                    letterSpacing: '-0.28px',
                  }}>
                  {analysis.oneLineSummary || '분석 요약 내용이 없습니다.'}
                </span>
              </div>
            </div>
          </div>

          {/* 오른쪽 영역 (마디 표기와 리포트 보기 버튼) */}
          <div className="flex items-center gap-[32px]">
            <span
              style={{
                color: '#868A91',
                textAlign: 'center',
                fontFamily: 'Pretendard',
                fontSize: '22px',
                fontStyle: 'normal',
                fontWeight: 500,
                lineHeight: '32px',
                letterSpacing: '-0.44px',
              }}>
              {analysis.startBar}마디-{analysis.endBar}마디
            </span>

            <button
              type="button"
              onClick={() => onSelectReport(analysis.startBar, analysis.endBar, analysis.analysisId)}
              style={{
                display: 'flex',
                width: '193px',
                height: '60px',
                padding: '6px 12px 6px 14px',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                flexShrink: 0,
                borderRadius: '6px',
                border: '0.5px solid #69FFC0',
                background: 'transparent',
              }}
              className="cursor-pointer transition-all hover:bg-white/5 active:scale-[0.98]">
              <span className="text-center text-[16px] leading-[28px] font-medium tracking-[-0.32px] text-[#69FFC0]">
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
                  stroke="#69FFC0"
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
