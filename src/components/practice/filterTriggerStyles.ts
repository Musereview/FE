export type DropdownSize = 'compact' | 'large';

export function getFilterTriggerClassName(isOpen: boolean, size: DropdownSize = 'compact') {
  if (size === 'large') {
    return `button-small flex h-12 w-full items-center justify-between gap-1 rounded-[6px] border-[0.5px] px-4 py-1 whitespace-nowrap ${
      isOpen ? 'border-primary-400 text-primary-500' : 'border-gray-500 text-gray-500'
    }`;
  }
  return `button-small flex h-10 w-full shrink-0 items-center justify-between gap-1 rounded-[6px] border-[0.5px] py-1 pr-3.5 pl-[18px] whitespace-nowrap ${
    isOpen ? 'border-primary-400 text-primary-500' : 'border-gray-500 text-gray-300'
  }`;
}

export function getFilterChevronClassName(isOpen: boolean, size: DropdownSize = 'compact') {
  const sizeClassName = size === 'large' ? 'size-5' : 'size-6';
  const idleClassName = size === 'large' ? 'text-gray-500' : 'text-gray-400';
  return `${sizeClassName} ${isOpen ? 'rotate-180 text-primary-500' : idleClassName}`;
}

const FILTER_PANEL_POSITION_CLASSNAME =
  'absolute top-[calc(100%+20px)] z-10 rounded-[6px] border-[0.5px] border-gray-600';

export const FILTER_PANEL_BASE_CLASSNAME = `${FILTER_PANEL_POSITION_CLASSNAME} left-1/2 -translate-x-1/2 bg-gray-700`;

export const FILTER_OPTION_LIST_PANEL_CLASSNAME = `${FILTER_PANEL_POSITION_CLASSNAME} left-0 flex min-w-full flex-col overflow-hidden`;

export function getSelectableOptionRowClassName(selected: boolean, size: DropdownSize = 'compact') {
  const sizeClassName = size === 'large' ? 'h-12 px-4' : 'h-10 px-[18px]';
  return `button-small flex w-full items-center ${sizeClassName} py-1 text-left whitespace-nowrap ${
    selected ? 'bg-primary-400 text-gray-950' : 'bg-gray-700 text-gray-300 hover:bg-primary-200 hover:text-gray-900'
  }`;
}
