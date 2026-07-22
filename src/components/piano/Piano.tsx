// 피아노 건반(88/61) 컴포넌트
import { PIANO_RANGE } from '@//constants/piano';
import type { ReactNode } from 'react';

interface PianoProps {
  keyCount?: 88 | 61;
  activeNotes?: Set<number>; // 선택으로
  rightSlot?: ReactNode; // 건반 오른쪽에 얹을 요소 (설정 버튼 등)
}

const isBlack = (midi: number) => [1, 3, 6, 8, 10].includes(midi % 12);

function Piano({ keyCount = 88, activeNotes, rightSlot }: PianoProps) {
  const { start, end } = PIANO_RANGE[keyCount];
  const keys = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  const whites = keys.filter((k) => !isBlack(k));

  return (
    <div className="relative mx-auto flex h-40 w-full max-w-[1560px] select-none">
      {whites.map((midi) => (
        <div
          key={midi}
          className={`relative flex-1 border-r-[1.5px] border-r-gray-500 ${
            activeNotes?.has(midi) ? 'bg-primary-200' : 'bg-gray-100'
          }`}>
          {isBlack(midi + 1) && midi + 1 <= end && (
            <div
              className={`absolute top-0 -right-[35.088%] z-10 h-[56.25%] w-[70.175%] ${
                activeNotes?.has(midi + 1) ? 'bg-primary-200 border-x border-b border-gray-600' : 'bg-gray-950'
              }`}
            />
          )}
        </div>
      ))}
      {/* 오른쪽 슬롯 — 건반 폭 기준으로 항상 고정 */}
      {rightSlot && <div className="absolute top-1/2 -right-[85px] z-20 -translate-y-1/2">{rightSlot}</div>}
    </div>
  );
}

export default Piano;
