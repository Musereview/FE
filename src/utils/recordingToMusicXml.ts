// 사용자가 실시간 연주한 녹음(PlayedNote[])을 MusicXML 문자열로 변환한다.
// 분석 화면에서 하드코딩된 /sample.xml 대신 실제 연주 내용을 OSMD로 그리기 위한 용도.
import type { PlayedNote } from '@/stores/practiceResultStore';

/** 16분음표 단위 해상도 (4분음표 = 4 division) */
const DIVISIONS = 4;

export interface BuildMusicXmlOptions {
  bpm: number;
  beatsPerBar: number; // 박자표 분자 (예: 4/4 → 4)
  beatType?: number; // 박자표 분모 (예: 4/4 → 4)
  key?: string; // 'C', 'G', 'E' ...
  mode?: 'major' | 'minor';
  title?: string;
  latencyMs?: number;
}

const PITCH_CLASS_INFO: { step: string; alter: number }[] = [
  { step: 'C', alter: 0 },
  { step: 'C', alter: 1 },
  { step: 'D', alter: 0 },
  { step: 'D', alter: 1 },
  { step: 'E', alter: 0 },
  { step: 'F', alter: 0 },
  { step: 'F', alter: 1 },
  { step: 'G', alter: 0 },
  { step: 'G', alter: 1 },
  { step: 'A', alter: 0 },
  { step: 'A', alter: 1 },
  { step: 'B', alter: 0 },
];

// alter 값 → 악보에 실제로 그려질 기호 이름(MusicXML <accidental>).
// <alter>는 '소리'만 정하고 기호는 그리지 않으므로, 제자리표는 이 태그로 명시해야 한다.
const ACCIDENTAL_NAME: Record<number, string> = {
  [-2]: 'flat-flat',
  [-1]: 'flat',
  0: 'natural',
  1: 'sharp',
  2: 'double-sharp',
};

// 조표에 포함된 음은 임시표 없이도 이미 올림/내림 상태다 (예: G major의 F는 기본이 F#).
const SHARP_ORDER = ['F', 'C', 'G', 'D', 'A', 'E', 'B'];
const FLAT_ORDER = ['B', 'E', 'A', 'D', 'G', 'C', 'F'];

/** fifths(조표) → step별 기본 alter. 여기 없는 step은 0(제자리). */
function buildKeyAlters(fifths: number): Map<string, number> {
  const map = new Map<string, number>();
  if (fifths > 0) SHARP_ORDER.slice(0, fifths).forEach((s) => map.set(s, 1));
  if (fifths < 0) FLAT_ORDER.slice(0, -fifths).forEach((s) => map.set(s, -1));
  return map;
}

// 조성 이름 → fifths(조표) 매핑. 목록에 없는 조성은 0(C major/A minor)으로 처리.
const KEY_FIFTHS: Record<string, number> = {
  'C-major': 0,
  'G-major': 1,
  'D-major': 2,
  'A-major': 3,
  'E-major': 4,
  'B-major': 5,
  'F#-major': 6,
  'C#-major': 7,
  'F-major': -1,
  'Bb-major': -2,
  'Eb-major': -3,
  'Ab-major': -4,
  'Db-major': -5,
  'Gb-major': -6,
  'Cb-major': -7,
  'A-minor': 0,
  'E-minor': 1,
  'B-minor': 2,
  'F#-minor': 3,
  'C#-minor': 4,
  'G#-minor': 5,
  'D#-minor': 6,
  'A#-minor': 7,
  'D-minor': -1,
  'G-minor': -2,
  'C-minor': -3,
  'F-minor': -4,
  'Bb-minor': -5,
  'Eb-minor': -6,
  'Ab-minor': -7,
};

// 허용 duration(분할 단위, division 기준)과 그에 대응하는 MusicXML type/dot.
// 내림차순: 긴 음가부터 그리디하게 소진하며 tie로 이어붙인다.
const DURATION_STEPS: { ticks: number; type: string; dot: boolean }[] = [
  { ticks: 16, type: 'whole', dot: false },
  { ticks: 12, type: 'half', dot: true },
  { ticks: 8, type: 'half', dot: false },
  { ticks: 6, type: 'quarter', dot: true },
  { ticks: 4, type: 'quarter', dot: false },
  { ticks: 3, type: 'eighth', dot: true },
  { ticks: 2, type: 'eighth', dot: false },
  { ticks: 1, type: '16th', dot: false },
];

