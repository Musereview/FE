// 연주 트랙 설정 페이지
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SettingsModal } from '@/components/settings/SettingsModal';
import Piano from '@/components/piano/Piano';
import { useSettingStore } from '@/stores/settingsStore';
import { ALL_TRACKS, RECOMMENDED_TRACKS } from '@/pages/practice/mockTracks';

function PracticeSettingsPage() {
  const navigate = useNavigate();
  const { practiceId } = useParams();
  const { keyCount, setBpm, setBeatsPerBar } = useSettingStore();

  useEffect(() => {
    // 추천/전체 목록 모두에서 곡 찾기
    const track = [...ALL_TRACKS, ...RECOMMENDED_TRACKS].find((t) => t.id === practiceId);
    if (track) {
      setBpm(track.bpm);
      setBeatsPerBar(Number(track.timeSignature.split('/')[0])); // '4/4'→4, '3/4'→3
    }
  }, [practiceId, setBpm, setBeatsPerBar]);

  return (
    <div className="flex h-full flex-col px-[135px]">
      <div className="flex-1" />
      <Piano keyCount={keyCount} />
      <SettingsModal
        onClose={() => navigate(`/practice/${practiceId}`)}
        onStart={() => navigate(`/practice/${practiceId}/play`)}
        onLatencyCheck={() => navigate(`/latency-check?from=practice`)}
      />
    </div>
  );
}

export default PracticeSettingsPage;
