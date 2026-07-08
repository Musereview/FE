import ChevronDownIcon from '@/assets/practice/chevron-down.svg?react';
import {
  FILTER_PANEL_BASE_CLASSNAME,
  getFilterChevronClassName,
  getFilterTriggerClassName,
} from './filterTriggerStyles';

const BPM_MIN = 0;
const BPM_MAX = 200;

interface BpmFilterDropdownProps {
  value: number | null;
  onChange: (value: number | null) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

function BpmFilterDropdown({ value, onChange, isOpen, onOpenChange }: BpmFilterDropdownProps) {
  return (
    <div className="relative">
      <button type="button" onClick={() => onOpenChange(!isOpen)} className={getFilterTriggerClassName(isOpen)}>
        BPM
        <ChevronDownIcon className={getFilterChevronClassName(isOpen)} />
      </button>

      {isOpen && (
        <div className={`${FILTER_PANEL_BASE_CLASSNAME} flex w-[220px] flex-col gap-2 p-[18px]`}>
          <label className="button-label2 text-gray-300" htmlFor="bpm-filter-input">
            0 ~ 200 BPM 이하
          </label>
          <input
            id="bpm-filter-input"
            type="number"
            min={BPM_MIN}
            max={BPM_MAX}
            placeholder="BPM 입력"
            value={value ?? ''}
            onChange={(event) => {
              const raw = event.target.value;
              onChange(raw === '' ? null : Number(raw));
            }}
            className="button-label2 focus:border-primary-400 h-8 rounded-[4px] border-[0.3px] border-gray-500 px-2 text-gray-100 placeholder:text-gray-500 focus:outline-none"
          />
        </div>
      )}
    </div>
  );
}

export default BpmFilterDropdown;
