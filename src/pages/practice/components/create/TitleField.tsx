interface TitleFieldProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

function TitleField({ value, onChange, className = '' }: TitleFieldProps) {
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
        placeholder="제목을 입력하세요."
        className="button-small h-12 w-full rounded-[6px] bg-gray-800 px-4 py-3 text-gray-300 placeholder:text-gray-300"
      />
    </div>
  );
}

export default TitleField;
