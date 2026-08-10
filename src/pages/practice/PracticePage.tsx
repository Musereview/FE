// 연습 목록 페이지
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Track, KeyMode } from '@/types/track';
import { GENRES } from './mockTracks';
import { mapListItemToTrack, mapDetailToTrack, mapRecommendedItemToTrack } from './trackDisplay';
import { useBackingTracks } from '@/hooks/useBackingTracks';
import { useBackingTrackDetail } from '@/hooks/useBackingTrackDetail';
import { useRecommendedBackingTracks } from '@/hooks/useRecommendedBackingTracks';
import { useCreatePlaying } from '@/hooks/useCreatePlaying';
import { usePlayingSessionStore } from '@/stores/playingSessionStore';
import TrackCard from '@/components/practice/TrackCard';
import RecommendedTrackCarousel from '@/components/practice/RecommendedTrackCarousel';
import SelectDropdown from '@/components/practice/SelectDropdown';
import KeyFilterDropdown from '@/components/practice/KeyFilterDropdown';
import BpmDropdown, { type BpmFilterMode } from '@/components/practice/BpmDropdown';
import TrackDetailModal from '@/components/practice/TrackDetailModal';
import Modal from '@/components/common/Modal';
import PlusIcon from '@/assets/practice/plus.svg?react';
import { useClickOutside } from '@/hooks/useClickOutside';

type SortBy = 'popularity' | 'latest';

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'popularity', label: '인기순' },
  { value: 'latest', label: '최신순' },
];

// GENRES[0] = 장르 전체 (필터 없음), GENRES[4] = 기타 (Jazz/Pop/Blues 외 나머지)
const GENRE_ALL = GENRES[0];
const GENRE_OTHER = GENRES[4];
const NAMED_GENRES = ['jazz', 'pop', 'blues'];
const GENRE_OPTIONS = GENRES.map((genre) => ({ value: genre, label: genre }));

const DEFAULT_BPM = 60;
const BPM_FILTER_RANGE = 2;

type FilterKey = 'sort' | 'genre' | 'key' | 'bpm';

function PracticePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [sortBy, setSortBy] = useState<SortBy>('popularity');
  const [genre, setGenre] = useState(GENRE_OPTIONS[0].value);
  const [bpm, setBpm] = useState(DEFAULT_BPM);
  const [bpmMode, setBpmMode] = useState<BpmFilterMode>('all'); // 전체(필터 없음)가 기본
  const [keyValue, setKeyValue] = useState('');
  const [keyMode, setKeyMode] = useState<KeyMode | null>(null);

  const [openFilter, setOpenFilter] = useState<FilterKey | null>(null);
  const filterRowRef = useRef<HTMLDivElement>(null);

  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useBackingTracks();
  const {
    data: recommendedData,
    isLoading: isRecommendedLoading,
    isError: isRecommendedError,
    refetch: refetchRecommended,
  } = useRecommendedBackingTracks();

  const detailId = selectedTrackId ? Number(selectedTrackId) : null;
  const {
    data: trackDetail,
    isLoading: isDetailLoading,
    isError: isDetailError,
    refetch: refetchDetail,
  } = useBackingTrackDetail(detailId);
  const selectedTrack: Track | null = trackDetail ? mapDetailToTrack(trackDetail) : null;

  const { mutateAsync: createPlaying, isPending: isStarting } = useCreatePlaying();
  const setPlayingSession = usePlayingSessionStore((s) => s.setSession);
  const [startError, setStartError] = useState(false);

  useEffect(() => {
    const reopenTrackId = (location.state as { reopenTrackId?: string } | null)?.reopenTrackId;
    if (!reopenTrackId) return;

    setSelectedTrackId(reopenTrackId);
    navigate(location.pathname, { replace: true, state: null });
  }, [location, navigate]);

  useClickOutside(filterRowRef, () => setOpenFilter(null));

  const tracks = useMemo(() => data?.pages.flatMap((page) => page.tracks.map(mapListItemToTrack)) ?? [], [data]);
  const recommendedTracks = useMemo(() => recommendedData?.map(mapRecommendedItemToTrack) ?? [], [recommendedData]);

  const filteredTracks = useMemo(() => {
    const filtered = tracks.filter((track) => {
      if (genre !== GENRE_ALL) {
        const isNamedGenre = NAMED_GENRES.includes(track.genre.toLowerCase());
        if (genre === GENRE_OTHER) {
          if (isNamedGenre) return false;
        } else if (track.genre.toLowerCase() !== genre.toLowerCase()) {
          return false;
        }
      }

      if (bpmMode === 'custom' && Math.abs(track.bpm - bpm) > BPM_FILTER_RANGE) return false;
      if (keyValue && track.key !== keyValue) return false;
      if (keyMode && track.mode !== keyMode) return false;
      return true;
    });

    return filtered.sort((a, b) =>
      sortBy === 'popularity'
        ? b.popularity - a.popularity
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [tracks, genre, bpm, bpmMode, keyValue, keyMode, sortBy]);

  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) fetchNextPage();
      },
      { rootMargin: '200px' },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSelectTrack = (track: Track) => {
    setStartError(false);
    setSelectedTrackId(track.id);
  };
  const handleCloseModal = () => setSelectedTrackId(null);
  const handleStartPractice = async () => {
    if (!trackDetail) return;
    setStartError(false);
    try {
      const session = await createPlaying(trackDetail.backingTrackId);
      setPlayingSession({ playingId: session.playingId, backingTrack: session.backingTrack });
      setSelectedTrackId(null);
      navigate(`/practice/${session.backingTrack.backingTrackId}/settings`);
    } catch {
      setStartError(true);
    }
  };
  const handleEditTrack = () => {
    if (!selectedTrack) return;
    setSelectedTrackId(null);
    navigate(`/practice/${selectedTrack.id}/edit`);
  };

  if (isLoading) {
    return <div className="body-medium flex min-h-screen items-center justify-center text-gray-500">불러오는 중…</div>;
  }

  if (isError) {
    return (
      <div className="body-medium flex min-h-screen flex-col items-center justify-center gap-4 text-gray-500">
        <p>백킹트랙 목록을 불러오지 못했어요.</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="button-small bg-primary-400 cursor-pointer rounded-[6px] px-4 py-2 text-gray-950">
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1128px] flex-col px-6">
      <section className="border-b border-gray-700 py-[76px]">
        <h2 className="body-medium text-primary-300 mb-5">김뮤즈 님을 위한 추천 트랙</h2>
        {isRecommendedLoading ? (
          <div className="body-medium flex h-40 items-center justify-center text-gray-500">불러오는 중…</div>
        ) : isRecommendedError ? (
          <div className="body-medium flex h-40 flex-col items-center justify-center gap-4 text-gray-500">
            <p>추천 트랙을 불러오지 못했어요.</p>
            <button
              type="button"
              onClick={() => refetchRecommended()}
              className="button-small bg-primary-400 cursor-pointer rounded-[6px] px-4 py-2 text-gray-950">
              다시 시도
            </button>
          </div>
        ) : (
          <RecommendedTrackCarousel tracks={recommendedTracks} onSelectTrack={handleSelectTrack} />
        )}
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
                mode={bpmMode}
                onModeChange={setBpmMode}
                isOpen={openFilter === 'bpm'}
                onOpenChange={(open) => setOpenFilter(open ? 'bpm' : null)}
                className="w-[106px]"
              />
            </div>

            <button
              type="button"
              onClick={() => navigate('/practice/new')}
              className="button-small bg-primary-400 flex h-11 w-32 shrink-0 cursor-pointer items-center justify-center gap-0.5 rounded-[6px] py-1.5 pr-1.5 pl-2.5 text-gray-950">
              생성하기
              <PlusIcon className="size-6" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredTracks.map((track) => (
            <TrackCard key={track.id} track={track} onClick={() => handleSelectTrack(track)} />
          ))}
        </div>

        {hasNextPage && <div ref={loadMoreRef} className="h-px w-full" />}
      </section>

      {selectedTrackId && isDetailLoading && (
        <Modal
          onClose={handleCloseModal}
          overlayClassName="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/70 p-6 backdrop-blur-sm"
          dialogClassName="body-medium flex h-40 w-[320px] items-center justify-center rounded-[10px] border-[0.3px] border-gray-600 bg-gray-900 text-gray-500"
          dialogAriaLabel="트랙 상세 정보 불러오는 중"
          lockBodyScroll>
          불러오는 중…
        </Modal>
      )}

      {selectedTrackId && isDetailError && (
        <Modal
          onClose={handleCloseModal}
          overlayClassName="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/70 p-6 backdrop-blur-sm"
          dialogClassName="body-medium flex h-40 w-[320px] flex-col items-center justify-center gap-4 rounded-[10px] border-[0.3px] border-gray-600 bg-gray-900 text-gray-500"
          dialogAriaLabel="트랙 상세 정보 불러오기 실패"
          lockBodyScroll>
          <p>트랙 정보를 불러오지 못했어요.</p>
          <button
            type="button"
            onClick={() => refetchDetail()}
            className="button-small bg-primary-400 cursor-pointer rounded-[6px] px-4 py-2 text-gray-950">
            다시 시도
          </button>
        </Modal>
      )}

      {selectedTrack && !isDetailLoading && (
        <TrackDetailModal
          track={selectedTrack}
          onClose={handleCloseModal}
          onStartPractice={handleStartPractice}
          onEditTrack={handleEditTrack}
          isStartingPractice={isStarting}
          startError={startError}
        />
      )}
    </div>
  );
}

export default PracticePage;
