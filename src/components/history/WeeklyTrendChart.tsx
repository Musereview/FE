export default function WeeklyTrendChart() {
  const points = [
    { label: '3주 전', score: 60, x: 40, y: 110 },
    { label: '2주 전', score: 78, x: 330, y: 65 },
    { label: '지난주', score: 63, x: 620, y: 100 },
    { label: '이번주', score: 93, x: 910, y: 24 },
  ];

  const pathString = points.reduce((acc, cur, idx) => {
    return idx === 0 ? `M ${cur.x} ${cur.y}` : `${acc} L ${cur.x} ${cur.y}`;
  }, '');

  return (
    <div className="flex w-full flex-col">
      {/* 전 주 대비 +9점 향상 텍스트 */}
      <div className="mb-3 w-auto text-lg font-medium tracking-tight text-gray-500">
        전 주보다 <span className="text-primary-400">+9점</span> 향상
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
