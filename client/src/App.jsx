import { useEffect, useMemo, useRef, useState } from 'react';
import { FileAudio, Loader2, Mic, Pause, Play, RefreshCw, Trash2, Upload } from 'lucide-react';
import { deleteTranscription, getTranscriptions, uploadAudio } from './api.js';

const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/webm', 'audio/mp4', 'audio/ogg', 'audio/m4a'];

export default function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('Ready to transcribe');
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  const latest = useMemo(() => history[0], [history]);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      setError('');
      const items = await getTranscriptions();
      setHistory(items);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    setError('');

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      setSelectedFile(null);
      setError('Choose an MP3, WAV, WEBM, MP4, M4A, or OGG audio file.');
      return;
    }

    setSelectedFile(file);
    setStatus(`${file.name} selected`);
  }

  async function submitAudio(file = selectedFile) {
    if (!file) {
      setError('Select or record an audio file first.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setStatus('Generating transcription');
      const saved = await uploadAudio(file);
      setHistory((current) => [saved, ...current]);
      setSelectedFile(null);
      setStatus('Transcription saved');
    } catch (requestError) {
      setError(requestError.message);
      setStatus('Transcription failed');
    } finally {
      setIsLoading(false);
    }
  }

  async function startRecording() {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], `recording-${Date.now()}.webm`, { type: 'audio/webm' });
        setSelectedFile(file);
        setStatus('Recording ready');
      };

      recorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setStatus('Recording');
    } catch {
      setError('Microphone access was blocked or is unavailable.');
    }
  }

  function stopRecording() {
    recorderRef.current?.stop();
    setIsRecording(false);
  }

  async function handleDelete(id) {
    try {
      await deleteTranscription(id);
      setHistory((current) => current.filter((item) => item._id !== id));
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <main className="min-h-screen bg-stone-50 text-ink">
      <section className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:px-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-ocean">MERN Speech-to-Text</p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Transcripter</h1>
            <p className="mt-2 max-w-2xl text-stone-600">
              Upload or record audio, generate a transcript, and keep a searchable history for review.
            </p>
          </div>
          <button className="inline-flex items-center justify-center gap-2 rounded-md border border-stone-300 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-stone-100" onClick={loadHistory}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Create transcription</h2>
          <p className="mt-1 text-sm text-stone-600">{status}</p>

          <label className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-stone-300 bg-stone-50 px-4 py-8 text-center transition hover:border-ocean hover:bg-teal-50">
            <FileAudio className="text-ocean" size={36} />
            <span className="mt-3 text-sm font-semibold">Choose audio file</span>
            <span className="mt-1 text-xs text-stone-500">MP3, WAV, WEBM, MP4, M4A, or OGG</span>
            <input className="sr-only" type="file" accept="audio/*" onChange={handleFileChange} />
          </label>

          {selectedFile && (
            <div className="mt-4 rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm">
              <span className="font-medium">{selectedFile.name}</span>
              <span className="ml-2 text-stone-500">{Math.round(selectedFile.size / 1024)} KB</span>
            </div>
          )}

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-ocean px-4 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-stone-300"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isLoading}
            >
              {isRecording ? <Pause size={17} /> : <Mic size={17} />}
              {isRecording ? 'Stop' : 'Record'}
            </button>
            <button
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-ember px-4 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-stone-300"
              onClick={() => submitAudio()}
              disabled={isLoading || isRecording}
            >
              {isLoading ? <Loader2 className="animate-spin" size={17} /> : <Upload size={17} />}
              Upload
            </button>
          </div>

          {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        </div>

        <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Latest transcription</h2>
          {latest ? (
            <div className="mt-4">
              <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                <span>{new Date(latest.createdAt).toLocaleString()}</span>
                <span className="rounded-full bg-teal-50 px-2 py-1 font-medium text-ocean">{latest.provider}</span>
              </div>
              <p className="mt-4 whitespace-pre-wrap rounded-md bg-stone-50 p-4 leading-7 text-stone-800">{latest.text}</p>
              {latest.audioUrl && (
                <audio className="mt-4 w-full" controls src={latest.audioUrl}>
                  <track kind="captions" />
                </audio>
              )}
            </div>
          ) : (
            <div className="mt-4 flex min-h-52 items-center justify-center rounded-md bg-stone-50 text-center text-sm text-stone-500">
              Your first transcription will appear here.
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">History</h2>
          <span className="text-sm text-stone-500">{history.length} saved</span>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {history.map((item) => (
            <article key={item._id} className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{item.originalName}</h3>
                  <p className="mt-1 text-xs text-stone-500">{new Date(item.createdAt).toLocaleString()}</p>
                </div>
                <button
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md text-stone-500 transition hover:bg-red-50 hover:text-red-700"
                  onClick={() => handleDelete(item._id)}
                  aria-label={`Delete ${item.originalName}`}
                >
                  <Trash2 size={17} />
                </button>
              </div>
              <p className="mt-3 line-clamp-4 text-sm leading-6 text-stone-700">{item.text}</p>
              {item.audioUrl && (
                <a className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-ocean hover:text-teal-800" href={item.audioUrl}>
                  <Play size={15} />
                  Play audio
                </a>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
