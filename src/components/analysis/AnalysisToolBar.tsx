// // import { ChevronLeft, Play, Pause, RotateCcw } from 'lucide-react';

// // interface AnalysisToolbarProps {
// //   isPlaying: boolean;
// //   startMeasure: number;
// //   endMeasure: number;

// //   onPlayToggle: () => void;
// //   onReset: () => void;
// //   onStartMeasureChange: (value: number) => void;
// //   onEndMeasureChange: (value: number) => void;
// //   onStartAnalysis: () => void;
// //   onBack: () => void;
// // }

// // export default function AnalysisToolbar({
// //   isPlaying,
// //   startMeasure,
// //   endMeasure,
// //   onPlayToggle,
// //   onReset,
// //   onStartMeasureChange,
// //   onEndMeasureChange,
// //   onStartAnalysis,
// //   onBack,
// // }: AnalysisToolbarProps) {
// //   return (
// //     <div className="flex flex-col gap-6">

// //       {/* 상단 */}
// //       <div className="flex items-center justify-between">

// //         <button
// //           onClick={onBack}
// //           className="flex items-center gap-2 text-gray-300 hover:text-white transition"
// //         >
// //           <ChevronLeft size={20} />
// //           <span>연습으로</span>
// //         </button>

// //         <div className="flex items-center gap-3">

// //           {/* 재생 */}
// //           <button
// //             onClick={onPlayToggle}
// //             className="rounded-lg bg-[#2B3140] p-3 hover:bg-[#3A4152] transition"
// //           >
// //             {isPlaying ? <Pause size={20} /> : <Play size={20} />}
// //           </button>

// //           {/* 처음으로 */}
// //           <button
// //             onClick={onReset}
// //             className="rounded-lg bg-[#2B3140] p-3 hover:bg-[#3A4152] transition"
// //           >
// //             <RotateCcw size={20} />
// //           </button>

// //         </div>
// //       </div>

// //       {/* 분석 구간 */}
// //       <div className="flex items-center gap-6">

// //         <div className="flex items-center gap-2">
// //           <span className="text-gray-300">시작 마디</span>

// //           <input
// //             type="number"
// //             min={1}
// //             value={startMeasure}
// //             onChange={(e) =>
// //               onStartMeasureChange(Number(e.target.value))
// //             }
// //             className="w-20 rounded-md bg-[#1B1F2A] px-3 py-2 text-center outline-none"
// //           />
// //         </div>

// //         <div className="flex items-center gap-2">
// //           <span className="text-gray-300">종료 마디</span>

// //           <input
// //             type="number"
// //             min={1}
// //             value={endMeasure}
// //             onChange={(e) =>
// //               onEndMeasureChange(Number(e.target.value))
// //             }
// //             className="w-20 rounded-md bg-[#1B1F2A] px-3 py-2 text-center outline-none"
// //           />
// //         </div>

// //         <button
// //           onClick={onStartAnalysis}
// //           className="ml-auto rounded-lg bg-[#4D6BFE] px-6 py-2 font-semibold hover:bg-[#3B59EA] transition"
// //         >
// //           분석하기
// //         </button>

// //       </div>
// //     </div>
// //   );
// // }
// import { Play, Pause, RotateCcw, ChevronRight } from 'lucide-react';

// interface Props {
//   isPlaying: boolean;
//   startMeasure: number;
//   endMeasure: number;

//   onPlayToggle: () => void;
//   onReset: () => void;

//   onStartMeasureChange: (value: number) => void;
//   onEndMeasureChange: (value: number) => void;

//   onStartAnalysis: () => void;
// }

// export default function AnalysisToolbar({
//   isPlaying,
//   startMeasure,
//   endMeasure,
//   onPlayToggle,
//   onReset,
//   onStartMeasureChange,
//   onEndMeasureChange,
//   onStartAnalysis,
// }: Props) {
//   return (
//     <div className="mt-10 flex items-end justify-between">
//       {/* 왼쪽 */}
//       <div className="flex items-center gap-5">
//         <button onClick={onPlayToggle} className="transition hover:scale-105">
//           {isPlaying ? (
//             <Pause size={34} fill="#69FFC0" color="#69FFC0" />
//           ) : (
//             <Play size={34} fill="#69FFC0" color="#69FFC0" />
//           )}
//         </button>

//         <button
//           onClick={onReset}
//           className="flex h-[52px] w-[52px] items-center justify-center rounded-md bg-[#2B2E36]">
//           <RotateCcw color="#CECFD1" size={22} />
//         </button>
//       </div>

//       {/* 오른쪽 */}

//       <div className="flex items-end gap-4">
//         <div className="flex flex-col gap-2">
//           <label className="text-[13px] text-[#86899C]">분석 시작 마디</label>

//           <input
//             type="number"
//             value={startMeasure}
//             onChange={(e) => onStartMeasureChange(Number(e.target.value))}
//             className="h-12 w-[150px] rounded-lg border border-[#2E3142] bg-[#1F212A] text-center outline-none"
//           />
//         </div>

//         <div className="flex flex-col gap-2">
//           <label className="text-[13px] text-[#86899C]">분석 종료 마디</label>

//           <input
//             type="number"
//             value={endMeasure}
//             onChange={(e) => onEndMeasureChange(Number(e.target.value))}
//             className="h-12 w-[150px] rounded-lg border border-[#2E3142] bg-[#1F212A] text-center outline-none"
//           />
//         </div>

//         <button
//           onClick={onStartAnalysis}
//           className="flex h-12 items-center gap-2 rounded-lg bg-[#69FFC0] px-7 font-bold text-[#090A0F]">
//           분석하기
//           <ChevronRight size={16} />
//         </button>
//       </div>
//     </div>
//   );
// }
