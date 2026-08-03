import type { WeeklyTrendData } from '@/types/history';

// viewBox(950) 안에서 첫/마지막 점이 놓이는 x 좌표
const X_START = 40;
const X_END = 910;
// Y축 눈금: 100점 -> y 0, 40점 -> y 156 (60점 구간이 156px)
const Y_PER_POINT = 2.6;
const Y_MAX = 208; // X축 실선 위치

function toY(score: number) {
  return Math.min(Math.max((100 - score) * Y_PER_POINT, 0), Y_MAX);
}

interface WeeklyTrendChartProps {
  data?: WeeklyTrendData;
}

export default function WeeklyTrendChart({ data }: WeeklyTrendChartProps) {
  const items = data?.items ?? [];
  const gap = items.length > 1 ? (X_END - X_START) / (items.length - 1) : 0;

  const points = items.map((item, idx) => ({
    label: item.label,
    score: item.averageScore,
    x: X_START + idx * gap,
    y: toY(item.averageScore),
  }));

  const pathString = points.reduce((acc, cur, idx) => {
    return idx === 0 ? `M ${cur.x} ${cur.y}` : `${acc} L ${cur.x} ${cur.y}`;
  }, '');

  const diff = data?.diffFromPreviousWeek;

  return (

    <div className="flex w-[1196px] flex-col">
      {/* 전 주 대비 점수 변화 텍스트 */}
      <div className="mb-[12px] text-[18px] leading-[30px] font-medium tracking-[-0.36px] text-gray-500">
        {diff !== undefined && (
          <>
            전 주보다 <span className={diff >= 0 ? 'text-primary-400' : 'text-purple-500'}>{Math.abs(diff)}점</span>{' '}
            {diff >= 0 ? '향상' : '하락'}
          </>
        )}

      </div>

      {/* 차트 메인 박스  */}
      <div className="box-border flex w-full flex-col rounded-[6px] border border-gray-800 bg-gray-950 px-6 pt-16 pb-10 md:px-10">
        {/* 전체 차트 영역 */}
        <div className="relative flex h-[260px] w-full">
          {/* 1. Y축 수치 레이블 */}
          <div className="pointer-events-none absolute top-0 bottom-[52px] left-0 w-10 text-base font-medium tracking-tight text-gray-500">
            <span className="absolute top-0 -translate-y-1/2">100</span>
            <span className="absolute top-[52px] -translate-y-1/2">80</span>
            <span className="absolute top-[104px] -translate-y-1/2">60</span>
            <span className="absolute top-[156px] -translate-y-1/2">40</span>
          </div>

          {/* 2. 그래프 및 그리드 영역 */}
          <div className="relative mr-5 ml-16 h-full flex-1">
            {/* 점선 4개 */}
            <div className="pointer-events-none absolute inset-x-0 top-0 flex h-[156px] flex-col justify-between">
              <div className="w-full border-b-[0.5px] border-dashed border-[#3A3F4A]" />
              <div className="w-full border-b-[0.5px] border-dashed border-[#3A3F4A]" />
              <div className="w-full border-b-[0.5px] border-dashed border-[#3A3F4A]" />
              <div className="w-full border-b-[0.5px] border-dashed border-[#3A3F4A]" />
            </div>

            {/* X축 기준 실선  */}
            <div className="pointer-events-none absolute inset-x-0 top-[208px] h-[0.7px] bg-gray-500" />

            {/* SVG 연결선 및 점 */}
            <div className="absolute inset-0 overflow-visible">
              <svg
                className="absolute inset-0 h-full w-full overflow-visible"
                viewBox="0 0 950 260"
                preserveAspectRatio="none">
                <path
                  d={pathString}
                  stroke="#69FFC0"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>

              {points.map((pt, idx) => {
                const leftPercent = (pt.x / 950) * 100;
                return (
                  <div key={idx}>
                    {/* 수치 텍스트  */}
                    <div
                      className="pointer-events-none absolute flex -translate-x-1/2 flex-col items-center"
                      style={{
                        left: `${leftPercent}%`,
                        top: `${pt.y - 52}px`,
                      }}>
                      <span className="text-[22px] leading-[32px] font-medium tracking-[-0.44px] text-gray-300">
                        {pt.score}
                      </span>
                    </div>

                    {/* 데이터 포인트 원 */}
                    <div
                      className="bg-primary-400 pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full"
                      style={{
                        left: `${leftPercent}%`,
                        top: `${pt.y}px`,
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* 3. 하단 X축 레이블 */}
            <div className="pointer-events-none absolute inset-x-0 top-[208px]">
              {points.map((pt, idx) => {
                const leftPercent = (pt.x / 950) * 100;
                return (
                  <span
                    key={idx}
                    className="absolute top-[13px] -translate-x-1/2 text-base font-medium tracking-tight text-gray-500"
                    style={{
                      left: `${leftPercent}%`,
                    }}>
                    {pt.label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
