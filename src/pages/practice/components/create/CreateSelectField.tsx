import { useEffect, useRef } from 'react';
import ChevronDownIcon from '@/assets/practice/chevron-down.svg?react';
import {
  CREATE_FIELD_LABEL_CLASSNAME,
  CREATE_FIELD_OPTION_PANEL_CLASSNAME,
  getCreateFieldChevronClassName,
  getCreateFieldOptionRowClassName,
  getCreateFieldTriggerClassName,
} from './createFieldStyles';

interface CreateSelectFieldOption<T extends string> {
  value: T;
  label: string;
}

interface CreateSelectFieldProps<T extends string> {
  label: string;
  hideLabel?: boolean;
  options: CreateSelectFieldOption<T>[];
  value: T;
  onChange: (value: T) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
}

function CreateSelectField<T extends string>({
  label,
  hideLabel = false,
  options,
  value,
  onChange,
  isOpen,
  onOpenChange,
  className = '',
}: CreateSelectFieldProps<T>) {
  const selectedLabel = options.find((option) => option.value === value)?.label ?? '';
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
      <p className={`${CREATE_FIELD_LABEL_CLASSNAME} ${hideLabel ? 'invisible' : ''}`}>{label || ' '}</p>

      <button
        type="button"
        aria-label={label}
        onClick={() => onOpenChange(!isOpen)}
        className={getCreateFieldTriggerClassName(isOpen)}>
        {selectedLabel}
        <ChevronDownIcon className={getCreateFieldChevronClassName(isOpen)} />
      </button>

      {isOpen && (
        <div className={CREATE_FIELD_OPTION_PANEL_CLASSNAME}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                onOpenChange(false);
              }}
              className={getCreateFieldOptionRowClassName(value === option.value)}>
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default CreateSelectField;
