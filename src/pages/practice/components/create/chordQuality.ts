export type ChordQuality = 'Maj' | 'Min' | 'Sus2' | 'Sus4' | '5' | 'Aug' | 'Dim';
export type ChordExtension = 'b5' | '#5' | '6' | '7' | 'maj7' | 'b9' | '9' | '#9' | '11' | '#11' | 'b13' | '13';

export const NOTE_OPTIONS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const QUALITY_OPTIONS: ChordQuality[] = ['Maj', 'Min', 'Sus2', 'Sus4', '5', 'Aug', 'Dim'];

export const QUALITY_SUFFIX: Record<ChordQuality, string> = {
  Maj: '',
  Min: 'm',
  Sus2: 'sus2',
  Sus4: 'sus4',
  '5': '5',
  Aug: 'aug',
  Dim: 'dim',
};

export const EXTENSION_OPTIONS: { value: ChordExtension; label: string }[] = [
  { value: 'b5', label: '♭5' },
  { value: '#5', label: '#5' },
  { value: '6', label: '6' },
  { value: '7', label: '7' },
  { value: 'maj7', label: 'maj7' },
  { value: 'b9', label: '♭9' },
  { value: '9', label: '9' },
  { value: '#9', label: '#9' },
  { value: '11', label: '11' },
  { value: '#11', label: '#11' },
  { value: 'b13', label: '♭13' },
  { value: '13', label: '13' },
];

// 전체 이론 조합 아님, 정의된 조합만 (추후 확장 필요)
export const QUALITY_DISABLED_EXTENSIONS: Record<ChordQuality, ChordExtension[]> = {
  Maj: [],
  Min: ['#5', '#9'],
  Sus2: ['b9', '9', '#9'],
  Sus4: ['#9', '11', '#11'],
  '5': ['#9'],
  Aug: ['b5', 'b13'],
  Dim: ['#5', '#9', '#11'],
};

// 자동 포함 텐션 (해제 불가, 표기엔 미포함)
export const QUALITY_LOCKED_EXTENSIONS: Partial<Record<ChordQuality, ChordExtension[]>> = {
  Dim: ['b5'],
};

interface BuildChordLabelArgs {
  root: string;
  quality: ChordQuality | null;
  extensions: Set<ChordExtension>;
  bass: string;
}

export function buildChordLabel({ root, quality, extensions, bass }: BuildChordLabelArgs): string {
  if (!root) return '';

  let label = root;

  if (quality) {
    label += QUALITY_SUFFIX[quality];
    const locked = QUALITY_LOCKED_EXTENSIONS[quality] ?? [];
    for (const { value, label: extensionLabel } of EXTENSION_OPTIONS) {
      if (extensions.has(value) && !locked.includes(value)) {
        label += extensionLabel;
      }
    }
  }

  if (bass) label += `/${bass}`;

  return label;
}

interface ParsedChordLabel {
  root: string;
  quality: ChordQuality | null;
  extensions: Set<ChordExtension>;
  bass: string;
}

const ROOT_PATTERN = /^[A-G](#|b)?/;
const EXTENSIONS_BY_LENGTH_DESC = [...EXTENSION_OPTIONS].sort((a, b) => b.value.length - a.value.length);

/** 코드 텍스트 → 근음/성질/텐션/베이스 역파싱 (완전 복원 아님) */
export function parseChordLabel(text: string): ParsedChordLabel {
  const empty: ParsedChordLabel = { root: '', quality: null, extensions: new Set(), bass: '' };
  if (!text) return empty;

  const [main, bassPart] = text.split('/');
  const rootMatch = main.match(ROOT_PATTERN);
  if (!rootMatch) return empty;

  const root = rootMatch[0];
  // M7 → maj7, ♭ → b 정규화 (텐션 매칭용)
  let rest = main.slice(root.length).replace(/^M7/, 'maj7').replace(/♭/g, 'b');

  let quality: ChordQuality = 'Maj';
  if (rest.startsWith('sus2')) {
    quality = 'Sus2';
    rest = rest.slice(4);
  } else if (rest.startsWith('sus4')) {
    quality = 'Sus4';
    rest = rest.slice(4);
  } else if (/^dim/i.test(rest)) {
    quality = 'Dim';
    rest = rest.replace(/^dim/i, '');
  } else if (/^aug/i.test(rest) || rest.startsWith('+')) {
    quality = 'Aug';
    rest = rest.replace(/^aug/i, '').replace(/^\+/, '');
  } else if (/^m(?!aj)/.test(rest)) {
    quality = 'Min';
    rest = rest.slice(1);
  } else if (rest === '5') {
    quality = '5';
    rest = '';
  }

  const disabled = new Set(QUALITY_DISABLED_EXTENSIONS[quality]);
  const extensions = new Set<ChordExtension>();
  let remaining = rest;
  while (remaining.length > 0) {
    const match = EXTENSIONS_BY_LENGTH_DESC.find(
      ({ value }) => !disabled.has(value) && remaining.toLowerCase().startsWith(value.toLowerCase()),
    );
    if (!match) break;
    extensions.add(match.value);
    remaining = remaining.slice(match.value.length);
  }

  (QUALITY_LOCKED_EXTENSIONS[quality] ?? []).forEach((ext) => extensions.add(ext));

  return { root, quality, extensions, bass: bassPart ?? '' };
}