const escapeXml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function midiToPitch(midi: number) {
  const pc = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  const { step, alter } = PITCH_CLASS_INFO[pc];
  return { step, alter, octave };
}

// 그랜드 스태프 분리 기준: 가온도(C4=MIDI 60) 컨벤션에서 낮은음자리표 경계는 F#3(MIDI 54).
// 이 음까지(이하)는 낮은음자리표(staff 2), 초과는 높은음자리표(staff 1)로 나눈다.
const GRAND_STAFF_SPLIT_MIDI = 54;

/** ticks를 표기 가능한 음표 단위들로 분해한다 (필요 시 tie로 이어질 조각들). */
function decomposeTicks(ticks: number): { ticks: number; type: string; dot: boolean }[] {
  const pieces: { ticks: number; type: string; dot: boolean }[] = [];
  let remaining = ticks;
  while (remaining > 0) {
    const step = DURATION_STEPS.find((s) => s.ticks <= remaining)!;
    pieces.push(step);
    remaining -= step.ticks;
  }
  return pieces;
}

interface NoteFragment {
  pitches: number[] | null; // null이면 쉼표
  ticks: number;
  type: string;
  dot: boolean;
  tieStart: boolean;
  tieStop: boolean;
}

/** 마디 전체를 쉼표로 채운 NoteFragment 배열 (그랜드 스태프 중 한쪽 마디 수가 모자랄 때 채움용) */
function fullMeasureRest(measureTicks: number): NoteFragment[] {
  return decomposeTicks(measureTicks).map((piece) => ({
    pitches: null,
    ticks: piece.ticks,
    type: piece.type,
    dot: piece.dot,
    tieStart: false,
    tieStop: false,
  }));
}

/**
 * 같은 시작 tick끼리 화음으로 그룹화하고, 겹치는 노트(다음 그룹이 이전 그룹 duration 안에서 시작)를
 * 클리핑해 단선율을 유지한다. 보표별로 나눈 노트에 대해 독립적으로 호출해야 한다 —
 * 합친 뒤에 클리핑하면 서로 다른 보표의 노트끼리 간섭해 지속 길이가 잘못 잘린다.
 */
function buildGroups(
  notes: { pitch: number; startTick: number; durationTicks: number }[],
): { startTick: number; durationTicks: number; pitches: number[] }[] {
  const groups: { startTick: number; durationTicks: number; pitches: number[] }[] = [];
  for (const n of notes) {
    const last = groups[groups.length - 1];
    if (last && last.startTick === n.startTick) {
      last.pitches.push(n.pitch);
      last.durationTicks = Math.max(last.durationTicks, n.durationTicks);
    } else {
      groups.push({ startTick: n.startTick, durationTicks: n.durationTicks, pitches: [n.pitch] });
    }
  }

  for (let i = 0; i < groups.length - 1; i++) {
    const maxTicks = groups[i + 1].startTick - groups[i].startTick;
    groups[i].durationTicks = Math.max(1, Math.min(groups[i].durationTicks, maxTicks));
  }
  return groups;
}

/**
 * 한 성부(그룹 목록)를 마디별 NoteFragment 배열로 변환한다.
 * - [startTick, startTick+ticks) 구간을 마디 경계에서 잘라 tie로 이어지는 조각들로 기록.
 * - 그룹 사이 빈 구간과 마지막 불완전 마디는 쉼표로 채운다.
 */
