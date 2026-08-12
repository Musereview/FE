import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

// 학습 이론/팁 마크다운 원문(theoryContent/practiceTip)을 렌더링. blockquote(>)는 강조 박스로 표시.
function MarkdownContent({ content, className = '' }: MarkdownContentProps) {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkBreaks]}
        components={{
          p: ({ children }) => <p className="body-regular2 text-gray-300">{children}</p>,
          ul: ({ children }) => (
            <ul className="body-regular2 flex list-disc flex-col gap-1 pl-5 text-gray-300">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="body-regular2 flex list-decimal flex-col gap-1 pl-5 text-gray-300">{children}</ol>
          ),
          li: ({ children }) => <li>{children}</li>,
          strong: ({ children }) => <strong className="font-semibold text-gray-100">{children}</strong>,
          blockquote: ({ children }) => (
            <blockquote className="bg-secondary-200 flex justify-center gap-2 rounded-[4px] px-5 py-4">
              <span aria-hidden className="shrink-0 leading-relaxed text-gray-900">
                ✔
              </span>
              <div className="flex flex-col gap-2 text-gray-950 [&_li]:text-inherit [&_p]:text-inherit [&_strong]:text-inherit">
                {children}
              </div>
            </blockquote>
          ),
        }}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default MarkdownContent;
