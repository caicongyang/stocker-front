const config = {
  development: {
    apiBaseUrl: 'http://localhost:8888'
  },
  production: {
    apiBaseUrl: process.env.VUE_APP_API_URL || 'http://localhost:8888'
  }
}

export default config[process.env.NODE_ENV || 'development'] 