// 피아노 건반(88/61) 컴포넌트
import { PIANO_RANGE } from '@//constants/piano';

interface PianoProps {
  keyCount?: 88 | 61;
  activeNotes?: Set<number>; // 선택으로
}

const isBlack = (midi: number) => [1, 3, 6, 8, 10].includes(midi % 12);

function Piano({ keyCount = 88, activeNotes }: PianoProps) {
  const { start, end } = PIANO_RANGE[keyCount];
  const keys = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  const whites = keys.filter((k) => !isBlack(k));

  return (
    <div className="mx-auto flex h-40 w-full max-w-[1560px] select-none">
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
    </div>
  );
}

export default Piano;
