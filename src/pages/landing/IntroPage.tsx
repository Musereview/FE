// 서비스 소개 페이지 (스플래시 이후 스크롤 랜딩)
import LogoTypo from '@/assets/landing/logo.svg?react';
import ArrowUpperLeft from '@/assets/landing/intro/arrow.svg?react';
import TopButton from '@/assets/landing/intro/top-button.svg?react';
import NrWave from '@/assets/landing/intro/wave-logo.svg?react';
import pianoUrl from '@/assets/landing/intro/piano.svg?url';
import feature1Url from '@/assets/landing/intro/feature1.svg?url';
import feature2Url from '@/assets/landing/intro/feature2.svg?url';
import feature3Url from '@/assets/landing/intro/feature3.svg?url';

// 섹션 공통 좌우 여백
const SECTION_PADDING = 'px-6 md:px-10 lg:px-20 xl:px-[100px] 2xl:px-[160px]';

const FEATURES = [
  {
    icon: feature1Url,
    title: '데이터 기반 피드백',
    desc: '반복되는 습관과 성장의 변화를 데이터로 보여줍니다.',
    grow: 'grow-[428]',
  },
  {
    icon: feature2Url,
    title: '실시간 화성학 통역사',
    desc: '연주에 담긴 의도를 음악 이론 언어로 해석합니다.',
    grow: 'grow-[466]',
  },
  {
    icon: feature3Url,
    title: '지능형 큐레이션',
    desc: '실력과 연주 패턴에 맞는 학습 방향을 제안합니다.',
    grow: 'grow-[385]',
  },
];

// 뮤즈리뷰 시작하기 버튼
function StartButton({ variant }: { variant: 'light' | 'dark' }) {
  const isLight = variant === 'light';
  return (
    <button
      type="button"
      className={`button-large1 flex h-[76px] w-[236px] items-center justify-center gap-2.5 rounded-md ${
        isLight ? 'bg-primary-400 text-gray-950' : 'bg-gray-950 text-gray-300'
      }`}>
      뮤즈리뷰 시작하기
      <ArrowUpperLeft className="size-6" />
    </button>
  );
}

function IntroPage() {
  return (
    <div className="bg-primary-400 relative min-h-screen w-full overflow-x-hidden">
      {/* 배경 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[1300px] bg-[radial-gradient(155%_95%_at_50%_6%,#0b0f19_0%,#0b0f19_45%,rgba(11,15,25,0.82)_60%,rgba(11,15,25,0.55)_70%,rgba(11,15,25,0.3)_80%,rgba(11,15,25,0.12)_88%,rgba(11,15,25,0.03)_94%,rgba(11,15,25,0)_100%)]"
      />

      {/* 상단 로고 */}
      <header className="relative z-10 flex h-[124px] items-center justify-center px-2.5 py-1">
        <LogoTypo className="text-primary-400 h-[29px] w-[174px]" aria-label="MUSE REVIEW" />
      </header>

      {/* 히어로 */}
      <section
        className={`relative z-10 flex flex-col items-center gap-[260px] pt-[180px] pb-[240px] ${SECTION_PADDING}`}>
        <div className="flex flex-col items-center gap-[60px]">
          <h1 className="heading-large text-center text-gray-200">
            막막한 독학 연습의 순간마다, 내 곁에 함께하는 AI 음악 멘토
          </h1>
          <StartButton variant="light" />
        </div>

        {/* 스크롤 아이콘 */}
        <div className="flex flex-col items-center gap-2">
          <span className="flex h-10 w-10 justify-center">
            <span className="mt-1 h-8 w-5 rounded-full border border-gray-400" />
          </span>
          <span className="body-regular1 text-gray-300">Scroll</span>
        </div>
      </section>

      {/* Sub1 */}
      <section
        className={`relative z-10 mx-auto flex w-full max-w-[1920px] flex-col items-start gap-16 py-55 xl:flex-row xl:gap-[218px] ${SECTION_PADDING}`}>
        <img
          src={pianoUrl}
          alt="piano-picture"
          className="aspect-590/393 w-full max-w-[590px] shrink-0 rounded-[10px] object-cover"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-[100px] text-gray-950">
          <h2 className="heading-large">왜 그 음을 선택했는지 기억하나요?</h2>
          <div className="flex flex-col gap-7">
            <p className="body-medium">
              좋다고 느껴 연주한 한 음, 자연스럽게 이어진 코드 진행.
              <br />
              그 순간에는 분명 이유가 있었지만 대부분의 독학 연주자는
              <br />
              자신의 선택을 설명하기 어렵습니다.
            </p>
            <p className="body-medium">
              연주에는 생각보다 많은 음악적 의도가 담겨 있지만,
              <br />
              혼자 하는 연습 속에서 그 의미를 발견하기란 쉽지 않습니다.
            </p>
          </div>
        </div>
      </section>

      {/* Sub2 */}
      <section className="relative z-10 bg-gray-950">
        <div className={`mx-auto flex w-full max-w-[1920px] flex-col gap-[220px] py-[184px] ${SECTION_PADDING}`}>
          <div className="flex flex-col gap-10 xl:flex-row xl:items-center xl:gap-[120px]">
            <h2 className="heading-large text-primary-400 xl:w-[790px] xl:shrink-0">
              뮤즈리뷰는 그 의도를 발견합니다.
            </h2>
            <p className="body-medium min-w-0 text-gray-300 xl:flex-1">
              우리는 단순히 연습하라고 재촉하지 않습니다.
              <br />
              데이터와 자연어로 연주자의 재생적 분석력을 키웁니다.
            </p>
          </div>

          <ul className="flex justify-between gap-10">
            {FEATURES.map(({ icon, title, desc, grow }) => (
              <li key={title} className={`flex min-w-0 basis-0 flex-col gap-[52px] ${grow}`}>
                <img src={icon} alt="" className="size-[100px] object-cover" />
                <div className="flex flex-col gap-2">
                  <h3 className="heading-small-b text-primary-400">{title}</h3>
                  <p className="body-medium text-gray-300">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Sub3 */}
      <section className={`relative z-10 overflow-hidden py-[300px] ${SECTION_PADDING}`}>
        <NrWave
          aria-hidden
          className="text-primary-500 pointer-events-none absolute top-1/2 left-1/2 w-[1920px] max-w-none -translate-x-1/2 -translate-y-1/2"
        />
        <div className="relative flex flex-col items-center gap-16">
          <div className="flex flex-col items-center gap-[18px] text-center text-gray-950">
            <h2 className="heading-large">
              연주는 끝났지만,
              <br />
              영감은 아직 남아 있습니다.
            </h2>
            <p className="body-medium">뮤즈리뷰가 여러분의 연주 속 영감과 가능성을 함께 찾아드립니다.</p>
          </div>
          <StartButton variant="dark" />
        </div>

        {/* 맨 위로 */}
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="맨 위로"
          className="absolute right-6 bottom-[60px] text-gray-950">
          <TopButton className="size-12" />
        </button>
      </section>
    </div>
  );
}

export default IntroPage;
