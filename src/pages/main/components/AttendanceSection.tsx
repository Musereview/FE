// src/pages/main/components/AttendanceSection.tsx
interface AttendanceDay {
  dayOfWeek: string;
  label: string;
  status: string;
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

  return (
    <div
      className="mx-auto flex w-full max-w-[1831px] items-center justify-between gap-10 font-sans tracking-tight text-white select-none"
      style={{ padding: '44px 160px', background: 'linear-gradient(0deg, #1B1E27 0%, #0B0F19 100%)' }}>
      {/* 좌측 영역: 타이틀 + 일주일 출석 현황 */}
      <div className="flex shrink-0 flex-col gap-5">
        <div className="flex flex-col">
          <h2 className="font-sans text-[32px] leading-[44px] font-semibold tracking-[-0.02em] text-gray-300">
            {user.nickname} 님,
          </h2>
          <h2 className="font-sans text-[32px] leading-[44px] font-semibold tracking-[-0.02em] text-white">
            {streak.currentDays}일 연속 학습 중이에요!
          </h2>
        </div>

        <div className="flex shrink-0 items-center gap-3.5">
          {streak.weeklyAttendance.map((item, index) => {
            const isAttended = item.status === 'COMPLETED' || item.status === 'TODAY_COMPLETED';
            const isToday = item.status === 'TODAY_COMPLETED';

            const todayItem = streak.weeklyAttendance.find((d) => d.status === 'TODAY_COMPLETED');
            const todayIndex = todayItem ? dayOrder.indexOf(todayItem.dayOfWeek) : -1;

            const currentIndex = dayOrder.indexOf(item.dayOfWeek);
            const isMissed = !isAttended && todayIndex !== -1 && currentIndex !== -1 && currentIndex < todayIndex;

            return (
              <div key={index} className="flex shrink-0 flex-col items-center gap-2">
                <div className="flex aspect-square h-10 w-10 shrink-0 items-center justify-center">
                  {isAttended ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="40"
                      height="40"
                      viewBox="0 0 40 40"
                      fill="none"
                      className="h-full w-full">
                      <circle cx="20" cy="20" r="17" fill="#69FFC0" />
                      <path
                        d="M13.5 20.3548L17.6472 25.7576C17.7453 25.7853 17.9339 25.796 18.0458 25.7803L27.5 16"
                        stroke="#0B0F19"
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
                      <circle cx="20" cy="20" r="17" fill="#55585E" />
                      <path
                        d="M26.6828 13.4268L13.7582 26.3514"
                        stroke="#AEB1B6"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M13.7582 13.4268L26.6828 26.3514"
                        stroke="#AEB1B6"
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
                      <circle cx="20" cy="20" r="16.25" stroke="#868A91" strokeWidth="1.5" strokeDasharray="5 5" />
                    </svg>
                  )}
                </div>
                <span className={`text-xs font-semibold ${isToday ? 'text-[#69FFC0]' : 'text-gray-500'}`}>
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 우측 영역: 연습 시간 정보 보드 (Figma 스펙 전면 적용) */}
      <div className="flex w-[320px] min-w-[320px] shrink-0 flex-col">
        {/* 상단: 주간 연습 시간 */}
        <div className="flex items-center justify-between gap-4 pb-3">
          <span className="shrink-0 font-sans text-[22px] leading-[32px] font-medium tracking-[-0.02em] text-[#69FFC0]">
            주간 연습 시간
          </span>
          <div className="flex items-baseline gap-0.5">
            <span className="font-sans text-[52px] leading-[74px] font-semibold tracking-[-0.02em] text-[#69FFC0]">
              {practiceSummary.weeklyPracticeHours}
            </span>
            <span className="font-sans text-[32px] leading-[44px] font-semibold tracking-[-0.02em] text-[#69FFC0]">
              h
            </span>
          </div>
        </div>

        {/* 구분선 */}
        <div className="h-[1px] w-full shrink-0 bg-gray-800" />

        {/* 하단: 월 누적 연습 시간 */}
        <div className="flex items-center justify-between gap-4 pt-3">
          <span className="shrink-0 font-sans text-[22px] leading-[32px] font-medium tracking-[-0.02em] text-gray-300">
            {practiceSummary.monthLabel} 누적 연습 시간
          </span>
          <div className="flex items-baseline gap-0.5">
            <span className="font-sans text-[32px] leading-[44px] font-semibold tracking-[-0.02em] text-gray-300">
              {practiceSummary.monthlyPracticeHours}
            </span>
            <span className="font-sans text-[22px] leading-[32px] font-medium tracking-[-0.02em] text-gray-300">h</span>
          </div>
        </div>
      </div>
    </div>
  );
}
