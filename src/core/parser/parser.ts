import type { VocalRole } from '../../types';
import { transposeChord, transposeKey } from '../music/transposer';
import type { ChordPair, ParsedSection, ParsedSong, VocalSegment } from './types';

// Helper to determine vocal role from string directive
function resolveVoiceDirective(str: string): VocalRole | null {
  const s = str.trim().toLowerCase();
  if (s === '1' || s === 'v1' || s === 'voz1' || s === 'voice 1' || s === 'cantante 1') return 'v1';
  if (s === '2' || s === 'v2' || s === 'voz2' || s === 'voice 2' || s === 'cantante 2') return 'v2';
  if (s === 'both' || s === 'ambos' || s === 'coro' || s === 'all' || s === 'duo' || s === 'armonia') return 'both';
  if (s === 'none' || s === 'neutral' || s === 'instrumental') return 'neutral';
  return null;
}

// Parses a string of line tokens like "[Em]Tell me [D/F#]something" into ChordPair[]
export function parseChordsAndLyrics(rawText: string): ChordPair[] {
  const pairs: ChordPair[] = [];
  const regex = /\[([^\]]+)\]|([^\[]+)/g;
  let match;
  let pendingChord: string | undefined = undefined;

  while ((match = regex.exec(rawText)) !== null) {
    if (match[1]) {
      // It's a chord [Chord]
      if (pendingChord) {
        // Two consecutive chords without text: push pending with empty or space lyric
        pairs.push({ chord: pendingChord, lyric: '   ' });
      }
      pendingChord = match[1];
    } else if (match[2]) {
      // It's lyrics
      pairs.push({
        chord: pendingChord,
        lyric: match[2],
      });
      pendingChord = undefined;
    }
  }

  if (pendingChord) {
    pairs.push({ chord: pendingChord, lyric: '' });
  }

  return pairs;
}

// Parses inline tags like "<v1>[Am]Word</v1> <v2>[D]Word 2</v2>"
export function parseLineWithVocalTags(rawLine: string, currentBlockVoice: VocalRole): VocalSegment[] {
  const segments: VocalSegment[] = [];
  const tagRegex = /<(v1|v2|both)>([\s\S]*?)<\/\1>/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tagRegex.exec(rawLine)) !== null) {
    const textBefore = rawLine.substring(lastIndex, match.index);
    if (textBefore.trim().length > 0 || (textBefore.length > 0 && segments.length > 0)) {
      segments.push({
        voice: currentBlockVoice,
        pairs: parseChordsAndLyrics(textBefore),
      });
    }

    const voiceTag = match[1].toLowerCase() as VocalRole;
    const tagContent = match[2];
    segments.push({
      voice: voiceTag,
      pairs: parseChordsAndLyrics(tagContent),
    });

    lastIndex = tagRegex.lastIndex;
  }

  const remainder = rawLine.substring(lastIndex);
  if (remainder.length > 0) {
    segments.push({
      voice: currentBlockVoice,
      pairs: parseChordsAndLyrics(remainder),
    });
  }

  // If no inline tags were present, the entire line is one segment
  if (segments.length === 0 && rawLine.length > 0) {
    segments.push({
      voice: currentBlockVoice,
      pairs: parseChordsAndLyrics(rawLine),
    });
  }

  return segments;
}

