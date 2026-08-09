import type { ChatMessage } from '../../hooks/useMentorChat';

interface ChatMessageListProps {
  messages: ChatMessage[];
  isStreaming: boolean;
}

export default function ChatMessageList({ messages, isStreaming }: ChatMessageListProps) {
  return (
    <>
      {messages.map((msg, index) => (
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
                  {isStreaming && index === messages.length - 1 && (
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
    </>
  );
}
