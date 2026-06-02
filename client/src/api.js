const API_URL = import.meta.env.VITE_API_URL || '';

export async function getTranscriptions() {
  const response = await fetch(`${API_URL}/api/transcriptions`);
  return parseResponse(response);
}

export async function uploadAudio(file) {
  const formData = new FormData();
  formData.append('audio', file);

  const response = await fetch(`${API_URL}/api/transcriptions`, {
    method: 'POST',
    body: formData
  });

  return parseResponse(response);
}

export async function deleteTranscription(id) {
  const response = await fetch(`${API_URL}/api/transcriptions/${id}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    await parseResponse(response);
  }
}

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Request failed.');
  }

  return data;
}
