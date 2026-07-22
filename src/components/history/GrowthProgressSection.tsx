// //1. 이번주 연주 요약 카드(3개)

// // src/components/history/GrowthProgressSection.tsx

// export default function GrowthProgressSection() {
//   return (
//     <div className="mb-[40px] rounded-[16px] bg-[#161B22] p-[32px] border border-[#2E3142]">
//       <div className="mb-[24px] flex items-center justify-between">
//         <h2 className="text-[18px] font-bold text-white">영역별 성장 변화</h2>
//         <span className="text-[14px] text-[#868C98]">지난주 대비 영역별 평균 점수 변화를 보여드려요.</span>
//       </div>
//       <div className="flex flex-col gap-[20px]">
//         {/* 스케일 */}
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-[16px] w-[140px]">
//             <span className="text-[15px] font-medium text-white">스케일</span>
//             <span className="text-[14px] font-bold text-[#69FFC0]">+8</span>
//           </div>
//           <div className="relative h-[12px] flex-1 rounded-full bg-[#2E3142] overflow-hidden ml-[20px]">
//             <div className="absolute left-0 top-0 h-full w-[75%] rounded-full bg-gradient-to-r from-[#69FFC0]/40 to-[#69FFC0]" />
//           </div>
//         </div>

//         {/* 텐션 */}
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-[16px] w-[140px]">
//             <span className="text-[15px] font-medium text-white">텐션</span>
//             <span className="text-[14px] font-bold text-[#69FFC0]">+6</span>
//           </div>
//           <div className="relative h-[12px] flex-1 rounded-full bg-[#2E3142] overflow-hidden ml-[20px]">
//             <div className="absolute left-0 top-0 h-full w-[65%] rounded-full bg-gradient-to-r from-[#69FFC0]/40 to-[#69FFC0]" />
//           </div>
//         </div>

//         {/* 진행 */}
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-[16px] w-[140px]">
//             <span className="text-[15px] font-medium text-white">진행</span>
//             <span className="text-[14px] font-bold text-[#69FFC0]">+4</span>
//           </div>
//           <div className="relative h-[12px] flex-1 rounded-full bg-[#2E3142] overflow-hidden ml-[20px]">
//             <div className="absolute left-0 top-0 h-full w-[55%] rounded-full bg-gradient-to-r from-[#69FFC0]/40 to-[#69FFC0]" />
//           </div>
//         </div>

//         {/* 코드 연결 */}
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-[16px] w-[140px]">
//             <span className="text-[15px] font-medium text-white">코드 연결</span>
//             <span className="text-[14px] font-bold text-[#A855F7]">-10</span>
//           </div>
//           <div className="relative h-[12px] flex-1 rounded-full bg-[#2E3142] overflow-hidden ml-[20px]">
//             <div className="absolute left-0 top-0 h-full w-[40%] rounded-full bg-gradient-to-r from-[#A855F7]/40 to-[#A855F7]" />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// src/components/history/GrowthProgressSection.tsx

// export default function GrowthProgressSection() {
//   return (
//     <div className="flex w-[1196px] flex-col rounded-[16px] bg-[#161B22] p-[40px] border border-[#2E3142]">

//       {/* 그래프 및 라벨 리스트 영역 (행마다 32px 간격) */}
//       <div className="flex flex-col gap-[32px]">

//         {/* 스케일 (+8) */}
//         <div className="flex items-center justify-between">
//           <div className="flex items-center w-[120px] justify-between">
//             <span className="text-[16px] font-medium text-[#AEB1B6]">스케일</span>
//             <span className="text-[16px] font-semibold text-[#69FFC0]">+8</span>
//           </div>
//           <div className="relative h-[24px] w-[720px] rounded-full bg-[#1B1E27] overflow-hidden border-[0.5px] border-[#868A91]/40">
//             <div className="absolute left-1/2 top-0 h-full w-[1px] bg-[#2E3142] z-10" />
//             <div className="absolute left-1/2 top-0 h-full w-[42%] rounded-r-full bg-gradient-to-r from-[#008751] to-[#69FFC0]" />
//           </div>
//         </div>

//         {/* 텐션 (+6) */}
//         <div className="flex items-center justify-between">
//           <div className="flex items-center w-[120px] justify-between">
//             <span className="text-[16px] font-medium text-[#AEB1B6]">텐션</span>
//             <span className="text-[16px] font-semibold text-[#69FFC0]">+6</span>
//           </div>
//           <div className="relative h-[24px] w-[720px] rounded-full bg-[#1B1E27] overflow-hidden border-[0.5px] border-[#868A91]/40">
//             <div className="absolute left-1/2 top-0 h-full w-[1px] bg-[#2E3142] z-10" />
//             <div className="absolute left-1/2 top-0 h-full w-[35%] rounded-r-full bg-gradient-to-r from-[#008751] to-[#69FFC0]" />
//           </div>
//         </div>