function buildStaffMeasures(
  groups: { startTick: number; durationTicks: number; pitches: number[] }[],
  measureTicks: number,
): NoteFragment[][] {
  const measures: NoteFragment[][] = [];
  const ensureMeasure = (idx: number) => {
    while (measures.length <= idx) measures.push([]);
  };

  const writeSpan = (startTick: number, ticks: number, pitches: number[] | null) => {
    let pos = startTick;
    let remaining = ticks;
    let isFirstChunk = true;
    while (remaining > 0) {
      const measureIdx = Math.floor(pos / measureTicks);
      const posInMeasure = pos - measureIdx * measureTicks;
      const chunkTicks = Math.min(remaining, measureTicks - posInMeasure);
      ensureMeasure(measureIdx);

      const pieces = decomposeTicks(chunkTicks);
      pieces.forEach((piece, i) => {
        const isLastPieceOfChunk = i === pieces.length - 1;
        const isLastChunkOverall = chunkTicks === remaining;
        measures[measureIdx].push({
          pitches,
          ticks: piece.ticks,
          type: piece.type,
          dot: piece.dot,
          tieStart: !(isLastPieceOfChunk && isLastChunkOverall),
          tieStop: !(isFirstChunk && i === 0),
        });
      });

      pos += chunkTicks;
      remaining -= chunkTicks;
      isFirstChunk = false;
    }
  };

  let cursor = 0;
  for (const g of groups) {
    if (g.startTick > cursor) writeSpan(cursor, g.startTick - cursor, null); // 빈 구간 = 쉼표
    writeSpan(g.startTick, g.durationTicks, g.pitches);
    cursor = g.startTick + g.durationTicks;
  }
  // 마지막 마디를 쉼표로 채워 불완전 마디가 남지 않게 한다.
  const remainderInLastMeasure = cursor % measureTicks;
  if (measures.length === 0 || remainderInLastMeasure > 0) {
    writeSpan(cursor, measureTicks - remainderInLastMeasure, null);
  }
  return measures;
}

/**
 * 연주 녹음(PlayedNote[])을 MusicXML(score-partwise) 문자열로 변환한다.
 * - 같은 시각(quantize 후)에 시작하는 노트는 화음(chord)으로 묶는다.
 * - 마디 경계를 넘는 노트는 tie로 이어지는 여러 조각으로 분할한다.
 * - 서로 다른 시각에 겹치는(폴리포닉) 노트는 지원하지 않고 시작 순서대로 단선율 처리한다.
 */
