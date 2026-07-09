import { useEffect, useRef } from 'react';
import ChevronDownIcon from '@/assets/practice/chevron-down.svg?react';
import {
  CREATE_FIELD_LABEL_CLASSNAME,
  getCreateFieldChevronClassName,
  getCreateFieldTriggerClassName,
} from './createFieldStyles';
import { BPM_MAX, BPM_MIN, BPM_SLIDER_TRACK_CLASSNAME, clampBpm, getBpmStepperButtonClassName } from '../bpmSlider';

const STEPPER_BUTTON_CLASSNAME = getBpmStepperButtonClassName('size-7');

interface BpmFieldProps {
  value: number;
  onChange: (value: number) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
}

function BpmField({ value, onChange, isOpen, onOpenChange, className = '' }: BpmFieldProps) {
  const setClampedValue = (next: number) => onChange(clampBpm(next));
  const containerRef = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={containerRef} className={`relative flex flex-col items-start gap-3 ${className}`}>
      <p className={CREATE_FIELD_LABEL_CLASSNAME}>BPM</p>

      <button
        type="button"
        aria-label="BPM"
        onClick={() => onOpenChange(!isOpen)}
        className={getCreateFieldTriggerClassName(isOpen)}>
        {value}
        <ChevronDownIcon className={getCreateFieldChevronClassName(isOpen)} />
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 z-10 flex w-[340px] items-center gap-4 rounded-[6px] border-[0.5px] border-gray-600 bg-gray-700 p-4">
          <div className="flex w-[190px] flex-col gap-1">
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
              <span className="button-label2 text-gray-400">{BPM_MIN}</span>
              <span className="button-label2 text-gray-400">{BPM_MAX}</span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              aria-label="BPM 감소"
              onClick={() => setClampedValue(value - 1)}
              className={`${STEPPER_BUTTON_CLASSNAME} rounded-l-[4px]`}>
              −
            </button>
            <div className="button-small bg-primary-400 flex h-7 w-9 items-center justify-center text-gray-950">
              {value}
            </div>
            <button
              type="button"
              aria-label="BPM 증가"
              onClick={() => setClampedValue(value + 1)}
              className={`${STEPPER_BUTTON_CLASSNAME} rounded-r-[4px]`}>
              +
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BpmField;
