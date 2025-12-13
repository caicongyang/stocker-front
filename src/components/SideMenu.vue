<template>
  <div class="side-menu">
    <div class="menu-header">
      <div class="logo">
        <i class="el-icon-data-analysis"></i>
        <span class="logo-text">股票分析</span>
      </div>
    </div>
    <el-menu
      :default-active="activeMenu"
      class="menu-vertical"
      @select="handleMenuSelect"
    >
      <el-menu-item index="1">
        <i class="el-icon-s-data"></i>
        <span>大盘看板</span>
      </el-menu-item>
      <el-menu-item index="10">
        <i class="el-icon-s-marketing"></i>
        <span>突破平台</span>
      </el-menu-item>
      <el-menu-item index="11">
        <i class="el-icon-s-finance"></i>
        <span>创新高概念</span>
      </el-menu-item>
      <el-menu-item index="2">
        <i class="el-icon-star-off"></i>
        <span>自选股票</span>
      </el-menu-item>
      <el-menu-item index="3">
        <i class="el-icon-document"></i>
        <span>复盘日志</span>
      </el-menu-item>
      <el-menu-item index="4">
        <i class="el-icon-bell"></i>
        <span>预警设置</span>
      </el-menu-item>
      <el-menu-item index="5">
        <i class="el-icon-notebook-1"></i>
        <span>操盘手册</span>
      </el-menu-item>
      <el-menu-item index="6">
        <i class="el-icon-chat-dot-square"></i>
        <span>AI 助手</span>
      </el-menu-item>
      <el-menu-item index="7">
        <i class="el-icon-money"></i>
        <span>资金流水分析</span>
      </el-menu-item>
      <el-menu-item index="8">
        <i class="el-icon-document-copy"></i>
        <span>提示词管理</span>
      </el-menu-item>
      <el-menu-item index="9">
        <i class="el-icon-setting"></i>
        <span>工具管理</span>
      </el-menu-item>
      <el-menu-item index="12">
        <i class="el-icon-user"></i>
        <span>Agent 管理</span>
      </el-menu-item>
      <el-menu-item index="13">
        <i class="el-icon-tickets"></i>
        <span>对话记录</span>
      </el-menu-item>
    </el-menu>
    
    <div class="user-section">
      <div class="user-info" @click="goToProfile" v-if="user">
        <el-avatar :size="40" :src="user.avatar || defaultAvatar"></el-avatar>
        <div class="user-details">
          <span class="username">{{ user.name || user.email }}</span>
          <span class="user-email">{{ user.email }}</span>
        </div>
      </div>
      <div class="user-actions">
        <el-button type="text" size="small" @click="goToProfile" v-if="user">
          <i class="el-icon-user"></i>
          个人中心
        </el-button>
        <el-button type="text" size="small" class="logout-button" @click="handleLogout">
          <i class="el-icon-switch-button"></i>
          退出登录
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'SideMenu',
  data() {
    return {
      activeMenu: '1',
      defaultAvatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
    }
  },
  computed: {
    ...mapGetters('auth', ['user', 'isAuthenticated'])
  },
  created() {
    this.setActiveMenu()
  },
  watch: {
    '$route'() {
      this.setActiveMenu()
    }
  },
  methods: {
    ...mapActions('auth', ['logout']),
    
    setActiveMenu() {
      const path = this.$route.path
      switch (path) {
        case '/dashboard':
          this.activeMenu = '1'
          break
        case '/favorite':
          this.activeMenu = '2'
          break
        case '/trading-log':
          this.activeMenu = '3'
          break
        case '/alert':
          this.activeMenu = '4'
          break
        case '/manual':
          this.activeMenu = '5'
          break
        case '/ai-chatbox':
          this.activeMenu = '6'
          break
        case '/stock-flow-analysis':
          this.activeMenu = '7'
          break
        case '/prompt-management':
          this.activeMenu = '8'
          break
        case '/tool-management':
          this.activeMenu = '9'
          break
        case '/platform-breakthrough-concept':
          this.activeMenu = '10'
          break
        case '/higher-concept-list':
          this.activeMenu = '11'
          break
        case '/agent-management':
          this.activeMenu = '12'
          break
        case '/conversation-records':
          this.activeMenu = '13'
          break
      }
    },
    handleMenuSelect(index) {
      const path = index === '1' ? '/dashboard' : 
                  index === '2' ? '/favorite' :
                  index === '3' ? '/trading-log' :
                  index === '4' ? '/alert' :
                  index === '5' ? '/manual' :
                  index === '6' ? '/ai-chatbox' :
                  index === '7' ? '/stock-flow-analysis' :
                  index === '8' ? '/prompt-management' :
                  index === '9' ? '/tool-management' :
                  index === '10' ? '/platform-breakthrough-concept' :
                  index === '11' ? '/higher-concept-list' :
                  index === '12' ? '/agent-management' :
                  index === '13' ? '/conversation-records' :
                  null
                  
      if (path && this.$route.path !== path) {
        this.$router.push(path)
      }
    },
    goToProfile() {
      if (this.$route.path !== '/profile') {
        this.$router.push('/profile')
      }
    },
    async handleLogout() {
      try {
        const result = await this.$confirm('确认退出系统？', '退出确认', {
          confirmButtonText: '确定退出',
          cancelButtonText: '取消',
          type: 'warning',
          center: true
        })
        
        if (result === 'confirm') {
          const logoutResult = await this.logout()
          
          if (logoutResult.success) {
            this.$message.success(logoutResult.message)
            
            // 清除所有可能的本地存储
            localStorage.removeItem('isLoggedIn')
            localStorage.removeItem('user_preferences')
            sessionStorage.clear()
            
            // 跳转到登录页
            this.$router.push('/login')
          } else {
            this.$message.error('退出登录失败，请重试')
          }
        }
      } catch (error) {
        // 用户取消操作，不做任何处理
        console.log('用户取消退出操作')
      }
    }
  }
}
</script>

<style scoped>
.side-menu {
  width: 240px;
  height: 100%;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
}

.menu-header {
  padding: 20px;
  border-bottom: 1px solid #e6e6e6;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.logo {
  display: flex;
  align-items: center;
  color: white;
}

.logo i {
  font-size: 24px;
  margin-right: 8px;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
}

.menu-vertical {
  flex: 1;
  border-right: none;
}

.menu-vertical .el-menu-item i {
  margin-right: 8px;
  font-size: 16px;
  width: 16px;
  text-align: center;
}

.user-section {
  padding: 15px;
  border-top: 1px solid #e6e6e6;
  background-color: #fafafa;
}

.user-info {
  display: flex;
  align-items: center;
  padding: 10px;
  margin-bottom: 10px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.user-info:hover {
  background-color: #f0f0f0;
}

.user-details {
  margin-left: 12px;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.username {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  font-size: 12px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-actions {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.user-actions .el-button {
  width: 100%;
  justify-content: flex-start;
  padding: 8px 12px;
  font-size: 13px;
}

.user-actions .el-button + .el-button {
  margin-left: 0;
}

.logout-button {
  color: #f56c6c !important;
}

.logout-button:hover {
  background-color: #fef0f0 !important;
}

.user-actions .el-button i {
  margin-right: 6px;
  font-size: 14px;
}
</style>