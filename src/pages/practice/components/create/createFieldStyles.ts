export const CREATE_FIELD_LABEL_CLASSNAME = 'body-regular2 w-full text-gray-300';

export function getCreateFieldTriggerClassName(isOpen: boolean) {
  return `button-small flex h-12 w-full items-center justify-between gap-1 rounded-[6px] border-[0.5px] px-4 py-1 whitespace-nowrap ${
    isOpen ? 'border-primary-400 text-primary-500' : 'border-gray-500 text-gray-500'
  }`;
}

export function getCreateFieldChevronClassName(isOpen: boolean) {
  return `size-5 ${isOpen ? 'rotate-180 text-primary-500' : 'text-gray-500'}`;
}

export const CREATE_FIELD_OPTION_PANEL_CLASSNAME =
  'absolute top-[calc(100%+20px)] left-0 z-10 flex w-full flex-col overflow-hidden rounded-[6px] border-[0.5px] border-gray-600';

export function getCreateFieldOptionRowClassName(selected: boolean) {
  return `button-small flex h-12 w-full items-center px-4 py-1 text-left whitespace-nowrap ${
    selected ? 'bg-primary-400 text-gray-950' : 'bg-gray-700 text-gray-300 hover:bg-primary-200 hover:text-gray-900'
  }`;
}
