export type MessageRole = 'USER' | 'ASSISTANT';

export interface MentorMessage {
  mentorMessageId: number;
  role: MessageRole;
  referencesJson?: {
    sourceFields: string[];
  } | null;
  content: string;
  createdAt: string;
}

export interface MentorChatHistoryResponse {
  analysisId: number;
  messages: MentorMessage[];
}

export interface SendMentorMessageRequest {
  content: string;
}

// SSE 이벤트 데이터 타입들
export interface StartEventData {
  analysisId: number;
  mentorChatSessionId: number;
  userMessage: MentorMessage;
}

export interface ChunkEventData {
  content: string;
}

export interface CompleteEventData {
  assistantMessage: MentorMessage;
}

export interface ErrorEventData {
  code: string;
  message: string;
}

//SSE 이벤트 페이로드 통신용 타입
export type SSEventData = StartEventData | ChunkEventData | CompleteEventData | ErrorEventData;

export interface SSEventPayload {
  type: 'start' | 'chunk' | 'complete' | 'error';
  data: SSEventData;
}
