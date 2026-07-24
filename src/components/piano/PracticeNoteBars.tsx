// 연습용 노트바 오버레이 — 누른 시간(지속시간)만큼 길이가 자란다.
// 디자인(그라데이션·건반별 폭·라운드)은 NoteBars와 동일. 다른 점은 길이가 고정이 아니라
// note-on ~ note-off 시간에 비례해 실시간으로 그려지는 것뿐이다. (requestAnimationFrame 기반)
import { useEffect, useRef, useState } from 'react';
import { noteCenterFraction, noteWidthFraction, type KeyCount } from '@/constants/piano';

export interface LiveNoteBar {
  id: number;
  midi: number;
  startTime: number; // performance.now() at note-on
  endTime: number | null; // performance.now() at note-off (null이면 아직 눌린 중)
}

interface PracticeNoteBarsProps {
  bars: LiveNoteBar[];
  keyCount: KeyCount;
  pxPerMs: number; // 시간 → 길이(px) 환산 (BPM 기준)
  onBarDone: (id: number) => void; // 다 올라간 노트바 제거
  paused?: boolean; // 정지 중이면 그 자리에 얼림
  frozenAt?: number; // 정지 시점 시각 (performance.now 기준) — 얼린 프레임 렌더 기준
}

// NoteBars와 동일한 디자인
const BAR_GRADIENT =
  'linear-gradient(180deg, var(--color-primary-400) 0%, var(--color-primary-400) 50%, var(--color-gray-950) 100%)';

export default function PracticeNoteBars({
  bars,
  keyCount,
  pxPerMs,
  onBarDone,
  paused = false,
  frozenAt = 0,
}: PracticeNoteBarsProps) {
  const [, setTick] = useState(0);
  const rafRef = useRef<number | undefined>(undefined);

  // 활성 노트바가 있고 재생 중일 때만 매 프레임 리렌더 (정지 중엔 루프 정지 = 얼림)
  useEffect(() => {
    if (bars.length === 0 || paused) return;
    const loop = () => {
      setTick((t) => (t + 1) % 1_000_000);
      const now = performance.now();
      // 뗀 뒤 헤더 위로 완전히 올라가(한 화면 높이 이상 상승) 화면 밖으로 나간 노트바 제거
      for (const b of bars) {
        if (b.endTime !== null && (now - b.endTime) * pxPerMs > window.innerHeight) onBarDone(b.id);
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [bars, onBarDone, pxPerMs, paused]);

  // 정지 중엔 정지 시점(frozenAt)으로 고정 렌더 → 그 자리에 얼림
  const now = paused ? frozenAt : performance.now();

  return (
    <div className="pointer-events-none absolute bottom-full left-0 w-full">
      {bars.map(({ id, midi, startTime, endTime }) => {
        const frac = noteCenterFraction(midi, keyCount);
        if (frac < 0) return null; // 범위 밖 음은 무시
        const widthPct = noteWidthFraction(midi, keyCount) * 100;

        const heldMs = (endTime ?? now) - startTime; // 누른 시간 (뗀 뒤엔 고정)
        const height = Math.max(4, heldMs * pxPerMs); // 길이 = 누른 시간 × 환산
        const released = endTime !== null;
        const riseMs = released ? now - endTime : 0;
        const translateY = -riseMs * pxPerMs; // 뗀 뒤 위로 올라감 (템포에 맞춘 속도)

        return (
          <span
            key={id}
            className="absolute bottom-0 rounded-t-[2px]"
            style={{
              left: `${frac * 100}%`,
              width: `${widthPct}%`,
              height: `${height}px`,
              transform: `translateX(-50%) translateY(${translateY}px)`,
              background: BAR_GRADIENT,
            }}
          />
        );
      })}
    </div>
  );
}
