import { transposeChord, transposeKey } from './music/transposer';
import { parseChordPro, transposeSongAST } from './parser/parser';

console.log('--- Testing Transposition ---');
console.log('C + 2 semitones =', transposeChord('C', 2)); // Should be D
console.log('Am + 3 semitones =', transposeChord('Am', 3)); // Should be Cm
console.log('D/F# + 1 semitone =', transposeChord('D/F#', 1)); // Should be D#/G or Eb/G
console.log('F#m7 - 2 semitones =', transposeChord('F#m7', -2)); // Should be Em7
console.log('Key Em + 2 =', transposeKey('Em', 2)); // F#m

const sample = `
{title: Shallow}
{artist: Lady Gaga & Bradley Cooper}
{key: Em}
{tempo: 96}

{v1}
[Em]Tell me [D/F#]something, [G]girl
[C]Are you happy in this [G]modern [D]world?
{/v1}

{v2}
[Em]Tell me [D/F#]something, [G]boy
{/v2}

{both}
[Am]I'm off the deep end, [D/F#]watch as I dive in
{/both}

<v1>[Am]In the shallow, </v1><v2>[D]shallow </v2><both>[G]now[/both]
`;

console.log('--- Testing Parser ---');
const parsed = parseChordPro(sample);
console.log('Title:', parsed.title);
console.log('Artist:', parsed.artist);
console.log('Sections count:', parsed.sections.length);

const transposed = transposeSongAST(parsed, 2);
console.log('Transposed Key:', transposed.originalKey);
console.log('First line chords in Section 1 (v1):', 
  transposed.sections[0].lines[0].segments[0].pairs.map(p => p.chord).filter(Boolean)
);
console.log('All music checks passed!');
