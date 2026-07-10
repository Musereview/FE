import { useMidi } from '@/hooks/useMidi';
import { useSettingStore } from '@/stores/settingsStore';
import * as Tone from 'tone';
import CloseIcon from '@/assets/close.svg?react';
import CheckIcon from '@/assets/check.svg?react';
import DropdownIcon from '@/assets/dropdown.svg?react';
import { useState } from 'react';

interface SettingsModalProps {
  onClose: () => void;
  onStart: () => void;
  onLatencyCheck: () => void; // 레이턴시 체크 경로 (다를 수 있음)
  startLabel?: string; // 대시보드/연습: '시작하기'(기본), 학습: '계속하기'
}

export function SettingsModal({ onClose, onStart, onLatencyCheck, startLabel = '시작하기' }: SettingsModalProps) {
  const { inputs } = useMidi(); //기기목록만 사용
  const { inputId, bpm, keyCount, latencyByDevice, setInput, setKeyCount } = useSettingStore();
  const [inputOpen, setInputOpen] = useState(false);
  const [outputOpen, setOutputOpen] = useState(false);
  const [outputSelected, setOutputSelected] = useState(false);
  const [keyOpen, setKeyOpen] = useState(false);

  // 현재 선택된 기기의 레이턴시 (없으면 null)
  const latencyMs = inputId ? (latencyByDevice[inputId] ?? null) : null;

  const handleStart = async () => {
    await Tone.start(); // 오디오 잠금 해제 - 클릭 핸들러 안에서만 가능
    onStart();
  };

  return (
    <div className="fixed inset-y-0 right-0 left-[90px] z-50 flex items-center justify-center bg-black/90">
      <div className="relative flex h-[960px] w-[960px] flex-col rounded-[10px] border-[0.3px] border-gray-600 bg-gray-900 px-[84px] pt-[60px]">
        {/* 닫힘 버튼 */}
        <button onClick={onClose} aria-label="닫기" className="absolute top-[29px] right-[38px] cursor-pointer">
          <CloseIcon className="h-6 w-6" />
        </button>
        {/* 미디 입력, 출력 설정 */}
        <div className="flex w-[792px] flex-col items-start gap-6 border-b-[0.5px] border-gray-700 pt-6 pb-12">
          <p className="body-medium">미디 입력 및 출력 설정</p>
          <div className="flex w-full gap-3">
            {/* Input — 커스텀 드롭다운 */}
            <div className="relative w-[388px]">
              <button
                type="button"
                onClick={() => setInputOpen((v) => !v)}
                className={`button-medium flex h-[60px] w-full cursor-pointer items-center justify-center gap-3 rounded-[6px] border ${
                  inputOpen
                    ? 'text-primary-500 border-gray-800 bg-gray-800'
                    : 'border-transparent bg-gray-800 text-white'
                }`}>
                {inputs.find((d) => d.id === inputId)?.name ?? 'Input'}
                <DropdownIcon className={`h-6 w-6 shrink-0 ${inputOpen ? 'rotate-180' : ''}`} />
              </button>

              {inputOpen && (
                <ul className="absolute top-full z-10 mt-1 w-full overflow-hidden rounded-[6px] bg-gray-800">
                  {inputs.length === 0 && (
                    <li className="flex h-[48px] items-center justify-center text-gray-400">연결된 기기가 없습니다</li>
                  )}
                  {inputs.map((d) => (
                    <li key={d.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setInput(d.id);
                          setInputOpen(false);
                        }}
                        className={`h-[48px] w-full cursor-pointer text-center ${
                          inputId === d.id ? 'bg-primary-500 text-gray-950' : 'bg-gray-800 text-gray-300'
                        }`}>
                        {d.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Output : 시스템 설정 고정*/}
            <div className="relative w-[388px]">
              <button
                type="button"
                onClick={() => setOutputOpen((v) => !v)}
                className={`button-medium flex h-[60px] w-full cursor-pointer items-center justify-center gap-3 rounded-[6px] border ${
                  outputOpen
                    ? 'text-primary-500 border-gray-800 bg-gray-800'
                    : 'border-transparent bg-gray-800 text-white'
                }`}>
                {outputSelected ? '시스템 설정: 스피커' : 'Output'}
                <DropdownIcon className={`h-6 w-6 shrink-0 ${outputOpen ? 'rotate-180' : ''}`} />
              </button>

              {outputOpen && (
                <ul className="absolute top-full z-10 mt-1 w-full overflow-hidden rounded-[6px] bg-gray-800">
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        setOutputSelected(true);
                        setOutputOpen(false);
                      }}
                      className={`h-[48px] w-full cursor-pointer text-center ${
                        outputSelected ? 'bg-primary-500 text-gray-950' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}>
                      시스템 설정: 스피커
                    </button>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* 레이턴시 체크 - 측정 전/후 상태 분기 */}
        <div className="flex w-[792px] flex-col items-start gap-6 border-b-[0.5px] border-gray-700 py-12">
          <p className="body-medium">레이턴시 체크</p>
          <div className="flex w-full items-end justify-between">
            {latencyMs === null ? (
              <>
                <button
                  onClick={onLatencyCheck}
                  className="button-large2 flex h-[60px] w-[190px] cursor-pointer items-center justify-center gap-2 rounded-[6px] border border-gray-800 bg-gray-800 py-[6px] pr-3 pl-[14px]">
                  체크하기
                  <CheckIcon />
                </button>
                <p className="body-ragular1 text-right text-[#69FFC0]">시작 전 레이턴시를 체크해 주세요.</p>
              </>
            ) : (
              <>
                <button
                  onClick={onLatencyCheck}
                  className="button-large2 flex h-[60px] w-[190px] cursor-pointer items-center justify-center gap-[8px] rounded-[6px] bg-[#FF5D6B] px-[12px] py-[6px]">
                  재설정
                </button>
                <p className="body-ragular1 text-right text-[#69FFC0]">레이턴시 설정이 완료되었습니다.</p>
              </>
            )}
          </div>
        </div>
        {/* BPM — 곡 고정값, 표시 전용 */}
        <div className="flex w-[190px] flex-col items-start gap-6 py-12">
          <p className="body-medium">BPM</p>
          <div className="button-medium flex h-[56px] items-center self-stretch rounded-[6px] bg-gray-800 px-[18px] py-1 text-gray-400">
            {bpm}
          </div>
        </div>
        {/* 피아노 건반 개수 */}
        <div className="flex w-[190px] flex-col items-start gap-6 py-12">
          <p className="body-medium">피아노 건반 개수</p>

          <div className="relative self-stretch">
            <button
              type="button"
              onClick={() => setKeyOpen((v) => !v)}
              className={`button-medium flex h-[56px] w-full cursor-pointer items-center justify-between rounded-[6px] border px-[18px] py-1 ${
                keyOpen ? 'border-primary-400 text-primary-500 bg-gray-900' : 'border-gray-500 bg-gray-900'
              }`}>
              {keyCount}
              <DropdownIcon className={`h-[24px] w-[24px] ${keyOpen ? 'rotate-180' : ''}`} />
            </button>

            {keyOpen && (
              <ul className="absolute top-full z-10 mt-1 w-full overflow-hidden rounded-[6px]">
                {([88, 61] as const).map((n) => (
                  <li key={n}>
                    <button
                      type="button"
                      onClick={() => {
                        setKeyCount(n);
                        setKeyOpen(false);
                      }}
                      className={`button-medium h-[56px] w-full cursor-pointer px-[18px] text-left ${
                        keyCount === n
                          ? 'bg-primary-500 text-gray-950' // 선택된 옵션
                          : 'bg-gray-700 text-gray-300' // 나머지
                      }`}>
                      {n}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <button
          onClick={handleStart}
          disabled={!inputId || !outputSelected}
          className="button-large2 bg-primary-400 mt-auto mb-[36px] flex h-[60px] w-[346px] cursor-pointer items-center justify-center gap-[8px] self-end rounded-[6px] px-[12px] py-[6px] text-gray-950 disabled:cursor-default disabled:opacity-40">
          {startLabel}
        </button>
      </div>
    </div>
  );
}
