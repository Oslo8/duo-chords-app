const DUBLYOBASE_TOKEN = 'dbo_mcp_project_yjT8ykEj_s9yzKtq3Zjz1VMDeHB9PN-tu6eKvI97tPQ';
const DUBLYOBASE_MCP_URL = 'https://dublyobase.yaperocallate.com/mcp';

async function callDublyoTool(name: string, args: Record<string, unknown> = {}) {
  const res = await fetch(DUBLYOBASE_MCP_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DUBLYOBASE_TOKEN}`,
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/call',
      params: {
        name,
        arguments: args,
      },
    }),
  });

  const data = (await res.json()) as { error?: unknown; result?: { content?: { text?: string }[] } };
  if (data.error) {
    throw new Error(`Dublyobase MCP error: ${JSON.stringify(data.error)}`);
  }

  const content = data.result?.content?.[0]?.text;
  if (!content) return null;
  try {
    return JSON.parse(content);
  } catch {
    return content;
  }
}

export async function getDublyoSongs() {
  const res = await callDublyoTool('records.list', { collection: 'duo_songs', perPage: 100 });
  return res.items || [];
}

export async function saveDublyoSong(song: Record<string, unknown>) {
  if (song.id) {
    try {
      return await callDublyoTool('records.update', {
        collection: 'duo_songs',
        id: song.id,
        data: song,
      });
    } catch {
      // If doesn't exist, create
    }
  }
  return await callDublyoTool('records.create', {
    collection: 'duo_songs',
    data: song,
  });
}

export async function deleteDublyoSong(id: string) {
  return await callDublyoTool('records.delete', {
    collection: 'duo_songs',
    id,
  });
}

export async function getDublyoConfig() {
  const res = await callDublyoTool('records.list', { collection: 'duo_configs', perPage: 1 });
  const item = res.items?.[0];
  if (item && item.stage_preferences && typeof item.stage_preferences === 'string') {
    try {
      item.stage_preferences = JSON.parse(item.stage_preferences);
    } catch {
      // keep as is
    }
  }
  return item || null;
}

export async function updateDublyoConfig(id: string, patch: Record<string, unknown>) {
  const data = { ...patch };
  if (data.stage_preferences && typeof data.stage_preferences !== 'string') {
    data.stage_preferences = JSON.stringify(data.stage_preferences);
  }
  return await callDublyoTool('records.update', {
    collection: 'duo_configs',
    id,
    data,
  });
}

export async function getDublyoSetlists() {
  const [setlistsRes, itemsRes] = await Promise.all([
    callDublyoTool('records.list', { collection: 'duo_setlists', perPage: 50 }),
    callDublyoTool('records.list', { collection: 'duo_setlist_items', perPage: 200 }),
  ]);

  const items = itemsRes.items || [];
  const setlists = (setlistsRes.items || []).map((s: Record<string, unknown>) => ({
    ...s,
    items: items
      .filter((i: Record<string, unknown>) => i.setlist_id === s.id)
      .sort((a: Record<string, number>, b: Record<string, number>) => (a.position || 0) - (b.position || 0)),
  }));

  return setlists;
}
