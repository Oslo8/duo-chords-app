import React, { useState, useMemo } from 'react';
import type { Song, DuoConfig } from '../../types';
import { 
  Search, 
  Plus, 
  Music2, 
  Guitar, 
  Play, 
  Edit3, 
  Trash2, 
  SlidersHorizontal,
  Download
} from 'lucide-react';

interface SongLibraryProps {
  songs: Song[];
  duoConfig: DuoConfig;
  onSelectSong: (song: Song) => void;
  onEditSong: (song: Song) => void;
  onCreateNewSong: () => void;
  onDeleteSong: (id: string) => void;
  onOpenDuoConfig: () => void;
}

export const SongLibrary: React.FC<SongLibraryProps> = ({
  songs,
  duoConfig,
  onSelectSong,
  onEditSong,
  onCreateNewSong,
  onDeleteSong,
  onOpenDuoConfig,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [keyFilter, setKeyFilter] = useState('ALL');

  // Available keys in the library for quick filtering
  const availableKeys = useMemo(() => {
    const set = new Set<string>();
    songs.forEach((s) => s.original_key && set.add(s.original_key));
    return Array.from(set).sort();
  }, [songs]);

  // Filtered songs
  const filteredSongs = useMemo(() => {
    return songs.filter((song) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        song.title.toLowerCase().includes(q) ||
        song.artist.toLowerCase().includes(q) ||
        song.content_chordpro.toLowerCase().includes(q);

      const matchesKey = keyFilter === 'ALL' || song.original_key === keyFilter;

      return matchesQuery && matchesKey;
    });
  }, [songs, searchQuery, keyFilter]);

  // Export songs to JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(songs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `repertorio_duo_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#07080c] text-slate-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Banner Duo Branding & Status */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/40 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center gap-1.5">
                  <Guitar className="w-3.5 h-3.5" />
                  Dúo Vocal & Guitarra
                </span>
                <span className="text-xs text-slate-400">• Sistema de Atril de Alto Contraste</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {duoConfig.duo_name}
              </h1>
              <p className="text-sm text-slate-400 mt-1 max-w-xl">
                Repertorio sincronizado con Dublyobase. Visualización en tiempo real con diferenciación vocal cromática y transposición inmediata.
              </p>
            </div>

            {/* Vocal indicators chip */}
            <div className="flex flex-col gap-2.5 bg-slate-950/70 p-4 rounded-2xl border border-slate-800 shrink-0">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="font-bold text-[11px] uppercase tracking-wider">Voces Configuradas</span>
                <button
                  onClick={onOpenDuoConfig}
                  className="text-sky-400 hover:text-sky-300 font-semibold text-xs flex items-center gap-1"
                >
                  <SlidersHorizontal className="w-3 h-3" />
                  <span>Ajustar</span>
                </button>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3.5 h-3.5 rounded-full shadow-md"
                    style={{ backgroundColor: duoConfig.singer_1_color }}
                  />
                  <span>{duoConfig.singer_1_name}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className="w-3.5 h-3.5 rounded-full shadow-md"
                    style={{ backgroundColor: duoConfig.singer_2_color }}
                  />
                  <span>{duoConfig.singer_2_name}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className="w-3.5 h-3.5 rounded-full shadow-md"
                    style={{ backgroundColor: duoConfig.both_color }}
                  />
                  <span>Ambos</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search, Filter & Actions Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por título, artista, acordes o letra..."
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          {/* Key Filter & Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Key Filter */}
            <select
              value={keyFilter}
              onChange={(e) => setKeyFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-sky-400 focus:outline-none focus:border-sky-500"
            >
              <option value="ALL">Todos los Tonos</option>
              {availableKeys.map((k) => (
                <option key={k} value={k}>
                  Tono: {k}
                </option>
              ))}
            </select>

            {/* Export JSON */}
            <button
              onClick={handleExportJSON}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Exportar copia de seguridad en JSON"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* New Song Button */}
            <button
              onClick={onCreateNewSong}
              className="px-4 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-sky-500/25 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir Canción</span>
            </button>
          </div>
        </div>

        {/* Songs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSongs.map((song) => {
            return (
              <div
                key={song.id}
                className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 hover:border-slate-700/80 transition-all flex flex-col justify-between group shadow-lg hover:shadow-xl hover:shadow-sky-500/5"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-950 text-sky-400 border border-slate-800">
                      {song.original_key || 'C'}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {song.default_bpm} BPM
                    </span>
                  </div>

                  <h3
                    onClick={() => onSelectSong(song)}
                    className="font-bold text-base text-white hover:text-sky-300 cursor-pointer truncate transition-colors"
                  >
                    {song.title}
                  </h3>
                  <p className="text-xs text-slate-400 truncate mb-4">{song.artist}</p>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  {/* Open in Stage Mode Button */}
                  <button
                    onClick={() => onSelectSong(song)}
                    className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 font-bold text-xs flex items-center gap-2 transition-all active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Ver en Atril</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditSong(song)}
                      className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Editar letra y acordes"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar "${song.title}" del repertorio?`)) {
                          onDeleteSong(song.id);
                        }
                      }}
                      className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-950/20 transition-colors"
                      title="Eliminar canción"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredSongs.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            <Music2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-base font-semibold text-slate-400">No se encontraron canciones</p>
            <p className="text-xs text-slate-500 mt-1">Prueba con otro término de búsqueda o crea una nueva canción.</p>
          </div>
        )}
      </div>
    </div>
  );
};