//         {/* 진행 (+4) */}
//         <div className="flex items-center justify-between">
//           <div className="flex items-center w-[120px] justify-between">
//             <span className="text-[16px] font-medium text-[#AEB1B6]">진행</span>
//             <span className="text-[16px] font-semibold text-[#69FFC0]">+4</span>
//           </div>
//           <div className="relative h-[24px] w-[720px] rounded-full bg-[#1B1E27] overflow-hidden border-[0.5px] border-[#868A91]/40">
//             <div className="absolute left-1/2 top-0 h-full w-[1px] bg-[#2E3142] z-10" />
//             <div className="absolute left-1/2 top-0 h-full w-[25%] rounded-r-full bg-gradient-to-r from-[#008751] to-[#69FFC0]" />
//           </div>
//         </div>

//         {/* 코드 연결 (-10) */}
//         <div className="flex items-center justify-between">
//           <div className="flex items-center w-[120px] justify-between">
//             <span className="text-[16px] font-medium text-[#AEB1B6]">코드 연결</span>
//             <span className="text-[16px] font-semibold text-[#A855F7]">-10</span>
//           </div>
//           <div className="relative h-[24px] w-[720px] rounded-full bg-[#1B1E27] overflow-hidden border-[0.5px] border-[#868A91]/40">
//             <div className="absolute left-1/2 top-0 h-full w-[1px] bg-[#2E3142] z-10" />
//             <div className="absolute right-1/2 top-0 h-full w-[50%] rounded-l-full bg-gradient-to-l from-[#4C1D95] to-[#A855F7]" />
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }
// src/components/history/GrowthProgressSection.tsx

export default function GrowthProgressSection() {
  return (
    <div className="flex w-[1196px] flex-col rounded-[6px] border border-[#2E3142] bg-[#161B22] p-[40px]">
      {/* 그래프 및 라벨 리스트 영역 (행마다 32px 간격) */}
      <div className="flex flex-col gap-[32px]">
        {/* 스케일 (+8) */}
        <div className="flex items-center justify-between">
          <div className="flex w-[120px] items-center justify-between">
            <span className="text-[16px] font-medium text-[#AEB1B6]">스케일</span>
            <span className="text-[16px] font-semibold text-[#69FFC0]">+8</span>
          </div>
          <div className="relative h-[24px] w-[720px] overflow-hidden rounded-full border-[0.5px] border-[#868A91]/40 bg-[#1B1E27]">
            <div className="absolute top-0 left-1/2 z-10 h-full w-[1px] bg-[#2E3142]" />
            <div className="absolute top-0 left-1/2 h-full w-[42%] rounded-r-full bg-gradient-to-r from-[#008751] to-[#69FFC0]" />
          </div>
        </div>

        {/* 텐션 (+6) */}
        <div className="flex items-center justify-between">
          <div className="flex w-[120px] items-center justify-between">
            <span className="text-[16px] font-medium text-[#AEB1B6]">텐션</span>
            <span className="text-[16px] font-semibold text-[#69FFC0]">+6</span>
          </div>
          <div className="relative h-[24px] w-[720px] overflow-hidden rounded-full border-[0.5px] border-[#868A91]/40 bg-[#1B1E27]">
            <div className="absolute top-0 left-1/2 z-10 h-full w-[1px] bg-[#2E3142]" />
            <div className="absolute top-0 left-1/2 h-full w-[35%] rounded-r-full bg-gradient-to-r from-[#008751] to-[#69FFC0]" />
          </div>
        </div>

        {/* 진행 (+4) */}
        <div className="flex items-center justify-between">
          <div className="flex w-[120px] items-center justify-between">
            <span className="text-[16px] font-medium text-[#AEB1B6]">진행</span>
            <span className="text-[16px] font-semibold text-[#69FFC0]">+4</span>
          </div>
          <div className="relative h-[24px] w-[720px] overflow-hidden rounded-full border-[0.5px] border-[#868A91]/40 bg-[#1B1E27]">
            <div className="absolute top-0 left-1/2 z-10 h-full w-[1px] bg-[#2E3142]" />
            <div className="absolute top-0 left-1/2 h-full w-[25%] rounded-r-full bg-gradient-to-r from-[#008751] to-[#69FFC0]" />
          </div>
        </div>

        {/* 코드 연결 (-10) */}
        <div className="flex items-center justify-between">
          <div className="flex w-[120px] items-center justify-between">
            <span className="text-[16px] font-medium text-[#AEB1B6]">코드 연결</span>
            <span className="text-[16px] font-semibold text-[#A855F7]">-10</span>
          </div>
          <div className="relative h-[24px] w-[720px] overflow-hidden rounded-full border-[0.5px] border-[#868A91]/40 bg-[#1B1E27]">
            <div className="absolute top-0 left-1/2 z-10 h-full w-[1px] bg-[#2E3142]" />
            <div className="absolute top-0 right-1/2 h-full w-[50%] rounded-l-full bg-gradient-to-l from-[#4C1D95] to-[#A855F7]" />
          </div>
        </div>
      </div>
    </div>
  );
}
