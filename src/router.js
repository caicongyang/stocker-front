import Vue from 'vue'
import VueRouter from 'vue-router'

// 公开页面 - 不需要登录
import Login from './views/public/Login.vue'
import FinancialNews from './views/public/FinancialNews.vue'
import ReportDetail from './views/public/ReportDetail.vue'
import FinancialReportDetail from './views/public/FinancialReportDetail.vue'
import PaymentSuccess from './views/public/PaymentSuccess.vue'
import PaymentCancel from './views/public/PaymentCancel.vue'

// 需要认证的页面
import Dashboard from './views/auth/Dashboard.vue'
import FavoriteStocks from './views/auth/FavoriteStocks.vue'
import UserProfile from './views/auth/UserProfile.vue'
import AlertSettings from './views/auth/AlertSettings.vue'
import TradingManual from './views/auth/TradingManual.vue'
import ConceptDetail from './views/auth/ConceptDetail.vue'
import LimitUpConceptDetail from './views/auth/LimitUpConceptDetail.vue'
import TradingLogList from './views/auth/TradingLogList.vue'
import AIChatbox from './views/auth/AIChatbox.vue'
import AgentChatbox from './views/auth/AgentChatbox.vue'
import StockFlowAnalysis from './views/auth/StockFlowAnalysis.vue'
import Payment from './views/auth/Payment.vue'
import PromptManagement from './views/auth/PromptManagement.vue'
import ToolManagement from './views/auth/ToolManagement.vue'
import AgentManagement from './views/auth/AgentManagement.vue'
import ConversationRecords from './views/auth/ConversationRecords.vue'
import PlatformBreakthroughConcept from './views/auth/PlatformBreakthroughConcept.vue'
import PlatformBreakthroughConceptDetail from './views/auth/PlatformBreakthroughConceptDetail.vue'
import HigherConceptList from './views/auth/HigherConceptList.vue'
import HigherConceptDetail from './views/auth/HigherConceptDetail.vue'
import StockNetInflowList from './views/auth/StockNetInflowList.vue'
import DataProcessing from './views/auth/DataProcessing.vue'
import { requireAuth, requireGuest } from './utils/auth-guard'
import store from './store'

Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    beforeEnter: requireGuest
  },
  {
    path: '/',
    name: 'FinancialNews',
    component: FinancialNews
  },
  {
    path: '/report/:id',
    name: 'ReportDetail',
    component: ReportDetail,
    props: true
  },
  {
    path: '/financial-report/:id',
    name: 'FinancialReportDetail',
    component: FinancialReportDetail,
    props: true
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    beforeEnter: requireAuth
  },
  {
    path: '/favorite',
    name: 'FavoriteStocks',
    component: FavoriteStocks,
    beforeEnter: requireAuth
  },
  {
    path: '/profile',
    name: 'UserProfile',
    component: UserProfile,
    beforeEnter: requireAuth
  },
  {
    path: '/alert',
    name: 'AlertSettings',
    component: AlertSettings,
    beforeEnter: requireAuth
  },
  {
    path: '/manual',
    name: 'TradingManual',
    component: TradingManual,
    beforeEnter: requireAuth
  },
  {
    path: '/ai-chatbox',
    name: 'AIChatbox',
    component: AIChatbox,
    beforeEnter: requireAuth
  },
  {
    path: '/agent-chatbox',
    name: 'AgentChatbox',
    component: AgentChatbox,
    beforeEnter: requireAuth
  },
  {
    path: '/concept/:name/:date',
    name: 'ConceptDetail',
    component: ConceptDetail,
    props: true,
    beforeEnter: requireAuth
  },
  {
    path: '/limit-up-concept/:name/:date',
    name: 'LimitUpConceptDetail',
    component: LimitUpConceptDetail,
    props: true,
    beforeEnter: requireAuth
  },
  {
    path: '/trading-log',
    name: 'TradingLogList',
    component: TradingLogList,
    beforeEnter: requireAuth
  },
  {
    path: '/stock-flow-analysis',
    name: 'StockFlowAnalysis',
    component: StockFlowAnalysis,
    beforeEnter: requireAuth
  },
  {
    path: '/payment',
    name: 'Payment',
    component: Payment,
    beforeEnter: requireAuth
  },
  {
    path: '/payment/success',
    name: 'PaymentSuccess',
    component: PaymentSuccess
  },
  {
    path: '/payment/cancel',
    name: 'PaymentCancel',
    component: PaymentCancel
  },
  {
    path: '/prompt-management',
    name: 'PromptManagement',
    component: PromptManagement,
    beforeEnter: requireAuth
  },
  {
    path: '/tool-management',
    name: 'ToolManagement',
    component: ToolManagement,
    beforeEnter: requireAuth
  },
  {
    path: '/agent-management',
    name: 'AgentManagement',
    component: AgentManagement,
    beforeEnter: requireAuth
  },
  {
    path: '/conversation-records',
    name: 'ConversationRecords',
    component: ConversationRecords,
    beforeEnter: requireAuth
  },
  {
    path: '/platform-breakthrough-concept',
    name: 'PlatformBreakthroughConcept',
    component: PlatformBreakthroughConcept,
    beforeEnter: requireAuth
  },
  {
    path: '/platform-breakthrough-concept/:name/:date',
    name: 'PlatformBreakthroughConceptDetail',
    component: PlatformBreakthroughConceptDetail,
    props: true,
    beforeEnter: requireAuth
  },
  {
    path: '/higher-concept-list',
    name: 'HigherConceptList',
    component: HigherConceptList,
    beforeEnter: requireAuth
  },
  {
    path: '/higher-concept/:name/:date',
    name: 'HigherConceptDetail',
    component: HigherConceptDetail,
    props: true,
    beforeEnter: requireAuth
  },
  {
    path: '/stock-net-inflow',
    name: 'StockNetInflowList',
    component: StockNetInflowList,
    beforeEnter: requireAuth
  },
  {
    path: '/data-processing',
    name: 'DataProcessing',
    component: DataProcessing,
    beforeEnter: requireAuth
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach(async (to, from, next) => {
  // 如果是登录页面或公开页面，直接通过
  if (to.path === '/' || to.path === '/login' || to.path.startsWith('/report/') || to.path.startsWith('/financial-report/') || to.path.startsWith('/payment/')) {
    next()
    return
  }
  
  // 检查是否有token
  const token = localStorage.getItem('auth_token')
  if (!token) {
    if (to.path !== '/login') {
      next('/login')
    } else {
      next()
    }
    return
  }
  
  // 如果有token，设置到axios header（防止刷新后丢失）
  if (token && !store.getters['auth/token']) {
    store.commit('auth/SET_TOKEN', token)
  }
  
  // 如果有token但没有用户信息，只在首次加载时获取用户信息
  // 避免每次路由切换都验证token
  if (!store.getters['auth/user']) {
    try {
      await store.dispatch('auth/getCurrentUser')
      next()
    } catch (error) {
      // token无效，跳转到登录页
      console.error('Token验证失败:', error)
      store.commit('auth/CLEAR_AUTH')
      if (to.path !== '/login') {
        next('/login')
      } else {
        next()
      }
    }
  } else {
    // 已有用户信息，直接放行，不再每次验证token
    next()
  }
})

const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

export default router