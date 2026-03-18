// In production, VITE_API_URL should be empty to use relative paths through nginx
// In development, it should be 'http://localhost:5267'
export const API_URL = import.meta.env.VITE_API_URL !== undefined
  ? import.meta.env.VITE_API_URL
  : 'http://localhost:5267';
