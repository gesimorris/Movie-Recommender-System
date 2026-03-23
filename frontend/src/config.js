// src/config.js
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://your-backend-name.onrender.com' // Your Render URL
  : 'http://127.0.0.1:5000';                 // Your Local URL

export default API_BASE_URL;