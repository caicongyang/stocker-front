import axios from 'axios'
import config from '@/config/config'

// 认证状态管理
const state = {
  user: null,
  token: localStorage.getItem('auth_token') || null,
  isAuthenticated: false,
  loading: false,
  error: null
}

const mutations = {
  SET_LOADING(state, loading) {
    state.loading = loading
  },
  
  SET_ERROR(state, error) {
    state.error = error
  },
  
  SET_USER(state, user) {
    state.user = user
    state.isAuthenticated = !!user
  },
  
  SET_TOKEN(state, token) {
    state.token = token
    state.isAuthenticated = !!token
    
    if (token) {
      localStorage.setItem('auth_token', token)
      // 设置axios默认请求头
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      localStorage.removeItem('auth_token')
      delete axios.defaults.headers.common['Authorization']
    }
  },
  
  CLEAR_AUTH(state) {
    state.user = null
    state.token = null
    state.isAuthenticated = false
    localStorage.removeItem('auth_token')
    delete axios.defaults.headers.common['Authorization']
  }
}

const actions = {
  // 用户注册
  async register({ commit }, { email, password, name }) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      const response = await axios.post(`${config.aiApiBaseUrl}/auth/register`, {
        email,
        password,
        name
      })
      
      commit('SET_LOADING', false)
      return { success: true, message: response.data.message }
    } catch (error) {
      commit('SET_LOADING', false)
      const message = error.response?.data?.detail || '注册失败'
      commit('SET_ERROR', message)
      return { success: false, message }
    }
  },
  
  // 邮箱密码登录
  async loginWithPassword({ commit }, { email, password }) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      const response = await axios.post(`${config.aiApiBaseUrl}/auth/login`, {
        email,
        password
      })
      
      const { token, user } = response.data
      
      commit('SET_TOKEN', token)
      commit('SET_USER', user)
      commit('SET_LOADING', false)
      
      return { success: true, message: response.data.message }
    } catch (error) {
      commit('SET_LOADING', false)
      const message = error.response?.data?.detail || '登录失败'
      commit('SET_ERROR', message)
      return { success: false, message }
    }
  },
  
  // 发送邮箱验证码
  async sendEmailCode({ commit }, email) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      const response = await axios.post(`${config.aiApiBaseUrl}/auth/send-email-code`, {
        email
      })
      
      commit('SET_LOADING', false)
      return { success: true, message: response.data.message }
    } catch (error) {
      commit('SET_LOADING', false)
      const message = error.response?.data?.detail || '发送验证码失败'
      commit('SET_ERROR', message)
      return { success: false, message }
    }
  },
  
  // 邮箱验证码登录
  async loginWithEmailCode({ commit }, { email, code }) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      const response = await axios.post(`${config.aiApiBaseUrl}/auth/login-with-email-code`, {
        email,
        code
      })
      
      const { token, user } = response.data
      
      commit('SET_TOKEN', token)
      commit('SET_USER', user)
      commit('SET_LOADING', false)
      
      return { success: true, message: response.data.message }
    } catch (error) {
      commit('SET_LOADING', false)
      const message = error.response?.data?.detail || '验证码登录失败'
      commit('SET_ERROR', message)
      return { success: false, message }
    }
  },
  
  // Google登录
  async loginWithGoogle({ commit }, googleToken) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      const response = await axios.post(`${config.aiApiBaseUrl}/auth/google-login`, {
        token: googleToken
      })
      
      const { token, user } = response.data
      
      commit('SET_TOKEN', token)
      commit('SET_USER', user)
      commit('SET_LOADING', false)
      
      return { success: true, message: response.data.message }
    } catch (error) {
      commit('SET_LOADING', false)
      const message = error.response?.data?.detail || 'Google登录失败'
      commit('SET_ERROR', message)
      return { success: false, message }
    }
  },
  
  // 获取用户信息
  async getCurrentUser({ commit, state }) {
    if (!state.token) {
      return { success: false, message: '未登录' }
    }
    
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      const response = await axios.get(`${config.aiApiBaseUrl}/auth/me`)
      
      commit('SET_USER', response.data.user)
      commit('SET_LOADING', false)
      
      return { success: true, user: response.data.user }
    } catch (error) {
      commit('SET_LOADING', false)
      
      // 如果token无效，清除认证状态
      if (error.response?.status === 401) {
        commit('CLEAR_AUTH')
      }
      
      const message = error.response?.data?.detail || '获取用户信息失败'
      commit('SET_ERROR', message)
      return { success: false, message }
    }
  },
  
  // 登出
  async logout({ commit }) {
    commit('SET_LOADING', true)
    
    try {
      // 可选：调用后端登出接口
      if (state.token) {
        await axios.post(`${config.aiApiBaseUrl}/auth/logout`)
      }
    } catch (error) {
      console.warn('后端登出接口调用失败:', error)
    } finally {
      commit('CLEAR_AUTH')
      commit('SET_LOADING', false)
    }
    
    return { success: true, message: '登出成功' }
  },
  
  // 初始化认证状态
  async initAuth({ commit, dispatch }) {
    const token = localStorage.getItem('auth_token')
    
    if (token) {
      commit('SET_TOKEN', token)
      // 验证token并获取用户信息
      await dispatch('getCurrentUser')
    }
  }
}

const getters = {
  isAuthenticated: state => state.isAuthenticated,
  user: state => state.user,
  loading: state => state.loading,
  error: state => state.error,
  userEmail: state => state.user?.email || '',
  userName: state => state.user?.name || ''
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}