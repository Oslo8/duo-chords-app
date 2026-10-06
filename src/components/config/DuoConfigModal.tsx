import React, { useState } from 'react';
import type { DuoConfig } from '../../types';
import { X, Palette, Check } from 'lucide-react';

interface DuoConfigModalProps {
  currentConfig: DuoConfig;
  onSave: (config: DuoConfig) => void;
  onClose: () => void;
}

const COLOR_PRESETS = [
  { name: 'Neón Escenario (Recomendado)', v1: '#00E5FF', v2: '#FFB300', both: '#E040FB' },
  { name: 'Esmeralda & Coral', v1: '#10B981', v2: '#F43F5E', both: '#8B5CF6' },
  { name: 'Cian & Amarillo Solar', v1: '#38BDF8', v2: '#FACC15', both: '#EC4899' },
  { name: 'Lima & Fucsia', v1: '#84CC16', v2: '#E11D48', both: '#06B6D4' },
];

export const DuoConfigModal: React.FC<DuoConfigModalProps> = ({
  currentConfig,
  onSave,
  onClose,
}) => {
  const [config, setConfig] = useState<DuoConfig>({ ...currentConfig });

  const handleApplyPreset = (preset: typeof COLOR_PRESETS[0]) => {
    setConfig((prev) => ({
      ...prev,
      singer_1_color: preset.v1,
      singer_2_color: preset.v2,
      both_color: preset.both,
    }));
  };

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-sky-400" />
            <h3 className="font-bold text-white text-base">Configuración de Escenario & Dúo</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-200">
          {/* Duo Name */}
          <div>
            <label className="block text-xs uppercase font-bold text-slate-400 mb-1.5">
              Nombre de la Agrupación / Dúo
            </label>
            <input
              type="text"
              value={config.duo_name}
              onChange={(e) => setConfig({ ...config, duo_name: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
              placeholder="Ej: Dúo Acústico"
            />
          </div>

          {/* Color Palettes Presets */}
          <div>
            <label className="block text-xs uppercase font-bold text-slate-400 mb-2">
              Paletas de Alto Contraste para Atril
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {COLOR_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-700/60 bg-slate-950/50 hover:bg-slate-800/60 text-left transition-colors"
                >
                  <span className="text-xs font-medium text-slate-300 truncate mr-2">{preset.name}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: preset.v1 }} />
                    <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: preset.v2 }} />
                    <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: preset.both }} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Singer 1 Settings */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Cantante 1
              </span>
              <span
                className="w-4 h-4 rounded-full border border-slate-600"
                style={{ backgroundColor: config.singer_1_color }}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-[10px] text-slate-400 mb-1">Nombre o Apodo</label>
                <input
                  type="text"
                  value={config.singer_1_name}
                  onChange={(e) => setConfig({ ...config, singer_1_name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Color Escenario</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={config.singer_1_color}
                    onChange={(e) => setConfig({ ...config, singer_1_color: e.target.value })}
                    className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
                  />
                  <span className="text-[11px] font-mono text-slate-400">{config.singer_1_color}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Singer 2 Settings */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Cantante 2
              </span>
              <span
                className="w-4 h-4 rounded-full border border-slate-600"
                style={{ backgroundColor: config.singer_2_color }}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-[10px] text-slate-400 mb-1">Nombre o Apodo</label>
                <input
                  type="text"
                  value={config.singer_2_name}
                  onChange={(e) => setConfig({ ...config, singer_2_name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Color Escenario</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={config.singer_2_color}
                    onChange={(e) => setConfig({ ...config, singer_2_color: e.target.value })}
                    className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
                  />
                  <span className="text-[11px] font-mono text-slate-400">{config.singer_2_color}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Both / Harmony Color */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Ambos / Dúo en Armonía
              </span>
              <span
                className="w-4 h-4 rounded-full border border-slate-600"
                style={{ backgroundColor: config.both_color }}
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="color"
                value={config.both_color}
                onChange={(e) => setConfig({ ...config, both_color: e.target.value })}
                className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
              />
              <span className="text-xs text-slate-400">
                Color asignado cuando ambos cantan al mismo tiempo o realizan coros juntos.
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-sky-500/25 active:scale-95 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Guardar Configuración</span>
          </button>
        </div>
      </div>
    </div>
  );
};
