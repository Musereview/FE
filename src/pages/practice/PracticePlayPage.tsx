// 연습 플레이 페이지 - 61건반/88건반
import Piano from '@/components/piano/Piano';
import { useActiveNotes } from '@/hooks/useActiveNotes';

function PracticePlayPage() {
  const { activeNotes } = useActiveNotes();

  return (
    <div className="flex h-full flex-col px-[135px]">
      <h1 className="text-2xl font-bold">연습 시작</h1>

      {/* 나중에 여기에 떨어지는 노트바(canvas) 영역이 들어감 */}
      <div className="flex-1" />

      <Piano keyCount={88} activeNotes={activeNotes} />
    </div>
  );
}

export default PracticePlayPage;
