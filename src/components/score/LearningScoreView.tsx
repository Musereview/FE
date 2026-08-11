// 학습 화면 악보 뷰 — 한 화면에 지정한 마디 수(기본 3마디)만 보이도록 확대하고,
// 현재 진행 마디를 항상 "가운데"에 둔다. 왼쪽=지나간 마디 / 오른쪽=다음 마디.
// 추가로, 사용자 입력에 대한 판정(Excellent/Good/Bad)을 음표 색으로 표시한다.
//  - 현재 쳐야 하는 음: 보라색(secondary-400) 전체 채움
//  - 판정된 음: 노트헤드 테두리를 판정색으로, 채움은 원복
//  - 아직 차례가 아닌 음: 색 변화 없음
// OSMD는 단일 가로 라인으로 1회 렌더(재렌더 없음), 색칠은 SVG를 직접 조작하므로 슬라이드 re-render에도 유지된다.
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useOSMD } from '@/hooks/music/useOSMD';
import { judgeNote, summarizeJudgments } from '@/utils/scoring';
import { TIMING_TOLERANCE, type NoteJudgment } from '@/constants/scoring';
import type { Difficulty } from '@/constants/difficulty';
import type { LearningScore } from '@/stores/learningScoreStore';
import {
  extractNoteEvents,
  findCurrentEventIndex,
  paintCurrent,
  paintDefault,
  paintJudged,
  type NoteEvent,
} from '@/utils/osmdColor';

export interface LearningScoreHandle {
  /** 사용자가 친 음을 현재 음과 대조해 판정·색칠한다. (틀린 음은 오타로 기록만) */
  judge: (midi: number, atSec: number) => void;
  /** 모든 음표 색을 기본으로 되돌린다. (재시작/정지) */
  reset: () => void;
  /** 지금까지의 판정을 집계한 최종 점수 지표 (점수 화면 연동용). */
  getScore: () => LearningScore;
  /** 현재 재생 박(소수, quarter-beat 단위)으로 현재 음 하이라이트/놓친 음 처리를 갱신. rAF로 매 프레임 호출. */
  tick: (beat: number) => void;
  /** 곡 종료 시 호출: 아직 판정 대기 중(보라색)인 마지막 음을 놓친 음(Bad)으로 확정·재색칠. */
  finalize: () => void;
}

interface LearningScoreViewProps {
  xmlContent?: string;
  xmlPath?: string;
  currentMeasureIndex: number; // 0-based 현재 진행 마디 (슬라이드 기준)
  bpm?: number; // 타이밍 판정용
  difficulty?: Difficulty; // 타이밍 허용치 선택
  latencyMs?: number; // 입력 레이턴시 보정값(ms) — 입력 시각에서 빼서 정박과 비교
  visibleMeasures?: number; // 한 화면에 보이는 마디 수 (기본 3)
  zoom?: number; // OSMD 기본 렌더 배율 (여기에 화면맞춤 scale이 추가로 곱해짐)
  height?: number; // 뷰포트 높이(px)
  className?: string;
}

