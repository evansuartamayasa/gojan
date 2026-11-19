export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export async function apiRequest(path, { method = 'GET', body, headers = {} } = {}) {
  const requestHeaders = new Headers({ Accept: 'application/json', ...headers });
  const options = {
    method,
    headers: requestHeaders,
    credentials: 'same-origin',
  };
  if (body !== undefined) {
    requestHeaders.set('Content-Type', 'application/json');
    options.body = JSON.stringify(body);
  }

  const response = await fetch(path, options);
  if (response.status === 204) return null;

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error('Respons server tidak dapat dibaca.');
  }

  if (!response.ok) {
    throw new ApiError(
      payload?.error || `Permintaan gagal (HTTP ${response.status}).`,
      response.status,
      payload?.details,
    );
  }
  return payload;
}
