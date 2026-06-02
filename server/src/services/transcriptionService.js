import fs from "node:fs";
import fetch from "node-fetch";
import FormData from "form-data";

export async function transcribeAudio(filePath, mimetype) {
  const provider = (process.env.STT_PROVIDER || "mock").toLowerCase();

  if (provider === "openai") {
    return transcribeWithOpenAI(filePath);
  }

  if (provider === "deepgram") {
    return transcribeWithDeepgram(filePath, mimetype);
  }

  return createMockTranscription(filePath);
}

async function transcribeWithOpenAI(filePath) {
  if (!process.env.GROQ_API_KEY) {
    throw Object.assign(
      new Error("GROQ_API_KEY is required for transcription."),
      { status: 500 },
    );
  }

  const form = new FormData();

  form.append("model", "whisper-large-v3");

  form.append("file", fs.createReadStream(filePath));

  const response = await fetch(
    "https://api.groq.com/openai/v1/audio/transcriptions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        ...form.getHeaders(),
      },
      body: form,
    },
  );

  const result = await response.json();

  if (!response.ok) {
    throw Object.assign(
      new Error(result.error?.message || "Groq transcription failed."),
      { status: response.status },
    );
  }

  return result.text || "";
}

async function transcribeWithDeepgram(filePath, mimetype) {
  if (!process.env.DEEPGRAM_API_KEY) {
    throw Object.assign(
      new Error("DEEPGRAM_API_KEY is required for Deepgram transcription."),
      { status: 500 },
    );
  }

  const response = await fetch(
    "https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true",
    {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
        "Content-Type": mimetype,
      },
      body: fs.createReadStream(filePath),
    },
  );

  const result = await response.json();

  if (!response.ok) {
    throw Object.assign(
      new Error(result.err_msg || "Deepgram transcription failed."),
      { status: response.status },
    );
  }

  return result.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";
}

function createMockTranscription(filePath) {
  const filename = filePath.split(/[\\/]/).pop();
  return `Mock transcription for ${filename}. Add an OpenAI or Deepgram API key in server/.env to generate real speech-to-text output.`;
}
