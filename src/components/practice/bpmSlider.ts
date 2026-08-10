export const BPM_MIN = 50;
export const BPM_MAX = 200;

export function clampBpm(value: number) {
  return Math.min(Math.max(value, BPM_MIN), BPM_MAX);
}

export const BPM_SLIDER_TRACK_CLASSNAME =
  'h-1 w-full cursor-pointer appearance-none rounded-full bg-gray-950 ' +
  '[&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-300 ' +
  '[&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-primary-300';

export function getBpmStepperButtonClassName(sizeClassName: string) {
  return `button-small flex ${sizeClassName} shrink-0 cursor-pointer items-center justify-center bg-primary-400 text-gray-950`;
}
