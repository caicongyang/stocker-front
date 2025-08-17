const config = {
  // API基础URL
  apiBaseUrl: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8080',
  
  // AI API基础URL
  aiApiBaseUrl: import.meta.env.VITE_AI_API_URL || 'http://127.0.0.1:8000',
  
  // Google OAuth客户端ID
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
}

export default config 