<template>
  <div class="login-container">
    <div class="login-left">
      <img src="https://img.freepik.com/free-vector/bull-market-concept-illustration_114360-7015.jpg" alt="Bull Market Logo" class="login-image">
    </div>
    <div class="login-right">
      <div class="login-box">
        <h2>股票市场分析系统</h2>
        
        <!-- 登录方式选择 -->
        <el-tabs v-model="activeTab" @tab-click="handleTabClick">
          <el-tab-pane label="密码登录" name="password">
            <el-form :model="passwordForm" :rules="passwordRules" ref="passwordForm" class="login-form">
              <el-form-item prop="email">
                <el-input
                  v-model="passwordForm.email"
                  prefix-icon="el-icon-message"
                  placeholder="请输入邮箱地址"
                  type="email">
                </el-input>
              </el-form-item>
              <el-form-item prop="password">
                <el-input
                  v-model="passwordForm.password"
                  prefix-icon="el-icon-lock"
                  type="password"
                  placeholder="请输入密码"
                  @keyup.enter.native="handlePasswordLogin">
                </el-input>
              </el-form-item>
              <el-form-item>
                <el-button 
                  type="primary" 
                  @click="handlePasswordLogin" 
                  :loading="loading"
                  class="login-button">
                  登录
                </el-button>
              </el-form-item>
              <div class="form-footer">
                <span class="register-link" @click="showRegister = true">没有账号？立即注册</span>
              </div>
            </el-form>
          </el-tab-pane>
          
          <el-tab-pane label="验证码登录" name="code">
            <el-form :model="codeForm" :rules="codeRules" ref="codeForm" class="login-form">
              <el-form-item prop="email">
                <el-input
                  v-model="codeForm.email"
                  prefix-icon="el-icon-message"
                  placeholder="请输入邮箱地址"
                  type="email">
                </el-input>
              </el-form-item>
              <el-form-item prop="code">
                <div class="code-input-group">
                  <el-input
                    v-model="codeForm.code"
                    prefix-icon="el-icon-key"
                    placeholder="请输入验证码"
                    @keyup.enter.native="handleCodeLogin">
                  </el-input>
                  <el-button 
                    @click="sendVerificationCode"
                    :disabled="codeSending || countdown > 0"
                    class="code-button">
                    {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
                  </el-button>
                </div>
              </el-form-item>
              <el-form-item>
                <el-button 
                  type="primary" 
                  @click="handleCodeLogin" 
                  :loading="loading"
                  class="login-button">
                  登录
                </el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
        
        <!-- Google登录 -->
        <div class="social-login">
          <div class="divider">
            <span>或使用以下方式登录</span>
          </div>
          <div class="google-signin-container">
            <div id="google-signin-button"></div>
          </div>
        </div>
        
        <!-- 错误提示 -->
        <el-alert
          v-if="error"
          :title="error"
          type="error"
          :closable="false"
          show-icon
          class="error-alert">
        </el-alert>
      </div>
    </div>
    
    <!-- 注册对话框 -->
    <el-dialog
      title="用户注册"
      :visible.sync="showRegister"
      width="500px">
      <el-form :model="registerForm" :rules="registerRules" ref="registerForm">
        <el-form-item label="邮箱地址" prop="email">
          <el-input v-model="registerForm.email" type="email"></el-input>
        </el-form-item>
        <el-form-item label="用户昵称" prop="name">
          <el-input v-model="registerForm.name" placeholder="可选"></el-input>
        </el-form-item>
        <el-form-item label="登录密码" prop="password">
          <el-input v-model="registerForm.password" type="password"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="registerForm.confirmPassword" type="password"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="showRegister = false">取 消</el-button>
        <el-button type="primary" @click="handleRegister" :loading="registerLoading">注 册</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import config from '@/config/config'

export default {
  name: 'Login',
  data() {
    const validateEmail = (rule, value, callback) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!value) {
        callback(new Error('请输入邮箱地址'))
      } else if (!emailRegex.test(value)) {
        callback(new Error('请输入有效的邮箱地址'))
      } else {
        callback()
      }
    }
    
    const validateConfirmPassword = (rule, value, callback) => {
      if (value !== this.registerForm.password) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    }
    
    return {
      activeTab: 'password',
      countdown: 0,
      codeSending: false,
      showRegister: false,
      registerLoading: false,
      
      // 密码登录表单
      passwordForm: {
        email: '',
        password: ''
      },
      
      // 验证码登录表单
      codeForm: {
        email: '',
        code: ''
      },
      
      // 注册表单
      registerForm: {
        email: '',
        name: '',
        password: '',
        confirmPassword: ''
      },
      
      // 表单验证规则
      passwordRules: {
        email: [{ validator: validateEmail, trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
      },
      
      codeRules: {
        email: [{ validator: validateEmail, trigger: 'blur' }],
        code: [
          { required: true, message: '请输入验证码', trigger: 'blur' },
          { len: 6, message: '验证码长度为6位', trigger: 'blur' }
        ]
      },
      
      registerRules: {
        email: [{ validator: validateEmail, trigger: 'blur' }],
        name: [{ max: 50, message: '用户昵称不能超过50个字符', trigger: 'blur' }],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, message: '密码至少6位', trigger: 'blur' }
        ],
        confirmPassword: [{ validator: validateConfirmPassword, trigger: 'blur' }]
      }
    }
  },
  
  computed: {
    ...mapGetters('auth', ['loading', 'error', 'isAuthenticated'])
  },
  
  methods: {
    ...mapActions('auth', [
      'loginWithPassword',
      'loginWithEmailCode', 
      'loginWithGoogle',
      'sendEmailCode',
      'register'
    ]),
    
    handleTabClick() {
      // 切换选项卡时清除错误信息
      this.$store.commit('auth/SET_ERROR', null)
    },
    
    // 密码登录
    async handlePasswordLogin() {
      this.$refs.passwordForm.validate(async (valid) => {
        if (!valid) return
        
        const result = await this.loginWithPassword({
          email: this.passwordForm.email,
          password: this.passwordForm.password
        })
        
        if (result.success) {
          this.$message.success(result.message)
          this.$router.push('/dashboard')
        }
      })
    },
    
    // 发送验证码
    async sendVerificationCode() {
      if (!this.codeForm.email) {
        this.$message.error('请先输入邮箱地址')
        return
      }
      
      // 验证邮箱格式
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(this.codeForm.email)) {
        this.$message.error('请输入有效的邮箱地址')
        return
      }
      
      this.codeSending = true
      
      const result = await this.sendEmailCode(this.codeForm.email)
      
      this.codeSending = false
      
      if (result.success) {
        this.$message.success(result.message)
        this.startCountdown()
      }
    },
    
    // 开始倒计时
    startCountdown() {
      this.countdown = 60
      const timer = setInterval(() => {
        this.countdown--
        if (this.countdown <= 0) {
          clearInterval(timer)
        }
      }, 1000)
    },
    
    // 验证码登录
    async handleCodeLogin() {
      this.$refs.codeForm.validate(async (valid) => {
        if (!valid) return
        
        const result = await this.loginWithEmailCode({
          email: this.codeForm.email,
          code: this.codeForm.code
        })
        
        if (result.success) {
          this.$message.success(result.message)
          this.$router.push('/dashboard')
        }
      })
    },
    
    // 用户注册
    async handleRegister() {
      this.$refs.registerForm.validate(async (valid) => {
        if (!valid) return
        
        this.registerLoading = true
        
        const result = await this.register({
          email: this.registerForm.email,
          name: this.registerForm.name,
          password: this.registerForm.password
        })
        
        this.registerLoading = false
        
        if (result.success) {
          this.$message.success(result.message + '，请使用邮箱密码登录')
          this.showRegister = false
          this.activeTab = 'password'
          this.passwordForm.email = this.registerForm.email
          
          // 清空注册表单
          this.registerForm = {
            email: '',
            name: '',
            password: '',
            confirmPassword: ''
          }
        }
      })
    },
    
    // Google登录回调
    async handleGoogleSignIn(response) {
      try {
        if (!response.credential) {
          this.$message.error('Google登录失败：未获取到凭证')
          return
        }
        
        const result = await this.loginWithGoogle(response.credential)
        
        if (result.success) {
          this.$message.success(result.message || 'Google登录成功')
          this.$router.push('/dashboard')
        } else {
          this.$message.error(result.message || 'Google登录失败')
        }
      } catch (error) {
        console.error('Google登录处理异常:', error)
        this.$message.error('Google登录处理异常，请重试')
      }
    },
    
    // 初始化Google登录
    initGoogleSignIn() {
      // 从config.js获取Google客户端ID
      const googleClientId = config.googleClientId
      
      console.log('Google客户端ID:', googleClientId) // 调试用，生产环境可删除
      console.log('完整配置:', config) // 调试用，生产环境可删除
      
      if (!googleClientId || googleClientId === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
        console.warn('Google客户端ID未配置，Google登录功能将不可用')
        // 隐藏Google登录区域
        this.$nextTick(() => {
          const googleContainer = document.querySelector('.social-login')
          if (googleContainer) {
            googleContainer.style.display = 'none'
          }
        })
        return
      }
      
      if (window.google && window.google.accounts) {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: this.handleGoogleSignIn
          })
          
          // 确保DOM元素存在后再渲染按钮
          this.$nextTick(() => {
            const buttonContainer = document.getElementById('google-signin-button')
            if (buttonContainer) {
              window.google.accounts.id.renderButton(
                buttonContainer,
                {
                  theme: 'outline',
                  size: 'large',
                  text: 'signin_with',
                  width: 300,
                  height: 50
                }
              )
              console.log('Google登录按钮渲染成功')
            } else {
              console.error('未找到Google登录按钮容器元素')
            }
          })
        } catch (error) {
          console.error('Google登录初始化失败:', error)
          this.hideGoogleLogin()
        }
      } else {
        console.warn('Google API未加载完成')
        // 延迟重试
        setTimeout(() => {
          this.initGoogleSignIn()
        }, 1000)
      }
    },
    
    // 隐藏Google登录区域
    hideGoogleLogin() {
      this.$nextTick(() => {
        const googleContainer = document.querySelector('.social-login')
        if (googleContainer) {
          googleContainer.style.display = 'none'
        }
      })
    },
    
    // 加载Google脚本
    loadGoogleScript() {
      if (!window.google) {
        const script = document.createElement('script')
        script.src = 'https://accounts.google.com/gsi/client'
        script.async = true
        script.defer = true
        
        script.onload = () => {
          console.log('Google脚本加载成功')
          // 延迟一点时间确保脚本完全初始化
          setTimeout(() => {
            this.initGoogleSignIn()
          }, 100)
        }
        
        script.onerror = (error) => {
          console.error('Google登录脚本加载失败:', error)
          console.warn('可能的原因：网络问题、防火墙阻止、或Google服务不可用')
          this.hideGoogleLogin()
        }
        
        // 设置超时处理
        setTimeout(() => {
          if (!window.google) {
            console.error('Google脚本加载超时')
            this.hideGoogleLogin()
          }
        }, 10000) // 10秒超时
        
        document.head.appendChild(script)
      } else {
        console.log('Google脚本已存在，直接初始化')
        this.initGoogleSignIn()
      }
    }
  },
  
  created() {
    // 如果已经登录，直接跳转到首页
    if (this.isAuthenticated) {
      this.$router.push('/dashboard')
    }
  },
  
  mounted() {
    // 调试：显示配置信息
    console.log('项目配置:', config)
    console.log('Google客户端ID:', config.googleClientId)
    
    // 加载Google登录脚本
    this.loadGoogleScript()
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
  width: 450px;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  font-size: 24px;
}

.login-form {
  margin-top: 20px;
}

.login-button {
  width: 100%;
  height: 40px;
}

.code-input-group {
  display: flex;
  gap: 10px;
}

.code-input-group .el-input {
  flex: 1;
}

.code-button {
  width: 110px;
  height: 40px;
}

.form-footer {
  text-align: center;
  margin-top: 15px;
}

.register-link {
  color: #409eff;
  cursor: pointer;
  font-size: 14px;
}

.register-link:hover {
  text-decoration: underline;
}

.social-login {
  margin-top: 30px;
}

.divider {
  text-align: center;
  margin: 20px 0;
  position: relative;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background-color: #dcdfe6;
}

.divider span {
  background-color: white;
  padding: 0 15px;
  color: #909399;
  font-size: 14px;
}

.google-signin-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

#google-signin-button {
  max-width: 300px;
  margin: 0 auto;
}

.error-alert {
  margin-top: 15px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
  }
  
  .login-left {
    flex: none;
    height: 200px;
  }
  
  .login-box {
    width: 100%;
    max-width: 400px;
  }
}
</style>