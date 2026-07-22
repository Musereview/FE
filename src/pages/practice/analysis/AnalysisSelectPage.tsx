// //분석 마디 선택 페이지
// import { useState, useEffect, useRef, useCallback } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';

// export default function AnalysisSelectPage() {
//   const navigate = useNavigate();
//   const { practiceId } = useParams<{ practiceId: string }>();

//   // --- [상태 관리] ---
//   const [isPlaying, setIsPlaying] = useState<boolean>(false);
//   const [startMeasure, setStartMeasure] = useState<string>('1마디');
//   const [endMeasure, setEndMeasure] = useState<string>('30마디');
//   const [toastMessage, setToastMessage] = useState<string | null>(null);

//   const [isScoreLoading, setIsScoreLoading] = useState<boolean>(true);
//   const scoreContainerRef = useRef<HTMLDivElement>(null);
//   const osmdRef = useRef<OpenSheetMusicDisplay | null>(null);

//   // 오디오 및 싱크 타이머 레프
//   const audioRef = useRef<HTMLAudioElement | null>(null);
//   const syncIntervalRef = useRef<number | null>(null);

//   // 악보 음표와 소리 시간을 매칭해주는 테이블 (초 단위)
//   const noteTimestampsRef = useRef<number[]>([0.0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5]);
//   const currentNoteIndexRef = useRef<number>(0);

//   // 처음으로 버튼 핸들러
//   const handleRewind = useCallback(() => {
//     setIsPlaying(false);
//     if (syncIntervalRef.current !== null) {
//       clearInterval(syncIntervalRef.current);
//       syncIntervalRef.current = null;
//     }
//     currentNoteIndexRef.current = 0;
//     if (audioRef.current) audioRef.current.currentTime = 0;
//     if (osmdRef.current) osmdRef.current.cursor.reset();

//     setToastMessage('첫 마디로 되돌아갔습니다.');
//     const timer = setTimeout(() => setToastMessage(null), 3000);
//     return () => clearTimeout(timer);
//   }, []);

//   // --- [1. 오디오 소리 바인딩] ---
//   useEffect(() => {
//     audioRef.current = new Audio('https://actions.google.com/sounds/v1/science_fiction/ambient_space_machine.ogg');

//     audioRef.current.onended = () => {
//       handleRewind();
//     };

//     return () => {
//       if (audioRef.current) {
//         audioRef.current.pause();
//         audioRef.current = null;
//       }
//       if (syncIntervalRef.current !== null) {
//         clearInterval(syncIntervalRef.current);
//       }
//     };
//   }, [handleRewind]);

//   // --- [2. MusicXML 기반 악보 렌더링] ---
//   useEffect(() => {
//     if (!scoreContainerRef.current) return;
//     scoreContainerRef.current.innerHTML = '';

//     const osmd = new OpenSheetMusicDisplay(scoreContainerRef.current, {
//       autoResize: true,
//       backend: 'svg',
//       drawingParameters: 'compacttight',
//       drawTitle: false,
//       drawSubtitle: false,
//       drawComposer: false,
//     });

//     osmdRef.current = osmd;

//     osmd
//       .load('/sample.xml')
//       .then(() => {
//         setIsScoreLoading(false);
//         osmd.render();

//         // 악보 오선지/음표 다크모드 반전 필터
//         if (scoreContainerRef.current) {
//           const svgElements = scoreContainerRef.current.querySelectorAll('svg');
//           svgElements.forEach((svg) => {
//             svg.querySelectorAll('path, rect, text, ellip').forEach((el) => {
//               const fill = el.getAttribute('fill');
//               const stroke = el.getAttribute('stroke');
//               if (fill && fill !== 'none' && fill !== 'transparent') el.setAttribute('fill', '#E7E7E8');
//               if (stroke && stroke !== 'none' && stroke !== 'transparent') el.setAttribute('stroke', '#E7E7E8');
//             });
//           });
//         }

//         osmd.cursor.show();
//       })
//       .catch((err) => {
//         console.error('악보 로드 에러 (public/sample.xml 확인 요망):', err);
//         setIsScoreLoading(false);
//       });

//     const handleResize = () => {
//       if (osmdRef.current) osmdRef.current.render();
//     };
//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, [practiceId]);

