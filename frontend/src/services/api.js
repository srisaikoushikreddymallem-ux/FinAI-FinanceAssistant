
const API_BASE_URL = 'http://127.0.0.1:8000';

export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('access_token');

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (response.status === 401) {
    localStorage.removeItem('access_token');
    window.location.href = '/';
    throw new Error('Session expired. Please log in again.');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || 'Something went wrong.');
  }

  return data;
};
