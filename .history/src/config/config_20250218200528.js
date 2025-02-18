const config = {
  development: {
    apiBaseUrl: '/api'
  },
  production: {
    apiBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8888'
  }
}

export default config[process.env.NODE_ENV || 'development'] 