interface AttendanceDay {
  dayOfWeek: string;
  label: string;
  status: 'COMPLETED' | 'TODAY_COMPLETED' | 'MISSED' | 'EMPTY';
}

interface AttendanceSectionProps {
  data: {
    user: { nickname: string };
    streak: { currentDays: number; message: string; weeklyAttendance: AttendanceDay[] };
    practiceSummary: { weeklyPracticeHours: number; monthlyPracticeHours: number; monthLabel: string };
  };
}

export default function AttendanceSection({ data }: AttendanceSectionProps) {
  const { user, streak, practiceSummary } = data;
  const dayOrder = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  const todayItem = streak.weeklyAttendance.find((d) => d.status === 'TODAY_COMPLETED');
  const todayIndex = todayItem ? dayOrder.indexOf(todayItem.dayOfWeek) : -1;

  return (
    <div
      className="w-full"
      // bg-gradient-to-b from-gray-900 to-gray-950
      style={{
        background: 'linear-gradient(0deg, var(--color-gray-900, #1B1E27) 0%, var(--color-gray-950, #0B0F19) 100%)',
      }}>
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 px-10 py-11 font-sans tracking-tight text-white select-none lg:flex-row lg:items-center lg:justify-between lg:gap-12">
        {/* 좌측 영역: 타이틀 + 일주일 출석 현황 */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col">
            <h2 className="text-[32px] leading-[44px] font-semibold tracking-[-0.64px] text-gray-300">
              {user.nickname} 님,
            </h2>
            <h2 className="text-[32px] leading-[44px] font-semibold tracking-[-0.64px] text-gray-200">
              {streak.currentDays}일 연속 학습 중이에요!
            </h2>
          </div>

          {/* 일주일 출석 현황 아이콘 리스트 */}
          <div className="flex flex-wrap items-center gap-3.5">
            {streak.weeklyAttendance.map((item, index) => {
              const isAttended = item.status === 'COMPLETED' || item.status === 'TODAY_COMPLETED';
              const isToday = item.status === 'TODAY_COMPLETED';

              const isMissed =
                item.status === 'MISSED' ||
                (!isAttended &&
                  todayIndex !== -1 &&
                  dayOrder.indexOf(item.dayOfWeek) !== -1 &&
                  dayOrder.indexOf(item.dayOfWeek) < todayIndex);

              return (
                <div key={index} className="flex flex-col items-center gap-2">
                  <div className="flex aspect-square h-10 w-10 shrink-0 items-center justify-center">
                    {isAttended ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="40"
                        height="40"
                        viewBox="0 0 40 40"
                        fill="none"
                        className="h-full w-full">
                        <circle cx="20" cy="20" r="17" className="fill-primary-400" />
                        <path
                          d="M13.5 20.3548L17.6472 25.7576C17.7453 25.7853 17.9339 25.796 18.0458 25.7803L27.5 16"
                          className="stroke-gray-950"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    ) : isMissed ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="40"
                        height="40"
                        viewBox="0 0 40 40"
                        fill="none"
                        className="h-full w-full">
                        <circle cx="20" cy="20" r="17" className="fill-gray-700" />
                        <path
                          d="M26.6828 13.4268L13.7582 26.3514"
                          className="stroke-gray-500"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M13.7582 13.4268L26.6828 26.3514"
                          className="stroke-gray-500"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="40"
                        height="40"
                        viewBox="0 0 40 40"
                        fill="none"
                        className="h-full w-full">
                        <circle
                          cx="20"
                          cy="20"
                          r="16.25"
                          className="stroke-gray-600"
                          strokeWidth="1.5"
                          strokeDasharray="5 5"
                        />
                      </svg>
                    )}
                  </div>
                  <span className={`text-xs font-semibold ${isToday ? 'text-primary-400' : 'text-gray-500'}`}>
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 우측 영역: 연습 시간 정보 보드 */}
        <div className="flex w-full max-w-[420px] flex-col lg:w-[320px] lg:min-w-[320px]">
          <div className="flex items-center justify-between gap-4 pb-3">
            <span className="text-primary-400 text-[22px] leading-[32px] font-medium tracking-[-0.02em]">
              주간 연습 시간
            </span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-primary-400 text-[52px] leading-[74px] font-semibold tracking-[-0.02em]">
                {practiceSummary.weeklyPracticeHours}
              </span>
              <span className="text-primary-400 text-[32px] leading-[44px] font-semibold tracking-[-0.02em]">h</span>
            </div>
          </div>
          <div className="h-[1px] w-full bg-gray-800" />
          <div className="flex items-center justify-between gap-4 pt-3">
            <span className="text-[22px] leading-[32px] font-medium tracking-[-0.02em] text-gray-300">
              {practiceSummary.monthLabel} 누적 연습 시간
            </span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-[32px] leading-[44px] font-semibold tracking-[-0.02em] text-gray-300">
                {practiceSummary.monthlyPracticeHours}
              </span>
              <span className="text-[22px] leading-[32px] font-medium tracking-[-0.02em] text-gray-300">h</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