export function parseChordPro(source: string): ParsedSong {
  const lines = source.split(/\r?\n/);
  
  const parsed: ParsedSong = {
    title: 'Sin Título',
    artist: 'Artista Desconocido',
    originalKey: 'C',
    tempo: 120,
    timeSignature: '4/4',
    capo: 0,
    metadata: {},
    sections: [],
  };

  let currentSection: ParsedSection = {
    type: 'general',
    defaultVoice: 'neutral',
    lines: [],
  };

  let activeBlockVoice: VocalRole = 'neutral';

  const closeCurrentSection = () => {
    if (currentSection.lines.length > 0) {
      parsed.sections.push(currentSection);
      currentSection = {
        type: 'general',
        defaultVoice: activeBlockVoice,
        lines: [],
      };
    }
  };

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();

    // Check ChordPro Directives: {directive: value} or {directive}
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      const directiveContent = trimmed.slice(1, -1).trim();
      const colonIdx = directiveContent.indexOf(':');
      const key = colonIdx > -1 ? directiveContent.slice(0, colonIdx).trim().toLowerCase() : directiveContent.toLowerCase();
      const val = colonIdx > -1 ? directiveContent.slice(colonIdx + 1).trim() : '';

      switch (key) {
        case 'title':
        case 't':
          parsed.title = val;
          break;
        case 'artist':
        case 'a':
        case 'subtitle':
        case 'st':
          parsed.artist = val;
          break;
        case 'key':
          parsed.originalKey = val;
          break;
        case 'tempo':
        case 'bpm':
          parsed.tempo = parseInt(val, 10) || 120;
          break;
        case 'time':
          parsed.timeSignature = val;
          break;
        case 'capo':
          parsed.capo = parseInt(val, 10) || 0;
          break;

        // Block vocal switches
        case 'v1':
        case 'voice1':
          activeBlockVoice = 'v1';
          currentSection.defaultVoice = 'v1';
          break;
        case '/v1':
        case 'end_voice1':
          if (activeBlockVoice === 'v1') activeBlockVoice = 'neutral';
          break;

        case 'v2':
        case 'voice2':
          activeBlockVoice = 'v2';
          currentSection.defaultVoice = 'v2';
          break;
        case '/v2':
        case 'end_voice2':
          if (activeBlockVoice === 'v2') activeBlockVoice = 'neutral';
          break;

        case 'both':
        case 'duo':
        case 'coro':
          activeBlockVoice = 'both';
          currentSection.defaultVoice = 'both';
          break;
        case '/both':
        case 'end_both':
          if (activeBlockVoice === 'both') activeBlockVoice = 'neutral';
          break;

        case 'voice':
        case 'v': {
          const v = resolveVoiceDirective(val);
          if (v) {
            activeBlockVoice = v;
            currentSection.defaultVoice = v;
          }
          break;
        }

        // Section boundaries
        case 'start_of_chorus':
        case 'soc':
          closeCurrentSection();
          currentSection = {
            type: 'chorus',
            header: val || 'Coro',
            defaultVoice: activeBlockVoice !== 'neutral' ? activeBlockVoice : 'both',
            lines: [],
          };
          break;
        case 'end_of_chorus':
        case 'eoc':
          closeCurrentSection();
          break;

        case 'start_of_verse':
        case 'sov':
          closeCurrentSection();
          currentSection = {
            type: 'verse',
            header: val || 'Estrofa',
            defaultVoice: activeBlockVoice,
            lines: [],
          };
          break;
        case 'end_of_verse':
        case 'eov':
          closeCurrentSection();
          break;

        case 'start_of_bridge':
        case 'sob':
          closeCurrentSection();
          currentSection = {
            type: 'bridge',
            header: val || 'Puente',
            defaultVoice: activeBlockVoice,
            lines: [],
          };
          break;
        case 'end_of_bridge':
        case 'eob':
          closeCurrentSection();
          break;

        case 'comment':
        case 'c':
          currentSection.lines.push({
            type: 'comment',
            commentText: val,
            segments: [],
            dominantVoice: activeBlockVoice,
          });
          break;

        default:
          parsed.metadata[key] = val;
          break;
      }
      continue;
    }

    // Blank line
    if (trimmed.length === 0) {
      if (currentSection.lines.length > 0 && currentSection.lines[currentSection.lines.length - 1].type !== 'empty') {
        currentSection.lines.push({
          type: 'empty',
          segments: [],
          dominantVoice: activeBlockVoice,
        });
      }
      continue;
    }

    // Lyric and chord line
    const segments = parseLineWithVocalTags(rawLine, activeBlockVoice);
    
    // Determine dominant voice for line indicator
    const dominantVoice = segments.length > 0 ? segments[0].voice : activeBlockVoice;

    currentSection.lines.push({
      type: 'lyric',
      segments,
      dominantVoice,
    });
  }

  closeCurrentSection();

  return parsed;
}

export function transposeSongAST(song: ParsedSong, semitones: number): ParsedSong {
  if (semitones === 0) return song;

  const newKey = transposeKey(song.originalKey, semitones);

  return {
    ...song,
    originalKey: newKey,
    sections: song.sections.map((section) => ({
      ...section,
      lines: section.lines.map((line) => {
        if (line.type !== 'lyric') return line;
        return {
          ...line,
          segments: line.segments.map((seg) => ({
            ...seg,
            pairs: seg.pairs.map((pair) => ({
              ...pair,
              chord: pair.chord ? transposeChord(pair.chord, semitones, newKey) : undefined,
            })),
          })),
        };
      }),
    })),
  };
}
