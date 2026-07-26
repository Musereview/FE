// src/pages/main/components/RecommandLearn.tsx
import { useNavigate } from 'react-router-dom';

interface RecommendationItem {
  learningId: number;
  title: string;
  level: string;
  description: string;
}

interface RecommendedLearningsProps {
  data: RecommendationItem[];
}

export default function RecommendedLearnings({ data }: RecommendedLearningsProps) {
  const navigate = useNavigate();

  return (
    <div className="flex w-full flex-col">
      <div className="flex w-full gap-4">
        {data.map((item) => {
          const isAdvanced = item.level === 'ADVANCED';

          return (
            <div
              key={item.learningId}
              onClick={() => navigate(`/learn/curriculum/${item.learningId}`)}

              className="cursor-pointer text-left transition-colors select-none hover:opacity-90"
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: '1',
                height: '198px',
                padding: '32px',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                borderRadius: '6px',
                background: '#2B2E36',
              }}>
              {/* ── 1) 상단 레이어: 노래 제목 & 난이도 뱃지  ── */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%' }}>
                <span
                  style={{
                    color: '#FFFFFF',
                    fontFamily: 'Pretendard',
                    fontSize: '24px',
                    fontStyle: 'normal',
                    fontWeight: 600,
                    lineHeight: '36px',
                    letterSpacing: '-0.48px',
                  }}>
                  {item.title}
                </span>

                {/* 난이도 뱃지 스타일 */}
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

              {/* ── 2) 하단 레이어: 설명 텍스트  ── */}
              <p
                className="w-full text-left whitespace-pre-line"
                style={{
                  color: '#E7E7E8',
                  fontFamily: 'Pretendard',
                  fontSize: '20px',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  lineHeight: '30px',
                  letterSpacing: '-0.4px',
                }}>
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
