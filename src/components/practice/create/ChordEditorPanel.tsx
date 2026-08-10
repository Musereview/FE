import { useEffect, useRef, useState } from 'react';
import SelectDropdown from '../SelectDropdown';
import { useClickOutside } from '@/hooks/useClickOutside';
import {
  NOTE_OPTIONS,
  QUALITY_OPTIONS,
  EXTENSION_OPTIONS,
  QUALITY_DISABLED_EXTENSIONS,
  QUALITY_LOCKED_EXTENSIONS,
  buildChordLabel,
  parseChordLabel,
  type ChordQuality,
  type ChordExtension,
} from './chordQuality';

const NOTE_SELECT_OPTIONS = [
  { value: '', label: '없음' },
  ...NOTE_OPTIONS.map((note) => ({ value: note, label: note })),
];

type OpenField = 'root' | 'bass' | null;

interface ChordEditorPanelProps {
  initialValue?: string;
  onApply: (chordLabel: string) => void;
  onCancel: () => void;
}

function ChordEditorPanel({ initialValue = '', onApply, onCancel }: ChordEditorPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const initial = parseChordLabel(initialValue);

  const [root, setRoot] = useState(initial.root);
  const [quality, setQuality] = useState<ChordQuality | null>(initial.quality);
  const [extensions, setExtensions] = useState<Set<ChordExtension>>(initial.extensions);
  const [bass, setBass] = useState(initial.bass);
  const [openField, setOpenField] = useState<OpenField>(null);

  useClickOutside(panelRef, onCancel);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onCancel();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const disabledExtensions = quality ? QUALITY_DISABLED_EXTENSIONS[quality] : [];
  const lockedExtensions = quality ? (QUALITY_LOCKED_EXTENSIONS[quality] ?? []) : [];

  const handleSelectQuality = (next: ChordQuality) => {
    const prevLocked = quality ? (QUALITY_LOCKED_EXTENSIONS[quality] ?? []) : [];
    setQuality(next);
    const nextDisabled = QUALITY_DISABLED_EXTENSIONS[next];
    const nextLocked = QUALITY_LOCKED_EXTENSIONS[next] ?? [];
    setExtensions((prev) => {
      const merged = new Set([...prev].filter((ext) => !nextDisabled.includes(ext) && !prevLocked.includes(ext)));
      nextLocked.forEach((ext) => merged.add(ext));
      return merged;
    });
  };

  const toggleExtension = (extension: ChordExtension) => {
    if (disabledExtensions.includes(extension) || lockedExtensions.includes(extension)) return;
    setExtensions((prev) => {
      const next = new Set(prev);
      if (next.has(extension)) next.delete(extension);
      else next.add(extension);
      return next;
    });
  };

  const chordLabel = buildChordLabel({ root, quality, extensions, bass });

  return (
    <div
      ref={panelRef}
      className="fixed inset-y-0 right-0 z-40 flex w-[525px] [scrollbar-gutter:stable] flex-col overflow-y-auto border-l-[0.3px] border-gray-700 bg-gray-900 px-16 py-9">
      <div className="flex items-center justify-between border-b-[0.5px] border-gray-700 py-6">
        <p className="body-medium text-gray-200">코드</p>
        <div className="border-primary-400 flex h-10 w-[271px] items-center justify-end rounded-[6px] border-[0.5px] px-3.5">
          <span className="body-medium text-primary-400 truncate">{chordLabel}</span>
        </div>
      </div>

      <div className="flex items-center justify-between border-b-[0.5px] border-gray-700 py-6">
        <p className="body-medium text-gray-200">근음</p>
        <SelectDropdown
          label="근음"
          options={NOTE_SELECT_OPTIONS}
          value={root}
          onChange={setRoot}
          isOpen={openField === 'root'}
          onOpenChange={(open) => setOpenField(open ? 'root' : null)}
          className="w-[106px]"
        />
      </div>

      <div className="grid grid-cols-4 gap-x-[3px] gap-y-3 border-b-[0.5px] border-gray-700 py-10">
        {QUALITY_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => handleSelectQuality(option)}
            aria-pressed={quality === option}
            className={`button-small flex h-11 cursor-pointer items-center justify-center rounded-[4px] border-[0.3px] ${
              quality === option ? 'bg-primary-400 border-primary-400 text-gray-950' : 'border-gray-500 text-gray-200'
            }`}>
            {option}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-x-[3px] gap-y-3 border-b-[0.5px] border-gray-700 py-10">
        {EXTENSION_OPTIONS.map(({ value, label }) => {
          const isDisabled = disabledExtensions.includes(value);
          const isLocked = lockedExtensions.includes(value);
          const isSelected = extensions.has(value);

          return (
            <button
              key={value}
              type="button"
              disabled={isDisabled || isLocked}
              onClick={() => toggleExtension(value)}
              aria-pressed={isSelected}
              className={`button-small flex h-11 cursor-pointer items-center justify-center rounded-[4px] border-[0.3px] disabled:cursor-not-allowed ${
                isSelected || isLocked
                  ? 'bg-primary-400 border-primary-400 text-gray-950'
                  : isDisabled
                    ? 'border-transparent bg-gray-600 text-gray-400'
                    : 'border-gray-500 text-gray-200'
              }`}>
              {label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between border-b-[0.5px] border-gray-700 py-6">
        <p className="body-medium text-gray-200">베이스 음</p>
        <SelectDropdown
          label="베이스 음"
          options={NOTE_SELECT_OPTIONS}
          value={bass}
          onChange={setBass}
          isOpen={openField === 'bass'}
          onOpenChange={(open) => setOpenField(open ? 'bass' : null)}
          className="w-[106px]"
        />
      </div>

      {root && quality && (
        <button
          type="button"
          onClick={() => onApply(chordLabel)}
          className="button-medium bg-primary-400 mt-6 flex h-12 w-[190px] shrink-0 cursor-pointer items-center justify-center self-center rounded-[6px] text-gray-950">
          입력하기
        </button>
      )}
    </div>
  );
}

export default ChordEditorPanel;
