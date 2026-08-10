import type { KeyMode } from '@/types/track';
import ChevronDownIcon from '@/assets/practice/chevron-down.svg?react';
import Dropdown from '@/components/common/Dropdown';
import {
  FILTER_PANEL_BASE_CLASSNAME,
  getFilterChevronClassName,
  getFilterTriggerClassName,
} from './filterTriggerStyles';

const SHARP_NOTE_GROUPS = [
  ['D#', 'E#'],
  ['G#', 'A#', 'B#'],
];

const NATURAL_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

const KEY_MODES: { value: KeyMode; label: string }[] = [
  { value: 'major', label: 'Major' },
  { value: 'minor', label: 'Minor' },
];

interface KeyOptionButtonProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
  className?: string;
}

function KeyOptionButton({ label, selected, onSelect, className = 'w-9' }: KeyOptionButtonProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex h-8 cursor-pointer items-center justify-center rounded-[4px] ${className} ${
        selected
          ? 'button-label1 bg-primary-400 text-gray-950'
          : 'button-label2 hover:border-primary-200 hover:bg-primary-200 border-[0.3px] border-gray-500 text-gray-200 hover:text-gray-900'
      }`}>
      {label}
    </button>
  );
}

interface KeyFilterDropdownProps {
  keyValue: string;
  mode: KeyMode | null;
  onKeyValueChange: (value: string) => void;
  onModeChange: (mode: KeyMode | null) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

function KeyFilterDropdown({
  keyValue,
  mode,
  onKeyValueChange,
  onModeChange,
  isOpen,
  onOpenChange,
}: KeyFilterDropdownProps) {
  return (
    <Dropdown
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      containerClassName="relative w-[106px]"
      triggerClassName={getFilterTriggerClassName(isOpen)}
      trigger={
        <>
          Key
          <ChevronDownIcon className={getFilterChevronClassName(isOpen)} />
        </>
      }
      panelClassName={`${FILTER_PANEL_BASE_CLASSNAME} flex w-[312px] flex-col gap-3 p-[18px]`}>
      <div className="flex w-full flex-col items-center gap-1">
        <div className="flex items-center gap-[52px]">
          {SHARP_NOTE_GROUPS.map((group, index) => (
            <div key={index} className="flex items-center gap-1">
              {group.map((note) => (
                <KeyOptionButton
                  key={note}
                  label={note}
                  selected={keyValue === note}
                  onSelect={() => onKeyValueChange(keyValue === note ? '' : note)}
                />
              ))}
            </div>
          ))}
        </div>

        <div className="flex w-full items-center justify-center gap-1">
          {NATURAL_NOTES.map((note) => (
            <KeyOptionButton
              key={note}
              label={note}
              selected={keyValue === note}
              onSelect={() => onKeyValueChange(keyValue === note ? '' : note)}
            />
          ))}
        </div>
      </div>

      <div className="flex w-full items-center gap-2">
        {KEY_MODES.map((option) => (
          <KeyOptionButton
            key={option.value}
            label={option.label}
            selected={mode === option.value}
            onSelect={() => onModeChange(mode === option.value ? null : option.value)}
            className="flex-1"
          />
        ))}
      </div>
    </Dropdown>
  );
}

export default KeyFilterDropdown;
