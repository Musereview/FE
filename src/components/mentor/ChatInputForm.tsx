interface ChatInputFormProps {
  inputText: string;
  setInputText: (text: string) => void;
  isStreaming: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ChatInputForm({ inputText, setInputText, isStreaming, onSubmit }: ChatInputFormProps) {
  return (
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
      <form onSubmit={onSubmit} className="relative flex w-full items-center">
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
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none">
            <rect width="36" height="36" rx="18" fill={inputText.trim() ? '#9CFFD6' : '#E7E7E8'} />
            <path
              d="M12.0628 12.1241L14.6067 18.4997L12.059 24.8769C11.9345 25.1847 12.0114 25.5273 12.2482 25.7595L12.2778 25.7886C12.4036 25.9 12.561 25.9712 12.729 25.993C12.8971 26.0147 13.068 25.9858 13.2191 25.9102L26.5422 19.228C26.6797 19.1606 26.7954 19.057 26.8762 18.9287C26.9571 18.8005 27 18.6527 27 18.502C27 18.3512 26.9573 18.2035 26.8765 18.0753C26.7957 17.9471 26.6801 17.8435 26.5426 17.7762L13.2235 11.09C12.9098 10.9333 12.5368 10.9857 12.2821 11.2122C12.0275 11.4388 11.9386 11.8047 12.0628 12.1241Z"
              fill={inputText.trim() ? '#0B0F19' : '#55585E'}
            />
          </svg>
        </button>
      </form>
    </div>
  );
}
