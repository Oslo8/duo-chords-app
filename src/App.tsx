import { useState, useEffect } from 'react';
import type { Song, DuoConfig, Setlist, SetlistItem } from './types';
import { DataService } from './services/db';
import { StageViewer } from './components/stage/StageViewer';
import { ChordProEditor } from './components/editor/ChordProEditor';
import { SongLibrary } from './components/library/SongLibrary';
import { SetlistManager } from './components/setlist/SetlistManager';
import { DuoConfigModal } from './components/config/DuoConfigModal';
import { Guitar, ListMusic, Music2, SlidersHorizontal, Plus } from 'lucide-react';

export function App() {
  const [view, setView] = useState<'library' | 'stage' | 'editor' | 'setlists'>('library');
  const [songs, setSongs] = useState<Song[]>([]);
  const [setlists, setSetlists] = useState<Setlist[]>([]);
  const [duoConfig, setDuoConfig] = useState<DuoConfig | null>(null);

  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [editingSong, setEditingSong] = useState<Song | null>(null);

  // Setlist playback context
  const [activeSetlistTitle, setActiveSetlistTitle] = useState<string | undefined>(undefined);
  const [activeSetlistItems, setActiveSetlistItems] = useState<SetlistItem[]>([]);
  const [activeSetlistIndex, setActiveSetlistIndex] = useState<number>(0);

  const [isDuoConfigOpen, setIsDuoConfigOpen] = useState(false);

  // Load initial data
  useEffect(() => {
    const init = async () => {
      const [loadedSongs, loadedConfig, loadedSetlists] = await Promise.all([
        DataService.getSongs(),
        DataService.getDuoConfig(),
        DataService.getSetlists(),
      ]);
      setSongs(loadedSongs);
      setDuoConfig(loadedConfig);
      setSetlists(loadedSetlists);
    };
    init();
  }, []);

  if (!duoConfig) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#07080c] text-sky-400 font-mono text-sm">
        Cargando repertorio para dúo...
      </div>
    );
  }

  // --- Handlers ---
  const handleSelectSongFromLibrary = (song: Song) => {
    setSelectedSong(song);
    setActiveSetlistTitle(undefined);
    setActiveSetlistItems([]);
    setActiveSetlistIndex(0);
    setView('stage');
  };

  const handleSelectSongFromSetlist = (
    song: Song,
    setlistTitle: string,
    itemIndex: number,
    allItems: SetlistItem[]
  ) => {
    setSelectedSong(song);
    setActiveSetlistTitle(setlistTitle);
    setActiveSetlistItems(allItems);
    setActiveSetlistIndex(itemIndex);
    setView('stage');
  };

  const handleNextSetlistSong = () => {
    if (activeSetlistIndex < activeSetlistItems.length - 1) {
      const nextIdx = activeSetlistIndex + 1;
      const nextItem = activeSetlistItems[nextIdx];
      const nextSong = nextItem.song || songs.find((s) => s.id === nextItem.song_id);
      if (nextSong) {
        setSelectedSong(nextSong);
        setActiveSetlistIndex(nextIdx);
      }
    }
  };

  const handlePrevSetlistSong = () => {
    if (activeSetlistIndex > 0) {
      const prevIdx = activeSetlistIndex - 1;
      const prevItem = activeSetlistItems[prevIdx];
      const prevSong = prevItem.song || songs.find((s) => s.id === prevItem.song_id);
      if (prevSong) {
        setSelectedSong(prevSong);
        setActiveSetlistIndex(prevIdx);
      }
    }
  };

  const handleCreateNewSong = () => {
    setEditingSong(null);
    setView('editor');
  };

  const handleEditSong = (song: Song) => {
    setEditingSong(song);
    setView('editor');
  };

  const handleSaveSong = async (songData: Omit<Song, 'id'> & { id?: string }): Promise<Song> => {
    const saved = await DataService.saveSong(songData);
    const updatedSongs = await DataService.getSongs();
    setSongs(updatedSongs);
    setSelectedSong(saved);
    setView('stage');
    return saved;
  };

  const handleDeleteSong = async (id: string) => {
    await DataService.deleteSong(id);
    const updatedSongs = await DataService.getSongs();
    setSongs(updatedSongs);
    if (selectedSong?.id === id) {
      setSelectedSong(null);
      setView('library');
    }
  };

  const handleSaveSetlist = async (setlistData: Omit<Setlist, 'id'> & { id?: string }) => {
    await DataService.saveSetlist(setlistData);
    const updatedSetlists = await DataService.getSetlists();
    setSetlists(updatedSetlists);
  };

  const handleDeleteSetlist = async (id: string) => {
    await DataService.deleteSetlist(id);
    const updatedSetlists = await DataService.getSetlists();
    setSetlists(updatedSetlists);
  };

  const handleSaveDuoConfig = async (newConfig: DuoConfig) => {
    const saved = await DataService.updateDuoConfig(newConfig);
    setDuoConfig(saved);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#07080c] text-slate-100 select-none overflow-hidden">
      {/* Top Main Navigation (Hidden when in pure Stage Mode for maximum screen real estate on stands) */}
      {view !== 'stage' && (
        <nav className="bg-slate-900 border-b border-slate-800 px-4 sm:px-8 py-3 shrink-0 flex items-center justify-between z-20">
          {/* Logo & Duo Name */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('library')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-slate-950 shadow-md">
              <Guitar className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="font-extrabold text-sm sm:text-base text-white tracking-tight block">
                DuoChords Live
              </span>
              <span className="text-[10px] text-sky-400 font-semibold tracking-wider uppercase">
                {duoConfig.duo_name}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-1 sm:gap-2 bg-slate-950 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => setView('library')}
              className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                view === 'library'
                  ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Music2 className="w-3.5 h-3.5" />
              <span>Repertorio</span>
            </button>

            <button
              onClick={() => setView('setlists')}
              className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                view === 'setlists'
                  ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ListMusic className="w-3.5 h-3.5" />
              <span>Setlists</span>
            </button>

            {selectedSong && (
              <button
                onClick={() => setView('stage')}
                className="px-3 sm:px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500 hover:text-slate-950 transition-all"
              >
                <span>Atril ({selectedSong.title})</span>
              </button>
            )}
          </div>

          {/* Right Action: Duo Setup & Quick New */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDuoConfigOpen(true)}
              className="p-2 sm:px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700/60 transition-colors"
              title="Configurar voces y colores de escenario"
            >
              <SlidersHorizontal className="w-4 h-4 text-sky-400" />
              <span className="hidden sm:inline">Configuración Dúo</span>
            </button>

            <button
              onClick={handleCreateNewSong}
              className="px-3 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold flex items-center gap-1 shadow-md shadow-sky-500/20"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nueva</span>
            </button>
          </div>
        </nav>
      )}

      {/* Main View Router */}
      {view === 'stage' && selectedSong && (
        <StageViewer
          song={selectedSong}
          duoConfig={duoConfig}
          onBackToList={() => setView('library')}
          onNextSong={handleNextSetlistSong}
          onPrevSong={handlePrevSetlistSong}
          hasNextSong={activeSetlistIndex < activeSetlistItems.length - 1}
          hasPrevSong={activeSetlistIndex > 0}
          setlistContextTitle={activeSetlistTitle}
          onEditSong={() => handleEditSong(selectedSong)}
        />
      )}

      {view === 'editor' && (
        <ChordProEditor
          initialSong={editingSong || undefined}
          duoConfig={duoConfig}
          onSave={handleSaveSong}
          onCancel={() => setView(selectedSong ? 'stage' : 'library')}
        />
      )}

      {view === 'library' && (
        <SongLibrary
          songs={songs}
          duoConfig={duoConfig}
          onSelectSong={handleSelectSongFromLibrary}
          onEditSong={handleEditSong}
          onCreateNewSong={handleCreateNewSong}
          onDeleteSong={handleDeleteSong}
          onOpenDuoConfig={() => setIsDuoConfigOpen(true)}
          onImportSong={handleSaveSong}
        />
      )}

      {view === 'setlists' && (
        <SetlistManager
          setlists={setlists}
          allSongs={songs}
          duoConfig={duoConfig}
          onSelectSongFromSetlist={handleSelectSongFromSetlist}
          onSaveSetlist={handleSaveSetlist}
          onDeleteSetlist={handleDeleteSetlist}
        />
      )}

      {/* Duo Configuration Modal */}
      {isDuoConfigOpen && (
        <DuoConfigModal
          currentConfig={duoConfig}
          onSave={handleSaveDuoConfig}
          onClose={() => setIsDuoConfigOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
