export function getFilterTriggerClassName(isOpen: boolean) {
  return `button-small flex h-10 w-full shrink-0 items-center gap-1 rounded-[6px] border-[0.5px] py-1 pr-3.5 pl-[18px] whitespace-nowrap ${
    isOpen ? 'border-primary-400 text-primary-500' : 'border-gray-500 text-gray-300'
  }`;
}

export function getFilterChevronClassName(isOpen: boolean) {
  return `size-6 ${isOpen ? 'rotate-180 text-primary-500' : 'text-gray-400'}`;
}

const FILTER_PANEL_POSITION_CLASSNAME =
  'absolute top-[calc(100%+20px)] z-10 rounded-[6px] border-[0.5px] border-gray-600';

export const FILTER_PANEL_BASE_CLASSNAME = `${FILTER_PANEL_POSITION_CLASSNAME} left-1/2 -translate-x-1/2 bg-gray-700`;

export const FILTER_OPTION_LIST_PANEL_CLASSNAME = `${FILTER_PANEL_POSITION_CLASSNAME} left-0 flex min-w-full flex-col overflow-hidden`;

export function getSelectableOptionRowClassName(selected: boolean) {
  return `button-small flex h-10 w-full items-center px-[18px] py-1 text-left whitespace-nowrap ${
    selected ? 'bg-primary-400 text-gray-950' : 'bg-gray-700 text-gray-300 hover:bg-primary-200 hover:text-gray-900'
  }`;
}
