import { useEffect, useState } from 'react';
import ChevronDownIcon from '@/assets/practice/chevron-down.svg?react';
import Dropdown from '@/components/common/Dropdown';
import {
  FILTER_PANEL_BASE_CLASSNAME,
  getFilterChevronClassName,
  getFilterTriggerClassName,
  type DropdownSize,
} from './filterTriggerStyles';
import { BPM_MAX, BPM_MIN, BPM_SLIDER_TRACK_CLASSNAME, clampBpm, getBpmStepperButtonClassName } from './bpmSlider';

const PANEL_CLASSNAME: Record<DropdownSize, string> = {
  compact: 'w-[392px] gap-6 p-5',
  large: 'w-[340px] gap-4 p-4',
};

const SLIDER_WRAPPER_CLASSNAME: Record<DropdownSize, string> = {
  compact: 'w-[220px]',
  large: 'w-[190px]',
};

const RANGE_LABEL_CLASSNAME: Record<DropdownSize, string> = {
  compact: 'caption-regular text-gray-400',
  large: 'button-label2 text-gray-400',
};

const CONTENT_ROW_GAP_CLASSNAME: Record<DropdownSize, string> = { compact: 'gap-6', large: 'gap-4' };
const STEPPER_SIZE_CLASSNAME: Record<DropdownSize, string> = { compact: 'size-8', large: 'size-7' };
const VALUE_STEPPER_WRAPPER_CLASSNAME: Record<DropdownSize, string> = { compact: 'h-8 w-10', large: 'h-7 w-9' };
const VALUE_PILL_BASE_CLASSNAME = 'button-small size-full rounded-[2px] bg-gray-900 text-gray-200';

export type BpmFilterMode = 'all' | 'custom';

interface BpmDropdownProps {
  value: number;
  onChange: (value: number) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  size?: DropdownSize;
  showLabel?: boolean;
  className?: string;
  /** 전체(필터 없음)/직접 선택 토글 — 필터 용도로 쓸 때만 전달. 안 주면 토글 없이 항상 조작 가능(생성 폼 등). */
  mode?: BpmFilterMode;
  onModeChange?: (mode: BpmFilterMode) => void;
}

function BpmDropdown({
  value,
  onChange,
  isOpen,
  onOpenChange,
  size = 'compact',
  showLabel = false,
  className = '',
  mode,
  onModeChange,
}: BpmDropdownProps) {
  const setClampedValue = (next: number) => onChange(clampBpm(next));
  const stepperButtonClassName = getBpmStepperButtonClassName(STEPPER_SIZE_CLASSNAME[size]);
  const isRangeDisabled = mode === 'all';

  const [isEditingValue, setIsEditingValue] = useState(false);
  const [draftValue, setDraftValue] = useState(String(value));

  useEffect(() => {
    if (!isOpen) setIsEditingValue(false);
  }, [isOpen]);

  const startEditingValue = () => {
    setDraftValue(String(value));
    setIsEditingValue(true);
  };

  const commitDraftValue = () => {
    if (draftValue.trim() !== '') setClampedValue(Number(draftValue));
    setIsEditingValue(false);
  };

  const handleDraftKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') event.currentTarget.blur();
    else if (event.key === 'Escape') setIsEditingValue(false);
  };

  return (
    <Dropdown
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      containerClassName={`relative ${showLabel ? 'flex flex-col items-start gap-3' : ''} ${className}`}
      beforeTrigger={showLabel && <p className="body-regular2 w-full text-gray-300">BPM</p>}
      triggerAriaLabel="BPM"
      triggerClassName={getFilterTriggerClassName(isOpen, size)}
      trigger={
        <>
          {showLabel ? value : 'BPM'}
          <ChevronDownIcon className={getFilterChevronClassName(isOpen, size)} />
        </>
      }
      panelClassName={`${FILTER_PANEL_BASE_CLASSNAME} flex flex-col ${PANEL_CLASSNAME[size]}`}>
      {mode !== undefined && (
        <div className="flex items-center gap-6">
          <label className="relative flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="bpmFilterMode"
              className="peer sr-only"
              checked={mode === 'all'}
              onChange={() => onModeChange?.('all')}
            />
            <span className="size-5 shrink-0 rounded-full border-2 border-gray-500 peer-checked:border-transparent peer-checked:bg-gray-950" />
            <span className="bg-primary-400 absolute top-1/2 left-1 size-3 -translate-y-1/2 rounded-full opacity-0 peer-checked:opacity-100" />
            <span className="button-label2 text-gray-200">전체</span>
          </label>

          <label className="relative flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="bpmFilterMode"
              className="peer sr-only"
              checked={mode === 'custom'}
              onChange={() => onModeChange?.('custom')}
            />
            <span className="size-5 shrink-0 rounded-full border-2 border-gray-500 peer-checked:border-transparent peer-checked:bg-gray-950" />
            <span className="bg-primary-400 absolute top-1/2 left-1 size-3 -translate-y-1/2 rounded-full opacity-0 peer-checked:opacity-100" />
            <span className="button-label2 text-gray-200">직접 선택</span>
          </label>
        </div>
      )}

      <div className={`flex items-center ${CONTENT_ROW_GAP_CLASSNAME[size]} ${isRangeDisabled ? 'opacity-30' : ''}`}>
        <div className={`flex ${SLIDER_WRAPPER_CLASSNAME[size]} flex-col gap-1`}>
          <input
            type="range"
            aria-label="BPM"
            min={BPM_MIN}
            max={BPM_MAX}
            value={value}
            disabled={isRangeDisabled}
            onChange={(event) => setClampedValue(Number(event.target.value))}
            className={`${BPM_SLIDER_TRACK_CLASSNAME} disabled:cursor-default`}
          />
          <div className="flex items-center justify-between">
            <span className={RANGE_LABEL_CLASSNAME[size]}>{BPM_MIN}</span>
            <span className={RANGE_LABEL_CLASSNAME[size]}>{BPM_MAX}</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center">
          <button
            type="button"
            aria-label="BPM 감소"
            disabled={isRangeDisabled}
            onClick={() => setClampedValue(value - 1)}
            className={`${stepperButtonClassName} rounded-l-[4px] disabled:cursor-default`}>
            −
          </button>
          <div
            className={`bg-primary-400 flex ${VALUE_STEPPER_WRAPPER_CLASSNAME[size]} shrink-0 items-center justify-center p-0.5`}>
            {isEditingValue ? (
              <input
                type="text"
                inputMode="numeric"
                aria-label="BPM 직접 입력"
                autoFocus
                disabled={isRangeDisabled}
                value={draftValue}
                onChange={(event) => setDraftValue(event.target.value.replace(/[^0-9]/g, ''))}
                onBlur={commitDraftValue}
                onKeyDown={handleDraftKeyDown}
                className={`${VALUE_PILL_BASE_CLASSNAME} text-center outline-none`}
              />
            ) : (
              <button
                type="button"
                aria-label="BPM 직접 입력"
                disabled={isRangeDisabled}
                onClick={startEditingValue}
                className={`${VALUE_PILL_BASE_CLASSNAME} flex cursor-text items-center justify-center disabled:cursor-default`}>
                {value}
              </button>
            )}
          </div>
          <button
            type="button"
            aria-label="BPM 증가"
            disabled={isRangeDisabled}
            onClick={() => setClampedValue(value + 1)}
            className={`${stepperButtonClassName} rounded-r-[4px] disabled:cursor-default`}>
            +
          </button>
        </div>
      </div>
    </Dropdown>
  );
}

export default BpmDropdown;
