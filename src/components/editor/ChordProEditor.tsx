import React, { useState, useRef } from 'react';
import type { Song, DuoConfig } from '../../types';
import { parseChordPro } from '../../core/parser/parser';
import { ChordLine } from '../stage/ChordLine';
import { ArrowLeft, Save, Sparkles, Mic2, Users, FileText, Eye } from 'lucide-react';

interface ChordProEditorProps {
  initialSong?: Song;
  duoConfig: DuoConfig;
  onSave: (song: Omit<Song, 'id'> & { id?: string }) => void;
  onCancel: () => void;
}

export const ChordProEditor: React.FC<ChordProEditorProps> = ({
  initialSong,
  duoConfig,
  onSave,
  onCancel,
}) => {
  const [title, setTitle] = useState(initialSong?.title || '');
  const [artist, setArtist] = useState(initialSong?.artist || '');
  const [originalKey, setOriginalKey] = useState(initialSong?.original_key || 'C');
  const [bpm, setBpm] = useState(initialSong?.default_bpm || 100);
  const [timeSignature, setTimeSignature] = useState(initialSong?.time_signature || '4/4');
  const [content, setContent] = useState(
    initialSong?.content_chordpro ||
      `{title: Nueva Canción}
{artist: Artista}
{key: C}
{tempo: 100}

{comment: Intro}
[C]  [G]  [Am]  [F]

{v1}
{comment: Estrofa 1 - Voz 1}
[C]Primera estrofa cantada por [G]Voz 1
[Am]Con acordes alineados sobre las [F]sílabas
{/v1}

{v2}
{comment: Estrofa 2 - Voz 2}
[C]Segunda estrofa cantada por [G]Voz 2
[Am]Respondiendo con su propia [F]tonalidad
{/v2}

{both}
{comment: Coro - Ambos cantantes en armonía}
[F]Juntos en el coro a dos [G]voces
[C]Armonizando con fuerza y [Am]pasión
{/both}
`
  );

  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'split'>('split');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Insert helper text at cursor position
  const insertTextAtCursor = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const replacement = `${prefix}${selectedText}${suffix}`;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      const newPos = start + prefix.length + selectedText.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const parsedPreview = parseChordPro(content);

  const handleSave = () => {
    if (!title.trim()) {
      alert('Por favor introduce un título para la canción');
      return;
    }

    onSave({
      id: initialSong?.id,
      title: title.trim(),
      artist: artist.trim() || 'Artista Desconocido',
      original_key: originalKey.trim() || 'C',
      default_bpm: bpm || 100,
      time_signature: timeSignature || '4/4',
      content_chordpro: content,
    });
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#08090e] text-slate-100 select-none overflow-hidden">
      {/* Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 z-30 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base font-bold text-white">
              {initialSong ? 'Editar Canción' : 'Nueva Canción para Dúo'}
            </h2>
            <p className="text-xs text-slate-400">Editor con formato enriquecido Duo-ChordPro</p>
          </div>
        </div>

        {/* View mode buttons (mobile vs desktop) */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-800 rounded-xl p-1 border border-slate-700 md:hidden">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg ${
                activeTab === 'editor' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-300'
              }`}
            >
              Código
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg ${
                activeTab === 'preview' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-300'
              }`}
            >
              Vista Previa
            </button>
          </div>

          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-sky-500/25 active:scale-95 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Canción</span>
          </button>
        </div>
      </header>

      {/* Metadata Bar */}
      <div className="bg-slate-950 border-b border-slate-800/80 px-4 py-3 shrink-0">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Shallow"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Artista</label>
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="Ej: Lady Gaga"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Tono Base</label>
            <input
              type="text"
              value={originalKey}
              onChange={(e) => setOriginalKey(e.target.value)}
              placeholder="C, Em, G..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-sky-400 font-bold focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Tempo (BPM)</label>
            <input
              type="number"
              value={bpm}
              onChange={(e) => setBpm(parseInt(e.target.value, 10) || 100)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-emerald-400 font-bold focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Compás</label>
            <input
              type="text"
              value={timeSignature}
              onChange={(e) => setTimeSignature(e.target.value)}
              placeholder="4/4, 3/4..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>
      </div>

      {/* Quick Vocal & Chord Toolbar */}
      <div className="bg-slate-900/60 border-b border-slate-800 px-4 py-2 shrink-0 overflow-x-auto flex items-center gap-2">
        <span className="text-[11px] uppercase font-bold text-slate-400 flex items-center gap-1 mr-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Atajos:
        </span>

        {/* Singer 1 block */}
        <button
          onClick={() => insertTextAtCursor('\n{v1}\n', '\n{/v1}\n')}
          className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 hover:brightness-110 active:scale-95"
          style={{
            borderColor: `${duoConfig.singer_1_color}60`,
            backgroundColor: `${duoConfig.singer_1_color}20`,
            color: duoConfig.singer_1_color,
          }}
        >
          <Mic2 className="w-3.5 h-3.5" />
          + {duoConfig.singer_1_name}
        </button>

        {/* Singer 2 block */}
        <button
          onClick={() => insertTextAtCursor('\n{v2}\n', '\n{/v2}\n')}
          className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 hover:brightness-110 active:scale-95"
          style={{
            borderColor: `${duoConfig.singer_2_color}60`,
            backgroundColor: `${duoConfig.singer_2_color}20`,
            color: duoConfig.singer_2_color,
          }}
        >
          <Mic2 className="w-3.5 h-3.5" />
          + {duoConfig.singer_2_name}
        </button>

        {/* Both block */}
        <button
          onClick={() => insertTextAtCursor('\n{both}\n', '\n{/both}\n')}
          className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 hover:brightness-110 active:scale-95"
          style={{
            borderColor: `${duoConfig.both_color}60`,
            backgroundColor: `${duoConfig.both_color}20`,
            color: duoConfig.both_color,
          }}
        >
          <Users className="w-3.5 h-3.5" />
          + Ambos (Armonía)
        </button>

        <div className="h-4 w-px bg-slate-700 mx-1" />

        {/* Inline Vocal tags */}
        <button
          onClick={() => insertTextAtCursor('<v1>', '</v1>')}
          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-cyan-400 border border-slate-700"
          title="Etiqueta vocal inline Voz 1"
        >
          &lt;v1&gt;
        </button>
        <button
          onClick={() => insertTextAtCursor('<v2>', '</v2>')}
          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-amber-400 border border-slate-700"
          title="Etiqueta vocal inline Voz 2"
        >
          &lt;v2&gt;
        </button>
        <button
          onClick={() => insertTextAtCursor('<both>', '</both>')}
          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-fuchsia-400 border border-slate-700"
          title="Etiqueta vocal inline Ambos"
        >
          &lt;both&gt;
        </button>

        <div className="h-4 w-px bg-slate-700 mx-1" />

        {/* Chord & section buttons */}
        <button
          onClick={() => insertTextAtCursor('[', ']')}
          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-sky-400 font-bold border border-slate-700"
          title="Insertar acorde"
        >
          [Acorde]
        </button>

        <button
          onClick={() => insertTextAtCursor('\n{c: ', '}\n')}
          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700"
          title="Insertar comentario de sección"
        >
          + Comentario
        </button>

        <button
          onClick={() => insertTextAtCursor('\n{soc}\n{comment: Coro}\n', '\n{eoc}\n')}
          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700"
          title="Insertar bloque Coro"
        >
          + Coro
        </button>
      </div>

      {/* Main Dual Pane Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Pane */}
        <div
          className={`flex-1 flex flex-col border-r border-slate-800 ${
            activeTab === 'preview' ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="bg-slate-900/40 px-4 py-1.5 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-sky-400" />
              ChordPro Source
            </span>
            <span className="font-mono text-[11px]">{content.split('\n').length} líneas</span>
          </div>

          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 w-full bg-[#07080c] p-4 text-sm font-mono leading-relaxed text-slate-200 resize-none focus:outline-none selection:bg-sky-500/30"
            placeholder="Escribe aquí tu canción en formato ChordPro..."
            spellCheck={false}
          />
        </div>

        {/* Live Stage Preview Pane */}
        <div
          className={`flex-1 flex flex-col overflow-y-auto bg-[#0a0c13] ${
            activeTab === 'editor' ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="bg-slate-900/40 px-4 py-1.5 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400 sticky top-0 z-10 backdrop-blur-sm">
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              Vista Previa en Vivo (Modo Atril)
            </span>
            <span className="text-[11px] text-slate-500">Actualización en tiempo real</span>
          </div>

          <div className="p-6 max-w-2xl mx-auto w-full">
            <div className="mb-6 pb-4 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white tracking-tight">
                {title || parsedPreview.title || 'Título de la Canción'}
              </h3>
              <p className="text-xs text-slate-400">
                {artist || parsedPreview.artist || 'Artista'} • Tono: {originalKey} • {bpm} BPM
              </p>
            </div>

            {parsedPreview.sections.map((section, sIdx) => (
              <div key={sIdx} className="mb-6">
                {section.header && (
                  <div className="mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-sky-400">
                      {section.header}
                    </span>
                  </div>
                )}
                <div className="space-y-1">
                  {section.lines.map((line, lIdx) => (
                    <ChordLine
                      key={lIdx}
                      line={line}
                      fontSize={18}
                      duoConfig={duoConfig}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
