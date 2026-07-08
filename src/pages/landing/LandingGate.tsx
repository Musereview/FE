// 진입 화면: 스플래시(LandingPage)를 5초 노출한 뒤 소개 페이지(IntroPage)로 전환
import { useEffect, useState } from 'react';
import LandingPage from './LandingPage';
import IntroPage from './IntroPage';

const SPLASH_DURATION = 3000;

function LandingGate() {
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(true), SPLASH_DURATION);
    return () => clearTimeout(timer);
  }, []);

  return showIntro ? <IntroPage /> : <LandingPage />;
}

export default LandingGate;
