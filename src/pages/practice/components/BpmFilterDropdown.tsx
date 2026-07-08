import ChevronDownIcon from '@/assets/practice/chevron-down.svg?react';
import {
  FILTER_PANEL_BASE_CLASSNAME,
  getFilterChevronClassName,
  getFilterTriggerClassName,
} from './filterTriggerStyles';

const BPM_MIN = 50;
const BPM_MAX = 200;

const SLIDER_CLASSNAME =
  'h-1 w-full cursor-pointer appearance-none rounded-full bg-gray-950 ' +
  '[&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-300 ' +
  '[&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-primary-300';

const STEPPER_BUTTON_CLASSNAME =
  'button-small flex size-8 shrink-0 items-center justify-center bg-primary-400 text-gray-950';

interface BpmFilterDropdownProps {
  value: number;
  onChange: (value: number) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

function BpmFilterDropdown({ value, onChange, isOpen, onOpenChange }: BpmFilterDropdownProps) {
  const setClampedValue = (next: number) => onChange(Math.min(Math.max(next, BPM_MIN), BPM_MAX));

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
              className={SLIDER_CLASSNAME}
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
