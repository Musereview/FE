// 악보 그릴 공간만 만들어주는 컴포넌트
import { useEffect, useRef } from 'react';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import { useOSMD } from '@/hooks/music/useOSMD';
import type { WindowScore } from '@/utils/musicXmlWindow';

interface ScoreRendererProps {
  windows: WindowScore[];
  onReady?: (osmd: OpenSheetMusicDisplay) => void;

  translateX?: number;
}

export default function ScoreRenderer({ windows, onReady, translateX = 0 }: ScoreRendererProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const xmlContent = windows.length > 0 ? windows[0].xml : '';
  console.log('=== ScoreRenderer ===');

  console.log('length=', xmlContent.length);
  console.log(JSON.stringify(xmlContent.substring(0, 100)));
  //   const { containerRef, isLoading } = useOSMD({

  //     xmlContent,
  //     onReady,
  //   });
  const { containerRef, isLoading } = useOSMD({
    xmlPath: '/sample.xml',
    onReady,
  });

  useEffect(() => {
    if (!contentRef.current) return;

    contentRef.current.style.transform = `translateX(-${translateX}px)`;
    contentRef.current.style.transition = 'transform .3s ease';
  }, [translateX]);

  return (
    <div className="relative rounded-[12px] border border-[#2E3142]/20 bg-[#090A0F]">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#090A0F]">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#69FFC0] border-t-transparent" />
          <span className="mt-4 text-sm text-[#86899C]">악보 렌더링 중...</span>
        </div>
      )}

      {/* Viewport */}
      <div className="min-h-[500px] w-full overflow-hidden p-[40px]">
        {/* 움직일 영역 */}
        <div
          ref={contentRef}
          // style={{

          //   width: "max-content",
          // }}
        >
          <div ref={containerRef} />
        </div>
      </div>
    </div>
  );
}