//   // --- [3. 오디오 재생 및 커서 진짜 동기화 엔진] ---
//   useEffect(() => {
//     if (!audioRef.current || !osmdRef.current) return;

//     if (isPlaying) {
//       audioRef.current.play().catch(() => {});

//       syncIntervalRef.current = window.setInterval(() => {
//         const currentTime = audioRef.current?.currentTime || 0;
//         const osmd = osmdRef.current;

//         if (osmd && osmd.cursor) {
//           const nextTimestamp = noteTimestampsRef.current[currentNoteIndexRef.current + 1];

//           if (nextTimestamp !== undefined && currentTime >= nextTimestamp) {
//             osmd.cursor.next();
//             currentNoteIndexRef.current += 1;
//           }
//         }
//       }, 100);
//     } else {
//       audioRef.current.pause();
//       if (syncIntervalRef.current !== null) {
//         clearInterval(syncIntervalRef.current);
//         syncIntervalRef.current = null;
//       }
//     }

//     return () => {
//       if (syncIntervalRef.current !== null) {
//         clearInterval(syncIntervalRef.current);
//         syncIntervalRef.current = null;
//       }
//     };
//   }, [isPlaying]);

//   // --- [4. 마디 입력값 자동 포맷팅 핸들러] ---
//   const extractNumber = (val: string) => {
//     const num = parseInt(val.replace(/[^0-9]/g, ''), 10);
//     return isNaN(num) ? '' : num.toString();
//   };

//   const handleFocus = (val: string, setter: (v: string) => void) => {
//     const onlyNum = extractNumber(val);
//     setter(onlyNum);
//   };

//   const handleBlur = (val: string, setter: (v: string) => void, defaultVal: string) => {
//     const onlyNum = extractNumber(val);
//     if (!onlyNum || onlyNum === '0') {
//       setter(defaultVal);
//     } else {
//       setter(`${onlyNum}마디`);
//     }
//   };

//   const handleChange = (val: string, setter: (v: string) => void) => {
//     const onlyNum = val.replace(/[^0-9]/g, '');
//     setter(onlyNum);
//   };

//   // --- [5. 예외 처리 및 분석 시작 핸들러] ---
//   const triggerToast = (msg: string) => {
//     setToastMessage(msg);
//     setTimeout(() => setToastMessage(null), 3000);
//   };

//   const getMeasureNumber = (val: string) => {
//     const num = parseInt(val.replace(/[^0-9]/g, ''), 10);
//     return isNaN(num) ? 0 : num;
//   };

//   const handleStartAnalysis = () => {
//     const startNum = getMeasureNumber(startMeasure);
//     const endNum = getMeasureNumber(endMeasure);
//     const diff = endNum - startNum + 1;

//     if (startNum === 0 || endNum === 0 || diff <= 0) {
//       triggerToast('올바른 분석 구간을 설정해 주세요.');
//       return;
//     }
//     if (diff > 32) {
//       triggerToast('분석 구간은 1~32마디 사이로 선택해 주세요');
//       return;
//     }

//     if (audioRef.current) audioRef.current.pause();
//     navigate(`/practice/${practiceId}/analysis/result?start=${startNum}&end=${endNum}`);
//   };

//   return (
//     <div className="relative min-h-screen w-full min-w-[1280px] bg-[#090A0F] px-4 py-[60px] font-sans text-white select-none md:px-16 xl:px-[120px]">
//       {toastMessage && (
//         <div className="fixed top-[40px] left-1/2 z-50 flex -translate-x-1/2 items-center gap-[12px] rounded-[12px] bg-[#E02424] px-[24px] py-[16px] text-[16px] font-bold text-white shadow-2xl">
//           <span>⚠️</span> {toastMessage}
//         </div>
//       )}

//       {/*  뒤로가기 버튼 */}
//       <div className="flex flex-col">
//         <button
//           onClick={() => navigate(-1)}
//           className="flex items-center gap-[6px] text-[15px] font-medium text-[#A6A8B2] transition-colors hover:text-white">
//           <span className="text-[12px]">＜</span> 연습으로
//         </button>

//         <h1 className="mt-[44px] text-[28px] font-bold tracking-tight text-white">분석 파트 설정</h1>

