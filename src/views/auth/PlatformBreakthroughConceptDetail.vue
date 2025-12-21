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
            prop="netAmount1d"
            label="1日净流入"
            min-width="120"
            align="right">
            <template slot-scope="scope">
              <span :class="getColorClass(scope.row.netAmount1d)">
                {{ formatAmount(scope.row.netAmount1d) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            prop="largeNetAmount1d"
            label="1日大单净流入"
            min-width="130"
            align="right">
            <template slot-scope="scope">
              <span :class="getColorClass(scope.row.largeNetAmount1d)">
                {{ formatAmount(scope.row.largeNetAmount1d) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            prop="superLargeNetAmount1d"
            label="1日超大单净流入"
            min-width="140"
            align="right">
            <template slot-scope="scope">
              <span :class="getColorClass(scope.row.superLargeNetAmount1d)">
                {{ formatAmount(scope.row.superLargeNetAmount1d) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            prop="netAmount3d"
            label="3日净流入"
            min-width="120"
            align="right">
            <template slot-scope="scope">
              <span :class="getColorClass(scope.row.netAmount3d)">
                {{ formatAmount(scope.row.netAmount3d) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            prop="largeNetAmount3d"
            label="3日大单净流入"
            min-width="130"
            align="right">
            <template slot-scope="scope">
              <span :class="getColorClass(scope.row.largeNetAmount3d)">
                {{ formatAmount(scope.row.largeNetAmount3d) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            prop="superLargeNetAmount3d"
            label="3日超大单净流入"
            min-width="140"
            align="right">
            <template slot-scope="scope">
              <span :class="getColorClass(scope.row.superLargeNetAmount3d)">
                {{ formatAmount(scope.row.superLargeNetAmount3d) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            prop="netAmount5d"
            label="5日净流入"
            min-width="120"
            align="right">
            <template slot-scope="scope">
              <span :class="getColorClass(scope.row.netAmount5d)">
                {{ formatAmount(scope.row.netAmount5d) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            prop="largeNetAmount5d"
            label="5日大单净流入"
            min-width="130"
            align="right">
            <template slot-scope="scope">
              <span :class="getColorClass(scope.row.largeNetAmount5d)">
                {{ formatAmount(scope.row.largeNetAmount5d) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            prop="superLargeNetAmount5d"
            label="5日超大单净流入"
            min-width="140"
            align="right">
            <template slot-scope="scope">
              <span :class="getColorClass(scope.row.superLargeNetAmount5d)">
                {{ formatAmount(scope.row.superLargeNetAmount5d) }}
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
            stockName: item.stockName,
            close: Number(item.close),
            open: Number(item.open),
            high: Number(item.high),
            low: Number(item.low),
            volumeIncreaseRatio: Number(item.volumeIncreaseRatio),
            intervalDays: item.intervalDays,
            netAmount1d: item.netAmount1d,
            largeNetAmount1d: item.largeNetAmount1d,
            superLargeNetAmount1d: item.superLargeNetAmount1d,
            netAmount3d: item.netAmount3d,
            largeNetAmount3d: item.largeNetAmount3d,
            superLargeNetAmount3d: item.superLargeNetAmount3d,
            netAmount5d: item.netAmount5d,
            largeNetAmount5d: item.largeNetAmount5d,
            superLargeNetAmount5d: item.superLargeNetAmount5d,
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
    
    getColorClass(value) {
      const num = Number(value)
      return {
        'up': num > 0,
        'down': num < 0
      }
    },
    
    formatAmount(value) {
      if (value === null || value === undefined) return '-'
      const num = Number(value)
      if (isNaN(num)) return '-'
      
      // 转换为万元
      const wan = num / 10000
      
      if (Math.abs(wan) >= 10000) {
        // 大于1亿，显示为亿
        return (wan / 10000).toFixed(2) + '亿'
      } else if (Math.abs(wan) >= 1) {
        // 大于1万，显示为万
        return wan.toFixed(2) + '万'
      } else {
        // 小于1万，显示原值
        return num.toFixed(2)
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
