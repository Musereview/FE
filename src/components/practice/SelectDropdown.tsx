import ChevronDownIcon from '@/assets/practice/chevron-down.svg?react';
import Dropdown from '@/components/common/Dropdown';
import {
  FILTER_OPTION_LIST_PANEL_CLASSNAME,
  getFilterChevronClassName,
  getFilterTriggerClassName,
  getSelectableOptionRowClassName,
  type DropdownSize,
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
  size?: DropdownSize;
  showLabel?: boolean;
  hideLabel?: boolean;
  className?: string;
}

function SelectDropdown<T extends string>({
  label,
  options,
  value,
  onChange,
  isOpen,
  onOpenChange,
  size = 'compact',
  showLabel = false,
  hideLabel = false,
  className = '',
}: SelectDropdownProps<T>) {
  const selectedLabel = options.find((option) => option.value === value)?.label ?? label;

  return (
    <Dropdown
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      containerClassName={`relative ${showLabel ? 'flex flex-col items-start gap-3' : ''} ${className}`}
      beforeTrigger={
        showLabel && (
          <p className={`body-regular2 w-full text-gray-300 ${hideLabel ? 'invisible' : ''}`}>{label || ' '}</p>
        )
      }
      triggerAriaLabel={label}
      triggerClassName={getFilterTriggerClassName(isOpen, size)}
      trigger={
        <>
          {selectedLabel}
          <ChevronDownIcon className={getFilterChevronClassName(isOpen, size)} />
        </>
      }
      panelClassName={FILTER_OPTION_LIST_PANEL_CLASSNAME}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => {
            onChange(option.value);
            onOpenChange(false);
          }}
          className={getSelectableOptionRowClassName(value === option.value, size)}>
          {option.label}
        </button>
      ))}
    </Dropdown>
  );
}

export default SelectDropdown;
