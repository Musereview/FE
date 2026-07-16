import { useEffect, useRef, useState } from 'react';
import ChevronDownIcon from '@/assets/practice/chevron-down.svg?react';
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

const STEPPER_SIZE_CLASSNAME: Record<DropdownSize, string> = { compact: 'size-8', large: 'size-7' };
const VALUE_STEPPER_WRAPPER_CLASSNAME: Record<DropdownSize, string> = { compact: 'h-8 w-10', large: 'h-7 w-9' };
const VALUE_PILL_BASE_CLASSNAME = 'button-small size-full rounded-[2px] bg-gray-900 text-gray-200';

interface BpmDropdownProps {
  value: number;
  onChange: (value: number) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  size?: DropdownSize;
  showLabel?: boolean;
  className?: string;
}

function BpmDropdown({
  value,
  onChange,
  isOpen,
  onOpenChange,
  size = 'compact',
  showLabel = false,
  className = '',
}: BpmDropdownProps) {
  const setClampedValue = (next: number) => onChange(clampBpm(next));
  const containerRef = useRef<HTMLDivElement>(null);
  const stepperButtonClassName = getBpmStepperButtonClassName(STEPPER_SIZE_CLASSNAME[size]);

  const [isEditingValue, setIsEditingValue] = useState(false);
  const [draftValue, setDraftValue] = useState(String(value));

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onOpenChange(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onOpenChange]);

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
    <div ref={containerRef} className={`relative ${showLabel ? 'flex flex-col items-start gap-3' : ''} ${className}`}>
      {showLabel && <p className="body-regular2 w-full text-gray-300">BPM</p>}

      <button
        type="button"
        aria-label="BPM"
        onClick={() => onOpenChange(!isOpen)}
        className={getFilterTriggerClassName(isOpen, size)}>
        {showLabel ? value : 'BPM'}
        <ChevronDownIcon className={getFilterChevronClassName(isOpen, size)} />
      </button>

      {isOpen && (
        <div className={`${FILTER_PANEL_BASE_CLASSNAME} flex items-center ${PANEL_CLASSNAME[size]}`}>
          <div className={`flex ${SLIDER_WRAPPER_CLASSNAME[size]} flex-col gap-1`}>
            <input
              type="range"
              aria-label="BPM"
              min={BPM_MIN}
              max={BPM_MAX}
              value={value}
              onChange={(event) => setClampedValue(Number(event.target.value))}
              className={BPM_SLIDER_TRACK_CLASSNAME}
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
              onClick={() => setClampedValue(value - 1)}
              className={`${stepperButtonClassName} rounded-l-[4px]`}>
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
                  onClick={startEditingValue}
                  className={`${VALUE_PILL_BASE_CLASSNAME} flex cursor-text items-center justify-center`}>
                  {value}
                </button>
              )}
            </div>
            <button
              type="button"
              aria-label="BPM 증가"
              onClick={() => setClampedValue(value + 1)}
              className={`${stepperButtonClassName} rounded-r-[4px]`}>
              +
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BpmDropdown;
