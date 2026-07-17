// 레이턴시 체크 페이지 (연습/학습 공용)
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Piano from '@/components/piano/Piano';
import NoteBars, { type NoteBar } from '@/components/piano/NoteBars';
import { noteCenterFraction } from '@/constants/piano';
import Metronome from '@/components/metronome/MetronomeDots';
import { useActiveNotes } from '@/hooks/useActiveNotes';
import { useMetronome } from '@/hooks/useMetronome';
import { useSettingStore } from '@/stores/settingsStore';
import RefreshIcon from '@/assets/restart.svg?react';
import * as Tone from 'tone';
import SettingsIcon from '@/assets/setting.svg?react';

type Phase = 'intro' | 'countdown' | 'measuring';

// 측정 설정
const COUNTDOWN_BEATS = 4; // 카운트다운 4박 (4,3,2,1)
const MEASURE_BEATS = 8; // 측정 8박
const TOTAL_BEATS = COUNTDOWN_BEATS + MEASURE_BEATS; // 총 12박
const VALID_WINDOW_MS = 250; // 정박 ±250ms 안이어야 유효 입력
const REQUIRED_SAMPLES = 3; // 유효 입력 3회 이상 → 성공

function LatencyCheckPage() {
  const navigate = useNavigate();
  const { keyCount, inputId, bpm, setLatency } = useSettingStore();
  const { start, stop } = useMetronome();

  const [phase, setPhase] = useState<Phase>('intro');
  const [beatInBar, setBeatInBar] = useState(-1);
  const [countdown, setCountdown] = useState<number | null>(null);

  // 친 음에서 솟아오르는 노트바 (measuring 중 입력마다 1개 생성)
  const [noteBars, setNoteBars] = useState<NoteBar[]>([]);
  const barIdRef = useRef(0);

  // 콜백 안에서 최신 phase 참조 (커밋된 렌더에서만 갱신되도록 effect에서 동기화)
  const phaseRef = useRef<Phase>('intro');
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // 측정 데이터
  const beatTimesRef = useRef<number[]>([]); // 측정 구간 정박 시각 (performance.now 기준)
  const samplesRef = useRef<number[]>([]); // 유효 offset 샘플
  const finishedRef = useRef(false);
  // intro부터 시작 (마운트 + 재시작 공용)
  const introTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 측정 완료 후 자동 복귀 타이머 (재시작/언마운트 시 취소 필요)
  const returnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 마지막 박 판정 유예 타이머 (마지막 박도 ±VALID_WINDOW_MS 늦은 입력까지 인정, 재시작/언마운트 시 취소 필요)
  const finishTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 측정용 MIDI 입력 (건반 하이라이트와 같은 useMidi 인스턴스를 공유 — measuring일 때만 기록)
  const { activeNotes } = useActiveNotes((note, _velocity, time) => {
    if (phaseRef.current !== 'measuring') return;

    // 친 음 위치에서 노트바 생성 (박자 유효 여부와 무관하게 시각 피드백)
    // 선택된 keyCount 범위 밖 노트는 NoteBars가 렌더링하지 않아 onAnimationEnd가 발동하지 않으므로 애초에 쌓지 않는다
    if (noteCenterFraction(note, keyCount) >= 0) {
      const id = barIdRef.current++;
      setNoteBars((prev) => [...prev, { id, midi: note }]);
    }

    const beats = beatTimesRef.current;
    if (beats.length === 0) return;

    const inputMs = time; // e.timeStamp — performance.now 기준
    const nearest = beats.reduce((a, b) => (Math.abs(b - inputMs) < Math.abs(a - inputMs) ? b : a));
    const offset = inputMs - nearest; // +면 늦게 침
    if (Math.abs(offset) <= VALID_WINDOW_MS) {
      samplesRef.current.push(offset);
    }
  });

  // 애니메이션 종료된 노트바 제거
  const handleBarDone = (id: number) => setNoteBars((prev) => prev.filter((b) => b.id !== id));

  // Tone time → performance.now 기준 ms
  const toPerfMs = (toneTime: number) => performance.now() + (toneTime - Tone.now()) * 1000;

  // 측정 종료 및 판정
  const finishMeasuring = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    stop();
    Tone.getDraw().cancel();

    const samples = samplesRef.current;

    if (samples.length >= REQUIRED_SAMPLES) {
      // offset(+) = 입력이 정박보다 늦음. 평균이 그 기기의 레이턴시(ms)
      const avg = samples.reduce((a, b) => a + b, 0) / samples.length;

      if (inputId) setLatency(inputId, Math.round(avg));
    } else {
      if (inputId) setLatency(inputId, 'failed');
    }

    // 1초 후 설정 모달로 복귀
    returnTimerRef.current = setTimeout(() => navigate(-1), 1000);
  };

  // 측정 흐름 (카운트다운 + 측정)
  const runMeasureFlow = () => {
    let totalBeat = 0;
    beatTimesRef.current = [];
    samplesRef.current = [];
    finishedRef.current = false;

    start(bpm, 4, (time, bib) => {
      const currentBeat = totalBeat;
      const isMeasure = currentBeat >= COUNTDOWN_BEATS;
      const isLastBeat = currentBeat === TOTAL_BEATS - 1;

      if (isMeasure) {
        beatTimesRef.current.push(toPerfMs(time));
      }

      Tone.getDraw().schedule(() => {
        setBeatInBar(bib);
        if (!isMeasure) {
          setCountdown(COUNTDOWN_BEATS - currentBeat);
        } else if (phaseRef.current !== 'measuring') {
          setPhase('measuring');
          setCountdown(null);
        }
        if (isLastBeat) {
          // 마지막 박도 다른 박과 동일하게 ±VALID_WINDOW_MS까지 늦은 입력을 인정하기 위해
          // 박 시각 직후가 아니라 유효 윈도우가 끝난 뒤 판정
          finishTimerRef.current = setTimeout(finishMeasuring, VALID_WINDOW_MS);
        }
      }, time);

      totalBeat += 1;
    });
  };

  const startFromIntro = () => {
    // 초기화
    setPhase('intro');
    setBeatInBar(-1);
    setCountdown(null);
    setNoteBars([]);
    finishedRef.current = false;

    introTimerRef.current = setTimeout(() => {
      setPhase('countdown');
      runMeasureFlow();
    }, 2000);
  };

  // 재시작 버튼
  const handleRestart = () => {
    if (introTimerRef.current) clearTimeout(introTimerRef.current);
    if (returnTimerRef.current) clearTimeout(returnTimerRef.current);
    if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
    stop();
    Tone.getDraw().cancel();
    startFromIntro(); // intro부터 다시
  };

  // 마운트 시 시작
  useEffect(() => {
    startFromIntro();

    return () => {
      if (introTimerRef.current) clearTimeout(introTimerRef.current);
      if (returnTimerRef.current) clearTimeout(returnTimerRef.current);
      if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
      stop();
      Tone.getDraw().cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative flex h-full flex-col">
      {/* 헤더 */}
      <header className="flex w-full items-center justify-between bg-gray-900 px-[160px] py-[28px]">
        <div className="heading-medium-b text-gray-200">레이턴시 체크</div>
        <button
          onClick={handleRestart}
          className="button-large2 flex h-[60px] w-[175px] items-center justify-center gap-2 rounded-[6px] bg-gray-800 px-3 py-[6px] text-gray-300">
          재시작
          <RefreshIcon className="h-5 w-5" />
        </button>
      </header>

      {/* intro 블러 오버레이 */}
      {phase === 'intro' && (
        <div className="absolute inset-0 z-30 bg-[#0B0F19]/90">
          <p className="heading-medium-b absolute top-[428px] left-1/2 -translate-x-1/2 text-center text-gray-200">
            박자에 맞춰 건반을 눌러주세요.
            <br />
            정확한 레이턴시 측정을 위해 3회 이상 입력해 주세요.
          </p>
        </div>
      )}

      {/* 본문 (노트바가 헤더 라인에서 잘려 사라지도록 overflow-hidden) */}
      <div className="relative flex flex-1 flex-col overflow-hidden px-[135px]">
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

        {/* 건반 영역 (+ 친 음에서 솟아오르는 노트바) */}
        <div className="relative mx-auto w-full max-w-[1560px]">
          {phase === 'measuring' && <NoteBars bars={noteBars} keyCount={keyCount} onBarDone={handleBarDone} />}
          <Piano
            keyCount={keyCount}
            activeNotes={activeNotes}
            rightSlot={
              <button
                onClick={() => navigate(-1)}
                className="flex cursor-pointer flex-col items-center gap-1"
                aria-label="설정">
                <SettingsIcon className="h-10 w-10" />
                <span className="button-small text-gray-600">설정</span>
              </button>
            }
          />
        </div>
      </div>
    </div>
  );
}

export default LatencyCheckPage;