export function buildMusicXmlFromRecording(recording: PlayedNote[], options: BuildMusicXmlOptions): string {
  const { bpm, beatsPerBar, beatType = 4, key = 'C', mode = 'major', title = '내 연주' } = options;

  const secToTick = (sec: number) => Math.round(((sec * bpm) / 60) * DIVISIONS);
  const measureTicks = Math.max(1, Math.round(beatsPerBar * (4 / beatType) * DIVISIONS));

  const quantized = recording
    .map((n) => {
      const startTick = Math.max(0, secToTick(n.onSec));
      const endTick = secToTick(n.offSec ?? n.onSec + 60 / bpm); // 못 닫힌 노트는 1박으로 대체
      return { pitch: n.midi, startTick, durationTicks: Math.max(1, endTick - startTick) };
    })
    .sort((a, b) => a.startTick - b.startTick);

  // 그랜드 스태프: 노트를 높은음자리표/낮은음자리표로 먼저 나눈 뒤, 화음 그룹화·겹침 클리핑을
  // 각 보표에서 독립적으로 수행한다 (합친 뒤 나누면 반대 보표 노트가 클리핑에 간섭함).
  const trebleGroups = buildGroups(quantized.filter((n) => n.pitch > GRAND_STAFF_SPLIT_MIDI));
  const bassGroups = buildGroups(quantized.filter((n) => n.pitch <= GRAND_STAFF_SPLIT_MIDI));

  const trebleMeasures = buildStaffMeasures(trebleGroups, measureTicks);
  const bassMeasures = buildStaffMeasures(bassGroups, measureTicks);

  // 한쪽 손 연주가 더 일찍 끝나 마디 수가 모자라면 쉼표 마디로 채워 길이를 맞춘다.
  const totalMeasureCount = Math.max(trebleMeasures.length, bassMeasures.length, 1);
  while (trebleMeasures.length < totalMeasureCount) trebleMeasures.push(fullMeasureRest(measureTicks));
  while (bassMeasures.length < totalMeasureCount) bassMeasures.push(fullMeasureRest(measureTicks));

  const fifths = KEY_FIFTHS[`${key}-${mode}`] ?? 0;
  const keyAlters = buildKeyAlters(fifths);

  // state: `${step}${octave}` → 이 마디에서 현재 유효한 alter.
  // 임시표는 마디 끝까지 유지되므로, 마디마다 보표별로 새로 만들어 넘긴다.
  const noteXml = (frag: NoteFragment, voice: number, staff: number, state: Map<string, number>): string => {
    const parts: string[] = [];
    const pitches = frag.pitches;
    if (pitches) {
      pitches.forEach((midi, i) => {
        parts.push('<note>');
        if (i > 0) parts.push('<chord/>');
        const { step, alter, octave } = midiToPitch(midi);
        parts.push('<pitch>');
        parts.push(`<step>${step}</step>`);
        if (alter !== 0) parts.push(`<alter>${alter}</alter>`);
        parts.push(`<octave>${octave}</octave>`);
        parts.push('</pitch>');
        parts.push(`<duration>${frag.ticks}</duration>`);
        if (frag.tieStart) parts.push('<tie type="start"/>');
        if (frag.tieStop) parts.push('<tie type="stop"/>');
        parts.push(`<voice>${voice}</voice>`);
        parts.push(`<type>${frag.type}</type>`);
        if (frag.dot) parts.push('<dot/>');

        // 직전에 유효하던 alter와 다를 때만 기호를 찍는다. C# 뒤의 C가 제자리표(♮)를 받는 지점.
        // 붙임줄로 앞 마디에서 넘어온 조각은 이미 기호가 붙어 있으므로 생략하되, 상태는 갱신한다.
        const slot = `${step}${octave}`;
        const effective = state.get(slot) ?? keyAlters.get(step) ?? 0;
        if (alter !== effective && !frag.tieStop) {
          parts.push(`<accidental>${ACCIDENTAL_NAME[alter]}</accidental>`);
        }
        state.set(slot, alter);

        parts.push(`<staff>${staff}</staff>`);
        if (frag.tieStart || frag.tieStop) {
          parts.push('<notations>');
          if (frag.tieStart) parts.push('<tied type="start"/>');
          if (frag.tieStop) parts.push('<tied type="stop"/>');
          parts.push('</notations>');
        }
        parts.push('</note>');
      });
    } else {
      parts.push('<note>');
      parts.push('<rest/>');
      parts.push(`<duration>${frag.ticks}</duration>`);
      parts.push(`<voice>${voice}</voice>`);
      parts.push(`<type>${frag.type}</type>`);
      if (frag.dot) parts.push('<dot/>');
      parts.push(`<staff>${staff}</staff>`);
      parts.push('</note>');
    }
    return parts.join('');
  };

  const measuresXml = Array.from({ length: totalMeasureCount }, (_, idx) => {
    // 음표 위치는 실제 bpm으로 양자화하므로 템포도 같이 남김
    // 없으면 computeMeasureTimings가 기본값 120bpm으로 마디 시각을 계산해 오디오와 어긋
    const attributesXml =
      idx === 0
        ? `<attributes><divisions>${DIVISIONS}</divisions><key><fifths>${fifths}</fifths></key><time><beats>${beatsPerBar}</beats><beat-type>${beatType}</beat-type></time><staves>2</staves><clef number="1"><sign>G</sign><line>2</line></clef><clef number="2"><sign>F</sign><line>4</line></clef></attributes><sound tempo="${bpm}"/>`
        : '';
    // 임시표 효력은 마디가 바뀌면 사라지고, 보표(높은음/낮은음)마다 독립적으로 적용된다.
    const trebleState = new Map<string, number>();
    const bassState = new Map<string, number>();
    const trebleXml = trebleMeasures[idx].map((f) => noteXml(f, 1, 1, trebleState)).join('');
    const backupXml = `<backup><duration>${measureTicks}</duration></backup>`;
    const bassXml = bassMeasures[idx].map((f) => noteXml(f, 2, 2, bassState)).join('');
    return `<measure number="${idx + 1}">${attributesXml}${trebleXml}${backupXml}${bassXml}</measure>`;
  }).join('');

  return (
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">' +
    '<score-partwise version="3.1">' +
    `<work><work-title>${escapeXml(title)}</work-title></work>` +
    '<part-list><score-part id="P1"><part-name>Piano</part-name></score-part></part-list>' +
    `<part id="P1">${measuresXml}</part>` +
    '</score-partwise>'
  );
}
