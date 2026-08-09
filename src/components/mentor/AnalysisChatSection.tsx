import { useMentorChat } from '../../hooks/useMentorChat';
import AnalysisReportView from './AnalysisReportView';
import ChatMessageList from './ChatMessageList';
import ChatInputForm from './ChatInputForm';

interface AnalysisReportData {
  analysisId?: number;
  summary?: string;
  report?: {
    content?: string;
  };
}

interface AnalysisChatSectionProps {
  analysisId?: number;
  summaryTitle?: string;
  reportContent?: string;
  analysisData?: AnalysisReportData;
}

export default function AnalysisChatSection({
  analysisId,
  summaryTitle,
  reportContent,
  analysisData,
}: AnalysisChatSectionProps) {
  const resolvedSummary = summaryTitle || analysisData?.summary || '';
  const resolvedContent = reportContent || analysisData?.report?.content || '';
  const resolvedAnalysisId = analysisId || analysisData?.analysisId;
  const token = localStorage.getItem('accessToken') || '';

  const {
    messages,
    inputText,
    setInputText,
    isStreaming,
    showScrollTop,
    chatScrollRef,
    handleScroll,
    handleScrollToTop,
    handleSendMessage,
  } = useMentorChat({ resolvedAnalysisId, token });

  // 마크다운 및 불릿 기호 제거 유틸 함수
  const removeMarkdown = (text?: string): string => {
    if (!text) return '';
    return text
      .replace(/#{1,6}[ \t]+/gm, '') // #, ##, ### 등 헤더 기호 제거
      .replace(/\*\*/g, '') // ** 볼드 기호 제거
      .replace(/^\s*[-*]\s+/gm, '') // 줄 맨 앞의 불릿 기호(* 또는 -) 제거
      .replace(/\*/g, '') // 단독 * 별표 제거
      .trim();
  };

  // 마크다운 파싱 함수
  const parseMarkdownContent = (content: string) => {
    const parts = content.split(/(?:^|\r?\n)##[ \t]+/).filter(Boolean);
    let mainDesc = '';
    const sections: Array<{ title: string; text: string }> = [];

    parts.forEach((part, index) => {
      const lines = part.split('\n').filter(Boolean);
      const firstLine = lines[0]?.trim() || '';

      // 첫 번째 파트이면서, '총평'이나 '잘한 점' 같은 섹션 타이틀이 아니라면 메인 설명으로 지정!
      if (index === 0 && !['총평', '잘한 점', '진행 맥락', '개선 제안', '점수 요약'].includes(firstLine)) {
        mainDesc = removeMarkdown(part);
      } else {
        // 그 외에는 각각의 섹션 (제목 + 본문)으로 분리
        const title = removeMarkdown(firstLine);
        const text = removeMarkdown(lines.slice(1).join('\n'));

        if (title) {
          sections.push({ title, text });
        }
      }
    });

    return { mainDesc, sections };
  };

  const { mainDesc, sections } = parseMarkdownContent(resolvedContent);

  return (
    <div className="flex w-full max-w-[1280px] flex-col">
      <style>{`
        @keyframes kf_3261_36497_translate_0 {
          0% { transform: translate(0px, 0px); }
          100% { transform: translate(0px, -10px); }
        }
      `}</style>

      {/* 전체 채팅 및 분석 결과 박스 컨테이너 */}
      <div
        className="relative flex w-full flex-col rounded-[6px_6px_0_0]"
        style={{
          display: 'flex',
          height: '630px',
          padding: '0px',
          flexDirection: 'column',
          alignItems: 'flex-start',
          alignSelf: 'stretch',
          borderRadius: '6px 6px 0 0',
          background: 'var(--Color-Gray-Scale-900, #1B1E27)',
          overflow: 'hidden',
        }}>
        {/* 상단 분석 결과 및 채팅 스크롤 영역 */}
        <div
          ref={chatScrollRef}
          onScroll={handleScroll}
          className="absolute inset-0 overflow-y-auto px-6 pt-[50px] sm:px-10 [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#55585E] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-[#2B2E36]"
          style={{ paddingBottom: '50px' }}>
          {/* 1. 분석 결과 영역 */}
          <AnalysisReportView resolvedSummary={resolvedSummary} mainDesc={mainDesc} sections={sections} />

          {/* 2. 유저 및 AI 채팅 메시지 리스트 */}
          <ChatMessageList messages={messages} isStreaming={isStreaming} />
        </div>

        {/* 스크롤 위로 이동 버튼 */}
        {showScrollTop && (
          <button
            onClick={handleScrollToTop}
            className="absolute z-10 cursor-pointer transition-all hover:scale-105 active:scale-95"
            style={{
              right: '24px',
              bottom: '24px',
              width: '48px',
              height: '48px',
              background: 'transparent',
              border: 'none',
              padding: 0,
            }}
            title="분석 결과로 이동">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="24" fill="#CECFD1" fillOpacity="0.7" />
              <path
                d="M24 36L24 13M33.5 21.6667L24 13L14.5 21.6667"
                stroke="#0B0F19"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>

      {/* 3. 최하단 채팅 입력 폼 */}
      <ChatInputForm
        inputText={inputText}
        setInputText={setInputText}
        isStreaming={isStreaming}
        onSubmit={handleSendMessage}
      />
    </div>
  );
}
