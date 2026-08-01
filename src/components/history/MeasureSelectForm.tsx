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
      <div className="flex items-end gap-[16px]">
        <div className="flex flex-col gap-[8px]">
          <label
            style={{
              alignSelf: 'stretch',
              color: '#E7E7E8',
              fontFamily: 'Pretendard',
              fontSize: '20px',
              fontStyle: 'normal',
              fontWeight: 400,
              lineHeight: '30px',
              letterSpacing: '-0.4px',
            }}>
            분석 시작 마디
          </label>
          <input
            type="text"
            value={startMeasure}
            onFocus={() => onFocus(startMeasure, setStartMeasure)}
            onBlur={() => onBlur(startMeasure, setStartMeasure, '1마디')}
            onChange={(e) => onChange(e.target.value, setStartMeasure)}
            style={{
              width: '174px',
              height: '60px',
              padding: '0 18px',
              borderRadius: '6px',
              background: '#2B2E36',
              color: '#E7E7E8',
              fontFamily: 'Pretendard',
              fontSize: '18px',
              fontStyle: 'normal',
              fontWeight: 500,
              lineHeight: '30px',
              letterSpacing: '-0.36px',
            }}
            className="text-center focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-[8px]">
          <label
            style={{
              alignSelf: 'stretch',
              color: '#E7E7E8',
              fontFamily: 'Pretendard',
              fontSize: '20px',
              fontStyle: 'normal',
              fontWeight: 400,
              lineHeight: '30px',
              letterSpacing: '-0.4px',
            }}>
            분석 종료 마디
          </label>
          <input
            type="text"
            value={endMeasure}
            onFocus={() => onFocus(endMeasure, setEndMeasure)}
            onBlur={() => onBlur(endMeasure, setEndMeasure, `${totalMeasures}마디`)}
            onChange={(e) => onChange(e.target.value, setEndMeasure)}
            style={{
              width: '174px',
              height: '60px',
              padding: '0 18px',
              borderRadius: '6px',
              background: '#2B2E36',
              color: '#E7E7E8',
              fontFamily: 'Pretendard',
              fontSize: '18px',
              fontStyle: 'normal',
              fontWeight: 500,
              lineHeight: '30px',
              letterSpacing: '-0.36px',
            }}
            className="text-center focus:outline-none"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={onSubmit}
        style={{
          display: 'flex',
          width: '366px',
          height: '60px',
          padding: '6px 12px 6px 14px',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          borderRadius: '6px',
          background: '#69FFC0',
        }}
        className="cursor-pointer transition-all hover:opacity-90 active:scale-[0.98]">
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
