async function parseResponse(response) {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();
  return { response: text };
}

export async function askModel(endpoint, message) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    const details = data?.details || data?.error || data?.message;
    throw new Error(details || `Request failed with HTTP ${response.status}`);
  }

  if (typeof data?.response !== 'string') {
    throw new Error('The backend returned an unexpected response format.');
  }

  return data.response;
}
