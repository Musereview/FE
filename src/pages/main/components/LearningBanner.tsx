// // //진행 중인 학습 배너
// // src/pages/main/components/LearningBanner.tsx
// import { useNavigate } from 'react-router-dom';

// interface LearningBannerProps {
//   data: {
//     learningId: number;
//     title: string;
//     subtitle: string;
//     level: string; // "ADVANCED" | "INTERMEDIATE" | "BEGINNER"
//     progressRate: number; // 10
//   } | null;
// }

// export default function LearningBanner({ data }: LearningBannerProps) {
//   const navigate = useNavigate();

//   if (!data) {
//     return (
//       <div className="flex w-full max-w-[1831px] mx-auto items-center justify-center h-[198px] px-[160px] text-gray-400 bg-[#0B0F19] rounded-2xl border border-gray-800 tracking-tight">
//         현재 진행 중인 학습이 없습니다.
//       </div>
//     );
//   }

//   const { learningId, title, subtitle, level, progressRate } = data;
//   const levelLabel = level === 'ADVANCED' ? '고급' : level === 'INTERMEDIATE' ? '중급' : '초급';

//   return (
//     <div
//       onClick={() => navigate(`/learn/curriculum/${learningId}`)}

//       className="flex w-full max-w-[1831px] mx-auto justify-between items-end p-8 h-[198px] text-white rounded-[20px] cursor-pointer tracking-tight select-none transition-all duration-300 hover:scale-[1.005] active:scale-[0.995] shrink-0 min-w-[1024px] overflow-hidden"

//       style={{
//         background: 'linear-gradient(90deg, #2E0854 0%, #111827 50%, #115E59 100%)',
//       }}
//     >
//       {/* ── 좌측 영역: 타이틀 & 설명 ── */}
//       <div className="flex flex-col gap-1.5 shrink-0 text-left">
//         <div className="flex items-center gap-2.5">
//           <h3 className="text-[28px] font-bold text-white tracking-tight whitespace-nowrap">
//             {title}
//           </h3>

//           <span className="px-3 py-0.5 text-xs font-semibold rounded-full bg-[#1F1E33]/80 text-[#AEB1B6] border border-[#3E3D59]">
//             {levelLabel}
//           </span>
//         </div>
//         <p className="text-base font-normal text-gray-200/90 whitespace-nowrap">
//           {subtitle}
//         </p>
//       </div>

//       {/* ── 우측 영역: 진행률 %  ── */}
//       <div className="text-right shrink-0 whitespace-nowrap">
//         <span className="text-xl font-medium text-white/80 mr-2">진행률</span>
//         <span className="text-[24px] font-bold text-white tracking-tighter">
//           {progressRate}%
//         </span>
//       </div>

//     </div>
//   );
// }
// src/pages/main/components/LearningBanner.tsx
import { useNavigate } from 'react-router-dom';
import bannerBg from '@/assets/main/image-mesh-gradient.png';

interface LearningBannerProps {
  data: {
    learningId: number;
    title: string;
    subtitle: string;
    level: string;
    progressRate: number;
  } | null;
}

export default function LearningBanner({ data }: LearningBannerProps) {
  const navigate = useNavigate();

  if (!data) return null;

  const { learningId, title, subtitle, level, progressRate } = data;
  const levelLabel = level === 'ADVANCED' ? '고급' : level === 'INTERMEDIATE' ? '중급' : '초급';

  return (
    <div className="flex w-full flex-col gap-3.5 text-left">
      {/* 섹션 라벨 타이틀 */}
      <h2 className="text-xl font-bold tracking-tight text-white">진행 중인 학습</h2>

      {/* 배너 카드 본체 */}
      <div
        onClick={() => navigate(`/learn/curriculum/${learningId}`)}

        className="flex h-[198px] w-full cursor-pointer items-end justify-between overflow-hidden rounded-[6px] bg-cover bg-center bg-no-repeat p-8 text-white"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(11, 15, 25, 0.00) 44.7%, rgba(11, 15, 25, 0.70) 100%), url(${bannerBg})`,
        }}>
        {/* ── 좌측 영역: 타이틀 & 설명 ── */}
        <div className="flex shrink-0 flex-col gap-2 text-left">
          <div className="flex items-center gap-2.5">
            <h3 className="text-[28px] leading-none font-bold tracking-tight text-white">{title}</h3>
            <span className="rounded-full border border-[#3E3D59] bg-[#1F1E33]/80 px-3 py-1 text-xs leading-none font-semibold text-[#AEB1B6]">
              {levelLabel}
            </span>
          </div>
          <p className="text-base font-normal tracking-tight text-gray-300">{subtitle}</p>
        </div>

        {/* ── 우측 영역: 진행률 % 표기 ── */}
        <div className="shrink-0 pb-0.5 text-right">
          <span className="mr-2 text-xl font-medium tracking-tight text-white/80">진행률</span>
          <span className="text-[24px] leading-none font-bold tracking-tighter text-white">{progressRate}%</span>
        </div>
      </div>
    </div>
  );
}
