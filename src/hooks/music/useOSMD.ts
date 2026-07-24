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

    const options = {
      autoResize: false,
      backend: 'svg',
      drawingParameters: 'compacttight',
      drawTitle: false,
      drawSubtitle: false,
      drawComposer: false,
      drawMeasureNumbers,
      renderSingleHorizontalStaffline: true,
      newSystemFromXML: false,
      newPageFromXML: false,
    } as ConstructorParameters<typeof OpenSheetMusicDisplay>[1];

    const osmd = new OpenSheetMusicDisplay(containerRef.current, options);
    osmd.zoom = zoom;

    osmd.EngravingRules.SheetMaximumWidth = sheetMaximumWidth;
    osmd.EngravingRules.PageTopMargin = 0;
    osmd.EngravingRules.TitleTopDistance = 0;

    osmdRef.current = osmd;

    osmd
      .load(source)
      .then(() => {
        if (cancelled) return;
        osmd.render();

        applyDarkModeColors(containerRef.current!);
        osmd.cursor.show();

        const positions = computeMeasureXPositionsPx(osmd, containerRef.current!);
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
  }, [xmlContent, xmlPath]);

  return { containerRef, osmdRef, isLoading, measureXPositions };
}

function applyDarkModeColors(container: HTMLElement) {
  const NOTE_COLOR = '#AEB1B6'; // 음표 및 악상 기호 색상
  const STAFF_COLOR = '#6E737D'; // 오선지 선 색상

  container.querySelectorAll('svg').forEach((svg) => {
    svg.style.backgroundColor = 'transparent';
    svg.style.height = 'auto';

    svg.querySelectorAll('path, rect, text, ellipse, line').forEach((el) => {
      const fill = el.getAttribute('fill');
      const stroke = el.getAttribute('stroke');

      if (fill && fill !== 'none' && fill !== 'transparent') {
        el.setAttribute('fill', NOTE_COLOR);
      }

      if (stroke && stroke !== 'none' && stroke !== 'transparent') {
        el.setAttribute('stroke', STAFF_COLOR);
      }
    });
  });
}

function computeMeasureXPositionsPx(osmd: OpenSheetMusicDisplay, container: HTMLElement): number[] {
  const graphic =
    (osmd as unknown as { GraphicSheet?: GraphicSheetLike }).GraphicSheet ??
    (osmd as unknown as { graphic?: GraphicSheetLike }).graphic;
  const measureList = graphic?.MeasureList ?? [];
  if (measureList.length === 0) return [0];

  const validRows = measureList.filter((row) => row && row.length > 0 && row[0]?.PositionAndShape);
  if (validRows.length === 0) return [0];

  const unitPositions = validRows.map((row) => row[0].PositionAndShape.AbsolutePosition.x as number);

  const lastRow = validRows[validRows.length - 1][0];
  const lastWidthUnit = lastRow.PositionAndShape.Size?.width ?? 0;
  const scoreWidthUnit = unitPositions[unitPositions.length - 1] + lastWidthUnit;

  const svg = container.querySelector('svg');
  const svgWidthPx = svg?.getBoundingClientRect().width ?? 0;

  const scale = scoreWidthUnit > 0 && svgWidthPx > 0 ? svgWidthPx / scoreWidthUnit : 10 * osmd.zoom;

  const positions = unitPositions.map((x) => x * scale);
  positions.push(scoreWidthUnit * scale);
  return positions;
}
