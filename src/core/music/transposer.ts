import { getSemitone, getNoteFromSemitone, FLAT_KEYS, normalizeNote } from './scales';

// Regex to capture root note, quality, and optional bass note:
// e.g. "C#m7/G#" -> root: "C#", quality: "m7", bass: "G#"
const CHORD_REGEX = /^([A-G][#b]?)([^/]*)(?:\/([A-G][#b]?))?$/;

export function isChord(token: string): boolean {
  return CHORD_REGEX.test(token.trim());
}

export function transposeSingleNote(note: string, semitones: number, preferFlats: boolean): string {
  const currentSemitone = getSemitone(note);
  if (currentSemitone === null) return note;
  return getNoteFromSemitone(currentSemitone + semitones, preferFlats);
}

export function transposeChord(chord: string, semitones: number, targetKeyHint?: string): string {
  const trimmed = chord.trim();
  if (semitones === 0) return trimmed;

  const match = trimmed.match(CHORD_REGEX);
  if (!match) return trimmed;

  const [, root, quality, bass] = match;
  const preferFlats = targetKeyHint ? FLAT_KEYS.has(targetKeyHint) : false;

  const transposedRoot = transposeSingleNote(root, semitones, preferFlats);
  const transposedBass = bass ? '/' + transposeSingleNote(bass, semitones, preferFlats) : '';

  return `${transposedRoot}${quality}${transposedBass}`;
}

export function calculateSemitoneOffset(fromKey: string, toKey: string): number {
  const normFrom = normalizeNote(fromKey.replace(/m$/, ''));
  const normTo = normalizeNote(toKey.replace(/m$/, ''));
  const fromSemi = getSemitone(normFrom);
  const toSemi = getSemitone(normTo);
  if (fromSemi === null || toSemi === null) return 0;
  return ((toSemi - fromSemi) % 12 + 12) % 12;
}

export function transposeKey(key: string, semitones: number): string {
  const isMinor = key.endsWith('m');
  const root = isMinor ? key.slice(0, -1) : key;
  const currentSemi = getSemitone(root);
  if (currentSemi === null) return key;

  const newRoot = getNoteFromSemitone(currentSemi + semitones, FLAT_KEYS.has(key));
  return isMinor ? `${newRoot}m` : newRoot;
}
