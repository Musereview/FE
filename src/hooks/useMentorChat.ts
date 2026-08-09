import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMentorMessages, streamMentorQuestion, type MentorMessageItem } from '@/apis/mentor';
import type { ErrorEventData } from '@/types/mentor';

export interface ChatMessage {
  id: number;
  sender: 'ai' | 'user';
  text: string;
}

interface UseMentorChatProps {
  resolvedAnalysisId?: number;
  token: string;
}

export function useMentorChat({ resolvedAnalysisId, token }: UseMentorChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  // TanStack Query로 대화 내역 조회
  const { data: serverMessages } = useQuery<MentorMessageItem[]>({
    queryKey: ['mentorMessages', resolvedAnalysisId],
    queryFn: () => fetchMentorMessages(resolvedAnalysisId!, token),
    enabled: !!resolvedAnalysisId,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (serverMessages && Array.isArray(serverMessages)) {
      const loadedMessages: ChatMessage[] = serverMessages.map((msg: MentorMessageItem) => ({
        id: msg.id,
        sender: msg.sender,
        text: msg.text,
      }));
      setMessages(loadedMessages);
    }
  }, [serverMessages]);

  // 스크롤 위치 감지
  const handleScroll = () => {
    if (chatScrollRef.current) {
      const { scrollTop } = chatScrollRef.current;
      setShowScrollTop(scrollTop > 20);
    }
  };

  // 자동 스크롤
  useEffect(() => {
    if (chatScrollRef.current && messages.length > 0) {
      const isUserAtBottom =
        chatScrollRef.current.scrollHeight - chatScrollRef.current.scrollTop <=
        chatScrollRef.current.clientHeight + 200;

      if (isStreaming || isUserAtBottom) {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      }
    }
  }, [messages, isStreaming]);

  const handleScrollToTop = () => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 질문 전송 및 스트리밍
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isStreaming || !resolvedAnalysisId) return;

    const userQuestion = inputText.trim();
    setInputText('');
    setIsStreaming(true);

    const tempUserId = Date.now();
    const tempAiId = Date.now() + 1;

    setMessages((prev) => [
      ...prev,
      { id: tempUserId, sender: 'user', text: userQuestion },
      { id: tempAiId, sender: 'ai', text: '' },
    ]);

    try {
      await streamMentorQuestion({
        analysisId: resolvedAnalysisId,
        content: userQuestion,
        accessToken: token,
        onStart: (data: unknown) => {
          const typedData = data as { userMessage?: { mentorMessageId: number } };
          if (typedData?.userMessage) {
            setMessages((prev) =>
              prev.map((msg) => (msg.id === tempUserId ? { ...msg, id: typedData.userMessage!.mentorMessageId } : msg)),
            );
          }
        },
        onChunk: (chunkText: string) => {
          setMessages((prev) =>
            prev.map((msg) => (msg.id === tempAiId ? { ...msg, text: msg.text + chunkText } : msg)),
          );
        },
        onComplete: (assistantMessage: unknown) => {
          const typedMsg = assistantMessage as { mentorMessageId: number; content: string };
          if (typedMsg) {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === tempAiId ? { id: typedMsg.mentorMessageId, sender: 'ai', text: typedMsg.content } : msg,
              ),
            );
          }
          setIsStreaming(false);
        },
        onError: (errorData: ErrorEventData) => {
          alert(errorData.message);
          setMessages((prev) =>
            prev.map((msg) => (msg.id === tempAiId ? { ...msg, text: `[오류] ${errorData.message}` } : msg)),
          );
          setIsStreaming(false);
        },
      });
    } catch (err) {
      console.error('SSE 스트리밍 에러:', err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempAiId ? { ...msg, text: '죄송합니다. 답변을 불러오는 중 오류가 발생했습니다.' } : msg,
        ),
      );
      setIsStreaming(false);
    }
  };

  return {
    messages,
    inputText,
    setInputText,
    isStreaming,
    showScrollTop,
    chatScrollRef,
    handleScroll,
    handleScrollToTop,
    handleSendMessage,
  };
}
