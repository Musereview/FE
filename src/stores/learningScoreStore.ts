// 학습 채점 결과를 점수 화면으로 전달하는 스토어
// 채점은 프론트에서 수행하며(연습 녹음 vs 정답 음), 결과를 여기 담아 ScorePage가 표시한다.
// DB에는 score(최종 점수)만 저장 예정.
import { create } from 'zustand';

export interface LearningScore {
  score: number; // 최종 점수 (DB 저장 대상)
  accuracy: number; // 정확도 (%)
  timing: number; // 리듬 타이밍 = Perfect 비율 (%)
  streak: number; // 연속 성공 (콤보, 개수)
  missedNotes: number; // 놓친 음 수
  total: number; // 정답 음 총 개수 (콤보 비율·풀콤보 판정용)
}

// TODO: 채점 로직(다음 단계) 붙기 전 임시 mock — UI 확인용. 채점 유틸에서 setScore로 덮어씀.
const MOCK_SCORE: LearningScore = {
  score: 95,
  accuracy: 96,
  timing: 92,
  streak: 18,
  missedNotes: 2,
  total: 20,
};

interface LearningScoreState {
  result: LearningScore;
  setScore: (result: LearningScore) => void;
}

export const useLearningScoreStore = create<LearningScoreState>((set) => ({
  result: MOCK_SCORE,
  setScore: (result) => set({ result }),
}));
