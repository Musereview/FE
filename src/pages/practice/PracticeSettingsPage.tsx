// 연주 트랙 설정 페이지
import { useNavigate, useParams } from 'react-router-dom';
import { SettingsModal } from '@/components/settings/SettingsModal';
import Piano from '@/components/piano/Piano';
import { useSettingStore } from '@/stores/settingsStore';

function PracticeSettingsPage() {
  const navigate = useNavigate();
  const { practiceId } = useParams();
  const { keyCount } = useSettingStore(); // 초기값 88

  return (
    <div className="flex h-full flex-col px-[135px]">
      {/* 상단 빈 공간 — 건반을 바닥으로 밀어냄 */}
      <div className="flex-1" />

      {/* 배경 건반 (장식용 — activeNotes 없이) */}
      <Piano keyCount={keyCount} />
      <SettingsModal
        onClose={() => navigate(`/practice/${practiceId}`)} // X 클릭 → 상세 화면
        onStart={() => navigate(`/practice/${practiceId}/play`)} // 시작하기 → 연주 화면
        onLatencyCheck={() => navigate(`/latency-check`)} //체크하기 -> 레이턴시 체크 화면
      />
    </div>
  );
}

export default PracticeSettingsPage;
