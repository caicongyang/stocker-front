<template>
  <div class="concept-detail">
    <SideMenu />
    <div class="content">
      <div class="header">
        <div class="title-section">
          <h2>{{ name }}</h2>
          <div class="subtitle">涨停概念股票列表</div>
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
            fixed
            sortable>
          </el-table-column>
          <el-table-column
            prop="stockName"
            label="股票名称"
            width="140"
            fixed
            sortable>
          </el-table-column>
          <el-table-column
            prop="close"
            label="收盘价"
            min-width="100"
            align="right"
            sortable>
            <template slot-scope="scope">
              {{ formatPrice(scope.row.close) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="pctChg"
            label="涨跌幅"
            min-width="100"
            align="right"
            sortable>
            <template slot-scope="scope">
              <span :class="getColorClass(scope.row.pctChg)">
                {{ formatPercentage(scope.row.pctChg) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            prop="volume"
            label="成交量"
            min-width="120"
            align="right"
            sortable>
            <template slot-scope="scope">
              {{ formatVolume(scope.row.volume) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="netAmount1d"
            label="1日净流入"
            min-width="120"
            align="right"
            sortable>
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
            align="right"
            sortable>
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
            align="right"
            sortable>
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
            align="right"
            sortable>
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
            align="right"
            sortable>
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
            align="right"
            sortable>
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
            align="right"
            sortable>
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
            align="right"
            sortable>
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
            align="right"
            sortable>
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
            align="center"
            sortable>
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
  name: 'LimitUpConceptDetail',
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
    formatVolume(volume) {
      if (!volume) return '0'
      if (volume >= 100000000) {
        return (volume / 100000000).toFixed(1) + '亿手'
      }
      return (volume / 10000).toFixed(1) + '万手'
    },
    formatDisplayDate(dateStr) {
      return new Date(dateStr).toLocaleDateString()
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
    async fetchData() {
      this.loading = true
      try {
        const response = await axios.get(`${config.apiBaseUrl}/limit-up-concept-details/list`, {
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
            volume: item.volume,
            netAmount1d: item.netAmount1d,
            largeNetAmount1d: item.largeNetAmount1d,
            superLargeNetAmount1d: item.superLargeNetAmount1d,
            netAmount3d: item.netAmount3d,
            largeNetAmount3d: item.largeNetAmount3d,
            superLargeNetAmount3d: item.superLargeNetAmount3d,
            netAmount5d: item.netAmount5d,
            largeNetAmount5d: item.largeNetAmount5d,
            superLargeNetAmount5d: item.superLargeNetAmount5d,
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