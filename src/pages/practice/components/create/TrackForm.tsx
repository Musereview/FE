import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { KeyMode, TrackDifficulty } from '@/types/track';
import { GENRES } from '../../mockTracks';
import ChevronLeftIcon from '@/assets/practice/chevron-left.svg?react';
import TitleField from './TitleField';
import { isValidTitle } from './titleValidation';
import SelectDropdown from '../SelectDropdown';
import BpmDropdown from '../BpmDropdown';
import ChordProgressionGrid, { type ChordCell } from './ChordProgressionGrid';
import ChordEditorPanel from './ChordEditorPanel';
import { createInitialMeasures, resizeMeasures, applyChordCascade, getDisplayMeasures } from './chordGrid';
import AudioUploadField from './AudioUploadField';

export type TimeSignature = '4/4' | '3/4';
type TrackAccess = 'private' | 'public';

const GENRE_OPTIONS = GENRES.map((genre) => ({ value: genre, label: genre }));

// D(natural) 목록에서 의도적 제외
const KEY_NOTE_OPTIONS = ['C', 'C#', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map((note) => ({
  value: note,
  label: note,
}));

const KEY_MODE_OPTIONS: { value: KeyMode; label: string }[] = [
  { value: 'major', label: 'Major' },
  { value: 'minor', label: 'Minor' },
];

const TIME_SIGNATURE_OPTIONS: { value: TimeSignature; label: string }[] = [
  { value: '4/4', label: '4/4' },
  { value: '3/4', label: '3/4' },
];

const DIFFICULTY_OPTIONS: { value: TrackDifficulty; label: string }[] = [
  { value: 'beginner', label: '초급' },
  { value: 'intermediate', label: '중급' },
  { value: 'advanced', label: '고급' },
];

const ACCESS_OPTIONS: { value: TrackAccess; label: string }[] = [
  { value: 'private', label: '나만 보기' },
  { value: 'public', label: '전체 공개' },
];

const DEFAULT_BPM = 60;

type FilterKey = 'genre' | 'key' | 'mode' | 'bpm' | 'timeSignature' | 'difficulty' | 'access';

export interface TrackFormInitialValues {
  title: string;
  genre: string;
  keyNote: string;
  keyMode: KeyMode;
  bpm: number;
  timeSignature: TimeSignature;
  difficulty: TrackDifficulty;
  measures: string[][];
}

interface TrackFormProps {
  heading: string;
  submitLabel: string;
  initialValues?: TrackFormInitialValues;
  backTrackId?: string;
}

function TrackForm({ heading, submitLabel, initialValues, backTrackId }: TrackFormProps) {
  const navigate = useNavigate();

  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [genre, setGenre] = useState(initialValues?.genre ?? GENRE_OPTIONS[0].value);
  const [keyNote, setKeyNote] = useState(initialValues?.keyNote ?? KEY_NOTE_OPTIONS[0].value);
  const [keyMode, setKeyMode] = useState<KeyMode>(initialValues?.keyMode ?? 'major');
  const [bpm, setBpm] = useState(initialValues?.bpm ?? DEFAULT_BPM);
  const [timeSignature, setTimeSignature] = useState<TimeSignature>(
    initialValues?.timeSignature ?? TIME_SIGNATURE_OPTIONS[0].value,
  );
  const [difficulty, setDifficulty] = useState<TrackDifficulty>(initialValues?.difficulty ?? 'beginner');
  const [access, setAccess] = useState<TrackAccess>('private');
  const [measures, setMeasures] = useState(
    () => initialValues?.measures ?? createInitialMeasures(TIME_SIGNATURE_OPTIONS[0].value),
  );
  const [selectedChordCell, setSelectedChordCell] = useState<ChordCell | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const [openField, setOpenField] = useState<FilterKey | null>(null);

  const handleTimeSignatureChange = (next: TimeSignature) => {
    setTimeSignature(next);
    setMeasures((prev) => resizeMeasures(prev, next));
    setSelectedChordCell(null);
  };

  const handleApplyChord = (chordLabel: string) => {
    if (!selectedChordCell) return;
    setMeasures((prev) => applyChordCascade(prev, selectedChordCell, chordLabel));
    setSelectedChordCell(null);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !isValidTitle(title)) return;

    navigate('/practice');
  };

  const handleBack = () => {
    if (backTrackId) navigate('/practice', { state: { reopenTrackId: backTrackId } });
    else navigate('/practice');
  };

  return (
    <div className="flex w-full flex-col gap-6 px-6 py-8">
      <div className="relative flex w-full items-start">
        <button
          type="button"
          onClick={handleBack}
          className="button-small absolute top-0 left-0 flex items-center gap-2 text-gray-400">
          <ChevronLeftIcon className="size-5" />
          목록으로
        </button>

        <h1 className="heading-small-b mx-auto w-full max-w-[649px] text-gray-300">{heading}</h1>
      </div>

      <div className="mx-auto flex w-full max-w-[649px] flex-col gap-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex w-full items-start justify-between">
            <TitleField value={title} onChange={setTitle} className="w-[500px]" />
            <SelectDropdown
              label="장르"
              size="large"
              showLabel
              options={GENRE_OPTIONS}
              value={genre}
              onChange={setGenre}
              isOpen={openField === 'genre'}
              onOpenChange={(open) => setOpenField(open ? 'genre' : null)}
              className="w-[135px]"
            />
          </div>

          <div className="flex w-full items-start justify-between">
            <div className="flex items-start gap-3">
              <SelectDropdown
                label="Key"
                size="large"
                showLabel
                options={KEY_NOTE_OPTIONS}
                value={keyNote}
                onChange={setKeyNote}
                isOpen={openField === 'key'}
                onOpenChange={(open) => setOpenField(open ? 'key' : null)}
                className="w-[135px]"
              />
              <SelectDropdown
                label="Key"
                size="large"
                showLabel
                hideLabel
                options={KEY_MODE_OPTIONS}
                value={keyMode}
                onChange={setKeyMode}
                isOpen={openField === 'mode'}
                onOpenChange={(open) => setOpenField(open ? 'mode' : null)}
                className="w-[135px]"
              />
            </div>

            <BpmDropdown
              value={bpm}
              onChange={setBpm}
              isOpen={openField === 'bpm'}
              onOpenChange={(open) => setOpenField(open ? 'bpm' : null)}
              size="large"
              showLabel
              className="w-[135px]"
            />
          </div>

          <div className="flex w-full items-start justify-between">
            <SelectDropdown
              label="박자"
              size="large"
              showLabel
              options={TIME_SIGNATURE_OPTIONS}
              value={timeSignature}
              onChange={handleTimeSignatureChange}
              isOpen={openField === 'timeSignature'}
              onOpenChange={(open) => setOpenField(open ? 'timeSignature' : null)}
              className="w-[144px]"
            />
            <SelectDropdown
              label="난이도"
              size="large"
              showLabel
              options={DIFFICULTY_OPTIONS}
              value={difficulty}
              onChange={setDifficulty}
              isOpen={openField === 'difficulty'}
              onOpenChange={(open) => setOpenField(open ? 'difficulty' : null)}
              className="w-[135px]"
            />
          </div>

          <ChordProgressionGrid
            measures={getDisplayMeasures(measures)}
            selectedCell={selectedChordCell}
            onSelectCell={setSelectedChordCell}
          />

          <div className="flex w-full items-start justify-between">
            <AudioUploadField file={audioFile} onChange={setAudioFile} className="w-[500px]" />
            <SelectDropdown
              label="사용 권한"
              size="large"
              showLabel
              options={ACCESS_OPTIONS}
              value={access}
              onChange={setAccess}
              isOpen={openField === 'access'}
              onOpenChange={(open) => setOpenField(open ? 'access' : null)}
              className="w-[135px]"
            />
          </div>

          <button
            type="submit"
            className="button-medium bg-primary-400 mt-3 flex h-12 w-[288px] items-center justify-center self-end rounded-[6px] text-gray-950">
            {submitLabel}
          </button>
        </form>
      </div>

      {selectedChordCell && (
        <ChordEditorPanel
          key={`${selectedChordCell.measureIndex}-${selectedChordCell.cellIndex}`}
          initialValue={measures[selectedChordCell.measureIndex][selectedChordCell.cellIndex]}
          onApply={handleApplyChord}
          onCancel={() => setSelectedChordCell(null)}
        />
      )}
    </div>
  );
}

export default TrackForm;
