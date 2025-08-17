// 路由守卫工具
import store from '@/store'

/**
 * 路由认证守卫
 * @param {Object} to - 目标路由
 * @param {Object} from - 源路由
 * @param {Function} next - 路由跳转函数
 */
export function requireAuth(to, from, next) {
  if (store.getters['auth/isAuthenticated']) {
    next()
  } else {
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  }
}

/**
 * 游客守卫（已登录用户不能访问登录页面等）
 * @param {Object} to - 目标路由
 * @param {Object} from - 源路由
 * @param {Function} next - 路由跳转函数
 */
export function requireGuest(to, from, next) {
  if (store.getters['auth/isAuthenticated']) {
    next('/dashboard')
  } else {
    next()
  }
}