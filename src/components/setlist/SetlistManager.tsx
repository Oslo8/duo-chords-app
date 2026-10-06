import React, { useState } from 'react';
import type { Setlist, Song, DuoConfig, SetlistItem } from '../../types';
import { 
  ListMusic, 
  Play, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Calendar, 
  Music, 
  X,
  Edit2
} from 'lucide-react';

interface SetlistManagerProps {
  setlists: Setlist[];
  allSongs: Song[];
  duoConfig: DuoConfig;
  onSelectSongFromSetlist: (song: Song, setlistTitle: string, setlistIndex: number, allItems: SetlistItem[]) => void;
  onSaveSetlist: (setlist: Omit<Setlist, 'id'> & { id?: string }) => void;
  onDeleteSetlist: (id: string) => void;
}

export const SetlistManager: React.FC<SetlistManagerProps> = ({
  setlists,
  allSongs,
  onSelectSongFromSetlist,
  onSaveSetlist,
  onDeleteSetlist,
}) => {
  const [activeSetlistId, setActiveSetlistId] = useState<string>(
    setlists.length > 0 ? setlists[0].id : ''
  );
  const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingDescription, setEditingDescription] = useState('');
  const [editingDate, setEditingDate] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [isAddSongModalOpen, setIsAddSongModalOpen] = useState(false);

  const currentSetlist = setlists.find((s) => s.id === activeSetlistId) || setlists[0];

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setEditingTitle('Nuevo Setlist para Concierto');
    setEditingDescription('');
    setEditingDate(new Date().toISOString().split('T')[0]);
    setIsEditingModalOpen(true);
  };

  const handleOpenEditModal = (setlist: Setlist) => {
    setEditingId(setlist.id);
    setEditingTitle(setlist.title);
    setEditingDescription(setlist.description || '');
    setEditingDate(setlist.event_date || '');
    setIsEditingModalOpen(true);
  };

  const handleSaveModal = () => {
    if (!editingTitle.trim()) return;
    onSaveSetlist({
      id: editingId || undefined,
      title: editingTitle.trim(),
      description: editingDescription.trim(),
      event_date: editingDate,
      is_active: true,
      items: editingId && currentSetlist ? currentSetlist.items : [],
    });
    setIsEditingModalOpen(false);
  };

  const handleAddSongToCurrentSetlist = (songId: string) => {
    if (!currentSetlist) return;
    const items = currentSetlist.items || [];
    const newItem: SetlistItem = {
      id: crypto.randomUUID(),
      setlist_id: currentSetlist.id,
      song_id: songId,
      position: items.length + 1,
      cue_notes: '',
    };
    onSaveSetlist({
      ...currentSetlist,
      items: [...items, newItem],
    });
    setIsAddSongModalOpen(false);
  };

  const handleRemoveItem = (index: number) => {
    if (!currentSetlist) return;
    const items = [...(currentSetlist.items || [])];
    items.splice(index, 1);
    // re-index positions
    const reindexed = items.map((it, idx) => ({ ...it, position: idx + 1 }));
    onSaveSetlist({
      ...currentSetlist,
      items: reindexed,
    });
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    if (!currentSetlist) return;
    const items = [...(currentSetlist.items || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const temp = items[index];
    items[index] = items[targetIndex];
    items[targetIndex] = temp;

    const reindexed = items.map((it, idx) => ({ ...it, position: idx + 1 }));
    onSaveSetlist({
      ...currentSetlist,
      items: reindexed,
    });
  };

  const handleUpdateItemNotes = (index: number, notes: string) => {
    if (!currentSetlist) return;
    const items = [...(currentSetlist.items || [])];
    items[index] = { ...items[index], cue_notes: notes };
    onSaveSetlist({
      ...currentSetlist,
      items,
    });
  };

  const handleStartShow = () => {
    if (!currentSetlist || !currentSetlist.items || currentSetlist.items.length === 0) return;
    const firstItem = currentSetlist.items[0];
    const firstSong = firstItem.song || allSongs.find((s) => s.id === firstItem.song_id);
    if (firstSong) {
      onSelectSongFromSetlist(firstSong, currentSetlist.title, 0, currentSetlist.items);
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-[#07080c] text-slate-100">
      {/* Sidebar: Setlists List */}
      <div className="w-full md:w-80 bg-slate-900/60 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListMusic className="w-5 h-5 text-sky-400" />
            <h3 className="font-bold text-white text-sm">Mis Setlists</h3>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="p-1.5 rounded-xl bg-sky-500/20 text-sky-400 hover:bg-sky-500 hover:text-slate-950 transition-colors text-xs font-semibold flex items-center gap-1"
            title="Crear nuevo setlist"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {setlists.map((setlist) => {
            const isSelected = setlist.id === currentSetlist?.id;
            const songCount = setlist.items?.length || 0;

            return (
              <div
                key={setlist.id}
                onClick={() => setActiveSetlistId(setlist.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-slate-800/90 border-sky-500/60 shadow-lg shadow-sky-500/10'
                    : 'bg-slate-950/40 border-slate-800 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-sm text-white truncate">{setlist.title}</h4>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-sky-400 shrink-0">
                    {songCount} temas
                  </span>
                </div>
                {setlist.description && (
                  <p className="text-xs text-slate-400 truncate mt-1">{setlist.description}</p>
                )}
                {setlist.event_date && (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-2">
                    <Calendar className="w-3 h-3" />
                    <span>{setlist.event_date}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Setlist Detail */}
      {currentSetlist ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar for Selected Setlist */}
          <div className="p-4 sm:p-6 bg-slate-900/40 border-b border-slate-800 shrink-0 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg sm:text-xl font-bold text-white">{currentSetlist.title}</h2>
                <button
                  onClick={() => handleOpenEditModal(currentSetlist)}
                  className="p-1 rounded text-slate-400 hover:text-white"
                  title="Editar nombre y fecha"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {currentSetlist.description || 'Sin descripción'} • {currentSetlist.items?.length || 0} canciones configuradas
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddSongModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4 text-sky-400" />
                <span>Agregar Canción</span>
              </button>

              <button
                onClick={handleStartShow}
                disabled={!currentSetlist.items || currentSetlist.items.length === 0}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 disabled:pointer-events-none text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>INICIAR SHOW EN VIVO</span>
              </button>

              <button
                onClick={() => {
                  if (confirm('¿Eliminar este setlist?')) {
                    onDeleteSetlist(currentSetlist.id);
                  }
                }}
                className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-950/20 transition-colors"
                title="Eliminar setlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Songs in Setlist Table */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2.5">
            {(!currentSetlist.items || currentSetlist.items.length === 0) && (
              <div className="text-center py-16 text-slate-500">
                <Music className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">Este setlist aún no contiene canciones.</p>
                <button
                  onClick={() => setIsAddSongModalOpen(true)}
                  className="mt-3 px-4 py-1.5 rounded-lg bg-sky-500/20 text-sky-400 hover:bg-sky-500 hover:text-slate-950 text-xs font-bold transition-colors"
                >
                  + Agregar primera canción
                </button>
              </div>
            )}

            {(currentSetlist.items || []).map((item, idx) => {
              const song = item.song || allSongs.find((s) => s.id === item.song_id);

              return (
                <div
                  key={item.id || idx}
                  className="bg-slate-900/70 border border-slate-800/90 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-slate-700 transition-all group"
                >
                  {/* Left: Position & Song Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-slate-800 font-mono font-bold text-xs text-sky-400 flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>

                    <div className="min-w-0">
                      <h4
                        onClick={() => song && onSelectSongFromSetlist(song, currentSetlist.title, idx, currentSetlist.items || [])}
                        className="font-bold text-sm text-white hover:text-sky-300 cursor-pointer truncate transition-colors"
                      >
                        {song?.title || 'Canción no encontrada'}
                      </h4>
                      <p className="text-xs text-slate-400 truncate">
                        {song?.artist} • Tono: <span className="text-sky-400 font-mono font-bold">{song?.original_key}</span> • {song?.default_bpm} BPM
                      </p>
                    </div>
                  </div>

                  {/* Center: Cue Notes (Notes for gig) */}
                  <div className="w-full sm:w-auto flex-1 max-w-md">
                    <input
                      type="text"
                      defaultValue={item.cue_notes || ''}
                      onBlur={(e) => handleUpdateItemNotes(idx, e.target.value)}
                      placeholder="Nota de atril (ej: Solo acústico, Capo 2...)"
                      className="w-full bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  {/* Right: Actions (Move Up, Down, Remove, Play) */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => handleMoveItem(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-20 text-slate-300"
                      title="Mover arriba"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleMoveItem(idx, 'down')}
                      disabled={idx === (currentSetlist.items?.length || 0) - 1}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-20 text-slate-300"
                      title="Mover abajo"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => song && onSelectSongFromSetlist(song, currentSetlist.title, idx, currentSetlist.items || [])}
                      className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 transition-colors"
                      title="Ver en atril"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>

                    <button
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/20"
                      title="Quitar del setlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-500">
          <p>Selecciona o crea un setlist para comenzar.</p>
        </div>
      )}

      {/* Modal: Create/Edit Setlist */}
      {isEditingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold text-white text-base">
              {editingId ? 'Editar Setlist' : 'Nuevo Setlist'}
            </h3>

            <div>
              <label className="block text-xs uppercase font-bold text-slate-400 mb-1">Título</label>
              <input
                type="text"
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white"
                placeholder="Ej: Concierto Viernes Noche"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-slate-400 mb-1">Descripción</label>
              <textarea
                value={editingDescription}
                onChange={(e) => setEditingDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                placeholder="Lugar, notas del show..."
                rows={2}
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-slate-400 mb-1">Fecha</label>
              <input
                type="date"
                value={editingDate}
                onChange={(e) => setEditingDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsEditingModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveModal}
                className="px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Song to Setlist */}
      {isAddSongModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-base">Seleccionar Canción del Repertorio</h3>
              <button onClick={() => setIsAddSongModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {allSongs.map((song) => (
                <div
                  key={song.id}
                  onClick={() => handleAddSongToCurrentSetlist(song.id)}
                  className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/50 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div>
                    <h4 className="font-bold text-sm text-white">{song.title}</h4>
                    <p className="text-xs text-slate-400">{song.artist} • Tono: {song.original_key}</p>
                  </div>
                  <span className="text-xs font-bold text-sky-400">+ Agregar</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
