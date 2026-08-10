import { useEffect, useState } from 'react';
import type { Track } from '@/types/track';
import TrackCard from './TrackCard';
import ChevronLeftIcon from '@/assets/practice/chevron-left.svg?react';
import ChevronRightIcon from '@/assets/practice/chevron-right.svg?react';

const VISIBLE_COUNT = 3;

interface RecommendedTrackCarouselProps {
  tracks: Track[];
  onSelectTrack: (track: Track) => void;
}

function RecommendedTrackCarousel({ tracks, onSelectTrack }: RecommendedTrackCarouselProps) {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(Math.ceil(tracks.length / VISIBLE_COUNT), 1);
  const visibleTracks = tracks.slice(page * VISIBLE_COUNT, page * VISIBLE_COUNT + VISIBLE_COUNT);

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages - 1));
  }, [totalPages]);

  return (
    <div className="group relative">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {visibleTracks.map((track) => (
          <TrackCard key={track.id} track={track} onClick={() => onSelectTrack(track)} />
        ))}
      </div>

      {page > 0 && (
        <button
          type="button"
          aria-label="이전 추천 트랙"
          onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
          className="absolute top-1/2 -left-5 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-gray-700 bg-gray-800 opacity-0 transition-opacity group-hover:opacity-100">
          <ChevronLeftIcon />
        </button>
      )}

      {page < totalPages - 1 && (
        <button
          type="button"
          aria-label="다음 추천 트랙"
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
          className="absolute top-1/2 -right-5 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-gray-700 bg-gray-800 opacity-0 transition-opacity group-hover:opacity-100">
          <ChevronRightIcon />
        </button>
      )}
    </div>
  );
}

export default RecommendedTrackCarousel;
