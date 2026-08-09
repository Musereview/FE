const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
import type { ErrorEventData, MentorChatHistoryResponse, MentorMessage } from '../types/mentor';

// 프론트엔드 컴포넌트가 사용할 메시지 아이템 타입 정의
export interface MentorMessageItem {
  id: number;
  sender: 'USER' | 'ASSISTANT' | string;
  text: string;
  references?: { sourceFields: string[] } | null;
  createdAt: string;
}

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

  if (!response.ok) {
    throw new Error('대화 내역을 불러오지 못했습니다.');
  }

  const result = await response.json();

  if (result.isSuccess && result.data) {
    const chatHistory: MentorChatHistoryResponse = result.data;

    return chatHistory.messages.map((msg: MentorMessage) => ({
      id: msg.mentorMessageId,
      sender: msg.role,
      text: msg.content,
      references: msg.referencesJson,
      createdAt: msg.createdAt,
    }));
  } else {
    throw new Error(result.message || '대화 내역을 불러오지 못했습니다.');
  }
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
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  let isFinished = false;

  try {
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
      let errorJson = { code: 'UNKNOWN_ERROR', message: '스트리밍 연결에 실패했습니다.' };
      try {
        errorJson = await response.json();
      } catch {
        // 무시
      }
      onError(errorJson);
      return;
    }

    reader = response.body?.getReader();
    if (!reader) {
      onError({ code: 'NO_READER', message: '응답 본문을 읽을 수 없습니다.' });
      return;
    }

    const decoder = new TextDecoder();
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

        let parsedData;
        try {
          parsedData = JSON.parse(eventData);
        } catch {
          continue;
        }

        switch (eventType) {
          case 'start':
            onStart(parsedData);
            break;
          case 'chunk':
            onChunk(parsedData.content);
            break;
          case 'complete':
            isFinished = true;
            onComplete(parsedData.assistantMessage);
            return;
          case 'error':
            isFinished = true;
            onError(parsedData);
            return;
        }
      }
    }
    isFinished = true;
  } catch (err: unknown) {
    if (!isFinished) {
      onError({ code: 'STREAM_ERROR', message: err instanceof Error ? err.message : '오류 발생' });
      isFinished = true;
    }
  } finally {
    if (!isFinished && reader) {
      await reader.cancel().catch(() => {});
      onError({ code: 'STREAM_CLOSED', message: '스트림이 예기치 않게 종료되었습니다.' });
    }
  }
}
