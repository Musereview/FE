// 레이턴시 체크 페이지 (연습/학습 공용)
import { useNavigate } from 'react-router-dom';
import Piano from '@/components/piano/Piano';
import { useActiveNotes } from '@/hooks/useActiveNotes';
import { useSettingStore } from '@/stores/settingsStore';

function LatencyCheckPage() {
  const navigate = useNavigate();
  const { activeNotes } = useActiveNotes();
  const { keyCount, inputId, setLatency } = useSettingStore();

  // TODO: 실제 측정 로직으로 대체 — 지금은 임시로 고정값 저장 후 복귀
  const handleComplete = () => {
    if (inputId) setLatency(inputId, 20);
    navigate(-1);
  };

  return (
    <div className="flex h-full flex-col px-[135px]">
      <h1 className="text-2xl font-bold">레이턴시 체크</h1>

      <button onClick={handleComplete} className="bg-primary-400 mt-4 w-fit rounded-[6px] px-4 py-2 text-gray-950">
        측정 완료 (임시)
      </button>

      <div className="flex-1" />
      <Piano keyCount={keyCount} activeNotes={activeNotes} />
    </div>
  );
}

export default LatencyCheckPage;
