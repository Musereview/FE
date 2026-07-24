// 점수 구간별 결과 멘트
// TODO(PM): 문구 확정 전 임시값. 확정되면 message만 교체하면 됨 (구간 개수 변경도 배열만 수정).
const FEEDBACK_TABLE: { min: number; message: string }[] = [
  { min: 90, message: '전체적으로 매우 안정적이에요. 11th 진입 타이밍을 조금 더 자연스럽게 조절해보세요.' },
  { min: 70, message: '좋아요! 조금만 더 정확하게 연주해보세요. (멘트 준비중)' },
  { min: 0, message: '차근차근 다시 연습해봐요. (멘트 준비중)' },
];

// 점수 → 해당 구간 멘트
export const getScoreFeedback = (score: number): string => FEEDBACK_TABLE.find((f) => score >= f.min)?.message ?? '';
