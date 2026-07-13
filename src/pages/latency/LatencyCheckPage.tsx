// 레이턴시 체크 페이지 (연습/학습 공용)
import { useNavigate } from 'react-router-dom';
import Piano from '@/components/piano/Piano';
import Metronome from '@/components/metronome/MetronomeDots';
import { useActiveNotes } from '@/hooks/useActiveNotes';
import { useSettingStore } from '@/stores/settingsStore';
import RefreshIcon from '@/assets/restart.svg?react';

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
    <div className="flex h-full flex-col">
      {/* 상단 헤더 */}
      <header className="flex w-full items-center justify-between bg-gray-900 px-[160px] py-[28px]">
        <div className="heading-medium-b text-gray-200">레이턴시 체크</div>
        <button className="button-large2 flex h-[60px] w-[175px] items-center justify-center gap-2 rounded-[6px] bg-gray-800 px-3 py-[6px] text-gray-300">
          재시작
          <RefreshIcon className="h-5 w-5" />
        </button>
      </header>

      {/* TODO: 레이턴시 저장을 위한 임시 코드 — 측정 로직 완성 시 제거 */}
      <button onClick={handleComplete} className="bg-primary-400 mt-4 w-fit rounded-[6px] px-4 py-2 text-gray-950">
        측정 완료 (임시)
      </button>

      {/* 본문 */}
      <div className="relative flex flex-1 flex-col px-[135px]">
        {/* 진행 점 — 상단 중앙 (TODO: 측정 로직에서 current 연결) */}
        <div className="mt-[151px] flex justify-center">
          <Metronome total={4} current={0} />
        </div>

        {/* 노트바 영역 (나중에) */}
        <div className="flex-1" />

        <Piano keyCount={keyCount} activeNotes={activeNotes} />
      </div>
    </div>
  );
}

export default LatencyCheckPage;
