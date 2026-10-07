import type { DuoConfig, Setlist, Song } from '../types';

const INITIAL_DUO_CONFIG: DuoConfig = {
  id: '33c79b50-b810-4d66-82db-da3787ebc8a7',
  duo_name: 'Dúo Armonía',
  singer_1_name: 'Voz 1 (Alex)',
  singer_1_color: '#00E5FF', // Neon Cyan
  singer_2_name: 'Voz 2 (Sara)',
  singer_2_color: '#FFB300', // Warm Amber
  both_color: '#E040FB',     // Electric Magenta
  stage_preferences: {
    fontSize: 20,
    showChords: true,
    contrastMode: 'high',
    monoChords: true,
    autoScrollBpmSync: true,
  },
};

const SEED_SONGS: Song[] = [
  {
    id: '734c9ef1-9fa3-4a24-8c3c-1c2c6db61101',
    title: 'Shallow',
    artist: 'Lady Gaga & Bradley Cooper',
    original_key: 'Em',
    default_bpm: 96,
    time_signature: '4/4',
    content_chordpro: `{title: Shallow}
{artist: Lady Gaga & Bradley Cooper}
{key: Em}
{tempo: 96}
{time: 4/4}
{capo: 0}

{comment: Intro (Guitarra acústica)}
[Em]  [D/F#]  [G]  [C]  [G]  [D]

{v1}
{comment: Estrofa 1 - Voz 1}
[Em]Tell me [D/F#]something, [G]girl
[C]Are you happy in this [G]modern [D]world?
[Em]Or do you [D/F#]need [G]more?
[C]Is there somethin' else you're [G]searchin' [D]for?
{/v1}

{comment: Puente instrumental}
[Em]  [D/F#]  [G]

{v2}
{comment: Estrofa 2 - Voz 2}
[Em]Tell me [D/F#]something, [G]boy
[C]Aren't you tired tryin' to [G]fill that [D]void?
[Em]Or do you [D/F#]need [G]more?
[C]Ain't it hard keepin' it so [G]hardcore?
{/v2}

{comment: Pre-Coro}
<v1>[Am]I'm falling, </v1><v2>in all the good times [D/F#]I find myself longin'</v2>
<both>[Em]for change, [D/F#]and in the [G]bad times I fear myself</both>

{both}
{comment: Estribillo - Ambos en armonía}
[Am]I'm off the deep end, [D/F#]watch as I dive in
[G]I'll never [D/F#]meet the [Em]ground
[Am]Crash through the surface, [D/F#]where they can't hurt us
[G]We're far from the [D/F#]shallow [Em]now
{/both}

{comment: Outro con voces alternadas}
<v1>[Am]In the sha-la, </v1><v2>[D/F#]la-la-la-low, </v2><both>[G]shallow [Em]now[/both]
`,
  },
  {
    id: '48b6de9c-6f61-45e0-8ebd-896e1b3ab9c8',
    title: 'Falling Slowly',
    artist: 'Glen Hansard & Markéta Irglová',
    original_key: 'C',
    default_bpm: 70,
    time_signature: '4/4',
    content_chordpro: `{title: Falling Slowly}
{artist: Glen Hansard & Markéta Irglová}
{key: C}
{tempo: 70}
{time: 4/4}

{comment: Intro (Guitarra acústica arpegiada)}
[C]  [F]  [C]  [F]

{v1}
{comment: Estrofa 1 - Voz 1}
[C]I don't know you, [F]but I want you
[C]All the more for [F]that
[C]Words fall through me [F]and always fool me
[Am]And I can't react [F]
{/v1}

{v2}
{comment: Estrofa 2 - Voz 2}
[Am]Games that never a[G]mount to more than they're [F]meant
Will play themselves out [G]
{/v2}

{both}
{comment: Estribillo - Armonía dúo}
[C]Take this sinking [F]boat and point it at [Am]home
We've still got [F]time
[C]Raise your hopeful [F]voice, you had a choice [Am]
You've made it [F]now
{/both}

{v1}
[C]Falling slowly, [F]eyes that know me
[C]And I can't go [F]back
{/v1}

{both}
[C]Take this sinking [F]boat and point it at [Am]home
We've still got [F]time
{/both}
`,
  },
  {
    id: 'c1e1b8df-7457-4221-90e4-642381c8b3a2',
    title: 'City of Stars',
    artist: 'Ryan Gosling & Emma Stone',
    original_key: 'Gm',
    default_bpm: 102,
    time_signature: '4/4',
    content_chordpro: `{title: City of Stars}
{artist: Ryan Gosling & Emma Stone (La La Land)}
{key: Gm}
{tempo: 102}
{time: 4/4}
{capo: 3}

{comment: Intro (Piano / Acústico)}
[Gm]  [C7]  [Dm]

{v1}
{comment: Estrofa 1 - Voz 1 (Sebastian)}
[Gm]City of stars, [C7]are you shining just for [Dm]me?
[Gm]City of stars, [C7]there's so much that I can't [F]see
Who [Gm]knows? [C7]Is this the start of something [F]wonderful and new?
[Gm]Or one more dream [A7]that I cannot make [Dm]true?
{/v1}

{v2}
{comment: Estrofa 2 - Voz 2 (Mia)}
[Gm]City of stars, [C7]just one thing everybody [Dm]wants
[Gm]There in the bars [C7]and through the smoke of the crowded [F]restaurants
It's [Gm]love, [C7]yes, all we're looking for is [F]love from someone else
A [Gm]rush, a glance, a [A7]touch, a dance
{/v2}

{both}
{comment: Estribillo - Ambos en armonía}
A [Bb]look in somebody's [C7]eyes to light up the [A7]skies
To open the [Dm]world and send it reeling
A [Bb]voice that says, I'll be [C7]here, and you'll be [Dm]alright
I [Bb]don't care if I [C7]know just where I will [A7]fall
'Cause all that I [Dm]need's this crazy feeling
A [Gm]rat-tat-tat on my [A7]heart...
{/both}

{v1}
[Dm]Think I want it to [Gm]stay
{/v1}

{both}
[Gm]City of stars, [C7]are you shining just for [Dm]me?
[Gm]City of stars, [A7]you never shined so [Dm]brightly
{/both}
`,
  },
];

