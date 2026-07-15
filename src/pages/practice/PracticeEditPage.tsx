// 백킹 트랙 수정 페이지
import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ALL_TRACKS, RECOMMENDED_TRACKS } from './mockTracks';
import { buildFallbackProgression, CURRENT_USER } from './trackDisplay';
import TrackForm, { type TimeSignature } from './components/create/TrackForm';
import { toEditableMeasures, getChordsPerMeasure } from './components/create/chordGrid';

function PracticeEditPage() {
  const navigate = useNavigate();
  const { practiceId } = useParams();

  const track = useMemo(
    () => [...ALL_TRACKS, ...RECOMMENDED_TRACKS].find((candidate) => candidate.id === practiceId),
    [practiceId],
  );
  const isOwnTrack = track?.creator === CURRENT_USER;

  useEffect(() => {
    if (!track || !isOwnTrack) navigate('/practice');
  }, [track, isOwnTrack, navigate]);

  if (!track || !isOwnTrack) return null;

  const numerator = getChordsPerMeasure(track.timeSignature);
  const progression = track.chordProgression ?? buildFallbackProgression(track.chords, numerator);

  return (
    <TrackForm
      key={track.id}
      heading="백킹 트랙 수정하기"
      submitLabel="수정 완료"
      initialValues={{
        title: track.title,
        genre: track.genre,
        keyNote: track.key,
        keyMode: track.mode,
        bpm: track.bpm,
        timeSignature: track.timeSignature as TimeSignature,
        difficulty: track.difficulty,
        measures: toEditableMeasures(progression),
      }}
    />
  );
}

export default PracticeEditPage;
