import axios from 'axios'
import config from '@/config/config'
import store from '@/store'
import router from '@/router'
import { Message } from 'element-ui'

// 创建axios实例
const request = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 10000
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 从store获取token
    const token = store.getters['auth/token']
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    console.log('发送请求:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      params: config.params
    })
    
    return config
  },
  error => {
    console.error('请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    console.log('收到响应:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    })
    
    return response
  },
  error => {
    console.error('响应错误:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data
    })
    
    // 处理401未授权错误
    if (error.response?.status === 401) {
      Message.error('登录已过期，请重新登录')
      store.dispatch('auth/logout')
      router.push('/login')
      return Promise.reject(error)
    }
    
    // 处理403禁止访问错误
    if (error.response?.status === 403) {
      Message.error('没有权限访问该资源')
      return Promise.reject(error)
    }
    
    // 处理500服务器错误
    if (error.response?.status >= 500) {
      Message.error('服务器错误，请稍后重试')
      return Promise.reject(error)
    }
    
    // 处理网络错误
    if (!error.response) {
      Message.error('网络错误，请检查网络连接')
      return Promise.reject(error)
    }
    
    return Promise.reject(error)
  }
)

export default request
