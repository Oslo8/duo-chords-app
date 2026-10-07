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
  isPopularHit?: boolean;
}

export interface LaCuerdaSearchResponse {
  detectedArtist?: string;
  results: LaCuerdaSearchResult[];
}

export interface ConvertedLaCuerdaSong {
  title: string;
  artist: string;
  original_key: string;
  default_bpm: number;
  time_signature: string;
  content_chordpro: string;
}

function cleanSongSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export async function searchLaCuerda(query: string): Promise<LaCuerdaSearchResponse> {
  const cleanQ = query.trim();
  if (!cleanQ) return { results: [] };

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  };

  // --- STRATEGY 1: Check if query is an Artist or Band (canc=2) ---
  try {
    const artistUrl = `https://acordes.lacuerda.net/busca.php?canc=2&exp=${encodeURIComponent(cleanQ)}`;
    const artistRes = await fetch(artistUrl, { headers });
    const finalUrl = artistRes.url || artistUrl;
    const html = await artistRes.text();

    const isArtistPage =
      /Tabs:\s*Acordes de Guitarra/i.test(html) ||
      /bName\s*=\s*['"]/.test(html) ||
      (/\.lacuerda\.net\/[^\/]+\/$/.test(finalUrl) && !finalUrl.includes('busca.php'));

    if (isArtistPage) {
      const bNameMatch = html.match(/bName\s*=\s*['"]([^'"]+)['"]/);
      const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
      const titleMatch = html.match(/<title>([^:]+)\s*Tabs:/i);

      let artistName = bNameMatch ? bNameMatch[1].trim() : '';
      if (!artistName && h1Match) artistName = h1Match[1].replace(/<[^>]+>/g, '').trim();
      if (!artistName && titleMatch) artistName = titleMatch[1].trim();
      if (!artistName) artistName = cleanQ;

      let artistSlug = '';
      const urlMatch = finalUrl.match(/\.lacuerda\.net\/([^\/\?#]+)\/?/);
      if (urlMatch && urlMatch[1] && urlMatch[1] !== 'busca.php') {
        artistSlug = urlMatch[1];
      } else {
        artistSlug = cleanSongSlug(artistName);
      }

      const results: LaCuerdaSearchResult[] = [];
      const seenSongs = new Set<string>();

      // 1. Extract Top Popular Songs (hits)
      const popLiRegex = /<li[^>]*onclick=['"]w\.location=["']([^"']+)["']['"][^>]*><a[^>]*>([^<]+)<\/a><\/li>/gi;
      let pMatch: RegExpExecArray | null;
      while ((pMatch = popLiRegex.exec(html)) !== null) {
        const songSlug = pMatch[1].trim();
        const songTitle = pMatch[2].trim();
        if (!songSlug || seenSongs.has(songSlug)) continue;
        seenSongs.add(songSlug);

        results.push({
          id: `${artistSlug}-${songSlug}-pop`,
          artist: artistName,
          artistSlug,
          title: songTitle,
          songSlug,
          ratingStars: 5,
          ratingLabel: '🔥 Hit Más Popular',
          versionsCount: 3,
          url: `https://acordes.lacuerda.net/${artistSlug}/${songSlug}.shtml`,
          isPopularHit: true,
        });
      }

      // 2. Extract Complete Discography from <ul id=b_main...
      const mainListMatch = html.match(/<ul[^>]*id=['"]?b_main['"]?[^>]*>([\s\S]*?)<\/ul>/i);
      if (mainListMatch) {
        const mainListHtml = mainListMatch[1];
        const songLiRegex = /<li[^>]*id=['"]([^'"]+)['"][^>]*lcd=['"]([^'"]+)['"][^>]*><a[^>]*href=['"]([^'"]+)['"][^>]*>([\s\S]*?)<\/a><\/li>/gi;
        let sMatch: RegExpExecArray | null;

        while ((sMatch = songLiRegex.exec(mainListHtml)) !== null) {
          const liId = sMatch[1];
          const lcd = sMatch[2];
          const songSlug = sMatch[3].trim();
          const rawTitle = sMatch[4];
          const songTitle = rawTitle.replace(/<[^>]+>/g, '').trim();

          if (!songSlug || seenSongs.has(songSlug)) continue;
          seenSongs.add(songSlug);

          const dashIdx = lcd.indexOf('-');
          const versionsStr = dashIdx !== -1 ? lcd.substring(dashIdx + 1) : '1';
          const versionsCount = versionsStr.length || 1;

          results.push({
            id: `${artistSlug}-${songSlug}-${liId}`,
            artist: artistName,
            artistSlug,
            title: songTitle,
            songSlug,
            ratingStars: 5,
            ratingLabel: '⭐⭐⭐⭐⭐ Acordes',
            versionsCount,
            url: `https://acordes.lacuerda.net/${artistSlug}/${songSlug}.shtml`,
            isPopularHit: false,
          });
        }
      }

      if (results.length > 0) {
        return {
          detectedArtist: artistName,
          results,
        };
      }
    }
  } catch (err) {
    console.warn('LaCuerda artist search attempt error:', err);
  }

  // --- STRATEGY 2: Search by Song Title (canc=1) ---
  const songUrl = `https://acordes.lacuerda.net/busca.php?canc=1&exp=${encodeURIComponent(cleanQ)}`;
  const songRes = await fetch(songUrl, { headers });
  if (songRes.ok) {
    const songHtml = await songRes.text();
    const songResults = parseSongTable(songHtml);
    if (songResults.length > 0) {
      return { results: songResults };
    }
  }

  // --- STRATEGY 3: General Search Fallback ---
  const generalUrl = `https://acordes.lacuerda.net/busca.php?exp=${encodeURIComponent(cleanQ)}`;
  const generalRes = await fetch(generalUrl, { headers });
  if (generalRes.ok) {
    const generalHtml = await generalRes.text();
    const generalResults = parseSongTable(generalHtml);
    return { results: generalResults };
  }

  return { results: [] };
}

function parseSongTable(html: string): LaCuerdaSearchResult[] {
  const results: LaCuerdaSearchResult[] = [];

  const fnsMatch = html.match(/var fns=\[([\s\S]*?)\];/);

  let fns: string[] = [];

  if (fnsMatch) {
    try {
      fns = (0, eval)('[' + fnsMatch[1] + ']');
    } catch {
      // ignore
    }
  }

  const rowRegex = /<tr><td>\s*<a[^>]*href=['"]\/([^\/]+)\/['"][^>]*>([^<]+)<\/a><\/td><td><ul[^>]*>([\s\S]*?)<\/ul><\/td><\/tr>/gi;
  let match: RegExpExecArray | null;

  while ((match = rowRegex.exec(html)) !== null) {
    const rowArtistSlug = match[1];
    const artistName = match[2].trim();
    const songsHtml = match[3];

    const songRegex = /<li[^>]*id=['"]([^'"]+)['"][^>]*lcd=['"]([^'"]+)['"][^>]*><a[^>]*>([\s\S]*?)<\/a><\/li>/gi;
    let sMatch: RegExpExecArray | null;

    while ((sMatch = songRegex.exec(songsHtml)) !== null) {
      const liId = sMatch[1];
      const lcd = sMatch[2];
      const rawTitle = sMatch[3];
      const songTitle = rawTitle.replace(/<[^>]+>/g, '').trim();

      const numMatch = liId.match(/\d+/);
      const n = numMatch ? parseInt(numMatch[0], 10) : 0;

      // In LaCuerda's table, rowArtistSlug from the row anchor is 100% exact!
      const artistSlug = rowArtistSlug;
      const normalizedTitle = cleanSongSlug(songTitle);

      let songSlug = '';
      if (fns.length > 0) {
        const exactFn = fns.find((f) => f === normalizedTitle);
        if (exactFn) {
          songSlug = exactFn;
        } else if (fns[n]) {
          songSlug = fns[n];
        }
      }

      if (!songSlug) {
        songSlug = normalizedTitle;
      }

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
        ratingLabel: '⭐⭐⭐⭐⭐ Acordes',
        versionsCount,
        url: canonicalUrl,
        isPopularHit: false,
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
          lastIdx = m.index + m[0].length;
        }

        // Merge chords into lyrics
        const lyrics = nextLine;
        let merged = '';
        let lyricsIdx = 0;

        for (const { col, chord } of chordsWithCol) {
          if (col > lyricsIdx) {
            merged += lyrics.substring(lyricsIdx, Math.min(col, lyrics.length));
            if (col > lyrics.length) {
              merged += ' '.repeat(col - lyrics.length);
            }
            lyricsIdx = Math.min(col, lyrics.length);
          }
          merged += `[${chord}]`;
        }

        if (lyricsIdx < lyrics.length) {
          merged += lyrics.substring(lyricsIdx);
        }

        chordproLines.push(merged);
        i++; // Skip the lyrics line since it's already consumed
      } else {
        // Standalone chord line (e.g. Intro or instrumental passage)
        const cleanChords = rawLine.replace(/<A>([^<]+)<\/A>/gi, '[$1]');
        chordproLines.push(cleanChords.trim());
      }
    } else {
      // Plain lyrics without chords or comments
      if (!inVerse && !inChorus) {
        chordproLines.push(`{${currentVoiceState}}`);
        inVerse = true;
      }
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
    throw new Error(`Error descargando canción de LaCuerda (HTTP ${res.status}): ${url}`);
  }

  const html = await res.text();
  return convertLaCuerdaHtmlToDuoChordPro(html);
}
