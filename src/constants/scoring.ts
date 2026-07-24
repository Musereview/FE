// 채점 판정 기준 (음표 색칠 + 점수 집계 공용)
import type { Difficulty } from '@/constants/difficulty';

// 난이도별 타이밍 허용치 (ms)
// tight 이내 → Perfect, tight~loose → Good, loose 초과/무입력/음 다름 → Bad
export const TIMING_TOLERANCE: Record<Difficulty, { tight: number; loose: number }> = {
  beginner: { tight: 150, loose: 350 },
  intermediate: { tight: 100, loose: 250 },
  advanced: { tight: 60, loose: 150 },
};

export type NoteJudgment = 'perfect' | 'good' | 'bad';

// 판정별 색 (OSMD notehead 등은 hex를 받으므로 hex로 정의)
// primary-400 #69ffc0 / warning #ffc107 / error #ff5d6b
// NOTE: 시안의 warning-100·error-100 토큰은 index.css에 아직 없어서 base 토큰 색을 사용
export const JUDGMENT_COLOR: Record<NoteJudgment, string> = {
  perfect: '#69ffc0', // 민트 (primary-400)
  good: '#ffc107', // 노랑 (warning)
  bad: '#ff5d6b', // 빨강 (error)
};
