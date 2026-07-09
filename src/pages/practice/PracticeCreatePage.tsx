// 백킹 트랙 생성 페이지
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { KeyMode, TrackDifficulty } from '@/types/track';
import { GENRES } from './mockTracks';
import ChevronLeftIcon from '@/assets/practice/chevron-left.svg?react';
import TitleField from './components/create/TitleField';
import CreateSelectField from './components/create/CreateSelectField';
import BpmField from './components/create/BpmField';
import ChordProgressionGrid from './components/create/ChordProgressionGrid';
import { addMeasures, createInitialMeasures } from './components/create/chordGrid';
import AudioUploadField from './components/create/AudioUploadField';

type TimeSignature = '4/4' | '3/4';
type TrackAccess = 'private' | 'public';

const GENRE_OPTIONS = GENRES.map((genre) => ({ value: genre, label: genre }));

// Figma 시안(Key select 옵션 목록) 그대로 반영 — D(natural)이 목록에서 빠져 있음.
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

// 이 화면의 Figma 시안 텍스트는 '고급'이지만, TrackCard 및 #8 트랙 상세 모달(trackDisplay.ts)에서
// 이미 advanced='전공'으로 확정되어 있어 앱 전체 라벨 일관성을 위해 '전공'으로 맞춤.
const DIFFICULTY_OPTIONS: { value: TrackDifficulty; label: string }[] = [
  { value: 'beginner', label: '초급' },
  { value: 'intermediate', label: '중급' },
  { value: 'advanced', label: '전공' },
];

const ACCESS_OPTIONS: { value: TrackAccess; label: string }[] = [
  { value: 'private', label: '나만 보기' },
  { value: 'public', label: '전체 공개' },
];

const DEFAULT_BPM = 120;

type FilterKey = 'genre' | 'key' | 'mode' | 'bpm' | 'timeSignature' | 'difficulty' | 'access';

function PracticeCreatePage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState(GENRE_OPTIONS[0].value);
  const [keyNote, setKeyNote] = useState(KEY_NOTE_OPTIONS[0].value);
  const [keyMode, setKeyMode] = useState<KeyMode>('major');
  const [bpm, setBpm] = useState(DEFAULT_BPM);
  const [timeSignature, setTimeSignature] = useState<TimeSignature>(TIME_SIGNATURE_OPTIONS[0].value);
  const [difficulty, setDifficulty] = useState<TrackDifficulty>('beginner');
  const [access, setAccess] = useState<TrackAccess>('private');
  const [measures, setMeasures] = useState(() => createInitialMeasures(TIME_SIGNATURE_OPTIONS[0].value));
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const [openField, setOpenField] = useState<FilterKey | null>(null);

  const handleTimeSignatureChange = (next: TimeSignature) => {
    setTimeSignature(next);
    setMeasures(createInitialMeasures(next));
  };

  const handleChordCellChange = (measureIndex: number, cellIndex: number, value: string) => {
    setMeasures((prev) =>
      prev.map((measure, m) =>
        m === measureIndex ? measure.map((cell, c) => (c === cellIndex ? value : cell)) : measure,
      ),
    );
  };

  const handleAddMeasures = () => setMeasures((prev) => addMeasures(prev, timeSignature));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;

    navigate('/practice');
  };

  return (
    <div className="flex w-full flex-col gap-6 px-6 py-8">
      <div className="relative flex w-full items-start">
        <button
          type="button"
          onClick={() => navigate('/practice')}
          className="button-small absolute top-0 left-0 flex items-center gap-2 text-gray-400">
          <ChevronLeftIcon className="size-5" />
          목록으로
        </button>

        <h1 className="heading-small-b mx-auto w-full max-w-[649px] text-gray-300">새 백킹 트랙 만들기</h1>
      </div>

      <div className="mx-auto flex w-full max-w-[649px] flex-col gap-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex w-full items-start justify-between">
            <TitleField value={title} onChange={setTitle} className="w-[500px]" />
            <CreateSelectField
              label="장르"
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
              <CreateSelectField
                label="Key"
                options={KEY_NOTE_OPTIONS}
                value={keyNote}
                onChange={setKeyNote}
                isOpen={openField === 'key'}
                onOpenChange={(open) => setOpenField(open ? 'key' : null)}
                className="w-[135px]"
              />
              <CreateSelectField
                label="Key"
                hideLabel
                options={KEY_MODE_OPTIONS}
                value={keyMode}
                onChange={setKeyMode}
                isOpen={openField === 'mode'}
                onOpenChange={(open) => setOpenField(open ? 'mode' : null)}
                className="w-[135px]"
              />
            </div>

            <BpmField
              value={bpm}
              onChange={setBpm}
              isOpen={openField === 'bpm'}
              onOpenChange={(open) => setOpenField(open ? 'bpm' : null)}
              className="w-[135px]"
            />
          </div>

          <div className="flex w-full items-start justify-between">
            <CreateSelectField
              label="박자"
              options={TIME_SIGNATURE_OPTIONS}
              value={timeSignature}
              onChange={handleTimeSignatureChange}
              isOpen={openField === 'timeSignature'}
              onOpenChange={(open) => setOpenField(open ? 'timeSignature' : null)}
              className="w-[144px]"
            />
            <CreateSelectField
              label="난이도"
              options={DIFFICULTY_OPTIONS}
              value={difficulty}
              onChange={setDifficulty}
              isOpen={openField === 'difficulty'}
              onOpenChange={(open) => setOpenField(open ? 'difficulty' : null)}
              className="w-[135px]"
            />
          </div>

          <ChordProgressionGrid
            measures={measures}
            onCellChange={handleChordCellChange}
            onAddMeasures={handleAddMeasures}
          />

          <div className="flex w-full items-start justify-between">
            <AudioUploadField file={audioFile} onChange={setAudioFile} className="w-[500px]" />
            <CreateSelectField
              label="사용 권한"
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
            생성하기
          </button>
        </form>
      </div>
    </div>
  );
}

export default PracticeCreatePage;
