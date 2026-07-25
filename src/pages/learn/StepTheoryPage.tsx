// 단계별 학습 상세(이론/예시) 페이지
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCurriculum } from './mockCurriculum';
import BackNavLayout from '@/components/learn/BackNavLayout';
import AccordionSection from '@/components/learn/AccordionSection';
import ChordExampleRow from '@/components/learn/ChordExampleRow';
import CurriculumBanner from '@/components/learn/CurriculumBanner';
import PlayIcon from '@/assets/practice/play.svg?react';
import StopIcon from '@/assets/practice/stop.svg?react';
import ReplayIcon from '@/assets/restart.svg?react';
import ClockIcon from '@/assets/clock.svg?react';
import StartIcon from '@/assets/learn/chevron-right-start.svg?react';

type SectionKey = 'example' | 'theory' | 'tip' | 'chord';

const CHORD_EXAMPLE_ROWS = [1, 2, 3];

function parseDurationToMs(durationLabel: string): number {
  const [minutes, seconds] = durationLabel.split(':').map(Number);
  return (minutes * 60 + seconds) * 1000;
}

function StepTheoryPage() {
  const { curriculumId } = useParams<{ curriculumId: string }>();
  const { title, difficulty, stepDescription, example, theory, theorySummary, tips, tipHighlight } = getCurriculum(
    curriculumId ?? '',
  );

  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    example: false,
    theory: false,
    tip: false,
    chord: false,
  });

  const toggleSection = (key: SectionKey) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const [isPlaying, setIsPlaying] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  const playTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    setIsPlaying(false);
    setHasFinished(false);
    return () => clearTimeout(playTimeoutRef.current);
  }, [curriculumId]);

  const handleTogglePlay = () => {
    if (isPlaying) {
      clearTimeout(playTimeoutRef.current);
      setIsPlaying(false);
      return;
    }

    setHasFinished(false);
    setIsPlaying(true);
    playTimeoutRef.current = setTimeout(() => {
      setIsPlaying(false);
      setHasFinished(true);
    }, parseDurationToMs(example.durationLabel));
  };

  return (
    <BackNavLayout>
      <section className="flex flex-col items-center gap-20 py-[76px]">
        <CurriculumBanner title={title} difficulty={difficulty} description={stepDescription} />

        <div className="flex w-full max-w-[649px] flex-col gap-[100px]">
          <div className="flex w-full flex-col gap-10">
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
                    <p className="body-regular2 text-gray-100">{example.title}</p>
                    <p className="button-label1 text-gray-300">{example.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <ClockIcon className="size-6" />
                  <p className="button-label1 text-gray-400">{example.durationLabel}</p>
                </div>
              </div>
            </AccordionSection>

            <AccordionSection
              icon="📚"
              title="이론 설명"
              isOpen={openSections.theory}
              onToggle={() => toggleSection('theory')}>
              <div className="flex flex-col gap-4">
                <p className="body-regular2 text-gray-300">{theory}</p>
                <div className="flex flex-col gap-2 rounded-[4px] bg-gray-400 px-10 py-5 text-center">
                  <p className="body-large-b text-primary-900">{theorySummary.title}</p>
                  <p className="body-small text-gray-900">{theorySummary.subtitle}</p>
                </div>
              </div>
            </AccordionSection>

            <AccordionSection icon="💡" title="연습 팁" isOpen={openSections.tip} onToggle={() => toggleSection('tip')}>
              <div className="flex flex-col gap-6">
                <div className="flex flex-col">
                  {tips.map((tip) => (
                    <p key={tip} className="body-regular2 text-gray-300">
                      • {tip}
                    </p>
                  ))}
                </div>

                <div className="bg-secondary-200 flex items-center justify-center gap-0.5 rounded-[4px] p-3">
                  <span className="body-regular2 text-gray-950">✓ {tipHighlight}</span>
                </div>
              </div>
            </AccordionSection>

            <AccordionSection
              icon="🎹"
              title="코드별 예시"
              isOpen={openSections.chord}
              onToggle={() => toggleSection('chord')}>
              <div className="flex w-full flex-col">
                {CHORD_EXAMPLE_ROWS.map((activeGroupCount, index) => (
                  <ChordExampleRow
                    key={activeGroupCount}
                    activeGroupCount={activeGroupCount}
                    className={
                      index === 0 ? 'rounded-t-[4px]' : index === CHORD_EXAMPLE_ROWS.length - 1 ? 'rounded-b-[4px]' : ''
                    }
                  />
                ))}
              </div>
            </AccordionSection>
          </div>

          <button
            type="button"
            className="button-large1 bg-primary-400 flex h-[76px] w-full items-center justify-center gap-2 rounded-[4px] text-gray-950">
            이 이론으로 실습하기
            <StartIcon className="size-6" />
          </button>
        </div>
      </section>
    </BackNavLayout>
  );
}

export default StepTheoryPage;
