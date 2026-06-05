/**
 * API 请求封装
 * 自动携带 JWT token
 */

const API_BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('mozhi_token');
}

export async function fetchAPI<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: '请求失败' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

/** 快捷 GET */
export function get<T = unknown>(path: string): Promise<T> {
  return fetchAPI<T>(path);
}

/** 快捷 POST */
export function post<T = unknown>(path: string, body: unknown): Promise<T> {
  return fetchAPI<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/** 快捷 PUT */
export function put<T = unknown>(path: string, body: unknown): Promise<T> {
  return fetchAPI<T>(path, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

/** 快捷 DELETE */
export function del<T = unknown>(path: string): Promise<T> {
  return fetchAPI<T>(path, { method: 'DELETE' });
}