//         <div className="mt-[35px] flex w-full items-end justify-between">
//           <div className="flex h-[52px] items-center gap-[19px]">
//             {/* 재생 / 일시정지 버튼  */}
//             <button
//               onClick={() => setIsPlaying(!isPlaying)}
//               className="flex items-center justify-center bg-transparent transition-all outline-none hover:scale-105 active:scale-95"
//               style={{ width: '33px', height: '26px' }}>
//               {isPlaying ? (
//                 // 일시정지 아이콘
//                 <svg width="26" height="33" viewBox="0 0 26 33" fill="none">
//                   <rect x="3" y="1" width="6" height="31" rx="1.5" fill="#69FFC0" />
//                   <rect x="17" y="1" width="6" height="31" rx="1.5" fill="#69FFC0" />
//                 </svg>
//               ) : (
//                 // 재생 아이콘
//                 <svg width="26" height="33" viewBox="0 0 26 33" fill="none">
//                   <path
//                     d="M25.4208 15.384C26.1931 15.88 26.1931 17.12 25.4208 17.6159L1.73767 32.8254C0.965374 33.3214 0 32.7014 0 31.7095L0 1.29051C0 0.298557 0.965378 -0.321418 1.73768 0.17456L25.4208 15.384Z"
//                     fill="#69FFC0"
//                   />
//                 </svg>
//               )}
//             </button>

//             {/* 처음으로 (되돌리기) 버튼 */}
//             <button
//               onClick={handleRewind}
//               className="flex items-center justify-center rounded-[6px] transition-all outline-none hover:scale-105 active:scale-95"
//               style={{ width: '52px', height: '52px' }}>
//               <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
//                 <rect width="52" height="52" rx="6" fill="#2B2E36" />
//                 <path
//                   d="M31.1991 9.8666C31.6986 9.63179 32.2949 9.84675 32.5301 10.3461L34.8875 15.3549C35.2172 16.0554 34.9161 16.8913 34.2157 17.2211L29.2059 19.5785C28.7063 19.8134 28.1109 19.5986 27.8758 19.099C27.6407 18.5994 27.8549 18.0042 28.3543 17.7689L31.4569 16.308C29.3431 15.3161 26.9824 14.9457 24.6532 15.2523C21.9794 15.6043 19.4957 16.8288 17.5887 18.7357C15.682 20.6426 14.4574 23.1257 14.1053 25.7992C13.7533 28.473 14.2941 31.1883 15.6424 33.5238C16.9908 35.8593 19.0719 37.6851 21.5633 38.7172C24.0548 39.7492 26.8178 39.9307 29.4227 39.2328C32.0276 38.5348 34.3298 36.9963 35.9715 34.8568C37.6131 32.7173 38.5037 30.0955 38.5038 27.3988C38.5039 26.8467 38.9516 26.3988 39.5038 26.3988C40.0558 26.399 40.5036 26.8468 40.5038 27.3988C40.5037 30.5358 39.4681 33.5858 37.5584 36.0746C35.6487 38.5633 32.9704 40.3525 29.9403 41.1644C26.9102 41.9763 23.6969 41.7653 20.7987 40.5648C17.9003 39.3643 15.4786 37.2407 13.91 34.5238C12.3416 31.8071 11.7135 28.6486 12.1229 25.5385C12.5324 22.4284 13.9566 19.5399 16.1747 17.3217C18.393 15.1034 21.2822 13.6784 24.3924 13.2689C27.0866 12.9144 29.8164 13.3397 32.2645 14.4789L30.7206 11.1977C30.4857 10.6981 30.6997 10.1018 31.1991 9.8666Z"
//                   fill="#CECFD1"
//                 />
//               </svg>
//             </button>
//           </div>

//           {/* 우측 마디 선택 및 분석 버튼 입력 폼  */}
//           <div className="flex items-end gap-[16px]">
//             <div className="flex flex-col gap-[8px]">
//               <label className="text-[13px] font-medium text-[#86899C]">분석 시작 마디</label>
//               <input
//                 type="text"
//                 value={startMeasure}
//                 onFocus={() => handleFocus(startMeasure, setStartMeasure)}
//                 onBlur={() => handleBlur(startMeasure, setStartMeasure, '1마디')}
//                 onChange={(e) => handleChange(e.target.value, setStartMeasure)}
//                 className="h-[48px] w-[140px] rounded-[8px] border border-[#2E3142]/60 bg-[#1F212A] px-[16px] text-center text-[15px] font-semibold text-white focus:border-[#69FFC0] focus:outline-none"
//               />
//             </div>

