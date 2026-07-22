import { useOSMD } from '@/hooks/music/useOSMD';
import type { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';

interface Props {
  xmlContent?: string;
  xmlPath?: string;
  translateX: number;
  viewportWidth: number;
  onReady?: (osmd: OpenSheetMusicDisplay, measureXPositions: number[]) => void;
}

const VIEWPORT_PADDING = 80; // p-[40px] 좌우 합

export default function ScoreRenderer({ xmlContent, xmlPath, translateX, viewportWidth, onReady }: Props) {
  const { containerRef, isLoading } = useOSMD({ xmlContent, xmlPath, onReady });

  return (
    <div className="relative rounded-[12px] border border-[#2E3142]/20 bg-[#090A0F]">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#090A0F]">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#69FFC0] border-t-transparent" />
          <span className="mt-4 text-sm text-[#86899C]">악보 렌더링 중...</span>
        </div>
      )}

      {/* 뷰포트: 항상 4마디 폭만 보여준다. 여기서 절대 OSMD를 다시 그리지 않는다 */}
      <div
        className="min-h-[500px] overflow-hidden p-[40px]"
        style={{
          width: viewportWidth > 0 ? `${viewportWidth + VIEWPORT_PADDING}px` : '100%',
          transition: 'width 0.6s ease',
        }}>
        {/* 실제 전체 악보(변하지 않음). transform으로만 이동시킨다 */}
        <div
          style={{
            transform: `translateX(-${translateX}px)`,
            transition: 'transform 0.6s ease',
            willChange: 'transform',
          }}>
          <div ref={containerRef} />
        </div>
      </div>
    </div>
  );
}
