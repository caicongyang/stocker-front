<template>
  <div class="payment-plans">
    <el-card class="plans-container">
      <div slot="header" class="clearfix">
        <span>选择套餐</span>
      </div>
      
      <div v-loading="loading" class="plans-grid">
        <el-card 
          v-for="plan in plans" 
          :key="plan.id" 
          class="plan-card"
          :class="{ 'recommended': plan.plan_type === 'monthly' }"
        >
          <div class="plan-header">
            <h3>{{ plan.name }}</h3>
            <div class="price">
              <span class="currency">¥</span>
              <span class="amount">{{ plan.price }}</span>
              <span class="period" v-if="plan.plan_type !== 'one_time'">
                /{{ plan.plan_type === 'monthly' ? '月' : '年' }}
              </span>
            </div>
          </div>
          
          <div class="plan-description">
            {{ plan.description }}
          </div>
          
          <ul class="features-list">
            <li v-for="feature in plan.features" :key="feature">
              <i class="el-icon-check"></i>
              {{ feature }}
            </li>
          </ul>
          
          <div class="plan-actions">
            <el-button 
              type="primary" 
              :size="plan.plan_type === 'monthly' ? 'medium' : 'small'"
              :loading="processingPlan === plan.id"
              @click="selectPlan(plan)"
              class="select-btn"
            >
              {{ plan.plan_type === 'one_time' ? '立即购买' : '订阅' }}
            </el-button>
          </div>
          
          <div v-if="plan.plan_type === 'monthly'" class="recommended-badge">
            推荐
          </div>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'PaymentPlans',
  data() {
    return {
      loading: false,
      processingPlan: null,
      plans: []
    }
  },
  mounted() {
    this.loadPlans()
  },
  methods: {
    async loadPlans() {
      this.loading = true
      try {
        const response = await axios.get('/api/payment/plans')
        this.plans = response.data
      } catch (error) {
        this.$message.error('加载套餐信息失败')
        console.error('Error loading plans:', error)
      } finally {
        this.loading = false
      }
    },
    
    async selectPlan(plan) {
      if (!this.$store.state.auth.user) {
        this.$message.warning('请先登录')
        this.$router.push('/login')
        return
      }
      
      this.processingPlan = plan.id
      
      try {
        let response
        if (plan.plan_type === 'one_time') {
          response = await axios.post('/api/payment/create-payment', {
            plan_id: plan.id,
            return_url: window.location.origin + '/payment/success'
          })
        } else {
          response = await axios.post('/api/payment/create-subscription', {
            plan_id: plan.id,
            return_url: window.location.origin + '/payment/success'
          })
        }
        
        if (response.data.success && response.data.payment_url) {
          // Redirect to payment page
          window.location.href = response.data.payment_url
        } else {
          this.$message.error('创建支付失败')
        }
        
      } catch (error) {
        this.$message.error('支付创建失败: ' + (error.response?.data?.detail || error.message))
        console.error('Payment creation error:', error)
      } finally {
        this.processingPlan = null
      }
    }
  }
}
</script>

<style scoped>
.payment-plans {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.plans-container {
  margin-bottom: 20px;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.plan-card {
  position: relative;
  transition: transform 0.2s, box-shadow 0.2s;
  height: 100%;
}

.plan-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.plan-card.recommended {
  border: 2px solid #409EFF;
  transform: scale(1.05);
}

.plan-header {
  text-align: center;
  margin-bottom: 20px;
}

.plan-header h3 {
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 24px;
}

.price {
  display: flex;
  align-items: baseline;
  justify-content: center;
  margin-bottom: 10px;
}

.currency {
  font-size: 16px;
  color: #666;
}

.amount {
  font-size: 36px;
  font-weight: bold;
  color: #409EFF;
  margin: 0 5px;
}

.period {
  font-size: 14px;
  color: #666;
}

.plan-description {
  text-align: center;
  color: #666;
  margin-bottom: 20px;
  line-height: 1.5;
}

.features-list {
  list-style: none;
  padding: 0;
  margin-bottom: 30px;
}

.features-list li {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  color: #555;
}

.features-list i {
  color: #67C23A;
  margin-right: 10px;
  font-weight: bold;
}

.plan-actions {
  text-align: center;
}

.select-btn {
  width: 100%;
  padding: 12px;
  font-size: 16px;
}

.recommended .select-btn {
  background: linear-gradient(45deg, #409EFF, #67C23A);
  border: none;
}

.recommended-badge {
  position: absolute;
  top: -10px;
  right: 20px;
  background: #409EFF;
  color: white;
  padding: 5px 15px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: bold;
}

@media (max-width: 768px) {
  .plans-grid {
    grid-template-columns: 1fr;
  }
  
  .plan-card.recommended {
    transform: none;
  }
}
</style>