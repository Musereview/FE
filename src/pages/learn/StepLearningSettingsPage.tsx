// 단계별 학습 설정 페이지
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SettingsModal } from '@/components/settings/SettingsModal';
import Piano from '@/components/piano/Piano';
import { useSettingStore } from '@/stores/settingsStore';
import { getCurriculum } from './mockCurriculum';

function StepLearningSettingsPage() {
  const navigate = useNavigate();
  const { curriculumId } = useParams();
  const { keyCount, setBpm, setBeatsPerBar } = useSettingStore();

  useEffect(() => {
    if (!curriculumId) return;
    const curriculum = getCurriculum(curriculumId);
    setBpm(curriculum.bpm);
    setBeatsPerBar(Number(curriculum.timeSignature.split('/')[0])); // '4/4'→4, '3/4'→3
  }, [curriculumId, setBpm, setBeatsPerBar]);

  return (
    <div className="flex h-full flex-col px-[135px]">
      <div className="flex-1" />
      <Piano keyCount={keyCount} />
      <SettingsModal
        onClose={() => navigate(-1)}
        onStart={() => navigate(`/learn/curriculum/${curriculumId}/play`)}
        onLatencyCheck={() => navigate('/latency-check?from=learn')}
      />
    </div>
  );
}

export default StepLearningSettingsPage;
