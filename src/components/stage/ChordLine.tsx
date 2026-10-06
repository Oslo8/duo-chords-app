import React from 'react';
import type { ParsedLine } from '../../core/parser/types';
import type { DuoConfig, VocalRole } from '../../types';
import { ChordToken } from './ChordToken';

interface ChordLineProps {
  line: ParsedLine;
  fontSize: number;
  duoConfig: DuoConfig;
  useLatinChords?: boolean;
  onChordClick?: (chord: string) => void;
}

export const ChordLine: React.FC<ChordLineProps> = ({
  line,
  fontSize,
  duoConfig,
  useLatinChords = false,
  onChordClick,
}) => {
  if (line.type === 'empty') {
    return <div className="h-6" />;
  }

  if (line.type === 'comment') {
    return (
      <div className="my-2 select-none">
        <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-300 bg-slate-800/80 border border-slate-700/60 rounded-md">
          {line.commentText}
        </span>
      </div>
    );
  }

  // Get color for dominant line role
  const getVoiceColor = (role: VocalRole): string => {
    switch (role) {
      case 'v1':
        return duoConfig.singer_1_color;
      case 'v2':
        return duoConfig.singer_2_color;
      case 'both':
        return duoConfig.both_color;
      default:
        return 'transparent';
    }
  };

  const dominantColor = getVoiceColor(line.dominantVoice);
  const hasVoiceIndicator = line.dominantVoice !== 'neutral';

  return (
    <div className="relative flex items-stretch my-2 group transition-colors">
      {/* Lateral Stage Indicator Bar (for 2-meter glance distance) */}
      <div
        className="w-2.5 rounded-full mr-3 shrink-0 transition-all duration-300 self-stretch"
        style={{
          backgroundColor: dominantColor,
          boxShadow: hasVoiceIndicator ? `0 0 10px ${dominantColor}66` : 'none',
          opacity: hasVoiceIndicator ? 1 : 0.2,
        }}
        title={`Voz asignada: ${line.dominantVoice}`}
      />

      {/* Line Content */}
      <div className="flex-1 flex flex-wrap items-baseline gap-x-1">
        {line.segments.map((segment, segIdx) => {
          const segColor = getVoiceColor(segment.voice);
          const isInlineOverride = segment.voice !== 'neutral' && segment.voice !== line.dominantVoice;

          return (
            <span
              key={segIdx}
              className={`inline-flex flex-wrap items-baseline rounded transition-all ${
                isInlineOverride ? 'px-2 py-0.5 border border-dashed rounded-md my-0.5' : ''
              }`}
              style={{
                borderColor: isInlineOverride ? segColor : 'transparent',
                backgroundColor: isInlineOverride ? `${segColor}15` : 'transparent',
              }}
            >
              {isInlineOverride && (
                <span
                  className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded mr-1 self-center"
                  style={{ backgroundColor: segColor, color: '#090a0f' }}
                >
                  {segment.voice === 'v1'
                    ? duoConfig.singer_1_name
                    : segment.voice === 'v2'
                    ? duoConfig.singer_2_name
                    : 'Ambos'}
                </span>
              )}

              {segment.pairs.map((pair, pIdx) => (
                <ChordToken
                  key={pIdx}
                  pair={pair}
                  fontSize={fontSize}
                  useLatinChords={useLatinChords}
                  onChordClick={onChordClick}
                />
              ))}
            </span>
          );
        })}
      </div>
    </div>
  );
};
