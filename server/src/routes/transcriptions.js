import express from 'express';
import { randomUUID } from 'node:crypto';
import { uploadAudio } from '../middleware/upload.js';
import { isDatabaseConnected } from '../lib/database.js';
import { Transcription } from '../models/Transcription.js';
import { transcribeAudio } from '../services/transcriptionService.js';

const router = express.Router();

router.get('/', async (_req, res, next) => {
  try {
    if (!isDatabaseConnected()) {
      res.json([]);
      return;
    }

    const transcriptions = await Transcription.find().sort({ createdAt: -1 }).limit(25);
    res.json(transcriptions);
  } catch (error) {
    next(error);
  }
});

router.post('/', uploadAudio.single('audio'), async (req, res, next) => {
  try {
    if (!req.file) {
      throw Object.assign(new Error('Audio file is required.'), { status: 400 });
    }

    const provider = process.env.STT_PROVIDER || 'mock';
    const text = await transcribeAudio(req.file.path, req.file.mimetype);
    const payload = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      provider,
      text,
      audioUrl: `/uploads/${req.file.filename}`
    };

    const transcription = isDatabaseConnected()
      ? await Transcription.create(payload)
      : { _id: randomUUID(), createdAt: new Date().toISOString(), ...payload };

    res.status(201).json(transcription);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (!isDatabaseConnected()) {
      res.status(204).end();
      return;
    }

    await Transcription.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
