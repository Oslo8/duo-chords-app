export const ANGLO_TO_LATIN: Record<string, string> = {
  'C': 'Do',
  'C#': 'Do#',
  'Db': 'Reb',
  'D': 'Re',
  'D#': 'Re#',
  'Eb': 'Mib',
  'E': 'Mi',
  'F': 'Fa',
  'F#': 'Fa#',
  'Gb': 'Solb',
  'G': 'Sol',
  'G#': 'Sol#',
  'Ab': 'Lab',
  'A': 'La',
  'A#': 'La#',
  'Bb': 'Sib',
  'B': 'Si',
};

export const LATIN_TO_ANGLO: Record<string, string> = {
  'DO': 'C',
  'DO#': 'C#',
  'REB': 'Db',
  'RE': 'D',
  'RE#': 'D#',
  'MIB': 'Eb',
  'MI': 'E',
  'FA': 'F',
  'FA#': 'F#',
  'SOLB': 'Gb',
  'SOL': 'G',
  'SOL#': 'G#',
  'LAB': 'Ab',
  'LA': 'A',
  'LA#': 'A#',
  'SIB': 'Bb',
  'SI': 'B',
};

export function formatChordNotation(chord: string, useLatin: boolean): string {
  if (!useLatin) return chord;
  // Replace root and bass notes with Latin
  return chord.replace(/([A-G][#b]?)/g, (match) => ANGLO_TO_LATIN[match] ?? match);
}
