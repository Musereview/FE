import UploadIcon from '@/assets/practice/upload.svg?react';

interface AudioUploadFieldProps {
  file: File | null;
  onChange: (file: File | null) => void;
  className?: string;
}

function AudioUploadField({ file, onChange, className = '' }: AudioUploadFieldProps) {
  return (
    <div className={`flex flex-col items-start gap-3 ${className}`}>
      <label htmlFor="track-audio" className="body-regular2 w-full text-gray-300">
        오디오 파일 업로드 (선택)
      </label>

      <label
        htmlFor="track-audio"
        className="button-label2 flex h-12 w-full cursor-pointer items-center justify-center gap-1 rounded-[6px] bg-gray-800 p-3 text-gray-300">
        <UploadIcon className="size-6" />
        {file ? file.name : '파일 선택'}
      </label>

      <input
        id="track-audio"
        type="file"
        accept="audio/*"
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
        className="hidden"
      />
    </div>
  );
}

export default AudioUploadField;
