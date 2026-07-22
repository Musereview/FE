import { useEffect, useRef, useState } from 'react';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';

interface Props {
  xmlPath?: string;
  xmlContent?: string;
  onReady?: (osmd: OpenSheetMusicDisplay) => void;
}

export function useOSMD({ xmlPath, xmlContent, onReady }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('xmlPath=', xmlPath);
    if (!containerRef.current) return;

    containerRef.current.innerHTML = '';

    const osmd = new OpenSheetMusicDisplay(containerRef.current, {
      autoResize: false,
      backend: 'svg',
      drawingParameters: 'compact',

      renderSingleHorizontalStaffline: true,

      drawTitle: false,
      drawSubtitle: false,
      drawComposer: false,
    });

    osmd.zoom = 1.0;
    console.log('=== useOSMD ===');
    console.log(xmlContent?.substring(0, 200));
    console.log(typeof xmlContent);
    const loadPromise =
      xmlContent !== undefined
        ? osmd.load(xmlContent)
        : xmlPath !== undefined
          ? osmd.load(xmlPath)
          : Promise.reject(new Error('xmlPath 또는 xmlContent가 필요합니다.'));

    loadPromise
      .then(() => {
        console.log('OSMD Load 성공');
        osmd.render();
        console.log('Render 완료');

        console.log('container width:', containerRef.current?.clientWidth);

        const svg = containerRef.current?.querySelector('svg');
        console.log('svg width:', svg?.getAttribute('width'));
        console.log('svg viewBox:', svg?.getAttribute('viewBox'));

        const svgs = containerRef.current?.querySelectorAll('svg');

        console.log('SVG 개수:', svgs?.length);

        svgs?.forEach((svg, index) => {
          console.log(`SVG ${index}`, svg);
        });
        console.log(containerRef.current?.innerHTML);

        const stafflines = containerRef.current?.querySelectorAll('.staffline');

        console.log('staffline 개수:', stafflines?.length);
        stafflines?.forEach((line, i) => {
          console.log(i, line.id);
        });

        containerRef.current?.querySelectorAll('svg').forEach((svg) => {
          svg.style.backgroundColor = 'transparent';
          //svg.style.width = "100%";
          svg.style.height = 'auto';

          svg.querySelectorAll('path, rect, text, ellipse').forEach((el) => {
            const fill = el.getAttribute('fill');
            const stroke = el.getAttribute('stroke');

            if (fill && fill !== 'none' && fill !== 'transparent') {
              el.setAttribute('fill', '#E7E7E8');
            }

            if (stroke && stroke !== 'none' && stroke !== 'transparent') {
              el.setAttribute('stroke', '#E7E7E8');
            }
          });
        });

        osmd.cursor.show();

        onReady?.(osmd);

        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });

    const handleResize = () => {
      osmd.render();
    };

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [xmlPath, xmlContent, onReady]);

  return {
    containerRef,
    isLoading,
  };
}
