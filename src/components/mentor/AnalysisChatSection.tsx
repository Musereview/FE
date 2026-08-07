import { useState, useRef, useEffect } from 'react';

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

export default function AnalysisChatSection({
  analysisId,
  summaryTitle,
  reportContent,
  analysisData,
}: AnalysisChatSectionProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  const resolvedSummary = summaryTitle || analysisData?.summary || '';
  const resolvedContent = reportContent || analysisData?.report?.content || '';
  const resolvedAnalysisId = analysisId || analysisData?.analysisId;

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

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  const handleScrollToTop = () => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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
    <div className="flex w-full max-w-[1280px] flex-col">
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
          {/* 분석 결과 영역 */}
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

              {/* 메인 설명 텍스트  */}
              <p
                className="pl-0 text-lg leading-relaxed font-normal tracking-[-0.4px] whitespace-pre-line sm:pl-[52px] sm:text-[20px] sm:leading-[30px]"
                style={{ color: 'var(--Color-Gray-Scale-200, #F0F1F1)', fontFamily: 'Pretendard' }}>
                {mainDesc}
              </p>
            </div>

            {/* 상세 분석 섹션들 */}
            {sections.map((sec, idx) => (
              <div
                key={idx}
                className={`flex w-full flex-col gap-2 ${idx === sections.length - 1 ? 'mb-0' : 'mb-[52px]'}`}>
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

          {/* 유저 및 AI 채팅 메시지 리스트 */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`mt-[52px] flex w-full flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              {msg.sender === 'user' ? (
                <div
                  className="max-w-[85%] rounded-[12px] bg-[#6712D1] px-5 py-3.5 text-lg leading-relaxed font-normal tracking-[-0.4px] shadow-md sm:max-w-[75%] sm:text-[20px] sm:leading-[30px]"
                  style={{ color: 'var(--Color-Secondary-100, #FAF2FF)', fontFamily: 'Pretendard' }}>
                  {msg.text}
                </div>
              ) : (
                <div className="flex w-full max-w-[90%] flex-col pl-0 sm:max-w-[85%] sm:pl-[52px]">
                  {isStreaming && msg.text === '' ? (
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
                    <div className="relative inline-flex flex-wrap items-center py-1">
                      <span
                        className="text-xl leading-snug font-medium tracking-[-0.44px] whitespace-pre-wrap sm:text-[22px] sm:leading-[32px]"
                        style={{ color: 'var(--Color-Primary-200, #D0FFEB)', fontFamily: 'Pretendard' }}>
                        {msg.text}
                      </span>
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

      {/* 최하단 채팅 입력 폼*/}
      <div
        className="w-full shrink-0 px-6 py-5 sm:px-10"
        style={{
          display: 'flex',
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
            className="w-full bg-transparent pr-12 text-sm leading-6 font-medium tracking-[-0.32px] focus:outline-none disabled:opacity-50 sm:text-base"
            style={{
              color: 'var(--color-gray-scale-300-text, #E7E7E8)',
              fontFamily: 'Pretendard',
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
