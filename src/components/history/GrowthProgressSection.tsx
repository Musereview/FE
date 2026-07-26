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
    <div className="flex items-center justify-between">
      <div className="flex w-[120px] items-center justify-between">
        <span className="text-[16px] font-medium text-gray-500">{label}</span>
        <span className={`text-[16px] font-semibold ${isPositive ? 'text-primary-400' : 'text-purple-500'}`}>
          {delta}
        </span>
      </div>
      <div className="relative h-[24px] w-[720px] overflow-hidden rounded-full border-[0.5px] border-gray-600/40 bg-gray-950">
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
    <div className="flex w-[1196px] flex-col rounded-[6px] border border-gray-800 bg-gray-900 p-[40px]">
      {/* 그래프 및 라벨 리스트 영역  */}
      <div className="flex flex-col gap-[32px]">
        {METRICS.map((metric) => (
          <GrowthBar key={metric.label} {...metric} />
        ))}
      </div>
    </div>
  );
}
