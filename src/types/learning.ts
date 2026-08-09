// 학습 결과 저장 API 타입
import type { ParsedMidiData } from '@/utils/midiData';

// 요청 바디 — POST /api/learnings/{learningId}/result
export interface SaveLearningResultRequest {
  score: number; // 최종 점수
  learningStepId: number; // 학습 스텝 ID
}

// 응답 data
export interface LearningResultResponse {
  userLearningProgressId: number;
  userId: number;
  learningId: number;
  status: string; // 예: 'COMPLETED'
  score: number;
  completedAt: string; // ISO 8601
}

// 연주(실습) 데이터 조회 응답 data
// GET /api/learnings/{learningId}/steps/{learningStepId}/practice-data
// 단계 상세 화면엔 없는, 실제 연주·채점에 필요한 값만 반환
export interface PracticeDataResponse {
  bpm: number;
  keySignature: string; // 예: 'C'
  // 채점용 MIDI 데이터 — 명세는 JSON 문자열이지만 실제로는 이미 파싱된 객체로 내려오기도 함 (utils/midiData.ts에서 둘 다 처리)
  midiData: string | Partial<ParsedMidiData>;
}

// 학습 진행률 조회 응답 data — GET /api/learnings/{learningId}/progress
// 완료(score>=90) 단계 수 / 전체 단계 수 기준 패키지 단위 진행률
export interface LearningProgressResponse {
  learningId: number;
  progressRate: number; // 0~100
}

// ──────────────────────────────────────────────────────────────────────────
// 아래 5개는 스웨거(https://api.musereview.site/swagger-ui/index.html) 실제 스키마 기준.
// 백엔드 difficulty/status는 대문자 enum 문자열로 내려옴 — apis/learningMappers.ts로 변환해서 사용.
// theoryContent/practiceTip은 마크다운 원문 그대로 내려옴(가공 없음) — react-markdown으로 렌더링.
// ──────────────────────────────────────────────────────────────────────────

// 1. 학습 홈 조회 — GET /api/learnings/home
export interface CurrentLearningDTO {
  learningId: number;
  title: string;
  difficulty: string; // 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  stepTitle: string; // 마지막으로 학습한 단계의 제목
  progressRate: number; // 1~99 (0 또는 100이면 currentLearning 자체가 null로 내려옴)
  nextStepId: number; // [이어서 학습하기] 클릭 시 이동할 단계 ID
}

export interface TheoryPackageItemDTO {
  learningId: number;
  title: string;
  difficulty: string;
  summary: string;
}

// 실전 반주법 패키지 항목 — 홈/목록 조회 공통. status 없음, progressRate로 클라이언트에서 status 계산
export interface AccompanimentItemDTO {
  learningId: number;
  title: string;
  description: string;
  estimatedMinutes: number;
  progressRate: number; // 0~100
}

export interface LearningHomeResponse {
  currentLearning: CurrentLearningDTO | null;
  theoryPackages: TheoryPackageItemDTO[]; // 난이도별 대표 학습 주제, 최대 3개
  accompanimentPackages: AccompanimentItemDTO[]; // 대표 실전 반주법 패키지, 이름순 3개
}

// 2-1. 학습 주제 전체 조회 — GET /api/learnings/theory?difficulty=BEGINNER|INTERMEDIATE|ADVANCED (difficulty 필수)
export interface TheoryItemDTO {
  learningId: number;
  title: string;
  difficulty: string;
  summary: string;
}
export interface TheoryListResponse {
  items: TheoryItemDTO[];
}

// 2-2. 실전 반주법 전체 조회 — GET /api/learnings/accompaniment (난이도 구분 없음)
export interface AccompanimentListResponse {
  totalCount: number;
  items: AccompanimentItemDTO[];
}

// 3. 학습 커리큘럼 조회 — GET /api/learnings/{learningId}
export interface ProgressInfoDTO {
  completedStepCount: number; // score>=90인 단계 수
  totalStepCount: number;
  progressRate: number; // 0~100
}

export interface StepItemDTO {
  learningStepId: number;
  stepNo: number;
  title: string;
  description: string;
  estimatedMinutes: number;
  status: string; // 'NOT_STARTED' | 'RETRY' | 'COMPLETED' — '학습 중' 상태는 백엔드에 없음(확인 필요 항목)
  score: number | null;
}

export interface LearningCurriculumResponse {
  learningId: number;
  title: string;
  subtitle: string;
  difficulty: string;
  theoryContent: string; // 마크다운 원문
  practiceTip: string; // 마크다운 원문
  progress: ProgressInfoDTO;
  steps: StepItemDTO[]; // step_no 오름차순
}

// 4. 학습 단계별 조회 — GET /api/learnings/{learningId}/steps/{learningStepId}
// 참고: bpm/timeSignature 필드 없음 — 실습 데이터(practice-data, 민서 담당 API)에서 조회해야 함
export interface ModelPerformanceDTO {
  title: string;
  description: string;
  audioUrl: string;
  durationSeconds: number;
}

export interface ChordExampleItemDTO {
  chordName: string;
  description: string;
  noteNumbers: number[]; // 가상 건반에 표시할 MIDI 노트 번호
}

export interface LearningStepDetailResponse {
  learningId: number;
  learningStepId: number;
  learningTitle: string;
  difficulty: string;
  stepNo: number;
  stepTitle: string;
  theoryContent: string; // 마크다운 원문
  practiceTip: string; // 마크다운 원문
  modelPerformance: ModelPerformanceDTO | null; // 없으면 null
  chordExamples: ChordExampleItemDTO[]; // 없으면 빈 배열
}