//             <div className="flex flex-col gap-[8px]">
//               <label className="text-[13px] font-medium text-[#86899C]">분석 종료 마디</label>
//               <input
//                 type="text"
//                 value={endMeasure}
//                 onFocus={() => handleFocus(endMeasure, setEndMeasure)}
//                 onBlur={() => handleBlur(endMeasure, setEndMeasure, '30마디')}
//                 onChange={(e) => handleChange(e.target.value, setEndMeasure)}
//                 className="h-[48px] w-[140px] rounded-[8px] border border-[#2E3142]/60 bg-[#1F212A] px-[16px] text-center text-[15px] font-semibold text-white focus:border-[#69FFC0] focus:outline-none"
//               />
//             </div>

//             <button
//               onClick={handleStartAnalysis}
//               className="flex h-[48px] items-center gap-[6px] rounded-[8px] bg-[#69FFC0] px-[24px] text-[15px] font-bold text-[#090A0F] transition-all hover:bg-[#52E0A7] active:scale-[0.98]">
//               분석하기
//               <svg
//                 width="14"
//                 height="14"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="3"
//                 strokeLinecap="round"
//                 strokeLinejoin="round">
//                 <path d="m9 18 6-6-6-6" />
//               </svg>
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* 하단 악보 보드 */}
//       <div className="relative mt-[40px] flex min-h-[500px] w-full items-center justify-center overflow-x-auto rounded-[12px] border border-[#2E3142]/20 bg-[#090A0F] p-[40px]">
//         {isScoreLoading && (
//           <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#090A0F]">
//             <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#69FFC0] border-t-transparent"></div>
//             <span className="mt-[16px] text-[14px] text-[#86899C]">악보 렌더링 및 미디 진행 동기화 중...</span>
//           </div>
//         )}
//         <div ref={scoreContainerRef} className="w-full min-w-[800px]" />
//       </div>
//     </div>
//   );
// }
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';

import ScoreRenderer from '@/components/music/ScoreRenderer';
import { useScoreCursorSync } from '@/hooks/music/useScoreCursorSync';
import { useSlidingWindow } from '@/hooks/music/useSlidingWindow';
import { computeMeasureTimings } from '@/utils/musicXmlTiming';
import { extractMeasureRange } from '@/utils/musicXmlMeasureRange';

