// 단계별 학습 설정 페이지 — 배경은 학습 플레이 화면과 동일한 UI(정적), 그 위에 설정 모달
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SettingsModal } from '@/components/settings/SettingsModal';
import Piano from '@/components/piano/Piano';
import LearningScoreView from '@/components/score/LearningScoreView';
import MetronomeDots from '@/components/metronome/MetronomeDots';
import BackingTrack from '@/pages/practice/components/BackingTrack';
import { buildFallbackProgression } from '@/pages/practice/trackDisplay';
import { useSettingStore } from '@/stores/settingsStore';
import { getCurriculum, getCurriculumProgress, getScorePath } from './mockCurriculum';
import PlayIcon from '@/assets/practice/play.svg?react';
import RefreshIcon from '@/assets/restart.svg?react';
import SettingsIcon from '@/assets/setting.svg?react';

// TODO(mock): 백킹트랙 코드 진행 — 학습 플레이 화면과 동일
const MOCK_CHORDS = ['Cm7(#11)', 'CM7(#11)', 'Dm7', 'Am7'];

function StepLearningSettingsPage() {
  const navigate = useNavigate();
  const { curriculumId = '' } = useParams();
  const { keyCount, setBpm, setBeatsPerBar } = useSettingStore();

  const curriculum = getCurriculum(curriculumId);
  const chapterNo = curriculumId.match(/\d+/)?.[0] ?? ''; // 'chapter-1' → '1'
  const title = chapterNo ? `${curriculum.title}-chapter ${chapterNo}` : curriculum.title;
  const bpm = curriculum.bpm;
  const beatsPerBar = Number(curriculum.timeSignature.split('/')[0]); // '4/4' → 4
  const measures = buildFallbackProgression(MOCK_CHORDS, beatsPerBar);
  const progress = getCurriculumProgress(curriculum.steps);

  useEffect(() => {
    setBpm(bpm);
    setBeatsPerBar(beatsPerBar);
  }, [bpm, beatsPerBar, setBpm, setBeatsPerBar]);

  return (
    <div className="flex h-full flex-col bg-gray-950">
      {/* 헤더 (학습 플레이 화면과 동일 — 배경, 비활성) */}
      <header className="flex h-[154px] w-full items-center justify-between bg-gray-900 px-[160px] py-[28px]">
        <div className="flex w-[403px] items-start gap-4">
          <div className="text-primary-400 flex items-center">
            <PlayIcon className="h-[52px] w-[52px]" />
          </div>
          <div className="flex flex-col items-start gap-6">
            <div className="heading-medium-b w-[500px] text-gray-200">{title}</div>
            <div className="inline-flex w-fit items-center gap-[24px] rounded-[4px] bg-gray-400 px-3 py-1">
              <span className="button-label2 text-gray-900">진행률 {progress}%</span>
              <span className="button-label2 text-gray-900">{bpm}BPM</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="button-large2 flex h-[60px] w-[175px] items-center justify-center gap-2 rounded-[6px] bg-gray-800 px-3 py-[6px] text-gray-300">
            재시작
            <RefreshIcon className="h-6 w-6" />
          </div>
          <div className="button-large2 bg-primary-400 flex h-[60px] w-[175px] items-center justify-center gap-2 rounded-[6px] px-3 py-[6px] text-gray-950">
            난이도 변경
          </div>
        </div>
      </header>

      {/* 본문 (학습 플레이 화면과 동일 — 정적) */}
      <div className="relative flex flex-1 flex-col px-[160px] pt-8">
        {/* 백킹트랙 + 진행점 (중앙 정렬, 반응형) */}
        <div className="relative mx-auto flex w-full max-w-[1510px] flex-col">
          <BackingTrack measures={measures} currentBeat={-1} beatsPerBar={beatsPerBar} />
          {/* top-[81px] = 본문 top-[113px] - pt-8(32px) */}
          <div className="absolute top-[81px] right-0 flex">
            <MetronomeDots total={beatsPerBar} current={-1} />
          </div>
        </div>

        {/* 악보 영역 (정적 — 진행/판정 없음) */}
        <div className="mx-auto mt-8 flex w-full max-w-[1510px] flex-1 items-center">
          <LearningScoreView
            xmlPath={getScorePath(curriculumId)}
            currentMeasureIndex={0}
            playheadBeat={-1}
            bpm={bpm}
            difficulty={curriculum.difficulty}
            visibleMeasures={3}
            height={600}
            className="w-full"
          />
        </div>

        {/* 건반 */}
        <div className="relative mx-auto w-full max-w-[1560px]">
          <Piano
            keyCount={keyCount}
            rightSlot={
              <div className="flex flex-col items-center gap-1">
                <SettingsIcon className="h-10 w-10" />
                <span className="button-small text-gray-600">설정</span>
              </div>
            }
          />
        </div>
      </div>

      <SettingsModal
        onClose={() => navigate(-1)}
        onStart={() => navigate(`/learn/curriculum/${curriculumId}/play`)}
        onLatencyCheck={() => navigate('/latency-check?from=learn')}
      />
    </div>
  );
}

export default StepLearningSettingsPage;
