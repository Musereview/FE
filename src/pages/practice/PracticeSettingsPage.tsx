// 연주 트랙 설정 페이지 — 배경은 연습 플레이 화면과 동일한 UI(정적), 그 위에 설정 모달
import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SettingsModal } from '@/components/settings/SettingsModal';
import Piano from '@/components/piano/Piano';
import MetronomeDots from '@/components/metronome/MetronomeDots';
import BackingTrack from '@/components/practice/BackingTrack';
import { useSettingStore } from '@/stores/settingsStore';
import { usePlayingSessionStore } from '@/stores/playingSessionStore';
import { buildFallbackProgression, mapDetailToTrack, MODE_LABEL } from '@/pages/practice/trackDisplay';
import PlayIcon from '@/assets/practice/play.svg?react';
import RefreshIcon from '@/assets/restart.svg?react';
import ChangeIcon from '@/assets/change.svg?react';
import CheckIcon from '@/assets/check.svg?react';
import SettingsIcon from '@/assets/setting.svg?react';

function PracticeSettingsPage() {
  const navigate = useNavigate();
  const { keyCount, setBpm, setBeatsPerBar } = useSettingStore();
  const backingTrack = usePlayingSessionStore((s) => s.backingTrack);
  const track = useMemo(() => (backingTrack ? mapDetailToTrack(backingTrack) : null), [backingTrack]);
  const beatsPerBar = track ? Number(track.timeSignature.split('/')[0]) : 4; // '4/4' → 4
  const measures = track ? (track.chordProgression ?? buildFallbackProgression(track.chords, beatsPerBar)) : [];

  // 세션 없이(새로고침/직접 진입) 들어온 경우 — 연주 세션은 상세 모달 "연습 시작"에서만 생성되므로 목록으로 되돌림
  useEffect(() => {
    if (!backingTrack) navigate('/practice', { replace: true });
  }, [backingTrack, navigate]);

  useEffect(() => {
    if (!track) return;
    setBpm(track.bpm);
    setBeatsPerBar(beatsPerBar);
  }, [track, beatsPerBar, setBpm, setBeatsPerBar]);

  if (!track) return null;

  return (
    <div className="flex h-full flex-col bg-gray-950">
      {/* 헤더 (연습 화면과 동일 — 배경, 비활성) */}
      <header className="flex h-[154px] w-full items-center justify-between bg-gray-900 px-[160px] py-[28px]">
        <div className="flex w-[403px] items-start gap-4">
          <div className="text-primary-400 flex items-center">
            <PlayIcon className="h-[52px] w-[52px]" />
          </div>
          <div className="flex flex-col items-start gap-6">
            <div className="heading-medium-b w-[328px] text-gray-200">{track.title}</div>
            <div className="inline-flex w-fit items-center gap-[24px] rounded-[4px] bg-gray-400 px-3 py-1">
              <span className="button-label2 text-gray-900">{track.genre.toUpperCase()}</span>
              <span className="button-label2 text-gray-900">
                {track.key} {MODE_LABEL[track.mode]}
              </span>
              <span className="button-label2 text-gray-900">{track.bpm}BPM</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="button-large2 flex h-[60px] w-[175px] items-center justify-center gap-2 rounded-[6px] bg-gray-800 px-3 py-[6px] text-gray-300">
            재시작
            <RefreshIcon className="h-6 w-6" />
          </div>
          <div className="button-large2 flex h-[60px] w-[175px] items-center justify-center gap-2 rounded-[6px] bg-gray-800 px-3 py-[6px] text-gray-300">
            트랙 변경
            <ChangeIcon className="h-6 w-6" />
          </div>
          <div className="button-large2 bg-primary-400 flex h-[60px] w-[175px] items-center justify-center gap-2 rounded-[6px] px-3 py-[6px] text-gray-950">
            분석하기
            <CheckIcon className="h-6 w-6" />
          </div>
        </div>
      </header>

      {/* 본문 (연습 화면과 동일 — 정적) */}
      <div className="relative flex flex-1 flex-col px-[160px] pt-8">
        {/* 백킹트랙 + 진행점 (중앙 정렬, 반응형) — 진행점 본문 기준 top-113, 백킹트랙 오른쪽 정렬 */}
        <div className="relative mx-auto flex w-full max-w-[1510px] flex-col">
          <BackingTrack measures={measures} currentBeat={-1} beatsPerBar={beatsPerBar} />
          {/* top-[81px] = 본문 top-[113px] - pt-8(32px) */}
          <div className="absolute top-[81px] right-0 flex">
            <MetronomeDots total={beatsPerBar} current={-1} />
          </div>
        </div>

        {/* 건반 */}
        <div className="flex flex-1 flex-col justify-end">
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
      </div>

      <SettingsModal
        onClose={() => navigate(-1)}
        onStart={() => navigate(`/practice/${track.id}/play`)}
        onLatencyCheck={() => navigate(`/latency-check?from=practice`)}
      />
    </div>
  );
}

export default PracticeSettingsPage;