export default function AnalysisSelectPage() {
  const navigate = useNavigate();
  const { practiceId } = useParams<{ practiceId: string }>();

  const [isPlaying, setIsPlaying] = useState(false);
  const [startMeasure, setStartMeasure] = useState('1마디');
  const [endMeasure, setEndMeasure] = useState('30마디');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [xmlContent, setXmlContent] = useState('');
  const [measureStartTimes, setMeasureStartTimes] = useState<number[]>([]);
  const [measureXPositions, setMeasureXPositions] = useState<number[]>([]);

  const osmdRef = useRef<OpenSheetMusicDisplay | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 1) 전체 MusicXML은 최초 1회만 fetch (더 이상 마디별로 자르지 않는다)
  useEffect(() => {
    let cancelled = false;
    fetch('/sample.xml')
      .then((r) => r.text())
      .then((text) => {
        if (cancelled) return;
        setXmlContent(text);
        setMeasureStartTimes(computeMeasureTimings(text).measureStartTimes);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // 2) 오디오 엘리먼트 (기존과 동일한 자리)
  useEffect(() => {
    const audio = new Audio('https://actions.google.com/sounds/v1/science_fiction/ambient_space_machine.ogg');
    audioRef.current = audio;
    audio.onended = () => handleRewind();
    return () => {
      audio.pause();
      audioRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.play().catch(() => {});
    else audioRef.current.pause();
  }, [isPlaying]);

  const handleOSMDReady = useCallback((osmd: OpenSheetMusicDisplay, positions: number[]) => {
    osmdRef.current = osmd;
    setMeasureXPositions(positions);
  }, []);

  // 3) 오디오 진행 시간 -> 현재 마디 인덱스 계산 + OSMD 커서 자동 이동
  const { currentMeasureIndex } = useScoreCursorSync({
    osmdRef,
    audioRef,
    measureStartTimes,
    isPlaying,
  });

  // 4) 현재 마디 -> Sliding Window (1~4 -> 4~7 -> 7~10 ...)
  const { translateX, viewportWidth } = useSlidingWindow(measureXPositions, currentMeasureIndex);

  const handleRewind = useCallback(() => {
    setIsPlaying(false);
    if (audioRef.current) audioRef.current.currentTime = 0;
    osmdRef.current?.cursor.reset();
    setToastMessage('첫 마디로 되돌아갔습니다.');
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  const extractNumber = (val: string) => {
    const num = parseInt(val.replace(/[^0-9]/g, ''), 10);
    return isNaN(num) ? '' : num.toString();
  };
  const handleFocus = (val: string, setter: (v: string) => void) => setter(extractNumber(val));
  const handleBlur = (val: string, setter: (v: string) => void, defaultVal: string) => {
    const onlyNum = extractNumber(val);
    setter(!onlyNum || onlyNum === '0' ? defaultVal : `${onlyNum}마디`);
  };
  const handleChange = (val: string, setter: (v: string) => void) => setter(val.replace(/[^0-9]/g, ''));

  const getMeasureNumber = (val: string) => {
    const num = parseInt(val.replace(/[^0-9]/g, ''), 10);
    return isNaN(num) ? 0 : num;
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleStartAnalysis = () => {
    const startNum = getMeasureNumber(startMeasure);
    const endNum = getMeasureNumber(endMeasure);
    const diff = endNum - startNum + 1;

    if (startNum === 0 || endNum === 0 || diff <= 0) {
      triggerToast('올바른 분석 구간을 설정해 주세요.');
      return;
    }
    if (diff > 32) {
      triggerToast('분석 구간은 1~32마디 사이로 선택해 주세요');
      return;
    }

    audioRef.current?.pause();

    // "분석하기"를 누르는 순간에만 1회 잘라서 다음 페이지로 넘긴다.
    // (표시/슬라이딩 경로와는 완전히 분리되어 있으므로 성능에 영향 없음)
    const rangeXml = extractMeasureRange(xmlContent, startNum, endNum);
    navigate(`/practice/${practiceId}/analysis/result?start=${startNum}&end=${endNum}`, { state: { rangeXml } });
  };

  return (
    <div className="relative min-h-screen w-full min-w-[1280px] bg-[#090A0F] px-4 py-[60px] font-sans text-white select-none md:px-16 xl:px-[120px]">
      {toastMessage && (
        <div className="fixed top-[40px] left-1/2 z-50 flex -translate-x-1/2 items-center gap-[12px] rounded-[12px] bg-[#E02424] px-[24px] py-[16px] text-[16px] font-bold text-white shadow-2xl">
          <span>⚠️</span> {toastMessage}
        </div>
      )}

      <div className="flex flex-col">
        <button
          onClick={() => navigate(-1)}
          className="flex cursor-pointer items-center gap-[6px] text-[15px] font-medium text-[#A6A8B2] transition-colors hover:text-white">
          <span className="text-[12px]">＜</span> 연습으로
        </button>

        <h1 className="mt-[44px] text-[28px] font-bold tracking-tight text-white">분석 파트 설정</h1>

        <div className="mt-[35px] flex w-full items-end justify-between">
          <div className="flex h-[52px] items-center gap-[19px]">
            <button
              onClick={() => setIsPlaying((p) => !p)}
              className="flex cursor-pointer items-center justify-center bg-transparent transition-all outline-none hover:scale-105 active:scale-95"
              style={{ width: '33px', height: '26px' }}>
              {isPlaying ? (
                <svg width="26" height="33" viewBox="0 0 26 33" fill="none">
                  <rect x="3" y="1" width="6" height="31" rx="1.5" fill="#69FFC0" />
                  <rect x="17" y="1" width="6" height="31" rx="1.5" fill="#69FFC0" />
                </svg>
              ) : (
                <svg width="26" height="33" viewBox="0 0 26 33" fill="none">
                  <path
                    d="M25.4208 15.384C26.1931 15.88 26.1931 17.12 25.4208 17.6159L1.73767 32.8254C0.965374 33.3214 0 32.7014 0 31.7095L0 1.29051C0 0.298557 0.965378 -0.321418 1.73768 0.17456L25.4208 15.384Z"
                    fill="#69FFC0"
                  />
                </svg>
              )}
            </button>

            <button
              onClick={handleRewind}
              className="flex cursor-pointer items-center justify-center rounded-[6px] transition-all outline-none hover:scale-105 active:scale-95"
              style={{ width: '52px', height: '52px' }}>
              <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                <rect width="52" height="52" rx="6" fill="#2B2E36" />
                <path
                  d="M31.1991 9.8666C31.6986 9.63179 32.2949 9.84675 32.5301 10.3461L34.8875 15.3549C35.2172 16.0554 34.9161 16.8913 34.2157 17.2211L29.2059 19.5785C28.7063 19.8134 28.1109 19.5986 27.8758 19.099C27.6407 18.5994 27.8549 18.0042 28.3543 17.7689L31.4569 16.308C29.3431 15.3161 26.9824 14.9457 24.6532 15.2523C21.9794 15.6043 19.4957 16.8288 17.5887 18.7357C15.682 20.6426 14.4574 23.1257 14.1053 25.7992C13.7533 28.473 14.2941 31.1883 15.6424 33.5238C16.9908 35.8593 19.0719 37.6851 21.5633 38.7172C24.0548 39.7492 26.8178 39.9307 29.4227 39.2328C32.0276 38.5348 34.3298 36.9963 35.9715 34.8568C37.6131 32.7173 38.5037 30.0955 38.5038 27.3988C38.5039 26.8467 38.9516 26.3988 39.5038 26.3988C40.0558 26.399 40.5036 26.8468 40.5038 27.3988C40.5037 30.5358 39.4681 33.5858 37.5584 36.0746C35.6487 38.5633 32.9704 40.3525 29.9403 41.1644C26.9102 41.9763 23.6969 41.7653 20.7987 40.5648C17.9003 39.3643 15.4786 37.2407 13.91 34.5238C12.3416 31.8071 11.7135 28.6486 12.1229 25.5385C12.5324 22.4284 13.9566 19.5399 16.1747 17.3217C18.393 15.1034 21.2822 13.6784 24.3924 13.2689C27.0866 12.9144 29.8164 13.3397 32.2645 14.4789L30.7206 11.1977C30.4857 10.6981 30.6997 10.1018 31.1991 9.8666Z"
                  fill="#CECFD1"
                />
              </svg>
            </button>
          </div>

          <div className="flex items-end gap-[16px]">
            <div className="flex flex-col gap-[8px]">
              <label className="text-[13px] font-medium text-[#86899C]">분석 시작 마디</label>
              <input
                type="text"
                value={startMeasure}
                onFocus={() => handleFocus(startMeasure, setStartMeasure)}
                onBlur={() => handleBlur(startMeasure, setStartMeasure, '1마디')}
                onChange={(e) => handleChange(e.target.value, setStartMeasure)}
                className="h-[48px] w-[140px] rounded-[8px] border border-[#2E3142]/60 bg-[#1F212A] px-[16px] text-center text-[15px] font-semibold text-white focus:border-[#69FFC0] focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-[8px]">
              <label className="text-[13px] font-medium text-[#86899C]">분석 종료 마디</label>
              <input
                type="text"
                value={endMeasure}
                onFocus={() => handleFocus(endMeasure, setEndMeasure)}
                onBlur={() => handleBlur(endMeasure, setEndMeasure, '30마디')}
                onChange={(e) => handleChange(e.target.value, setEndMeasure)}
                className="h-[48px] w-[140px] rounded-[8px] border border-[#2E3142]/60 bg-[#1F212A] px-[16px] text-center text-[15px] font-semibold text-white focus:border-[#69FFC0] focus:outline-none"
              />
            </div>

            <button
              onClick={handleStartAnalysis}
              className="flex h-[48px] cursor-pointer items-center gap-[6px] rounded-[8px] bg-[#69FFC0] px-[24px] text-[15px] font-bold text-[#090A0F] transition-all hover:bg-[#52E0A7] active:scale-[0.98]">
              분석하기
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-[40px]">
        {xmlContent && (
          <ScoreRenderer
            xmlContent={xmlContent}
            translateX={translateX}
            viewportWidth={viewportWidth}
            onReady={handleOSMDReady}
          />
        )}
      </div>
    </div>
  );
}
