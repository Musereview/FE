// 학습 결과(점수) 페이지 — 프론트 채점 결과를 표시 (채점 로직은 다음 단계)
import { useNavigate, useParams } from 'react-router-dom';
import { getCurriculum, getNextCurriculumId } from './mockCurriculum';
import { useLearningScoreStore } from '@/stores/learningScoreStore';
import { buildFeedback } from '@/constants/scoreFeedback';
import RefreshIcon from '@/assets/restart.svg?react';
import ChevronRightIcon from '@/assets/check.svg?react';
import StarIcon from '@/assets/Star.svg?react';

function ScorePage() {
  const navigate = useNavigate();
  const { curriculumId = '' } = useParams();
  const curriculum = getCurriculum(curriculumId);
  const { result } = useLearningScoreStore();

  const title = `${curriculum.stepDescription.replace(/^-\s*/, '')} - 학습 결과`;
  const nextCurriculumId = getNextCurriculumId(curriculumId); // 다음 단계 (없으면 null)

  const stats = [
    { label: '정확도', value: `${result.accuracy}%` },
    { label: '리듬 타이밍', value: `${result.timing}%` },
    { label: '연속 성공', value: `${result.streak}콤보` },
    { label: '놓친 음', value: `${result.missedNotes}개` },
  ];

  return (
    <div className="relative mx-auto flex h-full w-full max-w-[1510px] flex-col items-center bg-gray-950">
      {/* 헤더 */}
      <header className="absolute top-[76px] mb-[32px] flex w-full items-center justify-between px-[80px]">
        <div className="heading-small-b h-[36px] w-[714px] text-gray-300">{title}</div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`/learn/curriculum/${curriculumId}/theory`)}
            className="button-large2 flex h-[60px] w-[174px] items-center justify-center rounded-[6px] bg-gray-800 px-5 text-gray-300">
            이론 보기
          </button>
          <button
            type="button"
            onClick={() => navigate(`/learn/curriculum/${curriculumId}/play`)}
            className="button-large2 mr-[16px] ml-[16px] flex h-[60px] w-[176px] items-center justify-center rounded-[6px] bg-gray-800 px-[12px] py-[6px] text-gray-300">
            다시하기
            <RefreshIcon className="ml-2 h-[24px] w-[24px]" />
          </button>
          {/* 다음 단계의 단계별 학습 페이지로 이동 (마지막 단계면 커리큘럼 목록으로) */}
          <button
            type="button"
            onClick={() => navigate(nextCurriculumId ? `/learn/curriculum/${nextCurriculumId}` : '/learn/curriculum')}
            className="button-large2 bg-primary-400 flex h-[60px] w-[174px] items-center justify-center rounded-[6px] py-1.5 pr-3 pl-3.5 text-gray-950">
            다음 학습으로
            <ChevronRightIcon className="ml-2 h-[24px] w-[24px]" />
          </button>
        </div>
      </header>

      {/* 결과 */}
      <div className="flex flex-1 flex-col items-center justify-center gap-12">
        <div className="flex flex-col items-center gap-5">
          <div className="display-small text-primary-400 text-center tracking-[-3px]">{result.score}점</div>
          <p className="heading-small-b flex items-center gap-2 text-gray-400">
            <StarIcon className="mr-2 h-[36px] w-[36px]" />
            {buildFeedback(result)}
          </p>
        </div>

        {/* 통계 — 하나의 연결된 컨테이너 안에 4개 항목 */}
        <div className="flex items-center rounded-[6px] bg-gray-900 px-2">
          {stats.map((s) => (
            <div key={s.label} className="flex w-[186px] flex-col items-center justify-center gap-2 py-6">
              <span className="body-medium text-gray-300">{s.label}</span>
              <span className="heading-medium-b text-primary-300">{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ScorePage;
