import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { searchLaCuerda, fetchAndConvertLaCuerdaSong } from './src/server/lacuerda.ts';
import {
  getDublyoSongs,
  saveDublyoSong,
  deleteDublyoSong,
  getDublyoConfig,
  updateDublyoConfig,
  getDublyoSetlists,
} from './src/server/dublyobase.ts';

function apiMiddlewarePlugin(): Plugin {
  return {
    name: 'api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const rawUrl = req.url || '';
        if (!rawUrl.startsWith('/api/')) {
          return next();
        }

        const url = new URL(rawUrl, 'http://localhost');
        res.setHeader('Content-Type', 'application/json; charset=utf-8');

        // Helper to parse JSON body
        const readBody = async (): Promise<Record<string, unknown>> => {
          return new Promise((resolve, reject) => {
            let body = '';
            req.on('data', (chunk) => (body += chunk));
            req.on('end', () => {
              try {
                resolve(body ? JSON.parse(body) : {});
              } catch (e) {
                reject(e);
              }
            });
            req.on('error', reject);
          });
        };

        // --- LACUERDA ROUTES ---
        if (url.pathname === '/api/lacuerda/search') {
          const q = url.searchParams.get('q') || '';
          if (!q.trim()) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ error: 'Parámetro q requerido' }));
          }

          try {
            const data = await searchLaCuerda(q);
            return res.end(JSON.stringify(data));
          } catch (err: unknown) {
            res.statusCode = 500;
            const message = err instanceof Error ? err.message : 'Error desconocido';
            return res.end(JSON.stringify({ error: message }));
          }
        }

        if (url.pathname === '/api/lacuerda/import') {
          const songUrl = url.searchParams.get('url') || '';
          if (!songUrl) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ error: 'Parámetro url requerido' }));
          }

          try {
            const song = await fetchAndConvertLaCuerdaSong(songUrl);
            return res.end(JSON.stringify({ song }));
          } catch (err: unknown) {
            res.statusCode = 500;
            const message = err instanceof Error ? err.message : 'Error al importar de LaCuerda';
            return res.end(JSON.stringify({ error: message }));
          }
        }

        // --- DUBLYOBASE DB ROUTES ---
        if (url.pathname === '/api/db/songs') {
          try {
            if (req.method === 'GET') {
              const songs = await getDublyoSongs();
              return res.end(JSON.stringify({ songs }));
            }
            if (req.method === 'POST') {
              const body = await readBody();
              const saved = await saveDublyoSong(body);
              return res.end(JSON.stringify({ song: saved }));
            }
          } catch (err: unknown) {
            res.statusCode = 500;
            const message = err instanceof Error ? err.message : 'Error en Dublyobase songs';
            return res.end(JSON.stringify({ error: message }));
          }
        }

        if (url.pathname.startsWith('/api/db/songs/')) {
          const id = url.pathname.replace('/api/db/songs/', '');
          if (req.method === 'DELETE' && id) {
            try {
              await deleteDublyoSong(id);
              return res.end(JSON.stringify({ success: true }));
            } catch (err: unknown) {
              res.statusCode = 500;
              const message = err instanceof Error ? err.message : 'Error eliminando canción';
              return res.end(JSON.stringify({ error: message }));
            }
          }
        }

        if (url.pathname === '/api/db/config') {
          try {
            if (req.method === 'GET') {
              const config = await getDublyoConfig();
              return res.end(JSON.stringify({ config }));
            }
            if (req.method === 'POST') {
              const body = await readBody();
              const id = (body.id as string) || '';
              const saved = await updateDublyoConfig(id, body);
              return res.end(JSON.stringify({ config: saved }));
            }
          } catch (err: unknown) {
            res.statusCode = 500;
            const message = err instanceof Error ? err.message : 'Error en Dublyobase config';
            return res.end(JSON.stringify({ error: message }));
          }
        }

        if (url.pathname === '/api/db/setlists') {
          try {
            if (req.method === 'GET') {
              const setlists = await getDublyoSetlists();
              return res.end(JSON.stringify({ setlists }));
            }
          } catch (err: unknown) {
            res.statusCode = 500;
            const message = err instanceof Error ? err.message : 'Error en Dublyobase setlists';
            return res.end(JSON.stringify({ error: message }));
          }
        }

        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    apiMiddlewarePlugin(),
  ],
});
