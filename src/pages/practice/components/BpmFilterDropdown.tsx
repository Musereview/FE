import ChevronDownIcon from '@/assets/practice/chevron-down.svg?react';
import {
  FILTER_PANEL_BASE_CLASSNAME,
  getFilterChevronClassName,
  getFilterTriggerClassName,
} from './filterTriggerStyles';
import { BPM_MAX, BPM_MIN, BPM_SLIDER_TRACK_CLASSNAME, clampBpm, getBpmStepperButtonClassName } from './bpmSlider';

const STEPPER_BUTTON_CLASSNAME = getBpmStepperButtonClassName('size-8');

interface BpmFilterDropdownProps {
  value: number;
  onChange: (value: number) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

function BpmFilterDropdown({ value, onChange, isOpen, onOpenChange }: BpmFilterDropdownProps) {
  const setClampedValue = (next: number) => onChange(clampBpm(next));

  return (
    <div className="relative">
      <button type="button" onClick={() => onOpenChange(!isOpen)} className={getFilterTriggerClassName(isOpen)}>
        BPM
        <ChevronDownIcon className={getFilterChevronClassName(isOpen)} />
      </button>

      {isOpen && (
        <div className={`${FILTER_PANEL_BASE_CLASSNAME} flex w-[392px] items-center gap-6 p-5`}>
          <div className="flex w-[220px] flex-col gap-1">
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
              <span className="caption-regular text-gray-400">{BPM_MIN}</span>
              <span className="caption-regular text-gray-400">{BPM_MAX}</span>
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
            <div className="button-small bg-primary-400 flex h-8 w-10 items-center justify-center text-gray-950">
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

export default BpmFilterDropdown;
