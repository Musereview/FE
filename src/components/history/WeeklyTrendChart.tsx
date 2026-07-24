// // src/components/history/WeeklyTrendChart.tsx

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
    <div className="flex w-[1196px] flex-col">
      {/* 전 주 대비 +9점 향상 텍스트 */}
      <div
        className="mb-[12px] w-[193px]"
        style={{
          fontFamily: 'Pretendard',
          fontSize: '18px',
          fontStyle: 'normal',
          fontWeight: 500,
          lineHeight: '30px',
          letterSpacing: '-0.36px',
          color: '#AEB1B6',
        }}>
        전 주 대비 <span style={{ color: '#69FFC0' }}>+9점</span> 향상
      </div>

      {/* 차트 메인 박스  */}
      <div className="box-border flex w-[1196px] flex-col rounded-[6px] border border-[#2E3142] bg-[#161B22] px-[40px] pt-[66px] pb-[40px]">
        {/* 전체 차트 영역 */}
        <div className="relative flex h-[260px] w-full">
          {/* 1. Y축 수치 레이블 */}
          <div
            className="pointer-events-none absolute top-0 bottom-[52px] left-0 w-[40px]"
            style={{
              fontFamily: 'Pretendard',
              fontSize: '16px',
              fontWeight: 500,
              lineHeight: '24px',
              letterSpacing: '-0.32px',
              color: '#AEB1B6',
            }}>
            <span className="absolute top-[0px] translate-y-[-50%]">100</span>
            <span className="absolute top-[52px] translate-y-[-50%]">80</span>
            <span className="absolute top-[104px] translate-y-[-50%]">60</span>
            <span className="absolute top-[156px] translate-y-[-50%]">40</span>
          </div>

          {/* 2. 그래프 및 그리드 영역 */}
          <div className="relative mr-[20px] ml-[64px] h-full flex-1">
            {/* 점선 4개 */}
            <div className="pointer-events-none absolute inset-x-0 top-0 flex h-[156px] flex-col justify-between">
              <div className="w-full border-b-[0.5px] border-dashed border-[#3A3F4A]" />
              <div className="w-full border-b-[0.5px] border-dashed border-[#3A3F4A]" />
              <div className="w-full border-b-[0.5px] border-dashed border-[#3A3F4A]" />
              <div className="w-full border-b-[0.5px] border-dashed border-[#3A3F4A]" />
            </div>

            {/* X축 기준 실선 */}
            <div
              className="pointer-events-none absolute inset-x-0"
              style={{
                top: '208px',
                height: '0.7px',
                background: '#AEB1B6',
              }}
            />

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
                    {/* 수치 텍스트 */}
                    <div
                      className="pointer-events-none absolute flex -translate-x-1/2 flex-col items-center"
                      style={{
                        left: `${leftPercent}%`,
                        top: `${pt.y - 52}px`,
                      }}>
                      <span
                        style={{
                          alignSelf: 'stretch',
                          color: '#E7E7E8',
                          fontFamily: 'Pretendard',
                          fontSize: '22px',
                          fontWeight: 500,
                          lineHeight: '32px',
                          letterSpacing: '-0.44px',
                        }}>
                        {pt.score}
                      </span>
                    </div>

                    {/* 민트색 점 */}
                    <div
                      className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
                      style={{
                        left: `${leftPercent}%`,
                        top: `${pt.y}px`,
                        width: '16px',
                        height: '16px',
                      }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="8" fill="#69FFC0" />
                        {pt.label === '이번주' && (
                          <circle cx="8" cy="8" r="8" fill="#69FFC0" filter="url(#filter0_d_331_16405)" />
                        )}
                      </svg>
                      {pt.label === '이번주' && (
                        <defs>
                          <filter
                            id="filter0_d_331_16405"
                            x="0"
                            y="0"
                            width="16"
                            height="16"
                            filterUnits="userSpaceOnUse"
                            colorInterpolationFilters="sRGB">
                            <feFlood floodOpacity="0" result="BackgroundImageFix" />
                            <feColorMatrix
                              in="BackgroundImageFix"
                              type="matrix"
                              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                              result="hardAlpha"
                            />
                            <feOffset />
                            <feGaussianBlur stdDeviation="4" />
                            <feComposite in2="hardAlpha" operator="out" />
                            <feColorMatrix
                              type="matrix"
                              values="0 0 0 0 0.411765 0 0 0 0 1 0 0 0 0 0.752941 0 0 0 0.6 0"
                            />
                            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_331_16405" />
                            <feBlend
                              mode="normal"
                              in="SourceGraphic"
                              in2="effect1_dropShadow_331_16405"
                              result="shape"
                            />
                          </filter>
                        </defs>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 3. 하단 X축 레이블*/}
            <div className="pointer-events-none absolute inset-x-0" style={{ top: '208px' }}>
              {points.map((pt, idx) => {
                const leftPercent = (pt.x / 950) * 100;
                return (
                  <span
                    key={idx}
                    className="absolute -translate-x-1/2"
                    style={{
                      left: `${leftPercent}%`,
                      top: '13px',
                      fontFamily: 'Pretendard',
                      fontSize: '16px',
                      fontWeight: 500,
                      lineHeight: '24px',
                      letterSpacing: '-0.32px',
                      color: '#AEB1B6',
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
