<template>
  <div class="payment-cancel">
    <div class="cancel-container">
      <el-result
        icon="warning"
        title="支付已取消"
        sub-title="您的支付已被取消，没有产生任何费用"
      >
        <template slot="extra">
          <div class="cancel-actions">
            <el-button type="primary" @click="retryPayment">
              重新支付
            </el-button>
            
            <el-button @click="viewPlans">
              查看套餐
            </el-button>
            
            <el-button @click="goHome">
              返回首页
            </el-button>
          </div>
        </template>
      </el-result>
      
      <div class="cancel-info" v-if="orderId">
        <el-card>
          <div slot="header">
            <span>订单信息</span>
          </div>
          
          <el-descriptions :column="2" border>
            <el-descriptions-item label="订单号">
              {{ orderId }}
            </el-descriptions-item>
            
            <el-descriptions-item label="取消时间">
              {{ new Date().toLocaleString('zh-CN') }}
            </el-descriptions-item>
            
            <el-descriptions-item label="订单状态">
              <el-tag type="warning">已取消</el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </div>
      
      <div class="help-section">
        <el-card>
          <div slot="header">
            <span>需要帮助？</span>
          </div>
          
          <div class="help-content">
            <p>如果您在支付过程中遇到了问题，请尝试以下解决方案：</p>
            
            <ul class="help-list">
              <li>
                <i class="el-icon-refresh"></i>
                检查网络连接后重新尝试支付
              </li>
              <li>
                <i class="el-icon-bank-card"></i>
                确认支付账户余额充足
              </li>
              <li>
                <i class="el-icon-phone"></i>
                联系我们的客服团队获得帮助
              </li>
              <li>
                <i class="el-icon-question"></i>
                查看常见问题解答
              </li>
            </ul>
            
            <div class="contact-info">
              <el-alert
                title="如果问题持续存在，请联系客服"
                type="info"
                show-icon
                :closable="false"
              >
                <template slot="default">
                  <p>客服邮箱: support@example.com</p>
                  <p>工作时间: 周一至周五 9:00-18:00</p>
                </template>
              </el-alert>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PaymentCancel',
  data() {
    return {
      orderId: null,
      planId: null
    }
  },
  mounted() {
    // 获取URL参数
    this.orderId = this.$route.query.order_id
    this.planId = this.$route.query.plan_id
    
    this.$message.warning('支付已取消，您可以随时重新尝试')
  },
  methods: {
    retryPayment() {
      if (this.planId) {
        // 如果有套餐ID，直接跳转到支付页面并选择该套餐
        this.$router.push(`/payment?retry_plan=${this.planId}`)
      } else {
        this.$router.push('/payment')
      }
    },
    
    viewPlans() {
      this.$router.push('/payment?tab=plans')
    },
    
    goHome() {
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
.payment-cancel {
  min-height: 100vh;
  background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.cancel-container {
  background: white;
  border-radius: 12px;
  padding: 40px;
  max-width: 800px;
  width: 100%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.cancel-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
  margin-top: 20px;
}

.cancel-info {
  margin-top: 30px;
}

.help-section {
  margin-top: 30px;
}

.help-content p {
  color: #666;
  margin-bottom: 15px;
}

.help-list {
  list-style: none;
  padding: 0;
  margin: 20px 0;
}

.help-list li {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  color: #555;
}

.help-list i {
  color: #E6A23C;
  margin-right: 10px;
  font-size: 16px;
}

.contact-info {
  margin-top: 20px;
}

.contact-info p {
  margin: 5px 0;
  font-size: 14px;
}

@media (max-width: 768px) {
  .cancel-container {
    padding: 20px;
  }
  
  .cancel-actions {
    flex-direction: column;
  }
  
  .cancel-actions .el-button {
    width: 100%;
  }
}
</style>