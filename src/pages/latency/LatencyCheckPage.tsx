// 레이턴시 체크 페이지 (연습/학습 공용)
import Piano from '@/components/piano/Piano';
import { useActiveNotes } from '@/hooks/useActiveNotes';
import { useSettingStore } from '@/stores/settingsStore';

function LatencyCheckPage() {
  const { activeNotes } = useActiveNotes();
  const { keyCount } = useSettingStore();

  return (
    <div className="flex h-full flex-col px-[135px]">
      <h1 className="text-2xl font-bold">레이턴시 체크</h1>
      <div className="flex-1" />
      <Piano keyCount={keyCount} activeNotes={activeNotes} />
    </div>
  );
}

export default LatencyCheckPage;
