// 랜딩 페이지
import { useEffect, useRef } from 'react';
import LogoTypo from '@/assets/landing/logo.svg?react';
import HeroWave from '@/assets/landing/hero-wave.svg?react';
import waveFillUrl from '@/assets/landing/hero-wave-fill.svg?url';
import glow1Url from '@/assets/landing/glow-1.png';
import glow2Url from '@/assets/landing/glow-2.png';
import VERT from './glass.vert.glsl?raw';
import FRAG from './glass.frag.glsl?raw';

const TITLE = '흘러간 영감을 다시 듣다.';

// 이미지 로드
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number) {
  const scale = Math.max(w / img.width, h / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
}

function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { premultipliedAlpha: false });
    if (!gl) return;

    let disposed = false;

    // 셰이더 컴파일·연결
    const compile = (type: number, src: string) => {
      const s = gl.createShader(type);
      if (!s) throw new Error('shader');
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    gl.useProgram(program);

    // 화면 전체 사각형
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, 'uRes');
    const uScale = gl.getUniformLocation(program, 'uScale');
    const uSpread = gl.getUniformLocation(program, 'uSpread');
    const uRim = gl.getUniformLocation(program, 'uRim');
    gl.uniform1i(gl.getUniformLocation(program, 'tScene'), 0);
    gl.uniform1i(gl.getUniformLocation(program, 'tHeight'), 1);

    const makeTex = (unit: number) => {
      const tex = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      return tex;
    };
    const sceneTex = makeTex(0);
    const heightTex = makeTex(1);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    const drawScene = (w: number, h: number, dpr: number) => {
      const c = document.createElement('canvas');
      c.width = w * dpr;
      c.height = h * dpr;
      const ctx = c.getContext('2d');
      if (!ctx) return c;
      ctx.scale(dpr, dpr);
      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(0, 0, w, h);
      if (img1) drawCover(ctx, img1, w, h);
      if (img2) drawCover(ctx, img2, w, h);
      const fs = Math.min(Math.max(44, 0.095 * w), 150);
      ctx.fillStyle = '#f0f1f1';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `500 ${fs}px Pretendard, sans-serif`;
      if ('letterSpacing' in ctx) {
        (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '-2px';
      }
      ctx.fillText(TITLE, w / 2, h * 0.5 - 10);
      return c;
    };

    const drawHeight = (w: number, h: number, dpr: number) => {
      const c = document.createElement('canvas');
      c.width = w * dpr;
      c.height = h * dpr;
      const ctx = c.getContext('2d');
      if (!ctx) return c;
      ctx.scale(dpr, dpr);
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, w, h);
      if (!imgFill) return c;
      // 외곽선 SVG와 같은 위치
      const ribbonW = 1703;
      const ribbonH = 950;
      const x0 = w / 2 - ribbonW / 2;
      const y0 = h / 2 - 0.46 * ribbonH;
      ctx.filter = 'blur(18px)';
      ctx.drawImage(imgFill, x0, y0, ribbonW, ribbonH);
      ctx.filter = 'none';
      return c;
    };

    // 캔버스 → 텍스처 업로드
    const upload = (unit: number, tex: WebGLTexture | null, src: HTMLCanvasElement) => {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
    };

    const render = () => {
      if (disposed) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w === 0 || h === 0) return;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
      upload(0, sceneTex, drawScene(w, h, dpr));
      upload(1, heightTex, drawHeight(w, h, dpr));
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uScale, 0.06);
      gl.uniform1f(uSpread, 2.5);
      gl.uniform1f(uRim, 0.0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    let img1: HTMLImageElement | null = null;
    let img2: HTMLImageElement | null = null;
    let imgFill: HTMLImageElement | null = null;
    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(render);
    };

    // 창 크기 변화 감지
    const ro = new ResizeObserver(onResize);

    // 모니터 이동, 확대 감지
    let mql: MediaQueryList | null = null;
    const onDpr = () => {
      onResize();
      watchDpr();
    };
    const watchDpr = () => {
      mql = window.matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`);
      mql.addEventListener('change', onDpr, { once: true });
    };

    // 이미지, 폰트 로드 후 렌더링
    Promise.all([loadImage(glow1Url), loadImage(glow2Url), loadImage(waveFillUrl), document.fonts.ready])
      .then(([a, b, fill]) => {
        if (disposed) return;
        img1 = a;
        img2 = b;
        imgFill = fill;
        return document.fonts.load('500 150px Pretendard');
      })
      .then(() => {
        if (disposed) return;
        render();
        ro.observe(canvas);
        watchDpr();
      })
      .catch(() => {});

    // 클린업 함수
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      mql?.removeEventListener('change', onDpr);
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
    };
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gray-950">
      {/* 배경 + 타이틀 + 유리 굴절 */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 block size-full" />
      <h1 className="sr-only">{TITLE}</h1>

      {/* 유리 외곽선 */}
      <HeroWave
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 z-10 w-[1703px] max-w-none -translate-x-1/2 -translate-y-[46%]"
      />

      {/* 상단 로고 */}
      <header className="relative z-20 flex h-[124px] items-center justify-center px-2.5 py-1">
        <LogoTypo className="text-primary-400 h-[29px] w-[174px]" aria-label="MUSE REVIEW" />
      </header>
    </div>
  );
}

export default LandingPage;
