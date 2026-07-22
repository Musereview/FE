// 로딩 페이지
import { useEffect, useRef } from 'react';
import Navbar from '@/layout/Navbar';

const BAR_HEIGHTS = [
  75, 88, 97, 60, 85, 97, 120, 77, 97, 60, 30, 61, 97, 154, 184, 146, 221, 184, 161, 194, 208, 161, 120, 85, 48, 60, 85,
  60, 86, 73, 48, 62, 77, 73, 31, 15,
] as const;

const BAR_COUNT = BAR_HEIGHTS.length;
const FRAME_HEIGHT = 221; // 막대 영역 높이
const MIN_H = 12; // 막대 최소 높이
const MAX_H = 210; // 막대 최대 높이

function barLevel(t: number, i: number): number {
  const level =
    0.5 +
    0.26 * Math.sin(t * 1.8 + i * 0.55) +
    0.17 * Math.sin(t * 2.7 - i * 0.42 + 1.3) +
    0.11 * Math.sin(t * 4.1 + i * 0.9 + 2.1);
  return Math.min(1, Math.max(0, level));
}

function LoadingPage() {
  const barsRef = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const t = (now - start) / 1000;
      for (let i = 0; i < BAR_COUNT; i += 1) {
        const el = barsRef.current[i];
        if (!el) continue;
        el.style.height = `${MIN_H + barLevel(t, i) * (MAX_H - MIN_H)}px`;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950 text-gray-300">
      <Navbar />

      <main
        role="status"
        aria-live="polite"
        className="flex min-w-0 flex-1 flex-col items-center justify-center gap-[140px] px-6">
        <p className="heading-medium-m text-center text-gray-300">김뮤즈 님의 연습 결과를 분석 중입니다..</p>

        <div
          aria-hidden="true"
          className="flex w-full max-w-[1050px] items-end justify-between"
          style={{ height: FRAME_HEIGHT }}>
          {BAR_HEIGHTS.map((h, i) => (
            <span
              key={i}
              ref={(el) => {
                barsRef.current[i] = el;
              }}
              className="bg-primary-400 w-[4px] shrink-0 rounded-full"
              style={{ height: h }}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

export default LoadingPage;
