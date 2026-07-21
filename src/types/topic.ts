import type { Difficulty } from '@/constants/difficulty';

export type TopicDifficulty = Difficulty;

export interface Topic {
  id: string;
  title: string;
  difficulty: TopicDifficulty;
  description: string;
}

export type ChapterStatus = 'completed' | 'learning' | 'ready' | 'retry';

export interface TopicChapter {
  id: string;
  title: string;
  description: string;
  durationLabel: string;
  status: ChapterStatus;
  score?: number;
}

export interface CurriculumExample {
  title: string;
  subtitle: string;
  durationLabel: string;
}

export interface CurriculumHighlight {
  title: string;
  subtitle: string;
}

export interface Curriculum {
  title: string;
  difficulty: TopicDifficulty;
  description: string;
  /** 설정 화면에서 메트로놈/박자 세팅에 사용 */
  bpm: number;
  /** 예: '4/4', '3/4' */
  timeSignature: string;
  /** 단계별 학습 상세(설정) 페이지 배너에 쓰이는 스텝 소개 문구 */
  stepDescription: string;
  example: CurriculumExample;
  theory: string;
  theorySummary: CurriculumHighlight;
  tips: string[];
  tipHighlight: string;
  steps: TopicChapter[];
}
