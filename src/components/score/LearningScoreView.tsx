// 학습 화면 악보 뷰 — 한 화면에 지정한 마디 수(기본 3마디)만 보이도록 확대하고,
// 현재 진행 마디를 항상 "가운데"에 둔다. 왼쪽=지나간 마디 / 오른쪽=다음 마디.
// OSMD를 단일 가로 라인으로 1회 렌더한 뒤(재렌더 없음), 컨테이너에 고정 배율(scale) + translateX만
// 적용해 현재 마디를 중앙에 맞춘다. 마디가 바뀌면 translateX가 CSS transition으로 부드럽게 슬라이드.
import { useEffect, useRef, useState } from 'react';
import { useOSMD } from '@/hooks/music/useOSMD';

interface LearningScoreViewProps {
  xmlContent?: string;
  xmlPath?: string;
  currentMeasureIndex: number; // 0-based 현재 진행 마디
  visibleMeasures?: number; // 한 화면에 보이는 마디 수 (기본 3)
  zoom?: number; // OSMD 기본 렌더 배율 (여기에 화면맞춤 scale이 추가로 곱해짐)
  height?: number; // 뷰포트 높이(px) — 세로 넘침 방지 배율 계산에 사용
  className?: string;
}

export default function LearningScoreView({
  xmlContent,
  xmlPath,
  currentMeasureIndex,
  visibleMeasures = 3,
  zoom = 1.2,
  height = 260,
  className = '',
}: LearningScoreViewProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [svgHeight, setSvgHeight] = useState(0); // 렌더된 악보 원본 높이(px, 배율 전)
  const { containerRef, isLoading, measureXPositions } = useOSMD({ xmlContent, xmlPath, zoom });

  // 뷰포트 폭 추적 (반응형)
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const update = () => setViewportWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 렌더 완료 후 악보 원본 높이 측정 (세로 맞춤 배율 계산용)
  useEffect(() => {
    if (measureXPositions.length <= 1) return;
    const svg = containerRef.current?.querySelector('svg') as SVGSVGElement | null;
    const h = svg?.height?.baseVal?.value ?? 0;
    if (h) setSvgHeight(h);
  }, [measureXPositions, containerRef]);

  // measureXPositions = [마디0 좌측x, 마디1 좌측x, ..., 악보 끝x] → 길이 = 마디수 + 1
  const measureCount = Math.max(1, measureXPositions.length - 1);
  const ready = measureXPositions.length > 1 && viewportWidth > 0;

  // mock: 백킹 루프가 악보보다 짧을 수 있어 마디 인덱스를 악보 범위로 감싼다
  const idx = ready ? ((currentMeasureIndex % measureCount) + measureCount) % measureCount : 0;
  const measureCenter = ready ? (measureXPositions[idx] + measureXPositions[idx + 1]) / 2 : 0;

  // 화면맞춤 배율: 가로는 "visibleMeasures 마디 = 뷰포트 폭", 세로는 뷰포트 높이 이내 → 둘 중 작은 값.
  const avgMeasureWidth = ready ? measureXPositions[measureCount] / measureCount : 0;
  const widthScale = avgMeasureWidth > 0 ? viewportWidth / (visibleMeasures * avgMeasureWidth) : 1;
  const heightScale = svgHeight > 0 ? (height * 0.92) / svgHeight : widthScale;
  const scale = Math.min(4, Math.max(0.3, Math.min(widthScale, heightScale)));
  const offsetX = viewportWidth / 2 - measureCenter * scale; // 확대 후 현재 마디 중앙 = 뷰포트 중앙

  return (
    <div ref={viewportRef} className={`relative overflow-hidden ${className}`} style={{ height }}>
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="border-primary-400 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
        </div>
      )}
      <div
        ref={containerRef}
        className="absolute top-1/2 left-0 inline-block"
        style={{
          transformOrigin: '0% 50%', // 좌측·세로중앙 기준 확대 → 세로는 항상 가운데 유지
          transform: `translate(${offsetX}px, -50%) scale(${scale})`,
          transition: 'transform 400ms ease',
          opacity: ready ? 1 : 0,
        }}
      />
    </div>
  );
}
