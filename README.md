# Transcripter

Transcripter is a MERN stack speech-to-text app. Users can upload an audio file or record audio in the browser, send it to an Express API, transcribe it with a provider such as OpenAI Whisper or Deepgram, and save the result in MongoDB.

## Tech Stack

- MongoDB with Mongoose
- Express.js and Node.js
- React with Vite
- Tailwind CSS
- Multer for audio uploads
- OpenAI Whisper, Deepgram, or mock transcription mode

## Project Structure

```text
client/   React + Vite frontend
server/   Express API, MongoDB models, transcription services
```

## Setup

Install dependencies:

```bash
npm install
```

Create `server/.env` from the example:

```bash
cp server/.env.example server/.env
```

For local development without an API key, keep:

```env
STT_PROVIDER=mock
```

To use Groq Whisper, set:

```env
STT_PROVIDER=openai
GROQ_API_KEY=your_openai_key
```

To use Deepgram, set:

```env
STT_PROVIDER=deepgram
DEEPGRAM_API_KEY=your_deepgram_key
```

Start both apps:

```bash
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies API calls to the backend at `http://localhost:5000`.

## API Routes

- `GET /api/health` checks server status.
- `GET /api/transcriptions` returns saved transcription history.
- `POST /api/transcriptions` uploads an audio file, transcribes it, and stores the result.
- `DELETE /api/transcriptions/:id` deletes one saved transcription.

## MongoDB

Set `MONGODB_URI` in `server/.env`. A local example:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/transcripter
```

The server still runs if MongoDB is unavailable, but history storage will be disabled until the database connects.

## Deployment

Backend:

1. Deploy `server/` to Render, Railway, or another Node host.
2. Add `MONGODB_URI`, `STT_PROVIDER`, and the matching API key as environment variables.
3. Set `CLIENT_ORIGIN` to the deployed frontend URL.

Frontend:

1. Deploy `client/` to Netlify or Vercel.
2. Set `VITE_API_URL` to the deployed backend URL.
3. Build with `npm run build`.
