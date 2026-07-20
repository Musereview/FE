export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  beginner: '초급',
  intermediate: '중급',
  advanced: '고급',
};

export const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  beginner: 'border-level-bgn text-level-bgn',
  intermediate: 'border-level-int text-level-int',
  advanced: 'border-level-mjr text-level-mjr',
};
