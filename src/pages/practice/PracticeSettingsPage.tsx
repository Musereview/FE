// 연주 트랙 설정 페이지 — 배경은 연습 플레이 화면과 동일한 UI(정적), 그 위에 설정 모달
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SettingsModal } from '@/components/settings/SettingsModal';
import Piano from '@/components/piano/Piano';
import MetronomeDots from '@/components/metronome/MetronomeDots';
import BackingTrack from '@/pages/practice/components/BackingTrack';
import { useSettingStore } from '@/stores/settingsStore';
import { ALL_TRACKS, RECOMMENDED_TRACKS } from '@/pages/practice/mockTracks';
import { buildFallbackProgression, MODE_LABEL } from '@/pages/practice/trackDisplay';
import PlayIcon from '@/assets/practice/play.svg?react';
import RefreshIcon from '@/assets/restart.svg?react';
import ChangeIcon from '@/assets/change.svg?react';
import CheckIcon from '@/assets/check.svg?react';
import SettingsIcon from '@/assets/setting.svg?react';

function PracticeSettingsPage() {
  const navigate = useNavigate();
  const { practiceId } = useParams();
  const { keyCount, setBpm, setBeatsPerBar } = useSettingStore();

  const track = [...ALL_TRACKS, ...RECOMMENDED_TRACKS].find((t) => t.id === practiceId) ?? RECOMMENDED_TRACKS[0];
  const beatsPerBar = Number(track.timeSignature.split('/')[0]); // '4/4' → 4
  const measures = track.chordProgression ?? buildFallbackProgression(track.chords, beatsPerBar);

  useEffect(() => {
    setBpm(track.bpm);
    setBeatsPerBar(beatsPerBar);
  }, [track.bpm, beatsPerBar, setBpm, setBeatsPerBar]);

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
        {/* 백킹트랙 + 진행점 */}
        <div className="flex flex-col gap-4">
          <BackingTrack measures={measures} currentBeat={-1} beatsPerBar={beatsPerBar} />
          <div className="absolute top-[113px] right-[160px] flex">
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
        onStart={() => navigate(`/practice/${practiceId}/play`)}
        onLatencyCheck={() => navigate(`/latency-check?from=practice`)}
      />
    </div>
  );
}

export default PracticeSettingsPage;
