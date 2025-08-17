<template>
  <div class="concept-detail">
    <SideMenu />
    <div class="content">
      <div class="header">
        <div class="title-section">
          <h2>{{ name }}</h2>
          <div class="subtitle">成交量异动股票列表</div>
        </div>
        <div class="info-section">
          <div class="date">统计日期：{{ formatDisplayDate(date) }}</div>
          <div class="total">共 {{ stockList.length }} 只股票</div>
        </div>
      </div>

      <div class="table-container">
        <el-table
          :data="stockList"
          style="width: 100%"
          :loading="loading"
          height="calc(100vh - 200px)"
          border>
          <el-table-column
            prop="stockCode"
            label="股票代码"
            width="120"
            fixed>
          </el-table-column>
          <el-table-column
            prop="stockName"
            label="股票名称"
            width="140"
            fixed>
          </el-table-column>
          <el-table-column
            prop="close"
            label="收盘价"
            min-width="100"
            align="right">
            <template slot-scope="scope">
              {{ formatPrice(scope.row.close) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="pctChg"
            label="涨跌幅"
            min-width="100"
            align="right">
            <template slot-scope="scope">
              <span :class="getColorClass(scope.row.pctChg)">
                {{ formatPercentage(scope.row.pctChg) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            prop="volume"
            label="成交量增长"
            min-width="120"
            align="right">
            <template slot-scope="scope">
              <span :class="getColorClass(scope.row.volume)">
                {{ formatMultiple(scope.row.volume) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            prop="tradeDate"
            label="交易日期"
            min-width="120"
            align="center">
            <template slot-scope="scope">
              {{ formatDate(scope.row.tradeDate) }}
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            width="100"
            fixed="right">
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="primary"
                @click="addToFavorite(scope.row)">
                加入自选
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import SideMenu from '../../components/SideMenu.vue'
import axios from 'axios'
import config from '../../config/config'

export default {
  name: 'ConceptDetail',
  components: {
    SideMenu
  },
  props: {
    name: {
      type: String,
      required: true
    },
    date: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      loading: false,
      stockList: [],
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
    formatMultiple(value) {
      const num = Number(value)
      if (isNaN(num)) return '0.00'
      return num > 0 ? `${num.toFixed(2)}倍` : `${num.toFixed(2)}倍`
    },
    formatDisplayDate(dateStr) {
      return new Date(dateStr).toLocaleDateString()
    },
    async fetchData() {
      this.loading = true
      try {
        const response = await axios.get(`${config.apiBaseUrl}/concept-volume-details/list`, {
          params: {
            conceptName: this.name,
            tradeDate: this.date
          }
        })
        
        if (response.data.code === 0) {
          this.stockList = response.data.data.map(item => ({
            stockCode: item.stockCode,
            stockName: item.stockName,
            close: item.close,
            pctChg: item.pctChg,
            volume: item.volumeIncreaseRatio,
            tradeDate: item.tradeDate
          }))
        } else {
          this.$message.error('获取数据失败：' + response.data.message)
        }
      } catch (error) {
        console.error('API Error:', error)
        this.$message.error('获取数据失败：' + error.message)
      } finally {
        this.loading = false
      }
    },
    async addToFavorite(stock) {
      try {
        const { data: res } = await axios.post('/api/favorite-stock', {
          symbol: stock.stockCode,
          name: stock.stockName,
          type: 'stock',
          price: stock.close,
          change: stock.pctChg,
          volume: stock.volume
        })
        
        if (res.code === 0) {
          this.$message.success('添加自选成功')
        } else {
          this.$message.error(res.msg || '添加失败')
        }
      } catch (error) {
        console.error('添加失败:', error)
        this.$message.error('添加失败')
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
  padding: 24px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
}

.title-section {
  display: flex;
  flex-direction: column;
}

.title-section h2 {
  margin: 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.subtitle {
  color: #909399;
  margin-top: 8px;
  font-size: 14px;
}

.info-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.date, .total {
  color: #606266;
  font-size: 14px;
}

.table-container {
  flex: 1;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.up {
  color: #f56c6c;
  font-weight: 500;
}

.down {
  color: #67c23a;
  font-weight: 500;
}

/* Element UI 表格样式覆盖 */
:deep(.el-table) {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: transparent;
}

:deep(.el-table th) {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 600;
}

:deep(.el-table--border) {
  border-radius: 4px;
  overflow: hidden;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background: #fafafa;
}

:deep(.el-table__body tr:hover td) {
  background-color: #f5f7fa !important;
}

:deep(.el-table__body-wrapper) {
  flex: 1;
  overflow-y: auto;
}

/* 调整表头样式 */
:deep(.el-table__header-wrapper) {
  background-color: #f5f7fa;
}
</style>