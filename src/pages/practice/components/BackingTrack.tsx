// 백킹트랙(코드 진행) 표시 전용 컴포넌트
// 한 화면에 마디 PAGE_SIZE(4)개를 테두리 영역 안에 표시하고, 재생 중인 박(currentBeat)을
// 보라색으로 강조한다. 현재 페이지의 마디를 모두 지나가면 다음 4개 마디로 넘어간다.
import type { ChordMeasure } from '@/types/track';

interface BackingTrackProps {
  measures: ChordMeasure[];
  currentBeat: number; // 전체 진행 기준 현재 박(0-based), 미재생이면 -1
  beatsPerBar: number; // 4/4 → 4
  className?: string;
}

const PAGE_SIZE = 4; // 한 화면에 보이는 마디 수

export default function BackingTrack({ measures, currentBeat, beatsPerBar, className = '' }: BackingTrackProps) {
  // 현재 마디 → 현재 페이지(마디 4개 묶음) 계산
  const currentMeasure = currentBeat < 0 ? 0 : Math.floor(currentBeat / beatsPerBar);
  const page = Math.floor(currentMeasure / PAGE_SIZE);
  const startMeasure = page * PAGE_SIZE;
  const visibleMeasures = measures.slice(startMeasure, startMeasure + PAGE_SIZE);

  return (
    // 컨테이너: 최대 1510px, 마디 균등 분할(반응형) — 폭이 바뀌어도 셀이 고르게 정렬됨
    <div className={`flex w-full max-w-[1510px] items-center gap-6 rounded-[6px] bg-gray-900 p-3 ${className}`}>
      {visibleMeasures.map((measure, localIndex) => {
        const measureIndex = startMeasure + localIndex; // 전체 진행 기준 마디 인덱스
        return (
          // 마디 = 균등 폭(flex-1), 마디 안 셀도 균등 분할
          <div key={measureIndex} className="flex flex-1 items-center gap-1">
            {measure.map((chord, cellIndex) => {
              const flatIndex = measureIndex * beatsPerBar + cellIndex;
              const isCurrent = flatIndex === currentBeat;
              return (
                // 셀: 높이 30, 폭 균등(flex-1), radius 4px, bg gray-600 (재생 중인 박은 보라색)
                <div
                  key={cellIndex}
                  className={`button-label1 flex h-[30px] flex-1 items-center justify-center rounded-[4px] ${
                    isCurrent ? 'bg-secondary-400 text-gray-900' : 'bg-gray-600 text-gray-950'
                  }`}>
                  <span className={chord ? '' : 'invisible'}>{chord ?? '-'}</span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
