export default function GrowthProgressSection() {
  return (
    <div className="flex w-[1196px] flex-col rounded-[6px] border border-gray-800 bg-gray-900 p-[40px]">
      {/* 그래프 및 라벨 리스트 영역  */}
      <div className="flex flex-col gap-[32px]">
        {/* 스케일 (+8) */}
        <div className="flex items-center justify-between">
          <div className="flex w-[120px] items-center justify-between">
            <span className="text-[16px] font-medium text-gray-500">스케일</span>
            <span className="text-primary-400 text-[16px] font-semibold">+8</span>
          </div>
          <div className="relative h-[24px] w-[720px] overflow-hidden rounded-full border-[0.5px] border-gray-600/40 bg-gray-950">
            <div className="absolute top-0 left-1/2 z-10 h-full w-[1px] bg-gray-800" />
            <div className="to-primary-400 absolute top-0 left-1/2 h-full w-[42%] rounded-r-full bg-gradient-to-r from-[#008751]" />
          </div>
        </div>

        {/* 텐션 (+6) */}
        <div className="flex items-center justify-between">
          <div className="flex w-[120px] items-center justify-between">
            <span className="text-[16px] font-medium text-gray-500">텐션</span>
            <span className="text-primary-400 text-[16px] font-semibold">+6</span>
          </div>
          <div className="relative h-[24px] w-[720px] overflow-hidden rounded-full border-[0.5px] border-gray-600/40 bg-gray-950">
            <div className="absolute top-0 left-1/2 z-10 h-full w-[1px] bg-gray-800" />
            <div className="to-primary-400 absolute top-0 left-1/2 h-full w-[35%] rounded-r-full bg-gradient-to-r from-[#008751]" />
          </div>
        </div>

        {/* 진행 (+4) */}
        <div className="flex items-center justify-between">
          <div className="flex w-[120px] items-center justify-between">
            <span className="text-[16px] font-medium text-gray-500">진행</span>
            <span className="text-primary-400 text-[16px] font-semibold">+4</span>
          </div>
          <div className="relative h-[24px] w-[720px] overflow-hidden rounded-full border-[0.5px] border-gray-600/40 bg-gray-950">
            <div className="absolute top-0 left-1/2 z-10 h-full w-[1px] bg-gray-800" />
            <div className="to-primary-400 absolute top-0 left-1/2 h-full w-[25%] rounded-r-full bg-gradient-to-r from-[#008751]" />
          </div>
        </div>

        {/* 코드 연결 (-10) */}
        <div className="flex items-center justify-between">
          <div className="flex w-[120px] items-center justify-between">
            <span className="text-[16px] font-medium text-gray-500">코드 연결</span>
            <span className="text-[16px] font-semibold text-purple-500">-10</span>
          </div>
          <div className="relative h-[24px] w-[720px] overflow-hidden rounded-full border-[0.5px] border-gray-600/40 bg-gray-950">
            <div className="absolute top-0 left-1/2 z-10 h-full w-[1px] bg-gray-800" />
            <div className="absolute top-0 right-1/2 h-full w-[50%] rounded-l-full bg-gradient-to-l from-[#4C1D95] to-purple-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
