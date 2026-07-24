import { useState, useRef, useEffect } from 'react';
import { sendMentorChatStream, fetchMentorMessages, type MentorMessage } from '@/apis/mentor';

interface AnalysisChatSectionProps {
  analysisId: number;
}

interface StreamingMentorMessage extends MentorMessage {
  id?: number;
  isStreaming?: boolean;
}

export default function AnalysisChatSection({ analysisId }: AnalysisChatSectionProps) {
  const [messages, setMessages] = useState<StreamingMentorMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetchMentorMessages(analysisId);
        if (res.isSuccess && res.data?.messages) {
          setMessages(res.data.messages);
        }
      } catch (err) {
        console.error('대화 내역 조회 실패:', err);
      }
    }
    if (analysisId) {
      loadHistory();
    }
  }, [analysisId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userQuestion = inputText;
    setInputText('');

    const newUserMsg: StreamingMentorMessage = {
      role: 'USER',
      content: userQuestion,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setIsLoading(true);

    const tempAssistantMsgId = Date.now();
    const newAssistantMsg: StreamingMentorMessage = {
      id: tempAssistantMsgId,
      role: 'ASSISTANT',
      content: '',
      referencesJson: null,
      createdAt: new Date().toISOString(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, newAssistantMsg]);

    try {
      await sendMentorChatStream(analysisId, userQuestion, (event) => {
        if (event.type === 'chunk') {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === tempAssistantMsgId ? { ...msg, content: (msg.content || '') + event.data } : msg,
            ),
          );
        } else if (event.type === 'complete') {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === tempAssistantMsgId
                ? {
                    ...msg,
                    content: event.data.content,
                    referencesJson: event.data.referencesJson,
                    isStreaming: false,
                  }
                : msg,
            ),
          );
          setIsLoading(false);
        } else if (event.type === 'error') {
          throw new Error(event.message || 'AI 답변 생성 중 오류가 발생했습니다.');
        }
      });
    } catch (err) {
      console.error('SSE 스트리밍 에러:', err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempAssistantMsgId
            ? { ...msg, content: '답변을 불러오는 중 오류가 발생했습니다.', isStreaming: false }
            : msg,
        ),
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[520px] w-full flex-col rounded-xl border border-gray-800 bg-gray-900 p-6 text-gray-300 shadow-2xl">
      {/* 챗봇 헤더 */}
      <div className="mb-4 flex items-center justify-between border-b border-gray-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="border-primary-400 text-primary-400 button-small flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-gray-950 shadow-inner">
            AI
          </div>
          <div>
            <h3 className="heading-small-b text-base text-white">뮤즈리뷰 AI 멘토</h3>
            <p className="caption-regular text-gray-500">분석 결과 및 리포트 기반 실시간 멘토링</p>
          </div>
        </div>
      </div>

      {/* 대화 로그 영역 */}
      <div className="flex-1 space-y-4 overflow-y-auto pr-2">
        {messages.map((item, idx) => (
          <div
            key={item.mentorMessageId || item.messageId || item.id || idx}
            className={`flex ${item.role === 'USER' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`body-small max-w-[80%] rounded-2xl px-4 py-3 leading-relaxed ${
                item.role === 'USER'
                  ? 'bg-primary-400 rounded-br-xs font-medium text-gray-950 shadow-md'
                  : 'rounded-bl-xs border border-gray-800 bg-gray-950 text-gray-300 shadow-md'
              }`}>
              {item.referencesJson?.sourceFields && item.referencesJson.sourceFields.length > 0 && (
                <div className="caption-medium text-primary-400 mb-2 flex items-center space-x-1 border-b border-gray-800 pb-2">
                  <span>📌 참고 지표:</span>
                  <span className="rounded bg-gray-900 px-1.5 py-0.5 text-[10px]">
                    {item.referencesJson.sourceFields.join(', ')}
                  </span>
                </div>
              )}
              <p className="whitespace-pre-wrap">{item.content}</p>
              <div className="mt-1 flex items-center justify-end space-x-1">
                <span
                  className={`caption-regular block ${
                    item.role === 'USER' ? 'font-medium text-gray-950/70' : 'text-gray-500'
                  }`}>
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : ''}
                </span>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 질문 입력 Form */}
      <form onSubmit={handleSendMessage} className="mt-4 flex items-center space-x-2 border-t border-gray-800 pt-3">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          maxLength={500}
          disabled={isLoading}
          placeholder={
            isLoading
              ? 'AI 멘토가 답변을 작성 중입니다...'
              : 'AI 멘토에게 분석 결과에 대해 질문해보세요 (500자 이하)...'
          }
          className="body-small focus:border-primary-400 flex-1 rounded-lg border border-gray-800 bg-gray-950 px-4 py-3 text-gray-300 transition-colors focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !inputText.trim()}
          className="bg-primary-400 button-small shrink-0 cursor-pointer rounded-lg px-5 py-3 text-gray-950 transition-opacity select-none hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40">
          {isLoading ? '생성 중...' : '전송'}
        </button>
      </form>
    </div>
  );
}
