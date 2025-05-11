<template>
  <div class="login-container">
    <div class="login-left">
      <img src="https://img.freepik.com/free-vector/bull-market-concept-illustration_114360-7015.jpg" alt="Bull Market Logo" class="login-image">
    </div>
    <div class="login-right">
      <div class="login-box">
        <h2>股票市场分析系统</h2>
        <el-form :model="loginForm" :rules="rules" ref="loginForm" class="login-form">
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              prefix-icon="el-icon-user"
              placeholder="root">
            </el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              prefix-icon="el-icon-lock"
              type="password"
              placeholder="root">
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleLogin" class="login-button">直接登录</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    handleLogin() {
      // 不进行任何校验，直接登录
      localStorage.setItem('isLoggedIn', 'true')
      this.$message.success('登录成功')
      this.$router.push('/dashboard')
    }
  },
  created() {
    // 如果已经登录，直接跳转到首页
    if (localStorage.getItem('isLoggedIn')) {
      this.$router.push('/dashboard')
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  height: 100vh;
  background-color: #f5f7fa;
}

.login-left {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  padding: 40px;
}

.login-image {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
}

.login-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.login-box {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
}

.login-form {
  margin-top: 20px;
}

.login-button {
  width: 100%;
}
</style>