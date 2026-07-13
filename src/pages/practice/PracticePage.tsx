// 연습 목록 페이지
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Track, KeyMode } from '@/types/track';
import { RECOMMENDED_TRACKS, ALL_TRACKS, GENRES } from './mockTracks';
import TrackCard from './components/TrackCard';
import RecommendedTrackCarousel from './components/RecommendedTrackCarousel';
import SelectDropdown from './components/SelectDropdown';
import KeyFilterDropdown from './components/KeyFilterDropdown';
import BpmDropdown from './components/BpmDropdown';
import TrackDetailModal from './components/TrackDetailModal';
import PlusIcon from '@/assets/practice/plus.svg?react';

type SortBy = 'popularity' | 'latest';

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'popularity', label: '인기순' },
  { value: 'latest', label: '최신순' },
];

// GENRES[0] = 장르 전체 (필터 없음)
const GENRE_ALL = GENRES[0];
const GENRE_OPTIONS = GENRES.map((genre) => ({ value: genre, label: genre }));

const DEFAULT_BPM = 60;
const BPM_FILTER_RANGE = 20;

type FilterKey = 'sort' | 'genre' | 'key' | 'bpm';

const PAGE_SIZE = 9;

function PracticePage() {
  const navigate = useNavigate();

  const [sortBy, setSortBy] = useState<SortBy>('popularity');
  const [genre, setGenre] = useState(GENRE_OPTIONS[0].value);
  const [bpm, setBpm] = useState(DEFAULT_BPM);
  const [keyValue, setKeyValue] = useState('');
  const [keyMode, setKeyMode] = useState<KeyMode | null>(null);

  const [openFilter, setOpenFilter] = useState<FilterKey | null>(null);
  const filterRowRef = useRef<HTMLDivElement>(null);

  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRowRef.current && !filterRowRef.current.contains(event.target as Node)) {
        setOpenFilter(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredTracks = useMemo(() => {
    const filtered = ALL_TRACKS.filter((track) => {
      if (genre !== GENRE_ALL && track.genre !== genre) return false;
      if (Math.abs(track.bpm - bpm) > BPM_FILTER_RANGE) return false;
      if (keyValue && track.key !== keyValue) return false;
      if (keyMode && track.mode !== keyMode) return false;
      return true;
    });

    return filtered.sort((a, b) =>
      sortBy === 'popularity'
        ? b.popularity - a.popularity
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [genre, bpm, keyValue, keyMode, sortBy]);

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const hasMoreTracks = visibleCount < filteredTracks.length;

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [genre, bpm, keyValue, keyMode, sortBy]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasMoreTracks) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredTracks.length));
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMoreTracks, filteredTracks.length]);

  const visibleTracks = filteredTracks.slice(0, visibleCount);

  const handleSelectTrack = (track: Track) => setSelectedTrack(track);
  const handleStartPractice = (track: Track) => {
    setSelectedTrack(null);
    navigate(`/practice/${track.id}/settings`);
  };
  const handleEditTrack = (track: Track) => {
    setSelectedTrack(null);
    navigate(`/practice/${track.id}/edit`);
  };

  return (
    <div className="mx-auto flex w-full max-w-[1128px] flex-col px-6">
      <section className="border-b border-gray-700 py-[76px]">
        <h2 className="body-medium text-primary-300 mb-5">김뮤즈 님을 위한 추천 트랙</h2>
        <RecommendedTrackCarousel tracks={RECOMMENDED_TRACKS} onSelectTrack={handleSelectTrack} />
      </section>

      <section className="flex flex-col gap-9 py-[76px]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="heading-medium-b text-gray-200">전체</h2>

          <div className="flex flex-wrap items-center gap-6">
            <div ref={filterRowRef} className="flex flex-wrap items-start gap-3">
              <SelectDropdown
                label="인기순"
                options={SORT_OPTIONS}
                value={sortBy}
                onChange={setSortBy}
                isOpen={openFilter === 'sort'}
                onOpenChange={(open) => setOpenFilter(open ? 'sort' : null)}
                className="w-[102px]"
              />
              <SelectDropdown
                label="장르"
                options={GENRE_OPTIONS}
                value={genre}
                onChange={setGenre}
                isOpen={openFilter === 'genre'}
                onOpenChange={(open) => setOpenFilter(open ? 'genre' : null)}
              />
              <KeyFilterDropdown
                keyValue={keyValue}
                mode={keyMode}
                onKeyValueChange={setKeyValue}
                onModeChange={setKeyMode}
                isOpen={openFilter === 'key'}
                onOpenChange={(open) => setOpenFilter(open ? 'key' : null)}
              />
              <BpmDropdown
                value={bpm}
                onChange={setBpm}
                isOpen={openFilter === 'bpm'}
                onOpenChange={(open) => setOpenFilter(open ? 'bpm' : null)}
                className="w-[106px]"
              />
            </div>

            <button
              type="button"
              onClick={() => navigate('/practice/new')}
              className="button-small bg-primary-400 flex h-11 w-32 shrink-0 items-center justify-center gap-0.5 rounded-[6px] py-1.5 pr-1.5 pl-2.5 text-gray-950">
              생성하기
              <PlusIcon className="size-6" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleTracks.map((track) => (
            <TrackCard key={track.id} track={track} onClick={() => handleSelectTrack(track)} />
          ))}
        </div>

        {hasMoreTracks && <div ref={loadMoreRef} className="h-px w-full" />}
      </section>

      {selectedTrack && (
        <TrackDetailModal
          track={selectedTrack}
          onClose={() => setSelectedTrack(null)}
          onStartPractice={() => handleStartPractice(selectedTrack)}
          onEditTrack={() => handleEditTrack(selectedTrack)}
        />
      )}
    </div>
  );
}

export default PracticePage;
