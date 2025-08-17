<template>
  <div class="payment-history">
    <div class="history-filters">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-select v-model="filters.status" placeholder="交易状态" clearable>
            <el-option label="全部" value="" />
            <el-option label="待支付" value="pending" />
            <el-option label="已完成" value="completed" />
            <el-option label="已失败" value="failed" />
            <el-option label="已取消" value="cancelled" />
            <el-option label="已退款" value="refunded" />
          </el-select>
        </el-col>
        
        <el-col :span="8">
          <el-select v-model="filters.type" placeholder="交易类型" clearable>
            <el-option label="全部" value="" />
            <el-option label="支付" value="payment" />
            <el-option label="退款" value="refund" />
            <el-option label="续费" value="renewal" />
          </el-select>
        </el-col>
        
        <el-col :span="8">
          <el-date-picker
            v-model="filters.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
          />
        </el-col>
      </el-row>
      
      <el-row style="margin-top: 15px;">
        <el-col :span="24" style="text-align: right;">
          <el-button @click="resetFilters">重置</el-button>
          <el-button type="primary" @click="searchTransactions">搜索</el-button>
        </el-col>
      </el-row>
    </div>
    
    <el-table 
      :data="transactions" 
      v-loading="loading"
      style="width: 100%; margin-top: 20px;"
    >
      <el-table-column
        prop="created_at"
        label="交易时间"
        width="180"
      >
        <template slot-scope="scope">
          {{ formatDate(scope.row.created_at) }}
        </template>
      </el-table-column>
      
      <el-table-column
        prop="creem_order_id"
        label="订单号"
        width="200"
      >
        <template slot-scope="scope">
          <el-button 
            type="text" 
            @click="viewTransactionDetail(scope.row)"
            style="padding: 0;"
          >
            {{ scope.row.creem_order_id }}
          </el-button>
        </template>
      </el-table-column>
      
      <el-table-column
        prop="plan_name"
        label="套餐名称"
        width="150"
      />
      
      <el-table-column
        prop="transaction_type"
        label="交易类型"
        width="100"
      >
        <template slot-scope="scope">
          <el-tag :type="getTypeTagType(scope.row.transaction_type)" size="small">
            {{ getTypeText(scope.row.transaction_type) }}
          </el-tag>
        </template>
      </el-table-column>
      
      <el-table-column
        prop="amount"
        label="金额"
        width="120"
      >
        <template slot-scope="scope">
          <span :class="{ 'negative-amount': scope.row.transaction_type === 'refund' }">
            {{ scope.row.transaction_type === 'refund' ? '-' : '' }}¥{{ scope.row.amount }}
          </span>
        </template>
      </el-table-column>
      
      <el-table-column
        prop="payment_method"
        label="支付方式"
        width="120"
      />
      
      <el-table-column
        prop="status"
        label="状态"
        width="100"
      >
        <template slot-scope="scope">
          <el-tag :type="getStatusTagType(scope.row.status)" size="small">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      
      <el-table-column
        label="操作"
        width="150"
      >
        <template slot-scope="scope">
          <el-button 
            type="text" 
            size="small"
            @click="viewTransactionDetail(scope.row)"
          >
            查看详情
          </el-button>
          
          <el-button 
            v-if="scope.row.status === 'completed' && scope.row.transaction_type === 'payment'"
            type="text" 
            size="small"
            @click="requestRefund(scope.row)"
          >
            申请退款
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pagination.current"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pagination.size"
      layout="total, sizes, prev, pager, next, jumper"
      :total="pagination.total"
      style="margin-top: 20px; text-align: right;"
    />
    
    <!-- Transaction Detail Dialog -->
    <el-dialog
      title="交易详情"
      :visible.sync="showDetailDialog"
      width="600px"
    >
      <div v-if="selectedTransaction" class="transaction-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">
            {{ selectedTransaction.creem_order_id }}
          </el-descriptions-item>
          
          <el-descriptions-item label="支付ID">
            {{ selectedTransaction.creem_payment_id }}
          </el-descriptions-item>
          
          <el-descriptions-item label="交易时间">
            {{ formatDate(selectedTransaction.created_at) }}
          </el-descriptions-item>
          
          <el-descriptions-item label="交易类型">
            <el-tag :type="getTypeTagType(selectedTransaction.transaction_type)" size="small">
              {{ getTypeText(selectedTransaction.transaction_type) }}
            </el-tag>
          </el-descriptions-item>
          
          <el-descriptions-item label="套餐名称">
            {{ selectedTransaction.plan_name }}
          </el-descriptions-item>
          
          <el-descriptions-item label="金额">
            ¥{{ selectedTransaction.amount }}
          </el-descriptions-item>
          
          <el-descriptions-item label="支付方式">
            {{ selectedTransaction.payment_method }}
          </el-descriptions-item>
          
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusTagType(selectedTransaction.status)" size="small">
              {{ getStatusText(selectedTransaction.status) }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      
      <span slot="footer" class="dialog-footer">
        <el-button @click="showDetailDialog = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'PaymentHistory',
  data() {
    return {
      loading: false,
      transactions: [],
      filters: {
        status: '',
        type: '',
        dateRange: null
      },
      pagination: {
        current: 1,
        size: 20,
        total: 0
      },
      showDetailDialog: false,
      selectedTransaction: null
    }
  },
  mounted() {
    this.loadTransactions()
  },
  methods: {
    async loadTransactions() {
      this.loading = true
      try {
        const params = {
          limit: this.pagination.size,
          offset: (this.pagination.current - 1) * this.pagination.size
        }
        
        // Add filters
        if (this.filters.status) params.status = this.filters.status
        if (this.filters.type) params.type = this.filters.type
        if (this.filters.dateRange) {
          params.start_date = this.filters.dateRange[0]
          params.end_date = this.filters.dateRange[1]
        }
        
        const response = await axios.get('/api/payment/transactions', { params })
        
        this.transactions = response.data.transactions
        this.pagination.total = response.data.total
        
      } catch (error) {
        this.$message.error('加载交易记录失败')
        console.error('Error loading transactions:', error)
      } finally {
        this.loading = false
      }
    },
    
    searchTransactions() {
      this.pagination.current = 1
      this.loadTransactions()
    },
    
    resetFilters() {
      this.filters = {
        status: '',
        type: '',
        dateRange: null
      }
      this.pagination.current = 1
      this.loadTransactions()
    },
    
    handleSizeChange(val) {
      this.pagination.size = val
      this.pagination.current = 1
      this.loadTransactions()
    },
    
    handleCurrentChange(val) {
      this.pagination.current = val
      this.loadTransactions()
    },
    
    viewTransactionDetail(transaction) {
      this.selectedTransaction = transaction
      this.showDetailDialog = true
    },
    
    async requestRefund(transaction) {
      try {
        await this.$confirm('确定要申请退款吗？退款将在1-3个工作日内处理。', '申请退款', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        // This would call refund API
        this.$message.success('退款申请已提交，请耐心等待处理')
        
      } catch (error) {
        // User cancelled
      }
    },
    
    formatDate(dateString) {
      if (!dateString) return '-'
      return new Date(dateString).toLocaleString('zh-CN')
    },
    
    getStatusTagType(status) {
      const statusMap = {
        'pending': 'warning',
        'completed': 'success',
        'failed': 'danger',
        'cancelled': 'info',
        'refunded': 'warning'
      }
      return statusMap[status] || 'info'
    },
    
    getStatusText(status) {
      const statusMap = {
        'pending': '待支付',
        'completed': '已完成',
        'failed': '已失败',
        'cancelled': '已取消',
        'refunded': '已退款'
      }
      return statusMap[status] || '未知'
    },
    
    getTypeTagType(type) {
      const typeMap = {
        'payment': 'primary',
        'refund': 'warning',
        'renewal': 'success'
      }
      return typeMap[type] || 'info'
    },
    
    getTypeText(type) {
      const typeMap = {
        'payment': '支付',
        'refund': '退款',
        'renewal': '续费'
      }
      return typeMap[type] || '未知'
    }
  }
}
</script>

<style scoped>
.payment-history {
  padding: 20px;
}

.history-filters {
  background: white;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.negative-amount {
  color: #F56C6C;
}

.transaction-detail {
  margin: 20px 0;
}
</style>