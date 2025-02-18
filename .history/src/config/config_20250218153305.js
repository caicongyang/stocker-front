const config = {
  development: {
    apiBaseUrl: 'http://localhost:8888'
  },
  production: {
    apiBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8888'
  }
}

export default config[process.env.NODE_ENV || 'development'] 