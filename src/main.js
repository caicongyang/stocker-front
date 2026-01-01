import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import './styles/mobile.css'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'

Vue.use(ElementUI)

// 配置axios拦截器 - 全局处理401错误
axios.interceptors.response.use(
  response => response,
  error => {
    // 只有在明确收到401状态码时才清除token
    if (error.response && error.response.status === 401) {
      const currentPath = router.currentRoute.path
      // 如果不是在登录页面，清除token并跳转
      if (currentPath !== '/login') {
        console.warn('Token已失效，跳转到登录页')
        store.commit('auth/CLEAR_AUTH')
        router.push('/login')
      }
    }
    return Promise.reject(error)
  }
)

// 初始化认证状态
store.dispatch('auth/initAuth')

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')