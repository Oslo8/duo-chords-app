import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { Song, DuoConfig } from '../../types';
import { parseChordPro, transposeSongAST } from '../../core/parser/parser';
import { ChordLine } from './ChordLine';
import { ScrollHud } from './ScrollHud';
import { useAutoScroll } from '../../hooks/useAutoScroll';
import { useWakeLock } from '../../hooks/useWakeLock';
import { formatChordNotation } from '../../core/music/notes';
import { 
  Tv2, 
  ChevronLeft, 
  ChevronRight, 
  Hash, 
  Gauge, 
  ZoomIn, 
  ZoomOut, 
  ArrowLeft,
  Sparkles,
  Guitar
} from 'lucide-react';

interface StageViewerProps {
  song: Song;
  duoConfig: DuoConfig;
  onBackToList: () => void;
  onNextSong?: () => void;
  onPrevSong?: () => void;
  hasNextSong?: boolean;
  hasPrevSong?: boolean;
  setlistContextTitle?: string;
  onEditSong?: () => void;
}

export const StageViewer: React.FC<StageViewerProps> = ({
  song,
  duoConfig,
  onBackToList,
  onNextSong,
  onPrevSong,
  hasNextSong = false,
  hasPrevSong = false,
  setlistContextTitle,
  onEditSong,
}) => {
  const [semitoneShift, setSemitoneShift] = useState(0);
  const [fontSize, setFontSize] = useState(duoConfig.stage_preferences?.fontSize || 20);
  const [useLatinChords, setUseLatinChords] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedChord, setSelectedChord] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const { isLocked } = useWakeLock();

  // Auto-scroll hook
  const {
    isPlaying,
    speed,
    setSpeed,
    togglePlay,
    resetToTop,
    scrollContainerRef,
  } = useAutoScroll({ initialSpeed: Math.round((song.default_bpm || 100) * 0.3) });

  // Reset shift and scroll when song changes
  useEffect(() => {
    setSemitoneShift(0);
    resetToTop();
    setSelectedChord(null);
  }, [song.id, resetToTop]);

  // Parse raw ChordPro text into AST and apply transposition
  const rawParsed = useMemo(() => parseChordPro(song.content_chordpro), [song.content_chordpro]);
  const transposedSong = useMemo(
    () => transposeSongAST(rawParsed, semitoneShift),
    [rawParsed, semitoneShift]
  );

  // Fullscreen handler
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Keyboard and Bluetooth pedal navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight' && hasNextSong && onNextSong) {
        onNextSong();
      } else if (e.code === 'ArrowLeft' && hasPrevSong && onPrevSong) {
        onPrevSong();
      } else if (e.key === '+' || e.key === '=') {
        setSemitoneShift((prev) => (prev + 1) % 12);
      } else if (e.key === '-' || e.key === '_') {
        setSemitoneShift((prev) => (prev - 1 + 12) % 12);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, hasNextSong, onNextSong, hasPrevSong, onPrevSong]);

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-screen w-full bg-[#07080c] text-slate-100 select-none overflow-hidden"
    >
      {/* Top Stage Bar (Sticky HUD) */}
      <header className="bg-slate-900/95 border-b border-slate-800/80 px-4 py-2.5 z-30 shrink-0 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          {/* Left section: Return & Song titles */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onBackToList}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Volver a la lista"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Repertorio</span>
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white truncate tracking-tight">
                  {transposedSong.title || song.title}
                </h1>
                {setlistContextTitle && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 hidden md:inline truncate">
                    {setlistContextTitle}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 truncate">
                {transposedSong.artist || song.artist}
              </p>
            </div>
          </div>

          {/* Center section: Live Transposition Controls */}
          <div className="flex items-center gap-1 sm:gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setSemitoneShift((s) => (s - 1 + 12) % 12)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs active:scale-95 transition-all"
              title="Bajar 1 semitono (-1)"
            >
              -1
            </button>

            <div className="px-2.5 py-0.5 text-center min-w-[70px]">
              <span className="text-xs font-mono font-black text-sky-400 block">
                {formatChordNotation(transposedSong.originalKey, useLatinChords)}
              </span>
              <span className="text-[9px] text-slate-400 tracking-tighter">
                {semitoneShift === 0 ? 'Original' : `${semitoneShift > 0 ? '+' : ''}${semitoneShift} st`}
              </span>
            </div>

            <button
              onClick={() => setSemitoneShift((s) => (s + 1) % 12)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs active:scale-95 transition-all"
              title="Subir 1 semitono (+1)"
            >
              +1
            </button>

            {semitoneShift !== 0 && (
              <button
                onClick={() => setSemitoneShift(0)}
                className="text-[10px] px-1.5 py-1 rounded text-slate-400 hover:text-amber-400"
                title="Restablecer tono original"
              >
                Reset
              </button>
            )}
          </div>

          {/* Right section: Metronome, Capo, Font Size & Quick Settings */}
          <div className="flex items-center gap-2">
            {/* Capo & BPM Badges */}
            <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-slate-400">
              {transposedSong.capo > 0 && (
                <span className="px-2 py-1 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-amber-400" />
                  Capo {transposedSong.capo}
                </span>
              )}
              <span className="px-2 py-1 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                {transposedSong.tempo} BPM
              </span>
            </div>

            {/* Font Zoom Controls */}
            <div className="flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700/60">
              <button
                onClick={() => setFontSize((f) => Math.max(14, f - 2))}
                className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-700"
                title="Reducir tamaño de letra"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono px-1.5 text-slate-400">{fontSize}</span>
              <button
                onClick={() => setFontSize((f) => Math.min(36, f + 2))}
                className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-700"
                title="Aumentar tamaño de letra"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Latin vs Anglo toggle */}
            <button
              onClick={() => setUseLatinChords(!useLatinChords)}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-colors ${
                useLatinChords
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="Alternar entre notación C, D, E y Do, Re, Mi"
            >
              {useLatinChords ? 'Do-Re-Mi' : 'A-B-C'}
            </button>

            {/* Wake lock indicator */}
            <div
              className={`p-1.5 rounded-lg border text-xs flex items-center ${
                isLocked
                  ? 'border-emerald-500/30 text-emerald-400 bg-emerald-950/30'
                  : 'border-slate-700 text-slate-500 bg-slate-800/40'
              }`}
              title={isLocked ? 'Pantalla bloqueada para permanecer encendida' : 'Wake Lock inactivo'}
            >
              <Tv2 className="w-4 h-4" />
            </div>

            {/* Edit song button */}
            {onEditSong && (
              <button
                onClick={onEditSong}
                className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700/60"
              >
                Editar
              </button>
            )}
          </div>
        </div>

        {/* Vocal Legend Header Bar (Visual Quick Reference) */}
        <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
            <span className="text-slate-400 font-medium text-[11px] uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-sky-400" />
              Roles Vocales:
            </span>

            {/* Singer 1 */}
            <div className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                style={{
                  backgroundColor: duoConfig.singer_1_color,
                  boxShadow: `0 0 8px ${duoConfig.singer_1_color}88`,
                }}
              />
              <span className="font-semibold text-slate-200">{duoConfig.singer_1_name}</span>
            </div>

            {/* Singer 2 */}
            <div className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                style={{
                  backgroundColor: duoConfig.singer_2_color,
                  boxShadow: `0 0 8px ${duoConfig.singer_2_color}88`,
                }}
              />
              <span className="font-semibold text-slate-200">{duoConfig.singer_2_name}</span>
            </div>

            {/* Both */}
            <div className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                style={{
                  backgroundColor: duoConfig.both_color,
                  boxShadow: `0 0 8px ${duoConfig.both_color}88`,
                }}
              />
              <span className="font-semibold text-slate-200">Ambos (Armonía)</span>
            </div>
          </div>

          {/* Next/Prev Navigation for live gigs */}
          {(hasPrevSong || hasNextSong) && (
            <div className="flex items-center gap-1">
              <button
                disabled={!hasPrevSong}
                onClick={onPrevSong}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-300"
                title="Canción anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={!hasNextSong}
                onClick={onNextSong}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-300"
                title="Siguiente canción"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Lyrics & Chords Scroll Area */}
      <main
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 max-w-5xl mx-auto w-full pb-36 select-text stage-scroll-container"
      >
        {transposedSong.sections.map((section, sIdx) => {
          return (
            <section key={sIdx} className="mb-8">
              {section.header && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-md bg-slate-800/80 border border-slate-700/80 text-sky-400 shadow-sm">
                    {section.header}
                  </span>
                  {section.defaultVoice !== 'neutral' && (
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor:
                          section.defaultVoice === 'v1'
                            ? `${duoConfig.singer_1_color}25`
                            : section.defaultVoice === 'v2'
                            ? `${duoConfig.singer_2_color}25`
                            : `${duoConfig.both_color}25`,
                        color:
                          section.defaultVoice === 'v1'
                            ? duoConfig.singer_1_color
                            : section.defaultVoice === 'v2'
                            ? duoConfig.singer_2_color
                            : duoConfig.both_color,
                      }}
                    >
                      {section.defaultVoice === 'v1'
                        ? duoConfig.singer_1_name
                        : section.defaultVoice === 'v2'
                        ? duoConfig.singer_2_name
                        : 'Dúo'}
                    </span>
                  )}
                </div>
              )}

              <div className="space-y-1">
                {section.lines.map((line, lIdx) => (
                  <ChordLine
                    key={lIdx}
                    line={line}
                    fontSize={fontSize}
                    duoConfig={duoConfig}
                    useLatinChords={useLatinChords}
                    onChordClick={(chord) => setSelectedChord(chord)}
                  />
                ))}
              </div>
            </section>
          );
        })}

        {/* Selected chord quick info pill */}
        {selectedChord && (
          <div className="fixed top-24 right-6 bg-slate-900 border border-sky-500/50 shadow-2xl rounded-2xl p-4 z-40 animate-in fade-in slide-in-from-right-4">
            <div className="flex items-center justify-between gap-4 mb-2">
              <div className="flex items-center gap-2 text-sky-400 font-bold">
                <Guitar className="w-5 h-5" />
                <span>Acorde: {selectedChord}</span>
              </div>
              <button
                onClick={() => setSelectedChord(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Tono actual en afinación estándar. Pulsa sobre cualquier otro acorde para inspeccionarlo.
            </p>
          </div>
        )}
      </main>

      {/* Floating Auto-Scroll HUD */}
      <ScrollHud
        isPlaying={isPlaying}
        speed={speed}
        onTogglePlay={togglePlay}
        onResetToTop={resetToTop}
        onChangeSpeed={setSpeed}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
      />
    </div>
  );
};
