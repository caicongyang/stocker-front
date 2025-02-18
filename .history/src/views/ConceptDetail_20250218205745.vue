<template>
  <div class="concept-detail">
    <SideMenu />
    <div class="content">
      <div class="header">
        <h2>{{ name }} - 成交量异动股票列表</h2>
        <div class="date">{{ currentDate }}</div>
      </div>

      <el-table
        :data="stockList"
        style="width: 100%"
        :loading="loading">
        <el-table-column
          prop="stockCode"
          label="股票代码"
          width="120">
        </el-table-column>
        <el-table-column
          prop="stockName"
          label="股票名称"
          width="120">
        </el-table-column>
        <el-table-column
          prop="close"
          label="收盘价"
          width="120">
          <template slot-scope="scope">
            {{ formatPrice(scope.row.close) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="pctChg"
          label="涨跌幅"
          width="120">
          <template slot-scope="scope">
            <span :class="getColorClass(scope.row.pctChg)">
              {{ formatPercentage(scope.row.pctChg) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          prop="volume"
          label="成交量"
          width="120">
          <template slot-scope="scope">
            {{ formatVolume(scope.row.volume) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="amount"
          label="成交额"
          width="120">
          <template slot-scope="scope">
            {{ formatAmount(scope.row.amount) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="tradeDate"
          label="交易日期"
          width="120">
          <template slot-scope="scope">
            {{ formatDate(scope.row.tradeDate) }}
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import SideMenu from '../components/SideMenu.vue'
import axios from 'axios'
import config from '../config/config'

export default {
  name: 'ConceptDetail',
  components: {
    SideMenu
  },
  props: {
    name: {  // 修改为 name，与路由参数匹配
      type: String,
      required: true
    }
  },
  data() {
    return {
      loading: false,
      stockList: [],
      currentPage: 1,
      pageSize: 20,
      total: 0,
      currentDate: new Date().toLocaleDateString()
    }
  },
  methods: {
    formatPrice(price) {
      return Number(price).toFixed(2)
    },
    formatPercentage(value) {
      const num = Number(value)
      return num > 0 ? `+${num.toFixed(2)}%` : `${num.toFixed(2)}%`
    },
    getColorClass(value) {
      const num = Number(value)
      return {
        'up': num > 0,
        'down': num < 0
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString()
    },
    formatVolume(volume) {
      if (!volume) return '0'
      if (volume >= 100000000) {
        return (volume / 100000000).toFixed(1) + '亿手'
      }
      return (volume / 10000).toFixed(1) + '万手'
    },
    formatAmount(amount) {
      if (!amount) return '0'
      if (amount >= 100000000) {
        return (amount / 100000000).toFixed(1) + '亿'
      }
      return (amount / 10000).toFixed(1) + '万'
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.fetchData()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.fetchData()
    },
    async fetchData() {
      this.loading = true
      try {
        const response = await axios.get(`${config.apiBaseUrl}/concept-volume-details/list`, {
          params: {
            conceptName: this.name,
            pageNum: this.currentPage - 1,  // 后端从0开始计数
            pageSize: this.pageSize
          }
        })
        
        if (response.data.code === 0) {
          this.stockList = response.data.data.list
          this.total = response.data.data.total
        } else {
          this.$message.error('获取数据失败：' + response.data.message)
        }
      } catch (error) {
        console.error('API Error:', error)
        this.$message.error('获取数据失败：' + error.message)
      } finally {
        this.loading = false
      }
    }
  },
  created() {
    this.fetchData()
  }
}
</script>

<style scoped>
.concept-detail {
  display: flex;
  height: 100vh;
  background-color: #f5f7fa;
}

.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
  color: #303133;
}

.date {
  color: #909399;
}

.up {
  color: #f56c6c;
}

.down {
  color: #67c23a;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>