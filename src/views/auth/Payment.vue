<template>
  <div class="payment-page">
    <el-container>
      <el-header height="60px">
        <div class="header-content">
          <h2>支付中心</h2>
        </div>
      </el-header>
      
      <el-main>
        <el-tabs v-model="activeTab" type="border-card">
          <el-tab-pane label="选择套餐" name="plans">
            <PaymentPlans />
          </el-tab-pane>
          
          <el-tab-pane label="我的订阅" name="subscription" v-if="user">
            <SubscriptionManagement />
          </el-tab-pane>
          
          <el-tab-pane label="交易记录" name="transactions" v-if="user">
            <PaymentHistory />
          </el-tab-pane>
        </el-tabs>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import PaymentPlans from '../../components/PaymentPlans.vue'
import SubscriptionManagement from '../../components/SubscriptionManagement.vue'
import PaymentHistory from '../../components/PaymentHistory.vue'

export default {
  name: 'Payment',
  components: {
    PaymentPlans,
    SubscriptionManagement,
    PaymentHistory
  },
  data() {
    return {
      activeTab: 'plans'
    }
  },
  computed: {
    user() {
      return this.$store.state.auth.user
    }
  },
  mounted() {
    // If user is logged in and has a subscription, show subscription tab
    if (this.user && this.$route.query.tab) {
      this.activeTab = this.$route.query.tab
    }
  }
}
</script>

<style scoped>
.payment-page {
  background: #f5f7fa;
  min-height: 100vh;
}

.header-content {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 20px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-content h2 {
  margin: 0;
  color: #2c3e50;
}

.el-main {
  padding: 20px;
}

.el-tabs {
  background: white;
  border-radius: 8px;
}
</style>