import type { ReactNode } from 'react';
import ChevronDownIcon from '@/assets/practice/chevron-down.svg?react';

interface AccordionSectionProps {
  icon?: string;
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children?: ReactNode;
}

function AccordionSection({ icon, title, isOpen, onToggle, children }: AccordionSectionProps) {
  return (
    <div className="flex w-full flex-col gap-6 rounded-[6px] bg-gray-800 p-6">
      <button type="button" onClick={onToggle} className="flex w-full cursor-pointer items-center justify-between">
        <span className={`flex items-center gap-2 text-gray-200 ${icon ? 'body-large-b' : 'body-large-m'}`}>
          {icon && <span className="text-primary-400">{icon}</span>}
          {title}
        </span>
        <ChevronDownIcon className={`size-7 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && children}
    </div>
  );
}

export default AccordionSection;
