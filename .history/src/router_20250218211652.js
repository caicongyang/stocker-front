import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from './views/Login.vue'
import Dashboard from './views/Dashboard.vue'
import StockDetail from './views/StockDetail.vue'
import FavoriteStocks from './views/FavoriteStocks.vue'
import UserProfile from './views/UserProfile.vue'
import AlertSettings from './views/AlertSettings.vue'
import MarketDictionary from './views/MarketDictionary.vue'
import TradingManual from './views/TradingManual.vue'
import ConceptDetail from './views/ConceptDetail.vue'
import LimitUpConceptDetail from './views/LimitUpConceptDetail.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/stocks',
    name: 'StockDetail',
    component: StockDetail
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
    path: '/dictionary',
    name: 'MarketDictionary',
    component: MarketDictionary
  },
  {
    path: '/manual',
    name: 'TradingManual',
    component: TradingManual
  },
  {
    path: '/settings',
    name: 'SystemSettings',
    component: Dashboard
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
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn')
  
  if (to.path === '/login') {
    if (isLoggedIn) {
      next('/')
    } else {
      next()
    }
  } else {
    if (!isLoggedIn) {
      next('/login')
    } else {
      next()
    }
  }
})

export default router