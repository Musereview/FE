// 백킹 트랙 수정 페이지
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CURRENT_USER, LEVEL_MAP } from './trackDisplay';
import TrackForm, { type TimeSignature } from '@/components/practice/create/TrackForm';
import { fromChordProgressionEntries } from '@/components/practice/create/chordGrid';
import { useBackingTrackDetail } from '@/hooks/useBackingTrackDetail';

function PracticeEditPage() {
  const navigate = useNavigate();
  const { practiceId } = useParams();
  const backingTrackId = Number(practiceId);

  const { data: track, isLoading } = useBackingTrackDetail(Number.isFinite(backingTrackId) ? backingTrackId : null);
  const isOwnTrack = track?.creatorName === CURRENT_USER;

  useEffect(() => {
    if (!isLoading && (!track || !isOwnTrack)) navigate('/practice');
  }, [isLoading, track, isOwnTrack, navigate]);

  if (isLoading || !track || !isOwnTrack) return null;

  return (
    <TrackForm
      key={track.backingTrackId}
      mode="edit"
      backingTrackId={track.backingTrackId}
      heading="백킹 트랙 수정하기"
      submitLabel="수정 완료"
      backTrackId={String(track.backingTrackId)}
      initialValues={{
        title: track.title,
        genre: track.genre,
        keyNote: track.keySignature,
        keyMode: track.scaleType === 'MINOR' ? 'minor' : 'major',
        bpm: track.bpm,
        timeSignature: track.timeSignature as TimeSignature,
        difficulty: LEVEL_MAP[track.level],
        measures: fromChordProgressionEntries(track.chordProgression, track.timeSignature),
        playtimeSec: track.playtimeSec,
        audioFileUrl: track.audioFileUrl,
      }}
    />
  );
}

export default PracticeEditPage;