const SEED_SETLISTS: Setlist[] = [
  {
    id: '1bf96849-3b5d-4d96-a9cd-c59cd7bf8f50',
    title: 'Setlist Acústico - Show en Vivo',
    description: 'Repertorio de prueba para dúo vocal y guitarras con armonías',
    event_date: '2026-10-15',
    is_active: true,
    items: [
      {
        id: '428201fb-b25e-4643-ba10-8259721f15bf',
        setlist_id: '1bf96849-3b5d-4d96-a9cd-c59cd7bf8f50',
        song_id: '48b6de9c-6f61-45e0-8ebd-896e1b3ab9c8',
        position: 1,
        cue_notes: 'Arpegio suave, Voz 1 empieza con guitarra',
      },
      {
        id: '220f7f4e-9ed5-4615-ba49-4568a93ed4b2',
        setlist_id: '1bf96849-3b5d-4d96-a9cd-c59cd7bf8f50',
        song_id: 'c1e1b8df-7457-4221-90e4-642381c8b3a2',
        position: 2,
        override_capo: 3,
        cue_notes: 'Capo traste 3, ritmo swing acústico',
      },
      {
        id: '1b6de866-3563-41fd-b1b6-6b26d3b34528',
        setlist_id: '1bf96849-3b5d-4d96-a9cd-c59cd7bf8f50',
        song_id: '734c9ef1-9fa3-4a24-8c3c-1c2c6db61101',
        position: 3,
        cue_notes: 'Clímax vocal en coro juntos, solo acústico intermedio',
      },
    ],
  },
];

const STORAGE_KEYS = {
  SONGS: 'duo_chords_songs_v1',
  CONFIG: 'duo_chords_config_v1',
  SETLISTS: 'duo_chords_setlists_v1',
};

