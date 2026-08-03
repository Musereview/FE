interface MeasureSelectFormProps {
  startMeasure: string;
  endMeasure: string;
  onFocus: (val: string, setter: (v: string) => void) => void;
  onBlur: (val: string, setter: (v: string) => void, defaultVal: string) => void;
  onChange: (val: string, setter: (v: string) => void) => void;
  setStartMeasure: (v: string) => void;
  setEndMeasure: (v: string) => void;
  totalMeasures: number;
  onSubmit: () => void;
}

export default function MeasureSelectForm({
  startMeasure,
  endMeasure,
  onFocus,
  onBlur,
  onChange,
  setStartMeasure,
  setEndMeasure,
  totalMeasures,
  onSubmit,
}: MeasureSelectFormProps) {
  return (
    <div className="mt-[44px] flex items-end justify-between">
      <div className="flex items-end gap-4">
        {/* 분석 시작 마디 입력 박스 */}
        <div className="flex flex-col gap-2">
          <label className="w-full text-[20px] leading-[30px] font-normal tracking-[-0.4px] text-[#E7E7E8]">
            분석 시작 마디
          </label>
          <input
            type="text"
            value={startMeasure}
            onFocus={() => onFocus(startMeasure, setStartMeasure)}
            onBlur={() => onBlur(startMeasure, setStartMeasure, '1마디')}
            onChange={(e) => onChange(e.target.value, setStartMeasure)}
            className="h-[60px] w-[174px] rounded-[6px] bg-[#2B2E36] px-[18px] text-center text-[18px] leading-[30px] font-medium tracking-[-0.36px] text-[#E7E7E8] focus:outline-none"
          />
        </div>

        {/* 분석 종료 마디 입력 박스 */}
        <div className="flex flex-col gap-2">
          <label className="w-full text-[20px] leading-[30px] font-normal tracking-[-0.4px] text-[#E7E7E8]">
            분석 종료 마디
          </label>
          <input
            type="text"
            value={endMeasure}
            onFocus={() => onFocus(endMeasure, setEndMeasure)}
            onBlur={() => onBlur(endMeasure, setEndMeasure, `${totalMeasures}마디`)}
            onChange={(e) => onChange(e.target.value, setEndMeasure)}
            className="h-[60px] w-[174px] rounded-[6px] bg-[#2B2E36] px-[18px] text-center text-[18px] leading-[30px] font-medium tracking-[-0.36px] text-[#E7E7E8] focus:outline-none"
          />
        </div>
      </div>

      {/* 추가 분석하기 버튼 */}
      <button
        type="button"
        onClick={onSubmit}
        className="flex h-[60px] w-[366px] shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[6px] bg-[#69FFC0] px-[14px] py-[6px] transition-all hover:opacity-90 active:scale-[0.98]">
        <span className="text-[16px] font-bold text-[#1B1E27]">추가 분석하기</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          className="aspect-square shrink-0">
          <path
            d="M8.5 19.5L16.5 12L8.5 4.5"
            stroke="#1B1E27"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
