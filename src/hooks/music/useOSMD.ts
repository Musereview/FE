// import { useEffect, useRef, useState } from 'react';
// import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
// import type { GraphicSheetLike } from '@/types/osmd';

// interface UseOSMDOptions {
//   xmlContent?: string;
//   xmlPath?: string;
//   onReady?: (osmd: OpenSheetMusicDisplay, measureXPositions: number[]) => void;
// }

// export function useOSMD({ xmlContent, xmlPath, onReady }: UseOSMDOptions) {
//   const containerRef = useRef<HTMLDivElement>(null);
//   const osmdRef = useRef<OpenSheetMusicDisplay | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [measureXPositions, setMeasureXPositions] = useState<number[]>([]);

//   useEffect(() => {
//     if (!containerRef.current) return;
//     const source = xmlContent ?? xmlPath;
//     if (!source) return;

//     let cancelled = false;
//     containerRef.current.innerHTML = '';

//     const osmd = new OpenSheetMusicDisplay(containerRef.current, {
//       autoResize: false,
//       backend: 'svg',
//       drawingParameters: 'default', //레이아웃에 따라 default, leadsheet으로 변경 예정
//       //renderSingleHorizontalStaffline: true,
//       drawTitle: false,
//       drawSubtitle: false,
//       drawComposer: false,
//     });
//     osmd.zoom = 1.3;
//     osmdRef.current = osmd;

//     osmd
//       .load(source)
//       .then(() => {
//         if (cancelled) return;
//         osmd.render();

//         applyDarkModeColors(containerRef.current!);
//         osmd.cursor.show();

//         const positions = computeMeasureXPositionsPx(osmd, containerRef.current!);
//         setMeasureXPositions(positions);
//         setIsLoading(false);
//         onReady?.(osmd, positions);
//       })
//       .catch((err) => {
//         console.error('OSMD load error:', err);
//         setIsLoading(false);
//       });

//     return () => {
//       cancelled = true;
//     };
//     // xmlContent/xmlPath가 바뀌지 않는 한(=곡을 통째로 교체하는 경우가 아닌 한) 재실행되지 않는다.
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [xmlContent, xmlPath]);

//   return { containerRef, osmdRef, isLoading, measureXPositions };
// }

// function applyDarkModeColors(container: HTMLElement) {
//   const NOTE_COLOR = '#C7CBD5';

//   container.querySelectorAll('svg').forEach((svg) => {
//     svg.style.backgroundColor = 'transparent';
//     svg.style.height = 'auto';
//     svg.querySelectorAll('path, rect, text, ellipse').forEach((el) => {
//       const fill = el.getAttribute('fill');
//       const stroke = el.getAttribute('stroke');
//       //음표 내부
//       if (fill && fill !== 'none' && fill !== 'transparent') {
//         el.setAttribute('fill', NOTE_COLOR);
//       }
//       if (stroke && stroke !== 'none' && stroke !== 'transparent') {
//         el.setAttribute('stroke', NOTE_COLOR);
//       }
//     });
//   });
// }

// /**
//  * 각 마디의 실제 렌더링된 x좌표(px)를 계산한다.
//  * OSMD 내부 단위(unit)를 그대로 신뢰하지 않고, 실제 SVG의 렌더링된 폭을 기준으로
//  * scale factor를 역산하여 보정한다 (OSMD 버전별 unit 정의 차이에 안전).
//  * 반환 배열의 길이는 (마디 수 + 1)이며 마지막 원소는 "곡 전체 끝 x좌표"다.
//  */
// function computeMeasureXPositionsPx(osmd: OpenSheetMusicDisplay, container: HTMLElement): number[] {
//   const graphic =
//     (osmd as unknown as { GraphicSheet?: GraphicSheetLike }).GraphicSheet ??
//     (osmd as unknown as { graphic?: GraphicSheetLike }).graphic;
//   const measureList = graphic?.MeasureList ?? [];
//   if (measureList.length === 0) return [0];

//   const unitPositions = measureList.map((row) => row[0].PositionAndShape.AbsolutePosition.x as number);

//   const lastRow = measureList[measureList.length - 1][0];
//   const lastWidthUnit = lastRow.PositionAndShape.Size?.width ?? 0;
//   const scoreWidthUnit = unitPositions[unitPositions.length - 1] + lastWidthUnit;

//   const svg = container.querySelector('svg');
//   const svgWidthPx = svg?.getBoundingClientRect().width ?? 0;

//   const scale = scoreWidthUnit > 0 && svgWidthPx > 0 ? svgWidthPx / scoreWidthUnit : 10 * osmd.zoom; // OSMD 기본 관례(1 unit = 10px) 폴백

//   const positions = unitPositions.map((x) => x * scale);
//   positions.push(scoreWidthUnit * scale);
//   return positions;
// }
//경로: C:\project\MuseReview\FE\src\hooks\music\useOSMD.ts
import { useEffect, useRef, useState } from 'react';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import type { GraphicSheetLike } from '@/types/osmd';

interface UseOSMDOptions {
  xmlContent?: string;
  xmlPath?: string;
  zoom?: number;
  drawMeasureNumbers?: boolean;
  onReady?: (osmd: OpenSheetMusicDisplay, measureXPositions: number[]) => void;
}

export function useOSMD({ xmlContent, xmlPath, zoom = 1.1, drawMeasureNumbers = false, onReady }: UseOSMDOptions) {
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
      drawingParameters: 'default', // 레이아웃에 따라 default, leadsheet으로 변경 예정
      drawTitle: false,
      drawSubtitle: false,
      drawComposer: false,
      drawMeasureNumbers,
      // ✅ 여러 줄(System)로 자동 줄바꿈하지 않고 하나의 긴 가로 악보로 렌더링
      renderSingleHorizontalStaffline: true,
      // ✅ MusicXML에 박혀 있는 <print new-system="yes"/>, <print new-page="yes"/> 같은
      //    강제 줄바꿈/페이지 나눔 지시를 무시한다. (sample.xml에 다수 포함되어 있어 필수)
      newSystemFromXML: false,
      newPageFromXML: false,
    } as ConstructorParameters<typeof OpenSheetMusicDisplay>[1];

    const osmd = new OpenSheetMusicDisplay(containerRef.current, options);
    osmd.zoom = zoom;
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
 * 한 줄(Single Horizontal Staffline) 렌더링에서도 GraphicSheet.MeasureList는
 * "마디 인덱스" 기준으로 정렬되어 있으므로 로직 자체는 기존과 동일하게 동작한다.
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
