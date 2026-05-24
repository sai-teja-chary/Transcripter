import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { connectDatabase } from './lib/database.js';
import transcriptionRoutes from './routes/transcriptions.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const port = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    provider: process.env.STT_PROVIDER || 'mock'
  });
});

app.use('/api/transcriptions', transcriptionRoutes);
app.use(errorHandler);

await connectDatabase();

app.listen(port, () => {
  console.log(`Transcripter API running on http://localhost:${port}`);
});