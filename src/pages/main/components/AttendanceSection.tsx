//출석 현황 섹션

interface AttendanceDay {
  dayOfWeek: string;
  label: string;
  status: string; //  "COMPLETED" | "TODAY_COMPLETED" | "EMPTY"
}

interface AttendanceSectionProps {
  data: {
    user: {
      nickname: string;
    };
    streak: {
      currentDays: number;
      message: string;
      weeklyAttendance: AttendanceDay[];
    };
    practiceSummary: {
      weeklyPracticeHours: number;
      monthlyPracticeHours: number;
      monthLabel: string;
    };
  };
}

export default function AttendanceSection({ data }: AttendanceSectionProps) {
  const { user, streak, practiceSummary } = data;

  // 요일 순서 인덱스 매핑 (월~일 순서대로 0~6)
  const dayOrder = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  return (
    <div className="mx-auto flex w-full max-w-[1831px] min-w-[1024px] items-center justify-between gap-10 overflow-x-auto bg-[#090A0F] px-[160px] py-[44px] tracking-tight text-white select-none">
      {/* ── 좌측 영역: 출석 현황  ── */}
      <div className="flex shrink-0 flex-col gap-5">
        {/* 타이틀 */}
        <div className="whitespace-nowrap">
          <h2 className="text-xl font-normal text-gray-200">{user.nickname} 님,</h2>
          <h2 className="mt-0.5 text-xl font-bold text-white">{streak.currentDays}일 연속 학습 중이에요!</h2>
        </div>

        {/* 월~일 출석 리스트 */}
        <div className="flex shrink-0 items-center gap-3.5">
          {streak.weeklyAttendance.map((item, index) => {
            const isAttended = item.status === 'COMPLETED' || item.status === 'TODAY_COMPLETED';
            const isToday = item.status === 'TODAY_COMPLETED';

            // 오늘 날짜의 요일 인덱스 찾기
            const todayIndex = streak.weeklyAttendance.findIndex((d) => d.status === 'TODAY_COMPLETED');
            const currentIndex = dayOrder.indexOf(item.dayOfWeek);

            // 출석 실패(놓침) 조건: 출석 완료 상태가 아니고, 오늘보다 이전 요일일 때
            const isMissed = !isAttended && todayIndex !== -1 && currentIndex < todayIndex;

            return (
              <div key={index} className="flex shrink-0 flex-col items-center gap-2">
                <div className="flex aspect-square h-10 w-10 shrink-0 items-center justify-center">
                  {item.status === 'COMPLETED' || item.status === 'TODAY_COMPLETED' ? (
                    // 1) 출석 성공
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
                    // 2) 출석 놓침
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
                    // 3) 미래 요일 / 아직 안 온 날
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

                {/* 요일 라벨 */}
                <span className={`text-xs font-semibold ${isToday ? 'text-[#69FFC0]' : 'text-gray-500'}`}>
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 우측 영역: 연습 시간 통계  ── */}
      <div className="flex w-[280px] min-w-[280px] shrink-0 flex-col">
        {/* 주간 연습 시간 */}
        <div className="flex items-baseline justify-between gap-4 pb-3">
          <span className="shrink-0 text-sm font-semibold whitespace-nowrap text-[#69FFC0]">주간 연습 시간</span>
          <p className="text-[38px] leading-none font-bold tracking-tighter whitespace-nowrap text-[#69FFC0]">
            {practiceSummary.weeklyPracticeHours}
            <span className="ml-0.5 text-xl font-normal text-white">h</span>
          </p>
        </div>

        {/* 구분선 */}
        <div className="h-[1px] w-full shrink-0 bg-gray-800" />

        {/* 월간 누적 연습 시간 */}
        <div className="flex items-center justify-between gap-4 pt-3 text-sm">
          <span className="shrink-0 font-medium whitespace-nowrap text-gray-300">
            {practiceSummary.monthLabel} 누적 연습 시간
          </span>
          <p className="font-semibold whitespace-nowrap text-gray-300">{practiceSummary.monthlyPracticeHours}h</p>
        </div>
      </div>
    </div>
  );
}
