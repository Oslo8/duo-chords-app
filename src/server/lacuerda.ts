export interface LaCuerdaSearchResult {
  id: string;
  artist: string;
  artistSlug: string;
  title: string;
  songSlug: string;
  ratingStars: number;
  ratingLabel: string;
  versionsCount: number;
  url: string;
}

export interface ConvertedLaCuerdaSong {
  title: string;
  artist: string;
  original_key: string;
  default_bpm: number;
  time_signature: string;
  content_chordpro: string;
}

export async function searchLaCuerda(query: string): Promise<LaCuerdaSearchResult[]> {
  const url = `https://acordes.lacuerda.net/busca.php?canc=1&exp=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  });

  if (!res.ok) {
    throw new Error(`LaCuerda error HTTP ${res.status}`);
  }

  const html = await res.text();
  const results: LaCuerdaSearchResult[] = [];

  // Extract hds and fns arrays from page script
  const hdsMatch = html.match(/var hds=\[([\s\S]*?)\];/);
  const fnsMatch = html.match(/var fns=\[([\s\S]*?)\];/);
  const nmaxMatch = html.match(/var NMAX=(\d+);/);

  let hds: string[] = [];
  let fns: string[] = [];
  let nmax = 0;

  if (hdsMatch && fnsMatch && nmaxMatch) {
    try {
      hds = (0, eval)('[' + hdsMatch[1] + ']');
      fns = (0, eval)('[' + fnsMatch[1] + ']');
      nmax = parseInt(nmaxMatch[1], 10);
    } catch {
      // fallback
    }
  }

  // Parse table rows
  const rowRegex = /<tr><td>\s*<a[^>]*href=['"]\/([^\/]+)\/['"][^>]*>([^<]+)<\/a><\/td><td><ul[^>]*>([\s\S]*?)<\/ul><\/td><\/tr>/gi;
  let match: RegExpExecArray | null;

  while ((match = rowRegex.exec(html)) !== null) {
    const fallbackArtistSlug = match[1];
    const artistName = match[2].trim();
    const songsHtml = match[3];

    const songRegex = /<li[^>]*id=['"]([^'"]+)['"][^>]*lcd=['"]([^'"]+)['"][^>]*><a[^>]*>([^<]+)<\/a><\/li>/gi;
    let sMatch: RegExpExecArray | null;

    while ((sMatch = songRegex.exec(songsHtml)) !== null) {
      const liId = sMatch[1]; // e.g. "r049"
      const lcd = sMatch[2]; // e.g. "TRTTBTKH-12345678"
      const songTitle = sMatch[3].trim();

      // Extract numeric index n from liId ("r049" -> 49)
      const numMatch = liId.match(/\d+/);
      const n = numMatch ? parseInt(numMatch[0], 10) : 0;

      // In LaCuerda's arch.js: fn = '' + hds[NMAX - n] + '/' + fns[n]
      let artistSlug = fallbackArtistSlug;
      let songSlug = '';

      if (hds.length > 0 && nmax >= n && hds[nmax - n]) {
        artistSlug = hds[nmax - n];
      }

      if (fns.length > 0 && nmax >= n && fns[nmax - n]) {
        songSlug = fns[nmax - n];
      }

      if (!songSlug) {
        songSlug = songTitle
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/^_+|_+$/g, '');
      }

      // Count versions
      const dashIdx = lcd.indexOf('-');
      const versionsStr = dashIdx !== -1 ? lcd.substring(dashIdx + 1) : '1';
      const versionsCount = versionsStr.length || 1;

      const canonicalUrl = `https://acordes.lacuerda.net/${artistSlug}/${songSlug}.shtml`;

      results.push({
        id: `${artistSlug}-${songSlug}-${n}`,
        artist: artistName,
        artistSlug,
        title: songTitle,
        songSlug,
        ratingStars: 5,
        ratingLabel: '⭐⭐⭐⭐⭐ Versión Principal (Más Popular)',
        versionsCount,
        url: canonicalUrl,
      });
    }
  }

  return results;
}

