interface GrowthMetric {
  label: string;
  delta: string;
  direction: 'positive' | 'negative';
  widthPercent: number;
}

const METRICS: GrowthMetric[] = [
  { label: '스케일', delta: '+8', direction: 'positive', widthPercent: 42 },
  { label: '텐션', delta: '+6', direction: 'positive', widthPercent: 35 },
  { label: '진행', delta: '+4', direction: 'positive', widthPercent: 25 },
  { label: '코드 연결', delta: '-10', direction: 'negative', widthPercent: 50 },
];

function GrowthBar({ label, delta, direction, widthPercent }: GrowthMetric) {
  const isPositive = direction === 'positive';

  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      {/* 라벨과 수치 영역 */}
      <div className="flex w-full items-center justify-between md:w-[140px]">
        <span className="text-base font-medium text-gray-500">{label}</span>
        <span className={`text-base font-semibold ${isPositive ? 'text-primary-400' : 'text-purple-500'}`}>
          {delta}
        </span>
      </div>

      {/* 막대 그래프 영역*/}
      <div className="relative h-6 w-full overflow-hidden rounded-full border-[0.5px] border-gray-600/40 bg-gray-950 md:flex-1">
        <div className="absolute top-0 left-1/2 z-10 h-full w-[1px] bg-gray-800" />
        {isPositive ? (
          <div
            className="to-primary-400 absolute top-0 left-1/2 h-full rounded-r-full bg-gradient-to-r from-[#008751]"
            style={{ width: `${widthPercent}%` }}
          />
        ) : (
          <div
            className="absolute top-0 right-1/2 h-full rounded-l-full bg-gradient-to-l from-[#4C1D95] to-purple-500"
            style={{ width: `${widthPercent}%` }}
          />
        )}
      </div>
    </div>
  );
}

export default function GrowthProgressSection() {
  return (
    <div className="flex w-full flex-col rounded-[6px] border border-gray-800 bg-gray-900 p-6 md:p-10">
      {/* 그래프 및 라벨 리스트 영역 */}
      <div className="flex flex-col gap-8">
        {METRICS.map((metric) => (
          <GrowthBar key={metric.label} {...metric} />
        ))}
      </div>
    </div>
  );
}
