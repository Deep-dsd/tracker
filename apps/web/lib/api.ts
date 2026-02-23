import { SessionListItem, SessionDocument, UploadResponse } from '@/types/session';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new ApiError(response.status, error.detail || 'Request failed');
  }

  return response.json();
}

export async function uploadFiles(files: File[]): Promise<UploadResponse[]> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await fetch(`${API_URL}/api/sessions/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
    throw new ApiError(response.status, error.detail || 'Upload failed');
  }

  return response.json();
}

export async function listSessions(): Promise<SessionListItem[]> {
  return fetchApi<SessionListItem[]>('/api/sessions');
}

export async function getSession(sessionId: string): Promise<SessionDocument> {
  return fetchApi<SessionDocument>(`/api/sessions/${sessionId}`);
}

export async function deleteSession(sessionId: string): Promise<void> {
  await fetchApi(`/api/sessions/${sessionId}`, {
    method: 'DELETE',
  });
}
