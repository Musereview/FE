import DotEmpty from '@/assets/metronome/metronome-empty.svg?react';
import DotFilled from '@/assets/metronome/metronome-full.svg?react';

interface MetronomeProps {
  total: number; // 전체 점 개수
  current: number; // 현재 박 (0-based)
}

function MetronomeDots({ total, current }: MetronomeProps) {
  return (
    <div className="inline-flex items-center gap-6">
      {Array.from({ length: total }, (_, i) =>
        i === current ? <DotFilled key={i} className="h-8 w-8" /> : <DotEmpty key={i} className="h-8 w-8" />,
      )}
    </div>
  );
}

export default MetronomeDots;
