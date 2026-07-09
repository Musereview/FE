import type { ChangeEvent } from 'react';
import PlusIcon from '@/assets/practice/plus.svg?react';
import { MEASURE_WIDTH_CLASS } from './layout';

interface ChordProgressionGridProps {
  measures: string[][];
  onCellChange: (measureIndex: number, cellIndex: number, value: string) => void;
  onAddMeasures: () => void;
  className?: string;
}

function ChordProgressionGrid({ measures, onCellChange, onAddMeasures, className = '' }: ChordProgressionGridProps) {
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
        {measure.map((chord, cellIndex) => (
          <input
            key={cellIndex}
            type="text"
            value={chord}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              onCellChange(measureIndex, cellIndex, event.target.value)
            }
            aria-label={`${measureIndex + 1}번째 마디 ${cellIndex + 1}번째 코드`}
            className="button-small focus:ring-primary-400 flex size-12 shrink-0 items-center justify-center rounded-[4px] bg-gray-600 text-center text-gray-950 outline-none focus:ring-2"
          />
        ))}
      </div>
    );
  };

  return (
    <div className={`flex w-full flex-col items-start gap-3 ${className}`}>
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

        <button
          type="button"
          onClick={onAddMeasures}
          aria-label="마디 4개 추가"
          className="bg-primary-400 flex size-8 shrink-0 items-center justify-center self-center rounded-full text-gray-950">
          <PlusIcon className="size-4" />
        </button>
      </div>
    </div>
  );
}

export default ChordProgressionGrid;
