import express from 'express';
import cors from 'cors';
import { config } from './config/env';
import chatRouter from './routes/chat';
import refreshRouter from './routes/refresh';
import path from 'path';

async function startServer() {
  const app = express();
  const PORT = config.port;

  app.use(cors());
  app.use(express.json());

  app.use('/api', chatRouter);
  app.use('/api', refreshRouter);

  if (process.env.NODE_ENV !== "production") {
    // Imported lazily so production builds do not require Vite at runtime.
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
