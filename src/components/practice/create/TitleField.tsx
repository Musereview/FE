import { useState } from 'react';
import { isValidTitle } from './titleValidation';

interface TitleFieldProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

function TitleField({ value, onChange, className = '' }: TitleFieldProps) {
  const [touched, setTouched] = useState(false);
  const showError = touched && !isValidTitle(value);

  return (
    <div className={`flex flex-col justify-center gap-3 ${className}`}>
      <label htmlFor="track-title" className="body-regular2 text-gray-300">
        제목
      </label>
      <input
        id="track-title"
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={() => setTouched(true)}
        placeholder="제목을 입력하세요."
        aria-invalid={showError}
        className="button-small focus:border-primary-400 h-12 w-full rounded-[6px] border-[0.5px] border-transparent bg-gray-800 px-4 py-3 text-gray-300 placeholder:text-gray-300 focus:outline-none"
      />
      {showError && <p className="caption-regular text-error">제목은 특수문자를 제외한 30자 이내로 작성해주세요.</p>}
    </div>
  );
}

export default TitleField;
