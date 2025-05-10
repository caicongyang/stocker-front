const config = {
  development: {
    apiBaseUrl: '/api',
    aiApiBaseUrl: 'http://localhost:8000'
  },
  production: {
    apiBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8888',
    aiApiBaseUrl: import.meta.env.VITE_AI_API_URL || 'http://localhost:8000'
  }
}

export default config[process.env.NODE_ENV || 'development'] 