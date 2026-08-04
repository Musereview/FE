import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import type { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';

import { useOSMD } from '@/hooks/music/useOSMD';
import { useAutoFollowScroll } from '@/hooks/music/useAutoFollowScroll';
import { moveCursorToMeasure } from '@/utils/osmdCursor';

export interface ScoreViewerHandle {
  /** 커서와 스크롤을 모두 맨 처음(0번째 마디)으로 되돌린다. */
  reset: () => void;
  /** 특정 마디 인덱스로 커서와 스크롤을 즉시 이동시킨다. */
  jumpToMeasure: (measureIndex: number) => void;
}

export interface ScoreViewerProps {
  xmlContent?: string;
  xmlPath?: string;
  /** 현재 재생 위치에 해당하는 0-based 마디 인덱스. undefined면 커서/자동 스크롤을 사용하지 않는다. */
  currentMeasureIndex?: number;
  /** true인 동안에만 재생 위치를 따라 자동 스크롤한다 (보통 isPlaying을 그대로 전달). */
  followPlayback?: boolean;
  zoom?: number;
  drawMeasureNumbers?: boolean;
  height?: number | string;
  className?: string;
  onReady?: (osmd: OpenSheetMusicDisplay, measureXPositions: number[]) => void;
}

const ScoreViewer = forwardRef<ScoreViewerHandle, ScoreViewerProps>(function ScoreViewer(
  {
    xmlContent,
    xmlPath,
    currentMeasureIndex,
    followPlayback = false,
    zoom = 1.3,
    drawMeasureNumbers = false,
    height = 420,
    className = '',
    onReady,
  },
  ref,
) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { containerRef, osmdRef, isLoading, measureXPositions } = useOSMD({
    xmlContent,
    xmlPath,
    zoom,
    drawMeasureNumbers,
    onReady,
  });

  const targetX = currentMeasureIndex != null ? (measureXPositions[currentMeasureIndex] ?? null) : null;

  const { forceScrollTo } = useAutoFollowScroll({
    containerRef: scrollRef,
    targetX,
    enabled: followPlayback && currentMeasureIndex != null,
  });

  // 재생 위치(마디)가 바뀔 때마다 OSMD 커서만 이동시킨다. (재렌더링 없음)
  useEffect(() => {
    const osmd = osmdRef.current;
    if (!osmd || currentMeasureIndex == null) return;
    moveCursorToMeasure(osmd, currentMeasureIndex);
  }, [currentMeasureIndex, osmdRef]);

  useImperativeHandle(
    ref,
    () => ({
      reset: () => {
        osmdRef.current?.cursor.reset();
        forceScrollTo(0, 'smooth');
      },
      jumpToMeasure: (measureIndex: number) => {
        const osmd = osmdRef.current;
        if (!osmd) return;
        moveCursorToMeasure(osmd, measureIndex);
        const targetX = measureXPositions[measureIndex] ?? 0;
        forceScrollTo(targetX, 'auto');
      },
    }),
    [osmdRef, forceScrollTo, measureXPositions],
  );

  return (
    <div className={`relative rounded-[12px] border border-gray-800/20 bg-gray-950 ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-950">
          <div className="border-primary-400 h-10 w-10 animate-spin rounded-full border-4 border-t-transparent" />
          <span className="mt-4 text-sm text-gray-500">악보 렌더링 중...</span>
        </div>
      )}

      {/* 가로 스크롤 뷰포트. 자동 줄바꿈 대신 여기서 좌우로만 이동한다. */}
      <div
        ref={scrollRef}
        className="overflow-x-auto overflow-y-hidden px-0 py-7 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-700 [&::-webkit-scrollbar-track]:bg-transparent"
        style={{ height }}>
        {/* renderSingleHorizontalStaffline: true 로 렌더링된, 줄바꿈 없는 단일 라인 악보 */}
        <div
          ref={containerRef}
          className="inline-block align-top"
          style={{ transform: 'scale(1.2)', transformOrigin: 'top left' }}
        />
      </div>
    </div>
  );
});

export default ScoreViewer;
