const BASE_URL = import.meta.env.VITE_API_BASE_URL;
import type { ErrorEventData } from '../types/mentor';

/**
 * 1. AI 멘토 대화 내역 조회 (GET)
 */
export async function fetchMentorMessages(analysisId: number, accessToken: string): Promise<MentorMessageItem[]> {
  const response = await fetch(`${BASE_URL}/api/analyses/${analysisId}/mentor/messages`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  const result = await response.json();
  if (result.isSuccess) {
    return result.data.messages;
  } else {
    throw new Error(result.message || '대화 내역을 불러오지 못했습니다.');
  }
}

// 컴포넌트 내부 매핑용 타입
export interface MentorMessageItem {
  id: number;
  sender: 'ai' | 'user';
  text: string;
  referencesJson?: Record<string, unknown>;
}

/**
 * 2. AI 멘토 질문 전송 및 SSE 스트리밍 수신 (POST)
 */
export async function streamMentorQuestion({
  analysisId,
  content,
  accessToken,
  onStart,
  onChunk,
  onComplete,
  onError,
}: {
  analysisId: number;
  content: string;
  accessToken: string;
  onStart: (data: unknown) => void;
  onChunk: (chunkText: string) => void;
  onComplete: (assistantMessage: unknown) => void;
  onError: (errorData: ErrorEventData) => void;
}) {
  const response = await fetch(`${BASE_URL}/api/analyses/${analysisId}/mentor/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify({ content }),
  });

  // SSE 연결 전 발생한 일반 JSON 에러 처리
  if (!response.ok || response.headers.get('content-type')?.includes('application/json')) {
    const errorJson = await response.json();
    onError({ code: errorJson.code, message: errorJson.message });
    return;
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  if (!reader) return;

  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split('\n\n');
    buffer = events.pop() || '';

    for (const eventBlock of events) {
      if (!eventBlock.trim()) continue;

      let eventType = '';
      let eventData = '';

      const lines = eventBlock.split('\n');
      for (const line of lines) {
        if (line.startsWith('event:')) {
          eventType = line.replace('event:', '').trim();
        } else if (line.startsWith('data:')) {
          eventData += line.replace('data:', '').trim();
        }
      }

      const parsedData = JSON.parse(eventData);

      switch (eventType) {
        case 'start':
          onStart(parsedData);
          break;
        case 'chunk':
          onChunk(parsedData.content);
          break;
        case 'complete':
          onComplete(parsedData.assistantMessage);
          return;
        case 'error':
          onError(parsedData);
          return;
      }
    }
  }
}
