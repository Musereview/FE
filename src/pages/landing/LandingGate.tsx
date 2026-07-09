// 진입 화면
import { useState } from 'react';
import LandingPage from './LandingPage';
import IntroPage from './IntroPage';

function LandingGate() {
  const [isIntroVisible, setIsIntroVisible] = useState(false);

  return isIntroVisible ? <IntroPage /> : <LandingPage onEnterIntro={() => setIsIntroVisible(true)} />;
}

export default LandingGate;
