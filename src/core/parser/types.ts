import type { VocalRole } from '../../types';

export interface ChordPair {
  chord?: string;
  lyric: string;
}

export interface VocalSegment {
  voice: VocalRole;
  pairs: ChordPair[];
}

export interface ParsedLine {
  type: 'lyric' | 'comment' | 'empty';
  commentText?: string;
  segments: VocalSegment[];
  dominantVoice: VocalRole;
}

export interface ParsedSection {
  type: 'verse' | 'chorus' | 'bridge' | 'intro' | 'outro' | 'instrumental' | 'general';
  header?: string;
  defaultVoice: VocalRole;
  lines: ParsedLine[];
}

export interface ParsedSong {
  title: string;
  artist: string;
  originalKey: string;
  tempo: number;
  timeSignature: string;
  capo: number;
  metadata: Record<string, string>;
  sections: ParsedSection[];
}
