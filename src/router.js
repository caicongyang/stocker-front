import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from './views/Login.vue'
import Dashboard from './views/Dashboard.vue'
import FavoriteStocks from './views/FavoriteStocks.vue'
import UserProfile from './views/UserProfile.vue'
import AlertSettings from './views/AlertSettings.vue'
import TradingManual from './views/TradingManual.vue'
import ConceptDetail from './views/ConceptDetail.vue'
import LimitUpConceptDetail from './views/LimitUpConceptDetail.vue'
import TradingLogList from './views/TradingLogList.vue'
import AIChatbox from './views/AIChatbox.vue'
import FinancialNews from './views/FinancialNews.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/',
    name: 'FinancialNews',
    component: FinancialNews
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/favorite',
    name: 'FavoriteStocks',
    component: FavoriteStocks
  },
  {
    path: '/profile',
    name: 'UserProfile',
    component: UserProfile
  },
  {
    path: '/alert',
    name: 'AlertSettings',
    component: AlertSettings
  },
  {
    path: '/manual',
    name: 'TradingManual',
    component: TradingManual
  },
  {
    path: '/ai-chatbox',
    name: 'AIChatbox',
    component: AIChatbox
  },
  {
    path: '/concept/:name/:date',
    name: 'ConceptDetail',
    component: ConceptDetail,
    props: true
  },
  {
    path: '/limit-up-concept/:name/:date',
    name: 'LimitUpConceptDetail',
    component: LimitUpConceptDetail,
    props: true
  },
  {
    path: '/trading-log',
    name: 'TradingLogList',
    component: TradingLogList
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn')
  
  // Allow direct access to the financial news page and login page
  if (to.path === '/' || to.path === '/login') {
    next()
  } else {
    // Require login for all other routes
    if (!isLoggedIn) {
      next('/')
    } else {
      next()
    }
  }
})

export default router