import React from 'react';
import type { ChordPair } from '../../core/parser/types';
import { formatChordNotation } from '../../core/music/notes';

interface ChordTokenProps {
  pair: ChordPair;
  fontSize: number;
  useLatinChords?: boolean;
  onChordClick?: (chord: string) => void;
}

export const ChordToken: React.FC<ChordTokenProps> = ({
  pair,
  fontSize,
  useLatinChords = false,
  onChordClick,
}) => {
  const displayChord = pair.chord ? formatChordNotation(pair.chord, useLatinChords) : null;
  const isSpaceOnly = pair.lyric.trim() === '';

  return (
    <span className="inline-flex flex-col items-start leading-tight mr-[1px] select-text">
      {/* Chord line */}
      <span
        style={{ fontSize: `${Math.max(13, Math.round(fontSize * 0.85))}px` }}
        className={`font-chord font-bold text-sky-400 select-none tracking-wide h-[1.3em] inline-block ${
          displayChord ? 'cursor-pointer hover:text-sky-200 transition-colors' : 'opacity-0'
        }`}
        onClick={() => displayChord && onChordClick?.(displayChord)}
        title={displayChord ? `Acorde: ${displayChord}` : undefined}
      >
        {displayChord || ' '}
      </span>

      {/* Lyric line */}
      <span
        style={{ fontSize: `${fontSize}px` }}
        className="font-medium tracking-normal select-text whitespace-pre"
      >
        {isSpaceOnly ? pair.lyric || ' ' : pair.lyric}
      </span>
    </span>
  );
};
