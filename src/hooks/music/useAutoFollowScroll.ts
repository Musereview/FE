//경로 : C:\project\MuseReview\FE\src\hooks\music\useAutoFollowScroll.ts
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

interface Options {
  containerRef: RefObject<HTMLDivElement | null>;
  /** 현재 시점에 화면에 보여야 하는 x좌표(px). null이면 자동 이동하지 않는다. */
  targetX: number | null;
  /** true일 때만 targetX를 따라 자동 스크롤한다 (예: 재생 중일 때). */
  enabled: boolean;
  /** 타겟 위치가 스크롤 뷰 왼쪽 끝에 딱 붙지 않도록 주는 여백(px) */
  offset?: number;
  /** 사용자가 스크롤을 조작한 뒤 자동 추적을 다시 재개하기까지의 대기 시간(ms) */
  resumeDelayMs?: number;
}

/**
 * 재생 위치(targetX)를 따라 컨테이너를 자동으로 스크롤한다.
 * 단, 사용자가 휠/터치/드래그로 직접 스크롤을 조작하면 즉시 자동 추적을 멈추고,
 * 일정 시간 동안 추가 조작이 없으면 다시 자동 추적을 재개한다.
 * (재생이 다시 시작되면 대기 시간과 무관하게 즉시 재개한다)
 */
export function useAutoFollowScroll({ containerRef, targetX, enabled, offset = 80, resumeDelayMs = 1500 }: Options) {
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const resumeTimerRef = useRef<number | null>(null);
  const isProgrammaticRef = useRef(false);

  // 사용자가 직접 조작(휠/터치/드래그)했을 때만 자동 추적을 일시 중지한다.
  // (프로그래밍적으로 발생시킨 scroll 이벤트와 혼동되지 않도록 'scroll' 자체가 아니라
  //  실제 입력 이벤트를 감지한다)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const pauseAutoFollow = () => {
      if (isProgrammaticRef.current) return;
      setIsUserScrolling(true);
      if (resumeTimerRef.current) window.clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = window.setTimeout(() => setIsUserScrolling(false), resumeDelayMs);
    };

    el.addEventListener('wheel', pauseAutoFollow, { passive: true });
    el.addEventListener('touchstart', pauseAutoFollow, { passive: true });
    el.addEventListener('pointerdown', pauseAutoFollow);

    return () => {
      el.removeEventListener('wheel', pauseAutoFollow);
      el.removeEventListener('touchstart', pauseAutoFollow);
      el.removeEventListener('pointerdown', pauseAutoFollow);
      if (resumeTimerRef.current) window.clearTimeout(resumeTimerRef.current);
    };
  }, [containerRef, resumeDelayMs]);

  // 재생 버튼을 다시 누르면(=enabled: true) 이전 "사용자 스크롤" 상태를 즉시 해제한다.
  useEffect(() => {
    if (enabled) setIsUserScrolling(false);
  }, [enabled]);

  // 실제 자동 추적 스크롤 실행
  useEffect(() => {
    if (!enabled || isUserScrolling || targetX === null) return;
    const el = containerRef.current;
    if (!el) return;

    const desired = Math.max(0, targetX - offset);
    if (Math.abs(el.scrollLeft - desired) < 1) return;

    isProgrammaticRef.current = true;
    el.scrollTo({ left: desired, behavior: 'auto' });
    window.setTimeout(() => {
      isProgrammaticRef.current = false;
    }, 50);
  }, [targetX, enabled, isUserScrolling, containerRef, offset]);

  const forceScrollTo = useCallback(
    (x: number, behavior: ScrollBehavior = 'smooth') => {
      const el = containerRef.current;
      if (!el) return;
      isProgrammaticRef.current = true;
      el.scrollTo({ left: x, behavior });
      window.setTimeout(
        () => {
          isProgrammaticRef.current = false;
        },
        behavior === 'smooth' ? 600 : 50,
      );
    },
    [containerRef],
  );

  return { isUserScrolling, forceScrollTo };
}
