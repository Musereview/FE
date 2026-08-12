// 백킹 트랙 수정 페이지
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LEVEL_MAP } from './trackDisplay';
import TrackForm, { type TimeSignature } from '@/components/practice/create/TrackForm';
import { fromChordProgressionEntries } from '@/components/practice/create/chordGrid';
import { useBackingTrackDetail } from '@/hooks/useBackingTrackDetail';
import { useProfile } from '@/hooks/useProfile';

function PracticeEditPage() {
  const navigate = useNavigate();
  const { practiceId } = useParams();
  const backingTrackId = Number(practiceId);

  const { data: track, isLoading: isTrackLoading } = useBackingTrackDetail(
    Number.isFinite(backingTrackId) ? backingTrackId : null,
  );
  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const isLoading = isTrackLoading || isProfileLoading;
  // 소유자 확인은 실제 로그인 사용자(프로필 닉네임) 기준으로 판단 — 최종 권한 검증은 PUT API가 서버에서 수행
  const isOwnTrack = !!track && !!profile && track.creatorName === profile.nickname;

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
      }}
    />
  );
}

export default PracticeEditPage;
