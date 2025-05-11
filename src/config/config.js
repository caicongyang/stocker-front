const config = {
  // API基础URL
  apiBaseUrl: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
  
  // AI API基础URL
  aiApiBaseUrl: import.meta.env.VITE_AI_API_URL || 'http://127.0.0.1:8000'
}

export default config 