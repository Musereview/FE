// 학습 결과 최종 문구 생성 = [총평(점수 구간)] + [팁(최저 지표) 또는 칭찬]
import type { LearningScore } from '@/stores/learningScoreStore';

// 1. 총평 — 종합점수 구간
const OVERALL: { min: number; message: string }[] = [
  { min: 90, message: '완벽에 가까운 연주예요! 이 페이스 그대로 유지해보세요.' },
  { min: 70, message: '전체적으로 안정적이에요. 몇 군데만 다듬으면 훨씬 좋아질 것 같아요.' },
  { min: 50, message: '기본기는 잡혀 있어요. 정확도와 타이밍을 조금만 더 신경 써보세요.' },
  { min: 0, message: '아직 낯선 구간이 많아 보여요. 천천히 다시 연습해보는 걸 추천해요.' },
];

// 2. 지표별 팁 (정확도 / 리듬타이밍 / 콤보 중 최저 지표)
const TIP = {
  accuracy: '몇몇 음에서 어긋났어요. 운지를 다시 확인해보세요.',
  timing: '타이밍이 살짝 밀리거나 당겼어요. 메트로놈에 조금 더 집중해보세요.',
  combo: '중간에 콤보가 자주 끊겼어요. 구간을 나눠서 연습해보는 것도 좋아요.',
} as const;

// 세 지표 모두 우수(정확도·리듬타이밍 90%+, 콤보 풀콤보)일 때의 칭찬
const PRAISE = '지금처럼만 하면 다음 난이도도 충분히 도전해볼 만해요.';

export function buildFeedback(s: LearningScore): string {
  // 1) 총평
  const overall = OVERALL.find((o) => s.score >= o.min)?.message ?? '';

  // 2) 팁 or 칭찬
  const comboPct = s.total > 0 ? Math.round((s.streak / s.total) * 100) : 0; // 콤보 비율
  const fullCombo = s.total > 0 && s.streak === s.total;
  const allExcellent = s.accuracy >= 90 && s.timing >= 90 && fullCombo;

  let tail: string;
  if (allExcellent) {
    tail = PRAISE;
  } else {
    // 세 지표 중 최저 (동률이면 정확도 > 리듬타이밍 > 콤보 순 우선 → 배열 앞선 것 유지)
    const metrics = [
      { key: 'accuracy', value: s.accuracy },
      { key: 'timing', value: s.timing },
      { key: 'combo', value: comboPct },
    ] as const;
    const weakest = metrics.reduce((min, m) => (m.value < min.value ? m : min));
    tail = TIP[weakest.key];
  }

  // 3) 두 문장을 이어 한 줄로
  return `${overall} ${tail}`;
}