export function convertLaCuerdaHtmlToDuoChordPro(html: string): ConvertedLaCuerdaSong {
  // Title and Artist extraction from metadata script variables first
  const obandMatch = html.match(/oband=['"]([^'"]+)['"]/);
  const orolaMatch = html.match(/orola=['"]([^'"]+)['"]/);

  let title = orolaMatch ? orolaMatch[1].trim() : '';
  let artist = obandMatch ? obandMatch[1].trim() : '';

  // Fallbacks if not found in script variables
  if (!title) {
    const titleMatch = html.match(/<div id=tH1><h1><a[^>]*>([^<]+)<\/a>/i) || html.match(/<title>([^,:]+)[,:]/i);
    title = titleMatch ? titleMatch[1].trim() : 'Canción LaCuerda';
  }

  if (!artist) {
    const artistMatch = html.match(/<h2><a[^>]*>([^<]+)<\/a><\/h2>/i) || html.match(/<title>[^,:]+,\s*([^:]+):/i);
    artist = artistMatch ? artistMatch[1].trim() : 'Artista';
  }

  // Key hint from odes script variable (e.g. odes='Em G D A')
  const odesMatch = html.match(/odes=['"]([^'"]+)['"]/);
  let keyHint = 'C';
  if (odesMatch) {
    const chords = odesMatch[1].trim().split(/\s+/);
    if (chords.length > 0 && chords[0]) {
      keyHint = chords[0].replace(/[^A-G#bm]/g, '');
    }
  }

  // Extract <PRE> content
  const preMatch = html.match(/<div id=t_body><PRE>([\s\S]*?)<\/PRE><\/div>/i);
  if (!preMatch) {
    throw new Error('No se encontró el bloque de acordes <PRE> en la página de LaCuerda');
  }

  let rawPre = preMatch[1];

  // Remove <div></div> and stray HTML markers
  rawPre = rawPre.replace(/<div><\/div>/g, '');

  const lines = rawPre.split(/\r?\n/);
  const chordproLines: string[] = [
    `{title: ${title}}`,
    `{artist: ${artist}}`,
    `{key: ${keyHint || 'C'}}`,
    `{tempo: 100}`,
    `{time: 4/4}`,
    '',
  ];

  let currentVoiceState: 'v1' | 'v2' = 'v1';
  let inVerse = false;
  let inChorus = false;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Blank line
    if (!trimmed) {
      if (inVerse) {
        chordproLines.push(`{/${currentVoiceState}}`);
        inVerse = false;
        // Alternate voice for the next verse (Singer 1 <-> Singer 2)
        currentVoiceState = currentVoiceState === 'v1' ? 'v2' : 'v1';
      }
      if (inChorus) {
        chordproLines.push('{/both}');
        inChorus = false;
      }
      chordproLines.push('');
      continue;
    }

    // Section header check (Intro, Coro, Puente, etc.)
    const isSectionHeader = /^(intro|coro|estribillo|puente|solo|pre-coro|outro|intermedio|verso|estrofa)/i.test(trimmed) ||
                           /^\[(intro|coro|estribillo|puente|solo|pre-coro|outro|intermedio|verso|estrofa)\]/i.test(trimmed);

    if (isSectionHeader) {
      if (inVerse) {
        chordproLines.push(`{/${currentVoiceState}}`);
        inVerse = false;
      }
      if (inChorus) {
        chordproLines.push('{/both}');
        inChorus = false;
      }

      const headerClean = trimmed.replace(/[\[\]:]/g, '').toUpperCase();
      chordproLines.push(`{comment: ${headerClean}}`);

      if (headerClean.includes('CORO') || headerClean.includes('ESTRIBILLO')) {
        chordproLines.push('{both}');
        inChorus = true;
      }
      continue;
    }

    // Check if line contains chords (<A>...</A>)
    const hasChordTags = /<A>[^<]+<\/A>/i.test(rawLine);

    if (hasChordTags) {
      // Clean up rhythmic pattern notes in parentheses at the end: e.g. (Bm-G-D-A)
      const lineWithoutRhythm = rawLine.replace(/\([^\)]*<A>[\s\S]*?\)/gi, '');

      // Check if next line is lyrics (not chords and not empty)
      const nextLine = (i + 1 < lines.length) ? lines[i + 1] : '';
      const nextHasChords = /<A>[^<]+<\/A>/i.test(nextLine);
      const nextIsHeader = /^(intro|coro|estribillo|puente|solo|pre-coro|outro)/i.test(nextLine.trim());

      if (nextLine && !nextHasChords && !nextIsHeader && nextLine.trim().length > 0) {
        // We have chords aligned directly above lyrics!
        if (!inVerse && !inChorus) {
          chordproLines.push(`{${currentVoiceState}}`);
          inVerse = true;
        }

        // Parse chords and their column positions
        const chordsWithCol: { col: number; chord: string }[] = [];
        let cleanChordLine = '';
        const tagRegex = /<A>([^<]+)<\/A>/gi;
        let lastIdx = 0;
        let m: RegExpExecArray | null;

        while ((m = tagRegex.exec(lineWithoutRhythm)) !== null) {
          const textBefore = lineWithoutRhythm.substring(lastIdx, m.index);
          const col = cleanChordLine.length + textBefore.length;
          cleanChordLine += textBefore;
          chordsWithCol.push({ col, chord: m[1] });
          cleanChordLine += m[1];
          lastIdx = tagRegex.lastIndex;
        }

        // Merge chords into lyrics
        let mergedLine = '';
        let lyricIdx = 0;
        const lyrics = nextLine;

        for (const { col, chord } of chordsWithCol) {
          if (col > lyricIdx) {
            mergedLine += lyrics.substring(lyricIdx, Math.min(col, lyrics.length));
            lyricIdx = Math.min(col, lyrics.length);
          }
          mergedLine += `[${chord}]`;
        }
        if (lyricIdx < lyrics.length) {
          mergedLine += lyrics.substring(lyricIdx);
        }

        chordproLines.push(mergedLine.trimEnd());
        i++; // skip next line as consumed
      } else {
        // Isolated chord line (Intro or interlude)
        const converted = rawLine.replace(/<A>([^<]+)<\/A>/gi, '[$1]');
        chordproLines.push(converted.trim());
      }
    } else {
      // Regular text/lyric line
      chordproLines.push(rawLine.trim());
    }
  }

  if (inVerse) {
    chordproLines.push(`{/${currentVoiceState}}`);
  }
  if (inChorus) {
    chordproLines.push('{/both}');
  }

  return {
    title,
    artist,
    original_key: keyHint || 'C',
    default_bpm: 100,
    time_signature: '4/4',
    content_chordpro: chordproLines.join('\n'),
  };
}

export async function fetchAndConvertLaCuerdaSong(url: string): Promise<ConvertedLaCuerdaSong> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  });

  if (!res.ok) {
    throw new Error(`Error descargando canción de LaCuerda (HTTP ${res.status})`);
  }

  const html = await res.text();
  return convertLaCuerdaHtmlToDuoChordPro(html);
}
