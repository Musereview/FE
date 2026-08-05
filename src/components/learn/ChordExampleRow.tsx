import { useMemo } from 'react';
import Piano from '@/components/piano/Piano';

interface ChordExampleRowProps {
  chordName: string;
  description: string;
  /** 가상 건반에 하이라이트할 MIDI 노트 번호 목록 */
  noteNumbers: number[];
  className?: string;
}

function ChordExampleRow({ chordName, description, noteNumbers, className = '' }: ChordExampleRowProps) {
  const activeNotes = useMemo(() => new Set(noteNumbers), [noteNumbers]);

  return (
    <div className={`flex flex-col items-start gap-4 bg-gray-900 px-8 py-6 ${className}`}>
      <div className="flex flex-col">
        <p className="body-regular1 text-gray-300">{chordName}</p>
        <p className="body-small text-gray-500">{description}</p>
      </div>

      <Piano keyCount={61} activeNotes={activeNotes} />
    </div>
  );
}

export default ChordExampleRow;
