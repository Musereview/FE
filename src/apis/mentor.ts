import { axiosInstance } from './axiosInstance';

export interface MentorMessage {
  mentorMessageId?: number;
  messageId?: number;
  role: 'USER' | 'ASSISTANT';
  content: string;
  referencesJson?: {
    sourceFields?: string[];
  } | null;
  createdAt: string;
}

export interface SSEEventData {
  content?: string;
  referencesJson?: {
    sourceFields?: string[];
  } | null;
}

export interface SSEEventPayload {
  type: string;
  data?: string | SSEEventData;
  message?: string;
}

// 1. 기존 AI 멘토 대화 내역 조회 API
export async function fetchMentorMessages(analysisId: number) {
  const response = await axiosInstance.get(`/api/v1/analyses/${analysisId}/mentor/chat`);
  return response.data;
}

// 2. AI 멘토 질문 전송 (SSE 스트리밍 수신)
export async function sendMentorChatStream(
  analysisId: number,
  content: string,
  onEvent: (event: SSEEventPayload) => void,
  signal?: AbortSignal,
) {
  const token = localStorage.getItem('accessToken') || '';
  const response = await fetch(`/api/v1/analyses/${analysisId}/mentor/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
    signal,
  });

  if (!response.ok || !response.body) {
    throw new Error('AI 멘토 서버 호출에 실패했습니다.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data:')) {
        try {
          const jsonStr = line.replace(/^data:\s*/, '');
          const eventData = JSON.parse(jsonStr);
          onEvent(eventData);
        } catch (e) {
          console.error('SSE 파싱 에러:', e);
        }
      }
    }
  }
}
