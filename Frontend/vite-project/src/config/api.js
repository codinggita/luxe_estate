// Centralized API configuration
// In development, defaults to localhost:3000
// In production, uses the VITE_API_BASE_URL environment variable
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export default API_URL;
