//경로: C:\project\MuseReview\FE\src\hooks\music\useOSMD.ts
import { useEffect, useRef, useState } from 'react';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import type { GraphicSheetLike } from '@/types/osmd';

interface UseOSMDOptions {
  xmlContent?: string;
  xmlPath?: string;
  zoom?: number;
  drawMeasureNumbers?: boolean;

  sheetMaximumWidth?: number;
  onReady?: (osmd: OpenSheetMusicDisplay, measureXPositions: number[]) => void;
}

export function useOSMD({
  xmlContent,
  xmlPath,
  zoom = 1.1,
  drawMeasureNumbers = false,
  // 기본값을 32767보다 훨씬 크게(20만 unit) 잡아, 325마디 이상의 긴 악보도
  //    하나의 StaffLine 안에 전부 들어가도록 한다. (SVG는 실질적인 폭 제한이 없음)
  sheetMaximumWidth = 200_000,

  onReady,
}: UseOSMDOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const osmdRef = useRef<OpenSheetMusicDisplay | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [measureXPositions, setMeasureXPositions] = useState<number[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;
    const source = xmlContent ?? xmlPath;
    if (!source) return;

    let cancelled = false;
    containerRef.current.innerHTML = '';
    setIsLoading(true);

    // IOSMDOptions의 일부 속성은 설치된 opensheetmusicdisplay 버전의 타입 선언에
    // 누락돼 있을 수 있어 안전하게 caller 시점에 캐스팅한다.
    const options = {
      autoResize: false,
      backend: 'svg',
      drawingParameters: 'compacttight', // 레이아웃에 따라 default, leadsheet으로 변경 예정
      drawTitle: false,
      drawSubtitle: false,
      drawComposer: false,
      drawMeasureNumbers,
      //  하나의 긴 가로 악보로 렌더링
      renderSingleHorizontalStaffline: true,
      // MusicXML에 박혀 있는 <print new-system="yes"/>, <print new-page="yes"/> 같은
      //    강제 줄바꿈/페이지 나눔 지시를 무시한다. (sample.xml에 다수 포함되어 있어 필수)
      newSystemFromXML: false,
      newPageFromXML: false,
    } as ConstructorParameters<typeof OpenSheetMusicDisplay>[1];

    const osmd = new OpenSheetMusicDisplay(containerRef.current, options);
    osmd.zoom = zoom;

    osmd.EngravingRules.SheetMaximumWidth = sheetMaximumWidth;

    osmd.EngravingRules.PageTopMargin = 0;
    osmd.EngravingRules.TitleTopDistance = 0;

    // -----------------------------------------------------------------------------

    osmdRef.current = osmd;

    osmd
      .load(source)
      .then(() => {
        if (cancelled) return;
        osmd.render();

        applyDarkModeColors(containerRef.current!);
        osmd.cursor.show();

        const positions = computeMeasureXPositionsPx(osmd, containerRef.current!);
        console.log('총 마디 수:', positions.length - 1);
        setMeasureXPositions(positions);
        setIsLoading(false);
        onReady?.(osmd, positions);
      })
      .catch((err) => {
        console.error('OSMD load error:', err);
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // xmlContent/xmlPath가 바뀌지 않는 한(=곡을 통째로 교체하는 경우가 아닌 한) 재실행되지 않는다.
    // -> MusicXML은 최초 1회만 load/render 되고, 이후 위치 이동은 scroll/cursor.update()로만 처리된다.

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xmlContent, xmlPath]);

  return { containerRef, osmdRef, isLoading, measureXPositions };
}

function applyDarkModeColors(container: HTMLElement) {
  const NOTE_COLOR = '#C7CBD5';

  container.querySelectorAll('svg').forEach((svg) => {
    svg.style.backgroundColor = 'transparent';
    svg.style.height = 'auto';
    svg.querySelectorAll('path, rect, text, ellipse').forEach((el) => {
      const fill = el.getAttribute('fill');
      const stroke = el.getAttribute('stroke');
      if (fill && fill !== 'none' && fill !== 'transparent') {
        el.setAttribute('fill', NOTE_COLOR);
      }
      if (stroke && stroke !== 'none' && stroke !== 'transparent') {
        el.setAttribute('stroke', NOTE_COLOR);
      }
    });
  });
}

/**
 * 각 마디의 실제 렌더링된 x좌표(px)를 계산한다.
 * SheetMaximumWidth를 늘려 StaffLine이 항상 1개로 고정되므로,
 * GraphicSheet.MeasureList도 항상 단일 System(1행) 배열로 채워진다.
 */
function computeMeasureXPositionsPx(osmd: OpenSheetMusicDisplay, container: HTMLElement): number[] {
  const graphic =
    (osmd as unknown as { GraphicSheet?: GraphicSheetLike }).GraphicSheet ??
    (osmd as unknown as { graphic?: GraphicSheetLike }).graphic;
  const measureList = graphic?.MeasureList ?? [];
  if (measureList.length === 0) return [0];

  const unitPositions = measureList.map((row) => row[0].PositionAndShape.AbsolutePosition.x as number);

  const lastRow = measureList[measureList.length - 1][0];
  const lastWidthUnit = lastRow.PositionAndShape.Size?.width ?? 0;
  const scoreWidthUnit = unitPositions[unitPositions.length - 1] + lastWidthUnit;

  const svg = container.querySelector('svg');
  const svgWidthPx = svg?.getBoundingClientRect().width ?? 0;

  const scale = scoreWidthUnit > 0 && svgWidthPx > 0 ? svgWidthPx / scoreWidthUnit : 10 * osmd.zoom;

  const positions = unitPositions.map((x) => x * scale);
  positions.push(scoreWidthUnit * scale);
  return positions;
}
