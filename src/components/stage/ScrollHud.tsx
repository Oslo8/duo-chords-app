import React, { useState, useRef } from 'react';
import { Play, Pause, RotateCcw, Maximize, Minimize, Plus, Minus, Activity } from 'lucide-react';

interface ScrollHudProps {
  isPlaying: boolean;
  speed: number;
  onTogglePlay: () => void;
  onResetToTop: () => void;
  onChangeSpeed: (newSpeed: number) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const ScrollHud: React.FC<ScrollHudProps> = ({
  isPlaying,
  speed,
  onTogglePlay,
  onResetToTop,
  onChangeSpeed,
  isFullscreen,
  onToggleFullscreen,
}) => {
  // Tap tempo logic
  const tapTimesRef = useRef<number[]>([]);
  const [lastBpmTapped, setLastBpmTapped] = useState<number | null>(null);

  const handleTapTempo = () => {
    const now = performance.now();
    const taps = tapTimesRef.current;
    
    // Reset taps if last tap was more than 2.5 seconds ago
    if (taps.length > 0 && now - taps[taps.length - 1] > 2500) {
      tapTimesRef.current = [now];
      return;
    }

    taps.push(now);
    if (taps.length > 4) {
      taps.shift();
    }

    if (taps.length >= 2) {
      const intervals = [];
      for (let i = 1; i < taps.length; i++) {
        intervals.push(taps[i] - taps[i - 1]);
      }
      const avgIntervalMs = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const bpm = Math.round(60000 / avgIntervalMs);
      setLastBpmTapped(bpm);

      // Approximate smooth scroll speed from BPM: roughly 0.35 * BPM
      const calculatedSpeed = Math.max(10, Math.min(100, Math.round(bpm * 0.35)));
      onChangeSpeed(calculatedSpeed);
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-xl w-[92%] sm:w-auto">
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-2xl rounded-2xl px-4 py-2.5 flex items-center justify-between sm:justify-center gap-2 sm:gap-4 text-slate-100">
        
        {/* Play/Pause Main Stage Button */}
        <button
          onClick={onTogglePlay}
          className={`px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold text-sm tracking-wide transition-all shadow-lg active:scale-95 ${
            isPlaying
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/25 ring-2 ring-amber-400'
              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25 ring-2 ring-emerald-400'
          }`}
          title={isPlaying ? 'Pausar desplazamiento' : 'Iniciar auto-scroll'}
        >
          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
          <span>{isPlaying ? 'PAUSA' : 'SCROLL'}</span>
        </button>

        {/* Speed Adjustment */}
        <div className="flex items-center gap-1.5 bg-slate-800/90 px-2 py-1.5 rounded-xl border border-slate-700/60">
          <button
            onClick={() => onChangeSpeed(Math.max(10, speed - 5))}
            className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 active:scale-95 transition-colors"
            title="Reducir velocidad"
          >
            <Minus className="w-4 h-4" />
          </button>
          
          <div className="px-2 text-center select-none min-w-[58px]">
            <span className="text-xs font-mono font-bold text-sky-400 block">{speed} px/s</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-tighter">Velocidad</span>
          </div>

          <button
            onClick={() => onChangeSpeed(Math.min(120, speed + 5))}
            className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 active:scale-95 transition-colors"
            title="Aumentar velocidad"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Tap Tempo */}
        <button
          onClick={handleTapTempo}
          className="p-2 sm:px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-slate-300 flex items-center gap-1.5 active:scale-95 transition-all"
          title="Toca al ritmo de la música para ajustar velocidad"
        >
          <Activity className="w-4 h-4 text-pink-400" />
          <span className="text-xs font-semibold hidden sm:inline">
            {lastBpmTapped ? `${lastBpmTapped} BPM` : 'TAP TEMPO'}
          </span>
        </button>

        {/* Reset to Top */}
        <button
          onClick={onResetToTop}
          className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-slate-300 hover:text-white active:scale-95 transition-colors"
          title="Volver al inicio"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={onToggleFullscreen}
          className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-slate-300 hover:text-white active:scale-95 transition-colors"
          title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa (Modo Atril)'}
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
