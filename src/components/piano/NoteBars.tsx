// 친 음 위치에서 솟아오르는 노트바 오버레이
// 건반 위(bottom-full)에 얹혀, 각 노트바가 해당 음의 가로 위치·폭(흰/검은 건반 크기)에 맞춰 위로 올라가며 사라진다.
import { noteCenterFraction, noteWidthFraction, type KeyCount } from '@/constants/piano';

export interface NoteBar {
  id: number;
  midi: number;
}

interface NoteBarsProps {
  bars: NoteBar[];
  keyCount: KeyCount;
  onBarDone: (id: number) => void; // 애니메이션 종료 시 제거
}

// 디자인: linear-gradient(180deg, Primary400 0%, Primary400 50%, Gray950 100%)
const BAR_GRADIENT =
  'linear-gradient(180deg, var(--color-primary-400) 0%, var(--color-primary-400) 50%, var(--color-gray-950) 100%)';

function NoteBars({ bars, keyCount, onBarDone }: NoteBarsProps) {
  return (
    <div className="pointer-events-none absolute bottom-full left-0 w-full">
      {bars.map(({ id, midi }) => {
        const frac = noteCenterFraction(midi, keyCount);
        if (frac < 0) return null; // 범위 밖 음은 무시
        const widthPct = noteWidthFraction(midi, keyCount) * 100;
        return (
          <span
            key={id}
            onAnimationEnd={() => onBarDone(id)}
            className="animate-note-rise absolute bottom-0 h-[248px] rounded-t-[2px]"
            style={{
              left: `${frac * 100}%`,
              width: `${widthPct}%`,
              background: BAR_GRADIENT,
            }}
          />
        );
      })}
    </div>
  );
}

export default NoteBars;
