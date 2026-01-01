<template>
  <div class="user-profile">
    <SideMenu />
    <div class="content">
      <div class="profile-card">
        <div class="profile-header">
          <el-avatar :size="100" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"></el-avatar>
          <h2>个人信息</h2>
        </div>
        
        <el-form :model="userForm" label-width="100px" class="profile-form">
          <el-form-item label="用户名">
            <el-input v-model="userForm.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="userForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号码">
            <el-input v-model="userForm.phone"></el-input>
          </el-form-item>
          <el-form-item label="真实姓名">
            <el-input v-model="userForm.realName"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSave">保存修改</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import SideMenu from '../../components/SideMenu.vue'

export default {
  name: 'UserProfile',
  components: {
    SideMenu
  },
  data() {
    return {
      userForm: {
        username: 'admin',
        email: 'admin@example.com',
        phone: '13800138000',
        realName: '管理员'
      }
    }
  },
  methods: {
    handleSave() {
      this.$message.success('保存成功')
    }
  }
}
</script>

<style scoped>
.user-profile {
  display: flex;
  height: 100vh;
  background-color: #f5f7fa;
}

.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.profile-card {
  background: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.profile-header {
  text-align: center;
  margin-bottom: 30px;
}

.profile-header h2 {
  margin-top: 20px;
  color: #333;
}

.profile-form {
  max-width: 500px;
  margin: 0 auto;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .user-profile {
    flex-direction: column;
  }

  .content {
    padding: 68px 12px 12px 12px;
  }

  .profile-container {
    padding: 16px;
    max-width: 100%;
  }

  .profile-header {
    padding: 16px;
  }

  .profile-body {
    padding: 16px;
  }
}
</style>