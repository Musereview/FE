export function getFilterTriggerClassName(isOpen: boolean) {
  return `button-small flex h-10 w-full shrink-0 items-center gap-1 rounded-[6px] border-[0.5px] py-1 pr-3.5 pl-[18px] whitespace-nowrap ${
    isOpen ? 'border-primary-400 text-primary-500' : 'border-gray-500 text-gray-300'
  }`;
}

export function getFilterChevronClassName(isOpen: boolean) {
  return `size-6 ${isOpen ? 'rotate-180 text-primary-500' : 'text-gray-400'}`;
}

export const FILTER_PANEL_BASE_CLASSNAME =
  'absolute top-[calc(100%+8px)] left-0 z-10 rounded-[6px] border-[0.5px] border-gray-600 bg-gray-700';

interface SelectableOptionStyleOptions {
  selected: boolean;
  selectedTypography?: string;
  unselectedTypography?: string;
  unselectedExtra?: string;
}

export function getSelectableOptionClassName({
  selected,
  selectedTypography = 'button-label2',
  unselectedTypography = 'button-label2',
  unselectedExtra = '',
}: SelectableOptionStyleOptions) {
  return selected
    ? `${selectedTypography} bg-primary-400 text-gray-950`
    : `${unselectedTypography} text-gray-200 ${unselectedExtra}`;
}
