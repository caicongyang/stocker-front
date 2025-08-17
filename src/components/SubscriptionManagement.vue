/<template>
  <div class="subscription-management">
    <div v-loading="loading">
      <div v-if="subscription" class="subscription-info">
        <el-card>
          <div slot="header" class="clearfix">
            <span>当前订阅</span>
            <el-tag 
              :type="getStatusType(subscription.status)" 
              class="status-tag"
            >
              {{ getStatusText(subscription.status) }}
            </el-tag>
          </div>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="info-item">
                <label>套餐名称：</label>
                <span>{{ subscription.plan_name }}</span>
              </div>
              
              <div class="info-item">
                <label>套餐价格：</label>
                <span>¥{{ subscription.price }}/{{ subscription.plan_type === 'monthly' ? '月' : '年' }}</span>
              </div>
              
              <div class="info-item">
                <label>开始时间：</label>
                <span>{{ formatDate(subscription.start_date) }}</span>
              </div>
              
              <div class="info-item">
                <label>到期时间：</label>
                <span>{{ formatDate(subscription.end_date) }}</span>
              </div>
            </el-col>
            
            <el-col :span="12">
              <div class="info-item">
                <label>自动续费：</label>
                <el-switch
                  v-model="subscription.auto_renew"
                  :disabled="subscription.status !== 'active'"
                  @change="toggleAutoRenew"
                />
              </div>
              
              <div class="subscription-features">
                <label>包含功能：</label>
                <ul>
                  <li v-for="feature in subscription.features" :key="feature">
                    <i class="el-icon-check"></i>
                    {{ feature }}
                  </li>
                </ul>
              </div>
            </el-col>
          </el-row>
          
          <div class="subscription-actions" v-if="subscription.status === 'active'">
            <el-button 
              type="danger" 
              :loading="cancelling"
              @click="confirmCancellation"
            >
              取消订阅
            </el-button>
            
            <el-button 
              type="primary"
              @click="upgradeSubscription"
            >
              升级套餐
            </el-button>
          </div>
          
          <div v-if="subscription.status !== 'active'" class="inactive-notice">
            <el-alert
              :title="getInactiveMessage()"
              type="warning"
              show-icon
              :closable="false"
            />
            
            <div style="margin-top: 15px;">
              <el-button type="primary" @click="renewSubscription">
                重新订阅
              </el-button>
            </div>
          </div>
        </el-card>
      </div>
      
      <div v-else class="no-subscription">
        <el-empty description="暂无订阅">
          <el-button type="primary" @click="goToPlans">
            选择套餐
          </el-button>
        </el-empty>
      </div>
    </div>
    
    <!-- Cancellation Confirmation Dialog -->
    <el-dialog
      title="确认取消订阅"
      :visible.sync="showCancelDialog"
      width="500px"
    >
      <p>确定要取消当前订阅吗？</p>
      <p style="color: #F56C6C; font-size: 14px;">
        取消后将在当前计费周期结束时停止服务，无法退款。
      </p>
      
      <span slot="footer" class="dialog-footer">
        <el-button @click="showCancelDialog = false">取消</el-button>
        <el-button 
          type="danger" 
          :loading="cancelling"
          @click="cancelSubscription"
        >
          确认取消
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'SubscriptionManagement',
  data() {
    return {
      loading: false,
      cancelling: false,
      showCancelDialog: false,
      subscription: null
    }
  },
  mounted() {
    this.loadSubscription()
  },
  methods: {
    async loadSubscription() {
      this.loading = true
      try {
        const response = await axios.get('/api/payment/subscription')
        this.subscription = response.data
      } catch (error) {
        if (error.response?.status !== 404) {
          this.$message.error('加载订阅信息失败')
          console.error('Error loading subscription:', error)
        }
      } finally {
        this.loading = false
      }
    },
    
    getStatusType(status) {
      const statusMap = {
        'active': 'success',
        'inactive': 'info',
        'cancelled': 'warning',
        'expired': 'danger',
        'pending': 'warning'
      }
      return statusMap[status] || 'info'
    },
    
    getStatusText(status) {
      const statusMap = {
        'active': '激活',
        'inactive': '未激活',
        'cancelled': '已取消',
        'expired': '已过期',
        'pending': '待支付'
      }
      return statusMap[status] || '未知'
    },
    
    getInactiveMessage() {
      if (this.subscription.status === 'cancelled') {
        return '订阅已取消，将在到期时间停止服务'
      } else if (this.subscription.status === 'expired') {
        return '订阅已过期，请重新订阅以继续使用服务'
      } else if (this.subscription.status === 'pending') {
        return '订阅待支付，请完成支付以激活服务'
      }
      return '订阅暂未激活'
    },
    
    formatDate(dateString) {
      if (!dateString) return '-'
      return new Date(dateString).toLocaleString('zh-CN')
    },
    
    async toggleAutoRenew(value) {
      try {
        // This would call an API to update auto-renew setting
        // For now, just update local state
        this.$message.success(value ? '已开启自动续费' : '已关闭自动续费')
      } catch (error) {
        this.$message.error('设置失败')
        // Revert the switch
        this.subscription.auto_renew = !value
      }
    },
    
    confirmCancellation() {
      this.showCancelDialog = true
    },
    
    async cancelSubscription() {
      this.cancelling = true
      try {
        await axios.post(`/api/payment/cancel-subscription/${this.subscription.id}`)
        
        this.$message.success('订阅取消成功')
        this.showCancelDialog = false
        
        // Reload subscription info
        await this.loadSubscription()
        
      } catch (error) {
        this.$message.error('取消订阅失败: ' + (error.response?.data?.detail || error.message))
        console.error('Cancel subscription error:', error)
      } finally {
        this.cancelling = false
      }
    },
    
    upgradeSubscription() {
      this.$emit('switch-tab', 'plans')
    },
    
    renewSubscription() {
      this.$emit('switch-tab', 'plans')
    },
    
    goToPlans() {
      this.$emit('switch-tab', 'plans')
    }
  }
}
</script>

<style scoped>
.subscription-management {
  padding: 20px;
}

.status-tag {
  float: right;
}

.info-item {
  margin-bottom: 15px;
}

.info-item label {
  font-weight: bold;
  color: #666;
  margin-right: 10px;
}

.subscription-features {
  margin-top: 20px;
}

.subscription-features label {
  font-weight: bold;
  color: #666;
  display: block;
  margin-bottom: 10px;
}

.subscription-features ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.subscription-features li {
  margin-bottom: 8px;
  color: #555;
}

.subscription-features i {
  color: #67C23A;
  margin-right: 8px;
}

.subscription-actions {
  margin-top: 30px;
  text-align: right;
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.subscription-actions .el-button {
  margin-left: 10px;
}

.inactive-notice {
  margin-top: 20px;
  text-align: center;
}

.no-subscription {
  text-align: center;
  padding: 40px;
}
</style>