import { useEffect, useRef } from 'react';
import { MEASURE_WIDTH_CLASS } from './layout';

export interface ChordCell {
  measureIndex: number;
  cellIndex: number;
}

interface ChordProgressionGridProps {
  measures: string[][];
  selectedCell: ChordCell | null;
  onSelectCell: (cell: ChordCell | null) => void;
  className?: string;
}

function ChordProgressionGrid({ measures, selectedCell, onSelectCell, className = '' }: ChordProgressionGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedCell) return;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onSelectCell(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedCell, onSelectCell]);

  const rows: [string[], string[]][] = [];
  for (let i = 0; i < measures.length; i += 2) {
    rows.push([measures[i], measures[i + 1] ?? []]);
  }

  // #8 트랙 상세 모달과 동일한 방식: 마디 폭은 고정, 3박자는 좌우 마디를 각각 바깥쪽으로
  // 정렬해서 1번째/마지막 칸 위치가 4박자와 항상 같게 유지되도록 한다.
  const renderMeasure = (measure: string[], measureIndex: number, isSecondHalf: boolean) => {
    const isFourBeats = measure.length === 4;
    const alignmentClassName = isFourBeats ? 'justify-between' : `gap-11 ${isSecondHalf ? 'justify-end' : ''}`;

    return (
      <div className={`flex items-center ${MEASURE_WIDTH_CLASS} ${alignmentClassName}`}>
        {measure.map((chord, cellIndex) => {
          const isSelected = selectedCell?.measureIndex === measureIndex && selectedCell?.cellIndex === cellIndex;

          return (
            <button
              key={cellIndex}
              type="button"
              onClick={() => onSelectCell({ measureIndex, cellIndex })}
              aria-pressed={isSelected}
              aria-label={`${measureIndex + 1}번째 마디 ${cellIndex + 1}번째 코드`}
              className={`button-small flex size-12 shrink-0 items-center justify-center rounded-[4px] text-center outline-none ${
                isSelected
                  ? 'bg-secondary-600 border-secondary-100 text-secondary-100 border-[0.5px]'
                  : 'bg-gray-600 text-gray-950'
              }`}>
              <span className={chord ? '' : 'invisible'}>{chord || '-'}</span>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div ref={containerRef} className={`flex w-full flex-col items-start gap-3 ${className}`}>
      <p className="body-regular2 w-full text-gray-300">코드 진행</p>

      <div className="flex w-fit flex-col items-center gap-5 rounded-[10px] bg-gray-900 p-5">
        {rows.map(([leftMeasure, rightMeasure], rowIndex) => {
          const leftMeasureIndex = rowIndex * 2;
          const rightMeasureIndex = rowIndex * 2 + 1;

          return (
            <div key={rowIndex} className="flex items-center gap-7">
              {renderMeasure(leftMeasure, leftMeasureIndex, false)}
              <div className="h-12 w-px shrink-0 bg-gray-600" />
              {renderMeasure(rightMeasure, rightMeasureIndex, true)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ChordProgressionGrid;
