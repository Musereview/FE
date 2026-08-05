// 단계별 학습 상세(이론/예시) 페이지
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLearningCurriculum } from '@/hooks/useLearningCurriculum';
import { useLearningStep } from '@/hooks/useLearningStep';
import { formatDuration } from '@/pages/practice/trackDisplay';
import BackNavLayout from '@/components/learn/BackNavLayout';
import AccordionSection from '@/components/learn/AccordionSection';
import ChordExampleRow from '@/components/learn/ChordExampleRow';
import CurriculumBanner from '@/components/learn/CurriculumBanner';
import MarkdownContent from '@/components/learn/MarkdownContent';
import PlayIcon from '@/assets/practice/play.svg?react';
import StopIcon from '@/assets/practice/stop.svg?react';
import ReplayIcon from '@/assets/restart.svg?react';
import ClockIcon from '@/assets/clock.svg?react';
import StartIcon from '@/assets/learn/chevron-right-start.svg?react';

type SectionKey = 'example' | 'theory' | 'tip' | 'chord';

function StepTheoryPage() {
  const navigate = useNavigate();
  const { curriculumId = '' } = useParams<{ curriculumId: string }>();
  const { data: curriculum } = useLearningCurriculum(curriculumId);
  const { data: step } = useLearningStep(curriculumId);

  const title = curriculum?.title ?? '';
  const difficulty = curriculum?.difficulty ?? 'beginner';
  const stepTitle = step?.stepTitle ?? '';
  const theoryContent = step?.theoryContent ?? '';
  const practiceTip = step?.practiceTip ?? '';
  const modelPerformance = step?.modelPerformance ?? null;
  const chordExamples = step?.chordExamples ?? [];

  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    example: false,
    theory: false,
    tip: false,
    chord: false,
  });

  const toggleSection = (key: SectionKey) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);

  useEffect(() => {
    setIsPlaying(false);
    setHasFinished(false);
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
  }, [curriculumId]);

  const handleTogglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    if (hasFinished) audio.currentTime = 0;
    setHasFinished(false);
    audio.play();
    setIsPlaying(true);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setHasFinished(true);
  };

  return (
    <BackNavLayout>
      <section className="flex flex-col items-center gap-20 py-[76px]">
        <CurriculumBanner title={title} difficulty={difficulty} description={stepTitle} />

        <div className="flex w-full max-w-[649px] flex-col gap-[100px]">
          <div className="flex w-full flex-col gap-10">
            {modelPerformance && (
              <AccordionSection
                title="모범 연주 예시"
                isOpen={openSections.example}
                onToggle={() => toggleSection('example')}>
                <div className="flex items-center justify-between rounded-[4px] bg-gray-900 p-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleTogglePlay}
                      aria-label={isPlaying ? '정지' : hasFinished ? '다시 재생' : '재생'}
                      className="flex size-[52px] items-center justify-center">
                      {isPlaying ? (
                        <StopIcon className="text-primary-400 size-10" />
                      ) : hasFinished ? (
                        <ReplayIcon className="size-10 text-gray-400" />
                      ) : (
                        <PlayIcon className="text-primary-400 size-10" />
                      )}
                    </button>
                    <div className="flex flex-col gap-1">
                      <p className="body-regular2 text-gray-100">{modelPerformance.title}</p>
                      <p className="button-label1 text-gray-300">{modelPerformance.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <ClockIcon className="size-6" />
                    <p className="button-label1 text-gray-400">{formatDuration(modelPerformance.durationSeconds)}</p>
                  </div>
                </div>
                <audio ref={audioRef} src={modelPerformance.audioUrl} onEnded={handleAudioEnded} className="hidden" />
              </AccordionSection>
            )}

            <AccordionSection
              icon="📚"
              title="이론 설명"
              isOpen={openSections.theory}
              onToggle={() => toggleSection('theory')}>
              <MarkdownContent content={theoryContent} />
            </AccordionSection>

            <AccordionSection icon="💡" title="연습 팁" isOpen={openSections.tip} onToggle={() => toggleSection('tip')}>
              <MarkdownContent content={practiceTip} />
            </AccordionSection>

            {chordExamples.length > 0 && (
              <AccordionSection
                icon="🎹"
                title="코드별 예시"
                isOpen={openSections.chord}
                onToggle={() => toggleSection('chord')}>
                <div className="flex w-full flex-col">
                  {chordExamples.map((example, index) => (
                    <ChordExampleRow
                      key={`${example.chordName}-${index}`}
                      chordName={example.chordName}
                      description={example.description}
                      noteNumbers={example.noteNumbers}
                      className={
                        index === 0 ? 'rounded-t-[4px]' : index === chordExamples.length - 1 ? 'rounded-b-[4px]' : ''
                      }
                    />
                  ))}
                </div>
              </AccordionSection>
            )}
          </div>

          <button
            type="button"
            onClick={() => navigate(`/learn/curriculum/${curriculumId}/settings`)}
            className="button-large1 bg-primary-400 flex h-[76px] w-full cursor-pointer items-center justify-center gap-2 rounded-[4px] text-gray-950">
            이 이론으로 실습하기
            <StartIcon className="size-6" />
          </button>
        </div>
      </section>
    </BackNavLayout>
  );
}

export default StepTheoryPage;
