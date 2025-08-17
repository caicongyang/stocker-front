<template>
  <div class="payment-success">
    <div class="success-container">
      <el-result
        icon="success"
        title="支付成功"
        sub-title="您的支付已成功完成，感谢您的支持！"
      >
        <template slot="extra">
          <div class="success-actions">
            <el-button type="primary" @click="goToDashboard">
              返回首页
            </el-button>
            
            <el-button @click="viewSubscription">
              查看订阅
            </el-button>
            
            <el-button @click="continueUsing">
              开始使用
            </el-button>
          </div>
        </template>
      </el-result>
      
      <div class="payment-info" v-if="paymentId">
        <el-card>
          <div slot="header">
            <span>支付信息</span>
          </div>
          
          <el-descriptions :column="2" border>
            <el-descriptions-item label="支付单号">
              {{ paymentId }}
            </el-descriptions-item>
            
            <el-descriptions-item label="支付时间">
              {{ new Date().toLocaleString('zh-CN') }}
            </el-descriptions-item>
            
            <el-descriptions-item label="支付状态">
              <el-tag type="success">已完成</el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </div>
      
      <div class="next-steps">
        <el-card>
          <div slot="header">
            <span>接下来您可以</span>
          </div>
          
          <ul class="steps-list">
            <li>
              <i class="el-icon-data-analysis"></i>
              使用AI分析助手进行股票分析
            </li>
            <li>
              <i class="el-icon-document"></i>
              查看完整的市场数据和报告
            </li>
            <li>
              <i class="el-icon-star-off"></i>
              使用高级选股策略和工具
            </li>
            <li>
              <i class="el-icon-phone"></i>
              联系专属客服获得支持
            </li>
          </ul>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PaymentSuccess',
  data() {
    return {
      paymentId: null,
      orderId: null
    }
  },
  mounted() {
    // 获取URL参数
    this.paymentId = this.$route.query.payment_id
    this.orderId = this.$route.query.order_id
    
    // 显示成功消息
    this.$message.success('支付成功！欢迎使用我们的服务')
    
    // 可以在这里调用后端API确认支付状态
    this.confirmPaymentStatus()
  },
  methods: {
    async confirmPaymentStatus() {
      if (this.paymentId) {
        try {
          // 调用后端API确认支付状态
          // const response = await axios.get(`/api/payment/status/${this.paymentId}`)
          // 处理响应...
        } catch (error) {
          console.error('Error confirming payment status:', error)
        }
      }
    },
    
    goToDashboard() {
      this.$router.push('/dashboard')
    },
    
    viewSubscription() {
      this.$router.push('/payment?tab=subscription')
    },
    
    continueUsing() {
      this.$router.push('/ai-chatbox')
    }
  }
}
</script>

<style scoped>
.payment-success {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.success-container {
  background: white;
  border-radius: 12px;
  padding: 40px;
  max-width: 800px;
  width: 100%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.success-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
  margin-top: 20px;
}

.payment-info {
  margin-top: 30px;
}

.next-steps {
  margin-top: 30px;
}

.steps-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.steps-list li {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  color: #555;
  font-size: 16px;
}

.steps-list i {
  color: #409EFF;
  margin-right: 12px;
  font-size: 18px;
}

@media (max-width: 768px) {
  .success-container {
    padding: 20px;
  }
  
  .success-actions {
    flex-direction: column;
  }
  
  .success-actions .el-button {
    width: 100%;
  }
}
</style>