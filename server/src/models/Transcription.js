import mongoose from 'mongoose';

const transcriptionSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
      trim: true
    },
    originalName: {
      type: String,
      required: true,
      trim: true
    },
    mimetype: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    provider: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: true
    },
    audioUrl: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

export const Transcription = mongoose.model('Transcription', transcriptionSchema);
