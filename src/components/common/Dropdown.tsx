import { useRef, type ReactNode } from 'react';
import { useClickOutside } from '@/hooks/useClickOutside';

interface DropdownProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  beforeTrigger?: ReactNode;
  trigger: ReactNode;
  triggerClassName: string;
  triggerAriaLabel?: string;
  triggerAriaHasPopup?: React.AriaAttributes['aria-haspopup'];
  panelClassName: string;
  panelRole?: string;
  containerClassName?: string;
  children: ReactNode;
}

function Dropdown({
  isOpen,
  onOpenChange,
  beforeTrigger,
  trigger,
  triggerClassName,
  triggerAriaLabel,
  triggerAriaHasPopup,
  panelClassName,
  panelRole,
  containerClassName = 'relative',
  children,
}: DropdownProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  useClickOutside(containerRef, () => onOpenChange(false), isOpen);

  return (
    <div ref={containerRef} className={containerClassName}>
      {beforeTrigger}

      <button
        type="button"
        aria-label={triggerAriaLabel}
        aria-haspopup={triggerAriaHasPopup}
        aria-expanded={isOpen}
        onClick={() => onOpenChange(!isOpen)}
        className={`cursor-pointer ${triggerClassName}`}>
        {trigger}
      </button>

      {isOpen && (
        <div role={panelRole} className={panelClassName}>
          {children}
        </div>
      )}
    </div>
  );
}

export default Dropdown;
