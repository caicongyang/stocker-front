<template>
  <div class="side-menu">
    <el-menu
      :default-active="activeMenu"
      class="menu-vertical"
      @select="handleMenuSelect"
    >
      <el-menu-item index="1">
        <i class="el-icon-data-board"></i>
        <span>大盘看板</span>
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
    </el-menu>
    
    <div class="user-section">
      <div class="user-info" @click="goToProfile">
        <el-avatar :size="50" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"></el-avatar>
        <span class="username">管理员</span>
      </div>
      <el-button type="text" class="logout-button" @click="handleLogout">
        <i class="el-icon-switch-button"></i>
        退出登录
      </el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SideMenu',
  data() {
    return {
      activeMenu: '1'
    }
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
      }
    },
    handleMenuSelect(index) {
      const path = index === '1' ? '/dashboard' : 
                  index === '2' ? '/favorite' :
                  index === '3' ? '/trading-log' :
                  index === '4' ? '/alert' :
                  index === '5' ? '/manual' :
                  index === '6' ? '/ai-chatbox' :
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
    handleLogout() {
      this.$confirm('确认退出系统?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        localStorage.removeItem('isLoggedIn')
        this.$message.success('已退出登录')
        this.$router.push('/login')
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.side-menu {
  width: 200px;
  height: 100%;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
}

.menu-vertical {
  flex: 1;
  border-right: none;
}

.user-section {
  padding: 20px;
  border-top: 1px solid #e6e6e6;
}

.user-info {
  display: flex;
  align-items: center;
  padding: 10px 0;
  cursor: pointer;
}

.username {
  margin-left: 10px;
  color: #333;
}

.logout-button {
  width: 100%;
  margin-top: 10px;
  color: #f56c6c;
}

.logout-button i {
  margin-right: 5px;
}
</style>