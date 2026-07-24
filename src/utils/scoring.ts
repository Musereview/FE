// 학습 채점 로직 — 사용자 녹음 vs 정답 음 비교
// 결과(per-note 판정)는 악보 음표 색칠과 점수 집계 양쪽에서 공용으로 쓴다.
import type { Difficulty } from '@/constants/difficulty';
import type { PlayedNote } from '@/stores/practiceResultStore';
import type { LearningScore } from '@/stores/learningScoreStore';
import { TIMING_TOLERANCE, type NoteJudgment } from '@/constants/scoring';

// 악보(MusicXML/OSMD)에서 추출한 정답 음
export interface ExpectedNote {
  midi: number;
  onSec: number; // 정답 박자 위치(초, 재생 기준)
}

// 정답 음 하나에 대한 판정 결과 (색칠·집계 공용)
export interface NoteResult {
  expectedIndex: number;
  judgment: NoteJudgment;
  timingErrorMs: number | null; // null = 무입력(안 침)
}

// 단일 음 판정
// - 음 다름 or 무입력 → bad
// - 오차 ≤ tight → perfect / tight~loose → good / loose 초과 → bad
export function judgeNote(
  pitchMatch: boolean,
  timingErrorMs: number | null,
  tol: { tight: number; loose: number },
): NoteJudgment {
  if (!pitchMatch || timingErrorMs === null) return 'bad';
  const err = Math.abs(timingErrorMs);
  if (err <= tol.tight) return 'perfect';
  if (err <= tol.loose) return 'good';
  return 'bad';
}

// 녹음 vs 정답 → 판정 목록 + 점수 지표
// latencyMs: 레이턴시 보정값(입력 시각에서 빼서 정박과 비교)
export function scoreLearning(
  recording: PlayedNote[],
  expected: ExpectedNote[],
  difficulty: Difficulty,
  latencyMs = 0,
): { results: NoteResult[]; score: LearningScore } {
  const tol = TIMING_TOLERANCE[difficulty];
  const used = new Set<number>(); // 이미 매칭된 녹음 인덱스 (중복 매칭 방지)

  const results: NoteResult[] = expected.map((exp, i) => {
    // 같은 음높이 중 loose 이내에서 가장 가까운 미사용 녹음 찾기
    let bestIdx = -1;
    let bestErr = Infinity;
    for (let j = 0; j < recording.length; j++) {
      if (used.has(j) || recording[j].midi !== exp.midi) continue;
      const correctedOn = recording[j].onSec - latencyMs / 1000; // 보정된 입력 시각
      const err = Math.abs((correctedOn - exp.onSec) * 1000); // ms
      if (err < bestErr && err <= tol.loose) {
        bestErr = err;
        bestIdx = j;
      }
    }
    if (bestIdx === -1) {
      return { expectedIndex: i, judgment: 'bad', timingErrorMs: null }; // 무입력/음 다름
    }
    used.add(bestIdx);
    return { expectedIndex: i, judgment: judgeNote(true, bestErr, tol), timingErrorMs: bestErr };
  });

  // === 지표 집계 (공식은 조정 가능 — 필요 시 기획과 확정) ===
  const total = results.length || 1;
  const perfect = results.filter((r) => r.judgment === 'perfect').length;
  const good = results.filter((r) => r.judgment === 'good').length;
  const missedNotes = results.filter((r) => r.timingErrorMs === null).length; // 안 친 음

  // 정확도: 음+타이밍 허용(perfect+good) 비율
  const accuracy = Math.round(((perfect + good) / total) * 100);
  // 리듬 타이밍 = Perfect 비율 (기획 정의)
  const timing = Math.round((perfect / total) * 100);
  // 연속 성공: bad가 아닌(perfect/good) 최대 연속 구간
  let streak = 0;
  let run = 0;
  for (const r of results) {
    if (r.judgment !== 'bad') {
      run += 1;
      streak = Math.max(streak, run);
    } else {
      run = 0;
    }
  }
  // 최종 점수: 가중 평균 (perfect 100, good 60, bad 0) — DB 저장 대상
  const score = Math.round((perfect * 100 + good * 60) / total);

  return { results, score: { score, accuracy, timing, streak, missedNotes, total: results.length } };
}
