import { useState, useRef, useEffect } from 'react';

// ==========================================
// 1. 타입 정의 (TypeScript Interfaces)
// ==========================================
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

interface ChatMessage {
  id: number;
  sender: 'ai' | 'user';
  text: string;
}

// ==========================================
// 2. Mock Data
// ==========================================
const MOCK_ANALYSIS_RESPONSE: AnalysisReportData = {
  analysisId: 10,
  summary: '긴장감을 오래 유지하는 흐름이 많았어요.',
  report: {
    content:
      '## 긴장감을 오래 유지하는 흐름이 많았어요.\n\n' +
      '이번 연주에서는 코드톤에 바로 해결하기보다, 텐션 계열의 음을 유지하며 분위기를 끌고 가는 흐름이 자주 보였습니다.\n' +
      '특히 CM7 구간에서 안정감보다는 살짝 떠 있는 듯한 느낌을 반복적으로 선택하는 경향이 있었습니다.\n\n' +
      '### 강약 조절\n' +
      '초반에는 비교적 일정한 세기로 연주가 이어졌지만, 후반부로 갈수록 특정한 음을 더 강하게 강조하는 패턴이 나타났습니다.\n' +
      '특히 코드가 전환되는 순간마다 타건 강도가 자연스럽게 올라가는 흐름이 보였습니다.\n\n' +
      '### 멜로디 진행\n' +
      '오른손 멜로디는 큰 도약보다는 인접한 음들을 중심으로 연결되며 비교적 부드러운 흐름을 만들고 있었습니다.\n' +
      '비슷한 음역대를 반복적으로 사용하면서 전체적인 분위기를 안정적으로 유지하고 있습니다.\n\n' +
      '### 템포 유지력\n' +
      '양손이 동시에 눌러야 하는 지점에서 오른손이 살짝 앞서는 경향이 있습니다. 두 손의 호흡을 한 정바에 맞춰보세요.',
  },
};

