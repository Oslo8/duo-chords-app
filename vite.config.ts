import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { searchLaCuerda, fetchAndConvertLaCuerdaSong } from './src/server/lacuerda.ts';

function lacuerdaApiPlugin(): Plugin {
  return {
    name: 'lacuerda-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/lacuerda/')) {
          return next();
        }

        const url = new URL(req.url, 'http://localhost');
        res.setHeader('Content-Type', 'application/json; charset=utf-8');

        if (url.pathname === '/api/lacuerda/search') {
          const q = url.searchParams.get('q') || '';
          if (!q.trim()) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ error: 'Parámetro q requerido' }));
          }

          try {
            const results = await searchLaCuerda(q);
            return res.end(JSON.stringify({ results }));
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
    lacuerdaApiPlugin(),
  ],
});
