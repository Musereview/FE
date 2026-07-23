//경로 : C:\project\MuseReview\FE\src\components\score\ScoreViewer.tsx
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import type { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';

import { useOSMD } from '@/hooks/music/useOSMD';
import { useAutoFollowScroll } from '@/hooks/music/useAutoFollowScroll';
import { moveCursorToMeasure } from '@/utils/osmdCursor';

export interface ScoreViewerHandle {
  /** 커서와 스크롤을 모두 맨 처음(0번째 마디)으로 되돌린다. */
  reset: () => void;
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

/**
 * 하나의 긴 Horizontal Score(단일 System, 줄바꿈 없음)를 렌더링하고,
 * 필요 시 재생 위치를 따라 가로 스크롤 + 커서를 자동으로 이동시키는 재사용 가능한 악보 뷰어.
 *
 * - 분석 마디 설정 페이지 / 분석 결과 페이지 / 히스토리 상세 페이지에서 공통으로 사용한다.
 * - MusicXML은 최초 1회만 OSMD에 load/render 된다.
 * - 이후 재생 위치 이동은 오직 scrollLeft 변경 + cursor.update() 로만 이루어지며
 *   OSMD를 다시 render하지 않는다.
 * - 사용자가 직접 스크롤하면 자동 추적이 잠시 중단되고, 일정 시간 뒤(또는 재생 재개 시)
 *   다시 재생 위치를 따라간다.
 */
const ScoreViewer = forwardRef<ScoreViewerHandle, ScoreViewerProps>(function ScoreViewer(
  {
    xmlContent,
    xmlPath,
    currentMeasureIndex,
    followPlayback = false,
    zoom = 1.1,
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
    }),
    [osmdRef, forceScrollTo],
  );

  return (
    <div className={`relative rounded-[12px] border border-[#2E3142]/20 bg-[#090A0F] ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#090A0F]">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#69FFC0] border-t-transparent" />
          <span className="mt-4 text-sm text-[#86899C]">악보 렌더링 중...</span>
        </div>
      )}

      {/* 가로 스크롤 뷰포트. 자동 줄바꿈 대신 여기서 좌우로만 이동한다. */}
      <div
        ref={scrollRef}
        className="overflow-x-auto overflow-y-hidden p-[40px] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#3A3D4A] [&::-webkit-scrollbar-track]:bg-transparent"
        style={{ height }}>
        {/* renderSingleHorizontalStaffline: true 로 렌더링된, 줄바꿈 없는 단일 라인 악보 */}
        <div ref={containerRef} className="inline-block align-top" />
      </div>
    </div>
  );
});

export default ScoreViewer;
