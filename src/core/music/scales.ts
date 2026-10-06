export const SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
export const FLATS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] as const;

export const FLAT_KEYS = new Set(['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Dm', 'Gm', 'Cm', 'Fm', 'Bbm', 'Ebm']);

export const NOTE_TO_SEMITONE: Record<string, number> = {
  'C': 0, 'B#': 0,
  'C#': 1, 'Db': 1,
  'D': 2,
  'D#': 3, 'Eb': 3,
  'E': 4, 'Fb': 4,
  'F': 5, 'E#': 5,
  'F#': 6, 'Gb': 6,
  'G': 7,
  'G#': 8, 'Ab': 8,
  'A': 9,
  'A#': 10, 'Bb': 10,
  'B': 11, 'Cb': 11,
};

export function normalizeNote(note: string): string {
  const trimmed = note.trim();
  if (trimmed.length === 0) return '';
  const first = trimmed.charAt(0).toUpperCase();
  const rest = trimmed.slice(1);
  return first + rest;
}

export function getSemitone(note: string): number | null {
  const normalized = normalizeNote(note);
  return NOTE_TO_SEMITONE[normalized] ?? null;
}

export function getNoteFromSemitone(semitone: number, preferFlats: boolean = false): string {
  const mod = ((semitone % 12) + 12) % 12;
  return preferFlats ? FLATS[mod] : SHARPS[mod];
}
