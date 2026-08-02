import type { DomainGrowthItem } from '@/types/history';

interface GrowthMetric {
  label: string;
  delta: string;
  direction: 'positive' | 'negative';
  widthPercent: number;
}

// 막대 절반(50%)이 최대치. 1점당 5% 씩 채우고 10점 이상이면 가득 참
const PERCENT_PER_POINT = 5;
const MAX_WIDTH_PERCENT = 50;

function toMetric({ label, diff }: DomainGrowthItem): GrowthMetric {
  return {
    label,
    delta: `${diff > 0 ? '+' : ''}${diff}`,
    direction: diff >= 0 ? 'positive' : 'negative',
    widthPercent: Math.min(Math.abs(diff) * PERCENT_PER_POINT, MAX_WIDTH_PERCENT),
  };
}

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

interface GrowthProgressSectionProps {
  data?: DomainGrowthItem[];
}

export default function GrowthProgressSection({ data = [] }: GrowthProgressSectionProps) {
  return (
    <div className="flex w-[1196px] flex-col rounded-[6px] border border-gray-800 bg-gray-900 p-[40px]">
      {/* 그래프 및 라벨 리스트 영역  */}
      <div className="flex flex-col gap-[32px]">
        {data.map((item) => (
          <GrowthBar key={item.domain} {...toMetric(item)} />
        ))}
      </div>
    </div>
  );
}
