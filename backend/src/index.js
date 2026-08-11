import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import itemRoutes from './routes/items.js';
import requestRoutes from './routes/requests.js';
import mapRoutes from './routes/map.js';
import statsRoutes from './routes/stats.js';
import botRoutes from './routes/bot.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '5mb' }));

app.get('/', (_req, res) => {
  res.json({
    name: 'Eco Tashkent API',
    endpoints: ['/api/auth', '/api/items', '/api/requests', '/api/map/points', '/api/stats', '/api/stats/leaderboard'],
  });
});

app.use('/uploads', express.static(uploadsDir));
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/bot', botRoutes);

app.use((err, _req, res, _next) => {
  console.error('Xatolik:', err.message);
  res.status(500).json({ message: err.message || 'Server xatosi' });
});

const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, () => {
  console.log(`Eco Tashkent API http://localhost:${PORT} portida ishlamoqda`);
});
