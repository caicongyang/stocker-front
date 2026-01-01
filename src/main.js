import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import './styles/mobile.css'
import App from './App.vue'
import router from './router'
import store from './store'

Vue.use(ElementUI)

// 初始化认证状态
store.dispatch('auth/initAuth')

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')