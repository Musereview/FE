import ChevronDownIcon from '@/assets/practice/chevron-down.svg?react';
import {
  FILTER_PANEL_BASE_CLASSNAME,
  getFilterChevronClassName,
  getFilterTriggerClassName,
  getSelectableOptionClassName,
} from './filterTriggerStyles';

interface SelectDropdownOption<T extends string> {
  value: T;
  label: string;
}

interface SelectDropdownProps<T extends string> {
  label: string;
  options: SelectDropdownOption<T>[];
  value: T;
  onChange: (value: T) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
}

function SelectDropdown<T extends string>({
  label,
  options,
  value,
  onChange,
  isOpen,
  onOpenChange,
  className = '',
}: SelectDropdownProps<T>) {
  const selectedLabel = options.find((option) => option.value === value)?.label ?? label;

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        aria-label={label}
        onClick={() => onOpenChange(!isOpen)}
        className={getFilterTriggerClassName(isOpen)}>
        {selectedLabel}
        <ChevronDownIcon className={getFilterChevronClassName(isOpen)} />
      </button>

      {isOpen && (
        <div className={`${FILTER_PANEL_BASE_CLASSNAME} flex min-w-full flex-col gap-1 p-2`}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                onOpenChange(false);
              }}
              className={`rounded-[4px] px-3 py-1.5 text-left whitespace-nowrap ${getSelectableOptionClassName({
                selected: value === option.value,
                unselectedExtra: 'hover:bg-gray-600',
              })}`}>
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default SelectDropdown;
