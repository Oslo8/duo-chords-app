export type VocalRole = 'v1' | 'v2' | 'both' | 'neutral';

export interface DuoConfig {
  id?: string;
  duo_name: string;
  singer_1_name: string;
  singer_1_color: string;
  singer_2_name: string;
  singer_2_color: string;
  both_color: string;
  stage_preferences?: {
    fontSize?: number;
    showChords?: boolean;
    contrastMode?: 'high' | 'normal';
    monoChords?: boolean;
    autoScrollBpmSync?: boolean;
  };
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  original_key: string;
  default_bpm: number;
  time_signature: string;
  content_chordpro: string;
  created?: string;
  updated?: string;
}

export interface SetlistItem {
  id?: string;
  setlist_id: string;
  song_id: string;
  position: number;
  override_key?: string;
  override_capo?: number;
  cue_notes?: string;
  song?: Song;
}

export interface Setlist {
  id: string;
  title: string;
  description?: string;
  event_date?: string;
  is_active?: boolean;
  items?: SetlistItem[];
}
