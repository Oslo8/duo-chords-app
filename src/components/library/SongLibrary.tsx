import React, { useState, useMemo } from 'react';
import type { Song, DuoConfig } from '../../types';
import type { LaCuerdaSearchResult } from '../../server/lacuerda';
import { LaCuerdaService } from '../../services/lacuerdaService';
import {
  Music2,
  Search,
  Plus,
  Play,
  Edit3,
  Trash2,
  Globe,
  SlidersHorizontal,
  Download,
  Sparkles,
  Loader2,
  Guitar,
  Flame,
} from 'lucide-react';

interface SongLibraryProps {
  songs: Song[];
  duoConfig: DuoConfig;
  onSelectSong: (song: Song) => void;
  onEditSong: (song: Song) => void;
  onCreateNewSong: () => void;
  onDeleteSong: (id: string) => void;
  onOpenDuoConfig: () => void;
  onImportSong: (songData: Omit<Song, 'id'>) => Promise<Song>;
}

export const SongLibrary: React.FC<SongLibraryProps> = ({
  songs,
  duoConfig,
  onSelectSong,
  onEditSong,
  onCreateNewSong,
  onDeleteSong,
  onOpenDuoConfig,
  onImportSong,
}) => {
  const [activeTab, setActiveTab] = useState<'local' | 'lacuerda'>('local');
  const [searchQuery, setSearchQuery] = useState('');
  const [keyFilter, setKeyFilter] = useState('ALL');

  // LaCuerda search state
  const [isSearchingLaCuerda, setIsSearchingLaCuerda] = useState(false);
  const [laCuerdaResults, setLaCuerdaResults] = useState<LaCuerdaSearchResult[]>([]);
  const [detectedArtist, setDetectedArtist] = useState<string | null>(null);
  const [laCuerdaError, setLaCuerdaError] = useState<string | null>(null);
  const [importingUrl, setImportingUrl] = useState<string | null>(null);

  // Available keys in local library
  const availableKeys = useMemo(() => {
    const set = new Set<string>();
    songs.forEach((s) => s.original_key && set.add(s.original_key));
    return Array.from(set).sort();
  }, [songs]);

  // Filtered local songs
  const filteredLocalSongs = useMemo(() => {
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

  // Handle search in LaCuerda
  const handleSearchLaCuerda = async (customQuery?: string) => {
    const q = (customQuery !== undefined ? customQuery : searchQuery).trim();
    if (!q) return;

    setActiveTab('lacuerda');
    setIsSearchingLaCuerda(true);
    setLaCuerdaError(null);
    setDetectedArtist(null);

    try {
      const res = await LaCuerdaService.search(q);
      setLaCuerdaResults(res.results);
      setDetectedArtist(res.detectedArtist || null);

      if (res.results.length === 0) {
        setLaCuerdaError(`No se encontraron canciones ni artistas para "${q}" en LaCuerda.net`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al conectar con LaCuerda.net';
      setLaCuerdaError(msg);
      setLaCuerdaResults([]);
      setDetectedArtist(null);
    } finally {
      setIsSearchingLaCuerda(false);
    }
  };

  // 1-Click Import from LaCuerda
  const handleImportAndOpen = async (result: LaCuerdaSearchResult) => {
    if (importingUrl) return;
    setImportingUrl(result.url);
    try {
      const converted = await LaCuerdaService.importSong(result.url);
      const savedSong = await onImportSong({
        title: converted.title,
        artist: converted.artist,
        original_key: converted.original_key,
        default_bpm: converted.default_bpm,
        time_signature: converted.time_signature,
        content_chordpro: converted.content_chordpro,
      });

      // Immediately open in stage view!
      onSelectSong(savedSong);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al importar la canción';
      alert(`No se pudo importar: ${msg}`);
    } finally {
      setImportingUrl(null);
    }
  };

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
                <span className="text-xs text-slate-400">• Búsqueda Inteligente de Artistas y Canciones</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {duoConfig.duo_name}
              </h1>
              <p className="text-sm text-slate-400 mt-1 max-w-xl">
                Repertorio en vivo con detección automática de bandas, artistas y canciones en LaCuerda.net, conversión instantánea a dos voces y transposición.
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

        {/* Search Bar with Auto LaCuerda Trigger */}
        <div className="bg-slate-900/90 border border-slate-800 p-3 sm:p-4 rounded-2xl shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearchLaCuerda();
                }
              }}
              placeholder="Escribe banda, artista o canción (ej: Morat, Bad Bunny, Soda Stereo, Flaca)..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Search in LaCuerda Button */}
            <button
              onClick={() => handleSearchLaCuerda()}
              disabled={isSearchingLaCuerda || !searchQuery.trim()}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:pointer-events-none text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
              title="Buscar automáticamente en la base de datos de LaCuerda.net"
            >
              {isSearchingLaCuerda ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Globe className="w-4 h-4" />
              )}
              <span>Buscar en LaCuerda.net</span>
            </button>

            {/* New Manual Song */}
            <button
              onClick={onCreateNewSong}
              className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-sky-500/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Crear Manual</span>
            </button>

            {/* Export JSON */}
            <button
              onClick={handleExportJSON}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
              title="Exportar copia de seguridad de tu repertorio en JSON"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Selector: Mi Repertorio vs LaCuerda.net */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('local')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'local'
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Music2 className="w-4 h-4" />
              <span>Mi Repertorio ({filteredLocalSongs.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('lacuerda');
                if (laCuerdaResults.length === 0 && searchQuery.trim()) {
                  handleSearchLaCuerda();
                }
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'lacuerda'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>
                {detectedArtist ? `Canciones de ${detectedArtist}` : 'LaCuerda.net'} {laCuerdaResults.length > 0 && `(${laCuerdaResults.length})`}
              </span>
              {laCuerdaResults.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              )}
            </button>
          </div>

          {activeTab === 'local' && (
            <select
              value={keyFilter}
              onChange={(e) => setKeyFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono font-semibold text-sky-400 focus:outline-none"
            >
              <option value="ALL">Todos los Tonos</option>
              {availableKeys.map((k) => (
                <option key={k} value={k}>
                  Tono: {k}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* TAB 1: MI REPERTORIO LOCAL (DUBLYOBASE) */}
        {activeTab === 'local' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLocalSongs.map((song) => (
                <div
                  key={song.id}
                  onClick={() => onSelectSong(song)}
                  className="bg-slate-900/80 border border-slate-800/90 hover:border-sky-500/60 rounded-2xl p-5 cursor-pointer transition-all flex flex-col justify-between group shadow-lg hover:shadow-xl hover:shadow-sky-500/10 active:scale-[0.99]"
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

                    <h3 className="font-bold text-base text-white group-hover:text-sky-300 truncate transition-colors">
                      {song.title}
                    </h3>
                    <p className="text-xs text-slate-400 truncate mb-4">{song.artist}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectSong(song);
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 font-bold text-xs flex items-center gap-2 transition-all active:scale-95 shadow-sm"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Ver en Atril</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditSong(song);
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Editar letra y acordes"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
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
              ))}
            </div>

            {filteredLocalSongs.length === 0 && (
              <div className="text-center py-16 bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl p-8">
                <Music2 className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                <h4 className="text-base font-bold text-white mb-1">
                  {searchQuery ? `No tienes "${searchQuery}" en tu repertorio guardado` : 'Tu repertorio está vacío'}
                </h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
                  ¡Puedes buscar a la banda o canción en LaCuerda.net con un solo clic y traerla inmediatamente con sus acordes y asignación vocal!
                </p>
                {searchQuery.trim() && (
                  <button
                    onClick={() => handleSearchLaCuerda()}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs inline-flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Buscar "{searchQuery}" en LaCuerda.net</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: RESULTADOS EN VIVO DE LACUERDA.NET */}
        {activeTab === 'lacuerda' && (
          <div className="space-y-4">
            {isSearchingLaCuerda && (
              <div className="py-20 text-center space-y-3">
                <Loader2 className="w-10 h-10 mx-auto text-amber-400 animate-spin" />
                <p className="text-sm font-bold text-white">Consultando LaCuerda.net en tiempo real...</p>
                <p className="text-xs text-slate-400">Analizando si es una banda, artista o canción y extrayendo los hits principales</p>
              </div>
            )}

            {laCuerdaError && !isSearchingLaCuerda && (
              <div className="p-6 bg-red-950/30 border border-red-800/60 rounded-2xl text-center space-y-2">
                <p className="text-sm font-semibold text-red-300">{laCuerdaError}</p>
                <p className="text-xs text-slate-400">Prueba escribiendo el nombre de la banda (ej: Morat) o de una canción (ej: De música ligera).</p>
              </div>
            )}

            {!isSearchingLaCuerda && laCuerdaResults.length > 0 && (
              <div className="space-y-4">
                {/* Detected Artist Banner */}
                {detectedArtist && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-slate-900 to-indigo-950/40 border border-amber-500/40 flex items-center justify-between gap-4 shadow-xl">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20 text-xl">
                        🎤
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                            Banda / Artista Detectado
                          </span>
                          <span className="text-xs text-slate-400">• {laCuerdaResults.length} canciones disponibles</span>
                        </div>
                        <h3 className="text-lg font-black text-white tracking-tight">{detectedArtist}</h3>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-1.5 text-xs text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Hits más populares ordenados primero</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <span>
                    Se encontraron <strong className="text-amber-400">{laCuerdaResults.length}</strong> canciones en LaCuerda.net
                  </span>
                  <span className="text-[11px] text-slate-500 hidden sm:inline">
                    Haz clic en cualquier tarjeta para abrirla directamente en el atril
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {laCuerdaResults.map((result) => {
                    const isImportingThis = importingUrl === result.url;

                    return (
                      <div
                        key={result.id}
                        onClick={() => !isImportingThis && handleImportAndOpen(result)}
                        className={`bg-slate-900/90 border rounded-2xl p-5 flex flex-col justify-between shadow-xl cursor-pointer transition-all group active:scale-[0.99] ${
                          result.isPopularHit
                            ? 'border-amber-500/40 hover:border-amber-400 hover:shadow-amber-500/10 bg-gradient-to-b from-amber-500/5 to-slate-900/90'
                            : 'border-slate-800 hover:border-amber-500/50 hover:shadow-amber-500/5'
                        }`}
                      >
                        <div>
                          {/* Rating & Versions badge */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            {result.isPopularHit ? (
                              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/30 to-rose-500/30 text-amber-300 border border-amber-500/40 flex items-center gap-1 shadow-sm">
                                <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                                Hit Más Popular
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-amber-400" />
                                {result.ratingLabel}
                              </span>
                            )}
                            <span className="text-[10px] font-mono text-slate-400">
                              {result.versionsCount} ver.
                            </span>
                          </div>

                          <h4 className="font-extrabold text-base text-white group-hover:text-amber-300 transition-colors truncate">
                            {result.title}
                          </h4>
                          <p className="text-xs text-slate-400 truncate mb-4">{result.artist}</p>
                        </div>

                        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleImportAndOpen(result);
                            }}
                            disabled={isImportingThis}
                            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 active:scale-95 transition-all"
                            title="Descargar acordes, convertir a formato dúo y guardar en tu atril"
                          >
                            {isImportingThis ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Convirtiendo a Dúo y Abriendo...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4 fill-current" />
                                <span>⚡ Abrir en Atril (Dúo)</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SongLibrary;
