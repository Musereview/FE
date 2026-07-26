// OSMD 음표 색칠 + 정답 음 추출 유틸 (학습 화면 판정 표시)
// - 현재 쳐야 하는 음: 음표 전체를 보라색(secondary-400)으로 채움
// - 판정된 음: 채움은 기본색으로 되돌리고 노트헤드 "테두리"만 판정색(Excellent/Good/Bad)으로
// - 아직 차례가 아닌 음: 손대지 않음(기본색 유지)
import { JUDGMENT_COLOR, type NoteJudgment } from '@/constants/scoring';

export const CURRENT_NOTE_COLOR = '#c680ff'; // secondary-400 (현재 쳐야 하는 음)
const DEFAULT_NOTE_COLOR = '#aeb1b6'; // useOSMD 다크모드 기본 음표색

// OSMD GraphicalNote에서 실제로 쓰는 부분만 최소 타입으로 정의 (타입 결합도 최소화)
// NOTE: OSMD의 setColor API는 빔/꼬리 없는 음표에서 간헐적으로 예외를 던져 색이 안 먹는 경우가 있어,
//       노트헤드/기둥 SVG를 직접 조작한다(안정적, 재렌더에도 유지).
interface ColorableNote {
  sourceNote?: { halfTone: number; isRest(): boolean };
  getNoteheadSVGs?(): HTMLElement[];
  getStemSVG?(): HTMLElement | null;
  getFlagSVG?(): HTMLElement | null; // 꼬리 (8분음표 이하)
  getBeamSVGs?(): HTMLElement[]; // 빔 (여러 음 묶음)
}

export interface NoteEvent {
  gnotes: ColorableNote[]; // 같은 시점에 울리는 음표들(양손/화음)
  midis: number[]; // 해당 음표들의 MIDI
  onBeat: number; // 곡 시작 기준 박 위치 (4/4 가정: whole-note × 4)
}

// OSMD 커서를 한 번 훑어 정답 음 이벤트 목록 추출
// NOTE(mock 가정): 4/4 기준으로 whole-note timestamp × 4 = 박. MIDI = OSMD halfTone + 12.
export function extractNoteEvents(osmd: unknown): NoteEvent[] {
  // OSMD 내부 API 접근 (타입 미노출) — 최소한으로 캐스팅
  const cursor = (osmd as { cursor?: OsmdCursorLike })?.cursor;
  if (!cursor) return [];

  const events: NoteEvent[] = [];
  try {
    cursor.reset();
    let guard = 0;
    while (!cursor.iterator?.EndReached && guard++ < 10000) {
      const gnotes = (cursor.GNotesUnderCursor?.() ?? []) as ColorableNote[];
      const beat = (cursor.iterator?.CurrentSourceTimestamp?.RealValue ?? 0) * 4;
      const playable = gnotes.filter((g) => g?.sourceNote && !g.sourceNote.isRest());
      if (playable.length > 0) {
        events.push({
          gnotes: playable,
          midis: playable.map((g) => (g.sourceNote as { halfTone: number }).halfTone + 12),
          onBeat: beat,
        });
      }
      cursor.next();
    }
    cursor.reset();
    cursor.hide?.(); // 우리 색칠로 표시하므로 OSMD 기본 커서는 숨김
  } catch (err) {
    console.warn('[osmdColor] 정답 음 추출 중 오류:', err);
  }
  if (events.length === 0) console.warn('[osmdColor] 정답 음 0개 추출됨 — 커서/악보 상태 확인 필요');
  return events;
}

// 음표의 노트헤드/기둥 SVG를 안전하게 가져오기 (OSMD 내부 API — 예외 방어)
function heads(g: ColorableNote): HTMLElement[] {
  try {
    return g.getNoteheadSVGs?.() ?? [];
  } catch {
    return [];
  }
}
function stemOf(g: ColorableNote): HTMLElement | null {
  try {
    return g.getStemSVG?.() ?? null;
  } catch {
    return null;
  }
}
function flagOf(g: ColorableNote): HTMLElement | null {
  try {
    return g.getFlagSVG?.() ?? null;
  } catch {
    return null;
  }
}
function beamsOf(g: ColorableNote): HTMLElement[] {
  try {
    return g.getBeamSVGs?.() ?? [];
  } catch {
    return [];
  }
}

// 기둥·꼬리·빔을 한 색으로 칠하기 (노트헤드 제외)
function paintParts(g: ColorableNote, color: string) {
  applyColor(stemOf(g), { fill: color, stroke: color });
  applyColor(flagOf(g), { fill: color, stroke: color });
  beamsOf(g).forEach((b) => applyColor(b, { fill: color, stroke: color }));
}

// 요소 자신 + 하위 도형(path/ellipse 등)까지 색 적용
// (getNoteheadSVGs가 <g>를 반환하고 하위 path에 명시적 fill이 걸린 경우까지 확실히 덮기 위함)
function applyColor(el: HTMLElement | null, opts: { fill?: string; stroke?: string | null; strokeWidth?: string }) {
  if (!el) return;
  const targets: Element[] = [el, ...Array.from(el.querySelectorAll('path, ellipse, rect, circle, polygon'))];
  for (const t of targets) {
    if (opts.fill !== undefined) t.setAttribute('fill', opts.fill);
    if (opts.stroke === null) {
      t.removeAttribute('stroke');
      t.removeAttribute('stroke-width');
    } else if (opts.stroke !== undefined) {
      t.setAttribute('stroke', opts.stroke);
      if (opts.strokeWidth) t.setAttribute('stroke-width', opts.strokeWidth);
    }
  }
}

// 현재 쳐야 하는 음: 노트헤드 채움 + 기둥을 보라색으로 (테두리 없음)
export function paintCurrent(gnotes: ColorableNote[]) {
  gnotes.forEach((g) => {
    heads(g).forEach((h) => applyColor(h, { fill: CURRENT_NOTE_COLOR, stroke: null }));
    paintParts(g, CURRENT_NOTE_COLOR);
  });
}

// 판정된 음: 채움은 기본색으로, 노트헤드 "테두리"만 판정색(Excellent/Good/Bad)
export function paintJudged(gnotes: ColorableNote[], judgment: NoteJudgment) {
  const color = JUDGMENT_COLOR[judgment];
  gnotes.forEach((g) => {
    heads(g).forEach((h) => applyColor(h, { fill: DEFAULT_NOTE_COLOR, stroke: color, strokeWidth: '1' }));
    paintParts(g, color);
  });
}

// 기본색으로 되돌리기 (테두리 제거)
export function paintDefault(gnotes: ColorableNote[]) {
  gnotes.forEach((g) => {
    heads(g).forEach((h) => applyColor(h, { fill: DEFAULT_NOTE_COLOR, stroke: null }));
    paintParts(g, DEFAULT_NOTE_COLOR);
  });
}

// 현재 박에 해당하는 이벤트 인덱스 (onBeat ≤ beat 중 마지막). 없으면 -1
export function findCurrentEventIndex(events: NoteEvent[], beat: number): number {
  if (beat < 0 || events.length === 0) return -1;
  let idx = -1;
  for (let i = 0; i < events.length; i++) {
    if (events[i].onBeat <= beat + 1e-6) idx = i;
    else break;
  }
  return idx;
}

// OSMD 커서 최소 타입
interface OsmdCursorLike {
  reset(): void;
  next(): void;
  hide?(): void;
  GNotesUnderCursor?(): unknown[];
  iterator?: {
    EndReached: boolean;
    CurrentSourceTimestamp?: { RealValue: number };
  };
}
