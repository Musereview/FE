import Piano from '@/components/piano/Piano';

/** Cmaj7 코드톤(C·E·G·B)의 MIDI 노트 번호. 옥타브별로 하나씩 쌓아 누적 하이라이트 효과를 냄 */
const CMAJ7_OCTAVE_3 = [48, 52, 55, 59];
const CMAJ7_OCTAVE_4 = [60, 64, 67, 71];
const CMAJ7_OCTAVE_5 = [72, 76, 79, 83];

const ACTIVE_NOTES_BY_GROUP_COUNT: Record<number, Set<number>> = {
  1: new Set(CMAJ7_OCTAVE_3),
  2: new Set([...CMAJ7_OCTAVE_3, ...CMAJ7_OCTAVE_4]),
  3: new Set([...CMAJ7_OCTAVE_3, ...CMAJ7_OCTAVE_4, ...CMAJ7_OCTAVE_5]),
};

interface ChordExampleRowProps {
  /** 몇 옥타브까지 코드톤을 누적해서 밝게 표시할지 (1~3) */
  activeGroupCount: number;
  className?: string;
}

function ChordExampleRow({ activeGroupCount, className = '' }: ChordExampleRowProps) {
  return (
    <div className={`flex flex-col items-start gap-4 bg-gray-900 px-8 py-6 ${className}`}>
      <div className="flex flex-col">
        <p className="body-regular1 text-gray-300">Cmaj7</p>
        <p className="body-small text-gray-500">F(11th) 주의 - E(3rd)와 충돌</p>
      </div>

      <Piano keyCount={61} activeNotes={ACTIVE_NOTES_BY_GROUP_COUNT[activeGroupCount]} />
    </div>
  );
}

export default ChordExampleRow;
