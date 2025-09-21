<template>
  <div class="concept-detail">
    <SideMenu />
    <div class="content">
      <div class="header">
        <div class="title-section">
          <h2>{{ name }}</h2>
          <div class="subtitle">突破平台概念股票列表</div>
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
              ¥{{ formatPrice(scope.row.close) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="open"
            label="开盘价"
            min-width="100"
            align="right">
            <template slot-scope="scope">
              ¥{{ formatPrice(scope.row.open) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="high"
            label="最高价"
            min-width="100"
            align="right">
            <template slot-scope="scope">
              ¥{{ formatPrice(scope.row.high) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="low"
            label="最低价"
            min-width="100"
            align="right">
            <template slot-scope="scope">
              ¥{{ formatPrice(scope.row.low) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="volumeIncreaseRatio"
            label="成交量增幅"
            min-width="120"
            align="right">
            <template slot-scope="scope">
              <span :class="getVolumeColorClass(scope.row.volumeIncreaseRatio)">
                {{ formatVolumeRatio(scope.row.volumeIncreaseRatio) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            prop="intervalDays"
            label="突破天数"
            min-width="100"
            align="center">
            <template slot-scope="scope">
              {{ scope.row.intervalDays }}天
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
  name: 'PlatformBreakthroughConceptDetail',
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
      stockList: [],
      loading: false
    }
  },
  created() {
    this.fetchStockList()
  },
  watch: {
    name() {
      this.fetchStockList()
    },
    date() {
      this.fetchStockList()
    }
  },
  methods: {
    async fetchStockList() {
      this.loading = true
      try {
        const response = await axios.get(`${config.apiBaseUrl}/platform-breakthrough-concept-details/list`, {
          params: {
            tradeDate: this.date,
            conceptName: this.name
          }
        })
        
        console.log('Platform Breakthrough Concept Details Response:', response)
        
        if (response.data.code === 0) {
          this.stockList = response.data.data.map(item => ({
            id: item.id,
            stockCode: item.stockCode,
            stockName: this.getStockName(item.stockCode), // 需要从其他地方获取股票名称
            close: Number(item.close),
            open: Number(item.open),
            high: Number(item.high),
            low: Number(item.low),
            volumeIncreaseRatio: Number(item.volumeIncreaseRatio),
            intervalDays: item.intervalDays,
            tradeDate: item.tradeDate,
            conceptName: item.conceptName
          }))
        } else {
          console.error('获取突破平台概念详情数据失败:', {
            code: response.data.code,
            msg: response.data.message,
            fullResponse: response.data
          })
          this.$message.error('获取数据失败: ' + (response.data.message || '未知错误'))
        }
      } catch (error) {
        console.error('获取突破平台概念详情数据失败:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        })
        this.$message.error('网络请求失败，请稍后重试')
      } finally {
        this.loading = false
      }
    },
    
    getStockName(stockCode) {
      // 这里可以从本地缓存或其他API获取股票名称
      // 暂时返回股票代码
      return stockCode
    },
    
    formatDisplayDate(dateStr) {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    },
    
    formatDate(dateStr) {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return date.toLocaleDateString('zh-CN', {
        month: '2-digit',
        day: '2-digit'
      })
    },
    
    formatPrice(value) {
      const num = Number(value)
      if (isNaN(num)) return '0.00'
      return num.toFixed(2)
    },
    
    formatVolumeRatio(value) {
      const num = Number(value)
      if (isNaN(num)) return '0.00倍'
      return num.toFixed(2) + '倍'
    },
    
    getVolumeColorClass(value) {
      const num = Number(value)
      return {
        'volume-up': num > 1,
        'volume-down': num < 1,
        'volume-neutral': num === 1
      }
    },
    
    async addToFavorite(stock) {
      try {
        const response = await axios.post(`${config.apiBaseUrl}/favorite-stocks`, {
          stockCode: stock.stockCode,
          stockName: stock.stockName
        })
        
        if (response.data.code === 0) {
          this.$message.success(`${stock.stockName}(${stock.stockCode}) 已加入自选`)
        } else {
          this.$message.error('添加失败: ' + (response.data.message || '未知错误'))
        }
      } catch (error) {
        console.error('添加自选股票失败:', error)
        if (error.response?.status === 409) {
          this.$message.warning('该股票已在自选列表中')
        } else {
          this.$message.error('添加失败，请稍后重试')
        }
      }
    }
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
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: white;
  border-bottom: 1px solid #e6e6e6;
}

.title-section h2 {
  margin: 0 0 5px 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.subtitle {
  color: #909399;
  font-size: 14px;
}

.info-section {
  text-align: right;
}

.date, .total {
  color: #606266;
  font-size: 14px;
  margin-bottom: 5px;
}

.table-container {
  flex: 1;
  padding: 20px;
  overflow: hidden;
}

/* 成交量增幅颜色 */
.volume-up {
  color: #f56c6c;
  font-weight: 500;
}

.volume-down {
  color: #67c23a;
  font-weight: 500;
}

.volume-neutral {
  color: #909399;
}

/* Element UI 表格样式覆盖 */
:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table th) {
  background-color: #fafafa;
  color: #606266;
  font-weight: 600;
}

:deep(.el-table td) {
  border-bottom: 1px solid #f0f0f0;
}

:deep(.el-table__body tr:hover > td) {
  background-color: #f5f7fa;
}

:deep(.el-button--mini) {
  padding: 5px 10px;
  font-size: 12px;
}
</style>
