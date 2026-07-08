import { useMidi } from '@/hooks/useMidi';
import { useSettingStore } from '@/stores/settingsStore';
import * as Tone from 'tone';
import CloseIcon from '@/assets/close.svg?react';
import CheckIcon from '@/assets/check.svg?react';

interface SettingsModalProps {
  onClose: () => void;
  onStart: () => void;
  startLabel?: string; // 대시보드/연습: '시작하기'(기본), 학습: '계속하기'
}

export function SettingsModal({ onClose, onStart, startLabel = '시작하기' }: SettingsModalProps) {
  const { inputs } = useMidi(); //기기목록만 사용
  const { inputId, bpm, keyCount, latencyMs, setInput, setBpm, setKeyCount } = useSettingStore();

  const handleStart = async () => {
    await Tone.start(); // 오디오 잠금 해제 - 클릭 핸들러 안에서만 가능
    onStart();
  };

  return (
    <div className="fixed inset-y-0 right-0 left-[90px] z-50 flex items-center justify-center bg-black/90">
      <div className="relative flex h-[960px] w-[960px] flex-col rounded-[10px] border-[0.3px] border-gray-600 bg-gray-900 px-[84px] pt-[60px]">
        {/* 닫힘 버튼 */}
        <button onClick={onClose} aria-label="닫기" className="absolute top-[29px] right-[38px]">
          <CloseIcon className="h-6 w-6" />
        </button>
        {/* 미디 입력, 출력 설정 */}
        <div className="flex w-[792px] flex-col items-start gap-6 border-b-[0.5px] border-gray-700 pt-6 pb-12">
          <p className="body-medium">미디 입력 및 출력 설정</p>
          <div className="flex w-full gap-3">
            <select
              value={inputId ?? ''}
              onChange={(e) => setInput(e.target.value)}
              className="button-medium flex h-[60px] w-[388px] items-center justify-center gap-2 rounded-[6px] border-gray-600 bg-gray-800 p-[12px] text-center">
              <option value="" disabled>
                Input
              </option>
              {inputs.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <div className="button-medium flex h-[60px] w-[388px] items-center justify-center gap-2 rounded-[6px] border-gray-600 bg-gray-800 p-[12px] text-center">
              Output
            </div>
          </div>
        </div>
        {/* 레이턴시 체크 - 측정 전/후 상태 분기 */}
        <div className="flex w-[792px] flex-col items-start gap-6 border-b-[0.5px] border-gray-700 py-12">
          <p className="body-medium">레이턴시 체크</p>
          <div className="flex w-full items-end justify-between">
            {latencyMs === null ? (
              <>
                <button className="button-large2 flex h-[60px] w-[190px] items-center justify-center gap-2 rounded-[6px] border border-gray-800 bg-gray-800 py-[6px] pr-3 pl-[14px]">
                  체크하기
                  <CheckIcon />
                </button>
                <p className="body-ragular1 text-right text-[#69FFC0]">시작 전 레이턴시를 체크해 주세요.</p>
              </>
            ) : (
              <>
                <button className="button-large2 flex h-[60px] w-[190px] items-center justify-center gap-[8px] rounded-[6px] px-[12px] py-[6px]">
                  재설정
                </button>
                <p className="body-ragular1 text-right text-[#69FFC0]">레이턴시 설정이 완료되었습니다.</p>
              </>
            )}
          </div>
        </div>
        {/* BPM */}
        <div className="flex w-[190px] flex-col items-start gap-6 py-12">
          <p className="body-medium">BPM</p>
          <input
            type="number"
            value={bpm}
            min={50}
            max={200}
            onChange={(e) => setBpm(Number(e.target.value))}
            className="button-medium flex h-[56px] items-center gap-1 self-stretch rounded-[6px] bg-gray-800 px-[18px] py-1"
          />
        </div>
        {/* 피아노 건반 개수 */}
        <div className="flex w-[190px] flex-col items-start gap-6 py-12">
          <p className="body-medium">피아노 건반 개수</p>
          <select
            value={keyCount}
            onChange={(e) => setKeyCount(Number(e.target.value) as 88 | 61)}
            className="flex h-[56px] items-center justify-between self-stretch rounded-[6px] bg-gray-800 px-[18px] py-1">
            <option value={88}>88</option>
            <option value={61}>61</option>
          </select>
        </div>
        <button
          onClick={handleStart}
          disabled={!inputId}
          className="button-large2 bg-primary-400 mt-auto mb-[36px] flex h-[60px] w-[346px] items-center justify-center gap-[8px] self-end rounded-[6px] px-[12px] py-[6px] text-gray-950">
          {startLabel}
        </button>
      </div>
    </div>
  );
}
