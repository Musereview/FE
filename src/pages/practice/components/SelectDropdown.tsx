import ChevronDownIcon from '@/assets/practice/chevron-down.svg?react';
import {
  FILTER_OPTION_LIST_PANEL_CLASSNAME,
  getFilterChevronClassName,
  getFilterTriggerClassName,
  getSelectableOptionRowClassName,
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
        <div className={FILTER_OPTION_LIST_PANEL_CLASSNAME}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                onOpenChange(false);
              }}
              className={getSelectableOptionRowClassName(value === option.value)}>
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default SelectDropdown;
