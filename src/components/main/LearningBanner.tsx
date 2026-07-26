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

  // ── 💡 데이터가 없거나 모두 완료해서 진행 중인 학습이 없을 때 ──
  if (!data) {
    return (
      <div
        className="flex flex-col items-center justify-center text-center select-none"
        style={{
          height: '198px',
          padding: '32px',
          alignSelf: 'stretch',
          borderRadius: '6px',
          backgroundColor: '#1C1E24', // 시안의 차분하고 어두운 카드 배경색
        }}>
        <h4
          className="mb-2 font-sans font-bold tracking-wide text-white"
          style={{
            fontSize: '20px',
            lineHeight: '30px',
          }}>
          진행 중인 학습이 없습니다.
        </h4>
        <p
          className="font-sans tracking-wide text-gray-400"
          style={{
            fontSize: '14px',
            lineHeight: '22px',
          }}>
          새로운 학습을 시작하면 이곳에 표시됩니다.
        </p>
      </div>
    );
  }

  // ── 데이터가 있을 때 (기존 디자인 유지) ──
  const { learningId, title, subtitle, level, progressRate } = data;
  const isAdvanced = level === 'ADVANCED';

  return (
    <div
      onClick={() => navigate(`/learn/curriculum/${learningId}`)}
      className="cursor-pointer text-white transition-colors select-none hover:opacity-90"
      style={{
        display: 'flex',
        height: '198px',
        padding: '32px',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        alignSelf: 'stretch',
        borderRadius: '6px',
        backgroundImage: `linear-gradient(180deg, rgba(11, 15, 25, 0.00) 44.7%, rgba(11, 15, 25, 0.70) 100%), url(${bannerBg})`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: '0.132px 0px',
        backgroundSize: '100% 100%',
        backgroundColor: 'lightgray',
      }}>
      {/* 좌측 영역: 타이틀 & 설명 */}
      <div className="flex shrink-0 flex-col items-start gap-2 text-left">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="font-sans text-2xl font-bold tracking-tight">{title}</span>

          {/* 난이도 뱃지 */}
          <div
            style={{
              display: 'flex',
              width: '40px',
              padding: '4px 6px',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '10px',
              borderRadius: '999px',
              border: isAdvanced ? '0.5px solid #F0ABFF' : '0.5px solid #A2ACFF',
              background: '#1B1E27',
            }}
            className="shrink-0">
            <span
              style={{
                fontFamily: 'Pretendard',
                fontSize: '12px',
                fontWeight: 600,
                color: isAdvanced ? '#F0ABFF' : '#A2ACFF',
              }}>
              {isAdvanced ? '고급' : '중급'}
            </span>
          </div>
        </div>
        <p className="font-sans text-sm tracking-wide text-gray-300">{subtitle}</p>
      </div>

      {/* 우측 영역: 진행률 */}
      <span
        className="font-normal whitespace-nowrap"
        style={{
          color: '#E7E7E8',
          fontFamily: 'Pretendard',
          fontSize: '20px',
          lineHeight: '30px',
          letterSpacing: '-0.4px',
        }}>
        진행률 {progressRate}%
      </span>
    </div>
  );
}
