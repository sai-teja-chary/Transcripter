import multer from 'multer';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDirectory = path.join(__dirname, '..', '..', 'uploads');

fs.mkdirSync(uploadDirectory, { recursive: true });

const allowedMimeTypes = new Set([
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
  'audio/webm',
  'audio/mp4',
  'audio/m4a',
  'audio/ogg'
]);

const storage = multer.diskStorage({
  destination: uploadDirectory,
  filename: (_req, file, callback) => {
    const safeName = file.originalname.replace(/[^a-z0-9.\-_]/gi, '-').toLowerCase();
    callback(null, `${Date.now()}-${safeName}`);
  }
});

export const uploadAudio = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024
  },
  fileFilter: (_req, file, callback) => {
    if (allowedMimeTypes.has(file.mimetype)) {
      callback(null, true);
      return;
    }

    callback(Object.assign(new Error('Please upload a supported audio file.'), { status: 400 }));
  }
});