export default function AnalysisChatSection({
  analysisId,
  summaryTitle,
  reportContent,
  analysisData = MOCK_ANALYSIS_RESPONSE,
}: AnalysisChatSectionProps) {
  // 상태 관리 (채팅 메시지, 입력값, 스트리밍 여부, 상단 스크롤 버튼 표시 여부)
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  // 데이터 우선순위 적용
  const resolvedSummary = summaryTitle || analysisData?.summary || '긴장감을 오래 유지하는 흐름이 많았어요.';
  const resolvedContent = reportContent || analysisData?.report?.content || MOCK_ANALYSIS_RESPONSE.report!.content!;
  const resolvedAnalysisId = analysisId || analysisData?.analysisId || 10;

  // ==========================================
  // 3. 마크다운 파싱 함수
  // ==========================================
  const parseMarkdownContent = (content: string) => {
    const parts = content.split('### ').filter(Boolean);
    let mainDesc = '';
    const sections: Array<{ title: string; text: string }> = [];

    parts.forEach((part, index) => {
      if (
        index === 0 &&
        !part.startsWith('강약 조절') &&
        !part.startsWith('멜로디 진행') &&
        !part.startsWith('템포 유지력')
      ) {
        const cleanMain = part.replace(/^##\s*([^\n]+)\n+/, '').trim();
        mainDesc = cleanMain;
      } else {
        const lines = part.split('\n');
        const title = lines[0].trim();
        const text = lines.slice(1).join('\n').trim();
        if (title) {
          sections.push({ title, text });
        }
      }
    });

    return { mainDesc, sections };
  };

  const { mainDesc, sections } = parseMarkdownContent(resolvedContent);

  // 스크롤 위치 감지
  const handleScroll = () => {
    if (chatScrollRef.current) {
      const { scrollTop } = chatScrollRef.current;
      if (scrollTop > 20) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    }
  };

  // 새 메시지 추가 시 자동 스크롤 하단 고정
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  // 분석 결과 영역 최상단으로 부드럽게 스크롤 이동
  const handleScrollToTop = () => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // ==========================================
  // 4. 질문 전송 및 AI 응답 핸들러
  // ==========================================
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isStreaming) return;

    const userQuestion = inputText.trim();
    setInputText('');

    const userMsg: ChatMessage = {
      id: Date.now(),
      sender: 'user',
      text: userQuestion,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsStreaming(true);

    const aiMsgId = Date.now() + 1;
    const initialAiMsg: ChatMessage = {
      id: aiMsgId,
      sender: 'ai',
      text: '',
    };
    setMessages((prev) => [...prev, initialAiMsg]);

    try {
      const simulatedChunks = [
        '선택하신 마디 구간(#' + resolvedAnalysisId + ')의 ',
        '연주 패턴을 분석해 본 결과, ',
        '텐션 음을 조금 더 부드럽게 해결하면 ',
        '훨씬 완성도 높은 사운드가 될 것입니다! 🎵',
      ];

      for (const chunk of simulatedChunks) {
        await new Promise((resolve) => setTimeout(resolve, 350));
        setMessages((prev) => prev.map((msg) => (msg.id === aiMsgId ? { ...msg, text: msg.text + chunk } : msg)));
      }
    } catch (err) {
      console.error('SSE 스트리밍 에러:', err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMsgId ? { ...msg, text: '죄송합니다. 답변을 불러오는 중 오류가 발생했습니다.' } : msg,
        ),
      );
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex w-full max-w-[1400px] flex-col">
      {/* 스타일 태그: 애니메이션 키프레임 주입 */}
      <style>{`
        @keyframes kf_3261_36497_translate_0 {
          0% {
            animation-timing-function: linear(0, 0.03, 0.1077, 0.2165, 0.342, 0.4728, 0.6001, 0.7175, 0.8208, 0.9077, 0.9776, 1.0307, 1.0684, 1.0925, 1.1051, 1.1084, 1.1047, 1.096, 1.084, 1.0703, 1.0561, 1.0424, 1.0297, 1.0187, 1.0094, 1.0019, 0.9963, 0.9923, 0.9898, 0.9885, 0.9882, 0.9887, 0.9897, 0.991, 0.9925, 0.994, 0.9955, 0.9969, 0.9981, 0.9991, 0.9998, 1.0004, 1.0009, 1.0011, 1.0012, 1.0013, 1.0012, 1.0011, 1.001, 1.0008, 1.0006);
            transform: translate(0px, 0px);
          }
          100% {
            transform: translate(0px, -10px);
          }
        }
      `}</style>

      {/* 전체 채팅 및 분석 결과 박스 컨테이너  */}
      <div
        className="relative flex w-full flex-col rounded-[6px_6px_0_0]"
        style={{
          display: 'flex',
          height: '630px',
          padding: '0px', // 패딩을 스크롤 내부로 위임하여 스크롤바가 상단 끝까지 닿게 함
          flexDirection: 'column',
          alignItems: 'flex-start',
          alignSelf: 'stretch',
          borderRadius: '6px 6px 0 0',
          background: 'var(--Color-Gray-Scale-900, #1B1E27)',
          overflow: 'hidden',
        }}>
        {/* 상단 분석 결과 및 채팅 스크롤 영역  */}
        <div
          ref={chatScrollRef}
          onScroll={handleScroll}
          className="absolute inset-0 overflow-y-auto px-[40px] pt-[50px] [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#55585E] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-[#2B2E36]"
          style={{ paddingBottom: '50px' }}>
          {/* 분석 결과 영역 */}
          <div className="flex w-full flex-col">
            {/* 요약 타이틀 및 메인 콘텐츠 */}
            <div className="mb-[52px] flex flex-col" style={{ gap: '16px' }}>
              <div className="flex items-start gap-[16px]">
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
                  style={{
                    color: 'var(--Color-Primary-300, #9CFFD6)',
                    fontFamily: 'Pretendard',
                    fontSize: '32px',
                    fontStyle: 'normal',
                    fontWeight: 600,
                    lineHeight: '44px',
                    letterSpacing: '-0.64px',
                  }}>
                  {resolvedSummary}
                </h2>
              </div>

              {/* 메인 설명 텍스트 */}
              <p
                style={{
                  color: 'var(--Color-Gray-Scale-200, #F0F1F1)',
                  fontFamily: 'Pretendard',
                  fontSize: '20px',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  lineHeight: '30px',
                  letterSpacing: '-0.4px',
                }}
                className="pl-[52px] whitespace-pre-line">
                {mainDesc}
              </p>
            </div>

            {/* 상세 분석 섹션들 */}
            {sections.map((sec, idx) => (
              <div
                key={idx}
                className={`flex flex-col gap-2 ${idx === sections.length - 1 ? 'mb-0' : 'mb-[52px]'}`}
                style={{ alignSelf: 'stretch' }}>
                <h4
                  style={{
                    color: 'var(--Color-Gray-Scale-200, #F0F1F1)',
                    fontFamily: 'Pretendard',
                    fontSize: '22px',
                    fontStyle: 'normal',
                    fontWeight: 600,
                    lineHeight: '32px',
                    letterSpacing: '-0.44px',
                    alignSelf: 'stretch',
                    paddingLeft: '52px',
                  }}>
                  {sec.title}
                </h4>
                {/* 상세 분석 본문 텍스트 */}
                <p
                  style={{
                    color: 'var(--Color-Gray-Scale-200, #F0F1F1)',
                    fontFamily: 'Pretendard',
                    fontSize: '18px',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    lineHeight: '30px',
                    letterSpacing: '-0.36px',
                  }}
                  className="pl-[52px] whitespace-pre-line">
                  {sec.text}
                </p>
              </div>
            ))}
          </div>

          {/* 유저 및 AI 채팅 메시지 리스트 */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`mt-[52px] flex w-full flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              {msg.sender === 'user' ? (
                /* 유저 질문 메시지 (Typography/Body/Medium 스펙 적용) */
                <div
                  className="max-w-[75%] rounded-[12px] bg-[#6712D1] px-5 py-3.5 shadow-md"
                  style={{
                    color: 'var(--Color-Secondary-100, #FAF2FF)',
                    fontFamily: 'Pretendard',
                    fontSize: '20px',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    lineHeight: '30px',
                    letterSpacing: '-0.4px',
                  }}>
                  {msg.text}
                </div>
              ) : (
                /* AI 멘토 답장 영역 */
                <div className="flex w-full max-w-[85%] flex-col pl-[52px]">
                  {isStreaming && msg.text === '' ? (
                    /* AI 멘토 로딩 중 점 3개 애니메이션 SVG  */
                    <div className="py-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="90" height="40" viewBox="0 0 90 40" fill="none">
                        <circle
                          cx="19"
                          cy="24"
                          r="8"
                          fill="#D0FFEB"
                          style={{
                            animation: 'kf_3261_36497_translate_0 0.49617s infinite alternate linear',
                            animationDelay: '0s',
                          }}
                        />
                        <circle
                          cx="45"
                          cy="24"
                          r="8"
                          fill="#D0FFEB"
                          style={{
                            animation: 'kf_3261_36497_translate_0 0.49617s infinite alternate linear',
                            animationDelay: '0.15s',
                          }}
                        />
                        <circle
                          cx="71"
                          cy="24"
                          r="8"
                          fill="#D0FFEB"
                          style={{
                            animation: 'kf_3261_36497_translate_0 0.49617s infinite alternate linear',
                            animationDelay: '0.3s',
                          }}
                        />
                      </svg>
                    </div>
                  ) : (
                    /* AI 멘토 실제 답변 텍스트 및 커서 바 수직 정렬 */
                    <div className="relative inline-flex flex-wrap items-center py-1">
                      <span
                        style={{
                          color: 'var(--Color-Primary-200, #D0FFEB)',
                          fontFamily: 'Pretendard',
                          fontSize: '22px',
                          fontStyle: 'normal',
                          fontWeight: 500,
                          lineHeight: '32px',
                          letterSpacing: '-0.44px',
                          whiteSpace: 'pre-wrap',
                        }}>
                        {msg.text}
                      </span>
                      {/* 스트리밍 중일 때 텍스트와 나란히 정렬되는 커서 바 */}
                      {isStreaming && msg.id === messages[messages.length - 1].id && (
                        <span className="ml-1 inline-flex items-center" style={{ width: '2px', height: '24px' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="2" height="24" viewBox="0 0 2 24" fill="none">
                            <rect width="2" height="24" fill="#D0FFEB" />
                          </svg>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 스크롤 위로 이동 버튼 */}
        {showScrollTop && (
          <button
            onClick={handleScrollToTop}
            className="absolute z-10 cursor-pointer transition-all hover:scale-105 active:scale-95"
            style={{
              right: '36px',
              bottom: '30px',
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

      {/* 최하단 채팅 입력 폼 */}
      <div
        className="w-full shrink-0"
        style={{
          display: 'flex',
          padding: '20px 40px',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '20px',
          alignSelf: 'stretch',
          borderRadius: '0 0 6px 6px',
          borderTop: '0.3px solid var(--Color-Gray-Scale-500, #AEB1B6)',
          background: 'var(--Color-Gray-Scale-800, #2B2E36)',
        }}>
        <form onSubmit={handleSendMessage} className="relative flex w-full items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isStreaming}
            placeholder="질문 내용을 입력해 주세요."
            className="w-full bg-transparent pr-12 focus:outline-none disabled:opacity-50"
            style={{
              color: 'var(--color-gray-scale-300-text, #E7E7E8)',
              fontFamily: 'Pretendard',
              fontSize: '16px',
              fontStyle: 'normal',
              fontWeight: 500,
              lineHeight: '24px',
              letterSpacing: '-0.32px',
              flex: '1 0 0',
            }}
          />
          <button
            type="submit"
            disabled={isStreaming || !inputText.trim()}
            className="absolute right-0 flex cursor-pointer items-center justify-center transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed"
            style={{
              width: '36px',
              height: '36px',
              aspectRatio: '1/1',
              background: 'transparent',
              border: 'none',
              padding: 0,
            }}>
            {inputText.trim() ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none">
                <rect width="36" height="36" rx="18" fill="#9CFFD6" />
                <path
                  d="M12.0628 12.1241L14.6067 18.4997L12.059 24.8769C11.9345 25.1847 12.0114 25.5273 12.2482 25.7595L12.2778 25.7886C12.4036 25.9 12.561 25.9712 12.729 25.993C12.8971 26.0147 13.068 25.9858 13.2191 25.9102L26.5422 19.228C26.6797 19.1606 26.7954 19.057 26.8762 18.9287C26.9571 18.8005 27 18.6527 27 18.502C27 18.3512 26.9573 18.2035 26.8765 18.0753C26.7957 17.9471 26.6801 17.8435 26.5426 17.7762L13.2235 11.09C12.9098 10.9333 12.5368 10.9857 12.2821 11.2122C12.0275 11.4388 11.9386 11.8047 12.0628 12.1241Z"
                  fill="#0B0F19"
                />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none">
                <rect width="36" height="36" rx="18" fill="#E7E7E8" />
                <path
                  d="M12.0628 12.1241L14.6067 18.4997L12.059 24.8769C11.9345 25.1847 12.0114 25.5273 12.2482 25.7595L12.2778 25.7886C12.4036 25.9 12.561 25.9712 12.729 25.993C12.8971 26.0147 13.068 25.9858 13.2191 25.9102L26.5422 19.228C26.6797 19.1606 26.7954 19.057 26.8762 18.9287C26.9571 18.8005 27 18.6527 27 18.502C27 18.3512 26.9573 18.2035 26.8765 18.0753C26.7957 17.9471 26.6801 17.8435 26.5426 17.7762L13.2235 11.09C12.9098 10.9333 12.5368 10.9857 12.2821 11.2122C12.0275 11.4388 11.9386 11.8047 12.0628 12.1241Z"
                  fill="#55585E"
                />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
