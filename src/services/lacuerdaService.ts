import type { LaCuerdaSearchResult, ConvertedLaCuerdaSong } from '../server/lacuerda';

export class LaCuerdaService {
  static async search(query: string): Promise<LaCuerdaSearchResult[]> {
    if (!query.trim()) return [];

    const res = await fetch(`/api/lacuerda/search?q=${encodeURIComponent(query.trim())}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Error en la búsqueda' }));
      throw new Error(err.error || `Error HTTP ${res.status}`);
    }

    const data = await res.json();
    return data.results || [];
  }

  static async importSong(songUrl: string): Promise<ConvertedLaCuerdaSong> {
    const res = await fetch(`/api/lacuerda/import?url=${encodeURIComponent(songUrl)}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Error al importar la canción' }));
      throw new Error(err.error || `Error HTTP ${res.status}`);
    }

    const data = await res.json();
    if (!data.song) {
      throw new Error('No se pudo convertir la canción');
    }

    return data.song;
  }
}
