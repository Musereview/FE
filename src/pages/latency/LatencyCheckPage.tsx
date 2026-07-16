// 레이턴시 체크 페이지 (연습/학습 공용)
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Piano from '@/components/piano/Piano';
import Metronome from '@/components/metronome/MetronomeDots';
import { useActiveNotes } from '@/hooks/useActiveNotes';
import { useMetronome } from '@/hooks/useMetronome';
import { useSettingStore } from '@/stores/settingsStore';
import RefreshIcon from '@/assets/restart.svg?react';
import * as Tone from 'tone';
import SettingsIcon from '@/assets/setting.svg?react';

type Phase = 'intro' | 'countdown' | 'measuring';

function LatencyCheckPage() {
  const navigate = useNavigate();
  const { activeNotes } = useActiveNotes();
  const { keyCount, inputId, bpm, setLatency } = useSettingStore();
  const { start, stop } = useMetronome();

  const [phase, setPhase] = useState<Phase>('intro');
  const [beatInBar, setBeatInBar] = useState(-1);
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownDoneRef = useRef(false);

  // 화면 진입 → intro 3초 후 카운트다운 시작
  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase('countdown');
      start(bpm, 4, (time, bib) => {
        Tone.getDraw().schedule(() => {
          setBeatInBar(bib);
          setCountdown(4 - bib);
          if (bib === 0 && countdownDoneRef.current) {
            setPhase('measuring');
            stop();
            Tone.getDraw().cancel();
          }
        }, time);

        if (bib === 3) countdownDoneRef.current = true;
      }); // ← start 콜백 닫기
    }, 2000); // ← setTimeout 닫기

    return () => {
      clearTimeout(timer);
      stop();
      Tone.getDraw().cancel();
    };
  }, []);

  // TODO: 실제 측정 로직 — 지금은 임시 저장
  const handleComplete = () => {
    if (inputId) setLatency(inputId, 20);
    navigate(-1);
  };

  return (
    <div className="relative flex h-full flex-col">
      {/* 헤더 */}
      <header className="flex w-full items-center justify-between bg-gray-900 px-[160px] py-[28px]">
        <div className="heading-medium-b text-gray-200">레이턴시 체크</div>
        <button className="button-large2 flex h-[60px] w-[175px] items-center justify-center gap-2 rounded-[6px] bg-gray-800 px-3 py-[6px] text-gray-300">
          재시작
          <RefreshIcon className="h-5 w-5" />
        </button>
      </header>

      {/* intro 블러 오버레이 — 화면 전체 덮음 */}
      {phase === 'intro' && (
        <div className="absolute inset-0 z-20 bg-[#0B0F19]/90">
          <p className="heading-medium-b absolute top-[428px] left-1/2 -translate-x-1/2 text-center text-gray-200">
            박자에 맞춰 건반을 눌러주세요.
            <br />
            정확한 레이턴시 측정을 위해 3회 이상 입력해 주세요.
          </p>
        </div>
      )}

      {/* 본문 */}
      <div className="relative flex flex-1 flex-col px-[135px]">
        {/* 진행 점 — 카운트다운/측정 단계에만 */}
        {phase !== 'intro' && (
          <div className="mt-[151px] flex justify-center">
            <Metronome total={4} current={beatInBar} />
          </div>
        )}

        {/* 가운데 콘텐츠 — 단계별 */}
        <div className="flex flex-1 flex-col items-center justify-center">
          {phase === 'countdown' && countdown !== null && (
            <span className="display-large absolute top-[266px] left-1/2 -translate-x-1/2 text-center text-gray-700">
              {countdown}
            </span>
          )}
          {/* phase === 'measuring' → 노트바 (나중에) */}
        </div>

        {/* TODO: 측정 로직 완성 시 제거 */}
        {phase === 'measuring' && (
          <button
            onClick={handleComplete}
            className="bg-primary-400 mx-auto mb-4 w-fit rounded-[6px] px-4 py-2 text-gray-950">
            측정 완료 (임시)
          </button>
        )}

        {/* 건반 영역 */}
        <Piano
          keyCount={keyCount}
          activeNotes={activeNotes}
          rightSlot={
            <button className="flex cursor-pointer flex-col items-center gap-1" aria-label="설정">
              <SettingsIcon className="h-10 w-10" />
              <span className="button-small text-gray-600">설정</span>
            </button>
          }
        />
      </div>
    </div>
  );
}

export default LatencyCheckPage;