export class DataService {
  private static load<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      return JSON.parse(item) as T;
    } catch {
      return defaultValue;
    }
  }

  private static save<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('Error saving to storage:', e);
    }
  }

  // --- SONGS ---
  static async getSongs(): Promise<Song[]> {
    // 1. Try fetching from Dublyobase API
    try {
      const res = await fetch('/api/db/songs');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.songs) && data.songs.length > 0) {
          this.save(STORAGE_KEYS.SONGS, data.songs);
          return data.songs;
        }
      }
    } catch {
      // Offline fallback
    }

    // 2. Fallback to localStorage or SEED_SONGS
    return this.load<Song[]>(STORAGE_KEYS.SONGS, SEED_SONGS);
  }

  static async getSongById(id: string): Promise<Song | null> {
    const songs = await this.getSongs();
    return songs.find((s) => s.id === id) || null;
  }

  static async saveSong(song: Omit<Song, 'id'> & { id?: string }): Promise<Song> {
    const songs = await this.getSongs();
    const now = new Date().toISOString();
    let savedSong: Song;
    
    if (song.id) {
      const index = songs.findIndex((s) => s.id === song.id);
      if (index !== -1) {
        savedSong = {
          ...songs[index],
          ...song,
          id: song.id,
          updated: now,
        };
        songs[index] = savedSong;
      } else {
        savedSong = {
          ...song,
          id: song.id,
          created: now,
          updated: now,
        };
        songs.unshift(savedSong);
      }
    } else {
      savedSong = {
        ...song,
        id: crypto.randomUUID(),
        created: now,
        updated: now,
      };
      songs.unshift(savedSong);
    }

    // Save locally
    this.save(STORAGE_KEYS.SONGS, songs);

    // Sync to Dublyobase
    try {
      fetch('/api/db/songs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(savedSong),
      }).catch((e) => console.warn('Dublyobase sync background error:', e));
    } catch {
      // offline
    }

    return savedSong;
  }

  static async deleteSong(id: string): Promise<boolean> {
    const songs = await this.getSongs();
    const filtered = songs.filter((s) => s.id !== id);
    this.save(STORAGE_KEYS.SONGS, filtered);

    try {
      fetch(`/api/db/songs/${id}`, { method: 'DELETE' }).catch(() => {});
    } catch {
      // offline
    }

    return true;
  }

  // --- DUO CONFIG ---
  static async getDuoConfig(): Promise<DuoConfig> {
    try {
      const res = await fetch('/api/db/config');
      if (res.ok) {
        const data = await res.json();
        if (data.config && data.config.id) {
          this.save(STORAGE_KEYS.CONFIG, data.config);
          return data.config;
        }
      }
    } catch {
      // Offline fallback
    }

    return this.load<DuoConfig>(STORAGE_KEYS.CONFIG, INITIAL_DUO_CONFIG);
  }

  static async updateDuoConfig(patch: Partial<DuoConfig>): Promise<DuoConfig> {
    const current = await this.getDuoConfig();
    const updated = { ...current, ...patch };
    this.save(STORAGE_KEYS.CONFIG, updated);

    try {
      fetch('/api/db/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      }).catch(() => {});
    } catch {
      // offline
    }

    return updated;
  }

  // --- SETLISTS ---
  static async getSetlists(): Promise<Setlist[]> {
    let setlists = this.load<Setlist[]>(STORAGE_KEYS.SETLISTS, SEED_SETLISTS);
    try {
      const res = await fetch('/api/db/setlists');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.setlists) && data.setlists.length > 0) {
          setlists = data.setlists;
          this.save(STORAGE_KEYS.SETLISTS, setlists);
        }
      }
    } catch {
      // offline
    }

    const songs = await this.getSongs();
    return setlists.map((setlist) => ({
      ...setlist,
      items: (setlist.items || []).map((item) => ({
        ...item,
        song: songs.find((s) => s.id === item.song_id),
      })),
    }));
  }

  static async saveSetlist(setlist: Omit<Setlist, 'id'> & { id?: string }): Promise<Setlist> {
    const setlists = this.load<Setlist[]>(STORAGE_KEYS.SETLISTS, SEED_SETLISTS);
    const id = setlist.id || crypto.randomUUID();

    const newSetlist: Setlist = {
      ...setlist,
      id,
    };

    const idx = setlists.findIndex((s) => s.id === id);
    if (idx !== -1) {
      setlists[idx] = newSetlist;
    } else {
      setlists.push(newSetlist);
    }

    this.save(STORAGE_KEYS.SETLISTS, setlists);
    return newSetlist;
  }

  static async deleteSetlist(id: string): Promise<boolean> {
    const setlists = this.load<Setlist[]>(STORAGE_KEYS.SETLISTS, SEED_SETLISTS);
    const filtered = setlists.filter((s) => s.id !== id);
    this.save(STORAGE_KEYS.SETLISTS, filtered);
    return true;
  }

  // Reset to original Dublyobase seed
  static resetToDefault(): void {
    localStorage.removeItem(STORAGE_KEYS.SONGS);
    localStorage.removeItem(STORAGE_KEYS.CONFIG);
    localStorage.removeItem(STORAGE_KEYS.SETLISTS);
  }
}