const LearningScoreView = forwardRef<LearningScoreHandle, LearningScoreViewProps>(function LearningScoreView(
  {
    xmlContent,
    xmlPath,
    currentMeasureIndex,
    bpm = 120,
    difficulty = 'intermediate',
    latencyMs = 0,
    visibleMeasures = 3,
    zoom = 1.2,
    height = 260,
    className = '',
  },
  ref,
) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [svgHeight, setSvgHeight] = useState(0); // 렌더된 악보 원본 높이(px, 배율 전)
  const { containerRef, osmdRef, isLoading, measureXPositions } = useOSMD({ xmlContent, xmlPath, zoom });

  // 판정 상태 (React 렌더와 무관하게 SVG를 직접 색칠하므로 ref로 관리)
  const eventsRef = useRef<NoteEvent[]>([]); // 정답 음 이벤트 목록
  const judgedRef = useRef<Map<number, NoteJudgment>>(new Map()); // 판정 확정된 이벤트(맞음/놓침)
  const currentIdxRef = useRef(-1); // 현재 보라색으로 칠해진 이벤트 인덱스
  const missedRef = useRef<Set<number>>(new Set()); // 놓친 음(시간 지나도록 안 친 음) 인덱스
  const wrongHitsRef = useRef(0); // 오타 수 (틀린 음 입력 — 현재 음을 소비하지 않음)
  const hitMidisRef = useRef<Map<number, Set<number>>>(new Map()); // idx별 이미 맞춘 화음 음 (모두 쳐야 완료)

  // 뷰포트 폭 추적 (반응형)
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const update = () => setViewportWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 렌더 완료 후: 악보 원본 높이 측정 + 정답 음 이벤트 추출
  useEffect(() => {
    if (measureXPositions.length <= 1) return;
    const svg = containerRef.current?.querySelector('svg') as SVGSVGElement | null;
    const h = svg?.height?.baseVal?.value ?? 0;
    if (h) setSvgHeight(h);

    eventsRef.current = extractNoteEvents(osmdRef.current);
    judgedRef.current.clear();
    currentIdxRef.current = -1;
  }, [measureXPositions, containerRef, osmdRef]);

  // 부모(입력 핸들러/rAF)에서 호출
  useImperativeHandle(
    ref,
    () => ({
      // (C) 현재 음 + 아직 차례 안 된 다음 음과 대조: 맞으면 타이밍으로 판정(Excellent/Good/Bad), 틀리면 오타로 기록만
      judge: (midi: number, atSec: number) => {
        const events = eventsRef.current;
        const cur = currentIdxRef.current;
        if (cur < 0) return;
        const correctedAtSec = atSec - latencyMs / 1000; // 레이턴시 보정된 입력 시각
        const tol = TIMING_TOLERANCE[difficulty];

        const curEv = events[cur];
        const matchCurrent = !judgedRef.current.has(cur) && !!curEv?.midis.includes(midi);

        // tick()이 아직 "현재 음"으로 넘기지 않은 다음 음도, tol.loose 이내로 미리 친 경우엔 인정한다
        // (오차범위를 정박 전후로 대칭 적용 — 늦게 친 경우만 봐주던 기존 동작 수정)
        const nextIdx = cur + 1;
        const nextEv = events[nextIdx];
        let matchNext = false;
        if (!matchCurrent && nextEv && !judgedRef.current.has(nextIdx) && nextEv.midis.includes(midi)) {
          const nextErrMs = (correctedAtSec - nextEv.onBeat * (60 / bpm)) * 1000;
          matchNext = Math.abs(nextErrMs) <= tol.loose;
        }

        if (!matchCurrent && !matchNext) {
          if (judgedRef.current.has(cur)) {
            wrongHitsRef.current += 1; // 이미 판정된 자리에서의 추가 입력 = 오타
            return;
          }
          wrongHitsRef.current += 1; // 오타 집계
          if (curEv) {
            paintJudged(curEv.gnotes, 'bad'); // 오노트 = 즉시 bad 확정 (콤보 리셋)
            judgedRef.current.set(cur, 'bad');
          }
          return;
        }

        const idx = matchCurrent ? cur : nextIdx;
        const ev = events[idx] as NoteEvent;

        // 화음: 모든 음이 입력될 때까지 이벤트를 미해결로 유지 (첫 음만으로 완료 처리하지 않음)
        const hits = hitMidisRef.current.get(idx) ?? new Set<number>();
        if (hits.has(midi)) {
          wrongHitsRef.current += 1; // 같은 화음 음 중복 입력 = 오타
          return;
        }
        hits.add(midi);
        hitMidisRef.current.set(idx, hits);
        const needed = new Set(ev.midis).size; // 중복 음 대비 유니크 개수
        if (hits.size < needed) return; // 나머지 화음 음 대기
        const onSec = ev.onBeat * (60 / bpm);
        const timingErrorMs = (correctedAtSec - onSec) * 1000; // 레이턴시 보정 후 정박과 비교 (마지막 음 기준)
        const judgment = judgeNote(true, timingErrorMs, tol); // 화음 완성 → 타이밍 판정
        paintJudged(ev.gnotes, judgment);
        judgedRef.current.set(idx, judgment);
      },
      reset: () => {
        for (const ev of eventsRef.current) paintDefault(ev.gnotes);
        judgedRef.current.clear();
        missedRef.current.clear();
        hitMidisRef.current.clear();
        wrongHitsRef.current = 0;
        currentIdxRef.current = -1;
      },
      // 지금까지의 판정을 집계 (미해결 이벤트는 놓친 음=Bad으로 간주) → 최종 점수 지표
      getScore: () => {
        const results = eventsRef.current.map((_, i) => {
          const resolved = judgedRef.current.has(i);
          return {
            judgment: resolved ? (judgedRef.current.get(i) as NoteJudgment) : ('bad' as NoteJudgment),
            missed: missedRef.current.has(i) || !resolved,
          };
        });
        return summarizeJudgments(results);
      },
      // rAF에서 매 프레임 호출 — 소수 박 기준으로 현재 음(보라) 이동.
      // 지나친(현재보다 앞선) 미판정 음은 "놓친 음"(Bad)으로 확정. 정박 아닌 음(8분음표 등)도 정확히 현재 음이 됨.
      tick: (beat: number) => {
        const events = eventsRef.current;
        if (events.length === 0) return;
        const newIdx = findCurrentEventIndex(events, beat);
        const prev = currentIdxRef.current;
        if (newIdx === prev) return;
        if (newIdx > prev) {
          for (let i = Math.max(prev, 0); i < newIdx; i++) {
            if (!judgedRef.current.has(i)) {
              paintJudged(events[i].gnotes, 'bad');
              judgedRef.current.set(i, 'bad');
              missedRef.current.add(i); // 놓친 음(안 침)으로 기록 — 오타(틀린 음)와 구분
            }
          }
        }
        if (newIdx >= 0 && !judgedRef.current.has(newIdx)) paintCurrent(events[newIdx].gnotes);
        currentIdxRef.current = newIdx;
      },
      // 마지막 음은 다음 음으로 "넘어가는" 순간이 없어 tick의 catch-up이 절대 실행되지 않는다 —
      // 곡이 끝나는 시점에 직접 호출해 보라색으로 남지 않도록 확정한다.
      finalize: () => {
        const idx = currentIdxRef.current;
        if (idx < 0) return;
        const ev = eventsRef.current[idx];
        if (!ev || judgedRef.current.has(idx)) return;
        paintJudged(ev.gnotes, 'bad');
        judgedRef.current.set(idx, 'bad');
        missedRef.current.add(idx);
      },
      getStats: () => ({
        wrongHits: wrongHitsRef.current,
        results: Array.from(judgedRef.current.entries()),
      }),
    }),
    [bpm, difficulty, latencyMs],
  );

  // measureXPositions = [마디0 좌측x, 마디1 좌측x, ..., 악보 끝x] → 길이 = 마디수 + 1
  const measureCount = Math.max(1, measureXPositions.length - 1);
  const ready = measureXPositions.length > 1 && viewportWidth > 0;

  // mock: 백킹 루프가 악보보다 짧을 수 있어 마디 인덱스를 악보 범위로 감싼다
  const idx = ready ? ((currentMeasureIndex % measureCount) + measureCount) % measureCount : 0;
  const measureCenter = ready ? (measureXPositions[idx] + measureXPositions[idx + 1]) / 2 : 0;

  // 화면맞춤 배율: 가로는 "visibleMeasures 마디 = 뷰포트 폭", 세로는 뷰포트 높이 이내 → 둘 중 작은 값.
  const avgMeasureWidth = ready ? measureXPositions[measureCount] / measureCount : 0;
  const widthScale = avgMeasureWidth > 0 ? viewportWidth / (visibleMeasures * avgMeasureWidth) : 1;
  const heightScale = svgHeight > 0 ? (height * 0.92) / svgHeight : widthScale;
  const scale = Math.min(4, Math.max(0.3, Math.min(widthScale, heightScale)));
  const offsetX = viewportWidth / 2 - measureCenter * scale; // 확대 후 현재 마디 중앙 = 뷰포트 중앙

  return (
    <div ref={viewportRef} className={`relative overflow-hidden ${className}`} style={{ height }}>
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="border-primary-400 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
        </div>
      )}
      <div
        ref={containerRef}
        className="absolute top-1/2 left-0 inline-block"
        style={{
          transformOrigin: '0% 50%', // 좌측·세로중앙 기준 확대 → 세로는 항상 가운데 유지
          transform: `translate(${offsetX}px, -50%) scale(${scale})`,
          transition: 'transform 400ms ease',
          opacity: ready ? 1 : 0,
        }}
      />
    </div>
  );
});

export default LearningScoreView;
