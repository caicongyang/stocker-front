<template>
  <div class="concept-detail">
    <SideMenu />
    <div class="content">
      <div class="header">
        <div class="title-section">
          <h2>{{ name }}</h2>
          <div class="subtitle">创新高概念股票列表</div>
        </div>
        <div class="info-section">
          <div class="date">统计日期：{{ formatDisplayDate(date) }}</div>
          <div class="total">共 {{ stockList.length }} 只股票</div>
        </div>
      </div>

      <!-- 桌面端表格 -->
      <div class="table-container hide-on-mobile">
        <el-table
          :data="stockList"
          style="width: 100%"
          :loading="loading"
          height="calc(100vh - 200px)"
          border
          :default-sort="{prop: 'gain', order: 'descending'}">
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
            prop="gain"
            label="当日涨幅"
            min-width="100"
            align="right"
            sortable>
            <template slot-scope="scope">
              <span :class="getColorClass(scope.row.gain)">
                {{ formatPercentage(scope.row.gain) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            prop="intervalDays"
            label="创新高间隔"
            min-width="120"
            align="center"
            sortable>
            <template slot-scope="scope">
              <span class="interval-badge" :class="getIntervalClass(scope.row.intervalDays)">
                {{ scope.row.intervalDays }}天
              </span>
            </template>
          </el-table-column>
          <el-table-column
            prop="previousHighsDate"
            label="前期高点日期"
            min-width="120"
            align="center"
            sortable>
            <template slot-scope="scope">
              {{ formatDate(scope.row.previousHighsDate) }}
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

      <!-- 移动端卡片列表 -->
      <div class="mobile-stock-list show-on-mobile">
        <div v-if="loading" class="mobile-loading">
          <i class="el-icon-loading"></i>
          <p>加载中...</p>
        </div>
        <div v-else-if="stockList.length === 0" class="mobile-empty">
          <i class="el-icon-document"></i>
          <p>暂无数据</p>
        </div>
        <div v-else>
          <div 
            v-for="(stock, index) in stockList" 
            :key="index" 
            class="mobile-stock-card">
            <div class="stock-card-header">
              <div class="stock-basic-info">
                <div class="stock-name">{{ stock.stockName }}</div>
                <div class="stock-code">{{ stock.stockCode }}</div>
              </div>
              <div class="stock-price-info">
                <div class="stock-price">¥{{ formatPrice(stock.close) }}</div>
                <div :class="['stock-change', getColorClass(stock.gain)]">
                  {{ formatPercentage(stock.gain) }}
                </div>
              </div>
            </div>
            <div class="stock-card-body">
              <div class="stock-data-row">
                <span class="label">创新高间隔</span>
                <span :class="['interval-badge', getIntervalClass(stock.intervalDays)]">
                  {{ stock.intervalDays }}天
                </span>
              </div>
              <div class="stock-data-row">
                <span class="label">前期高点日期</span>
                <span class="value">{{ formatDate(stock.previousHighsDate) }}</span>
              </div>
              <div class="stock-data-row">
                <span class="label">成交量</span>
                <span class="value">{{ formatVolume(stock.volume) }}</span>
              </div>
              <div class="stock-data-row">
                <span class="label">1日净流入</span>
                <span :class="['value', getColorClass(stock.netAmount1d)]">
                  {{ formatAmount(stock.netAmount1d) }}
                </span>
              </div>
              <div class="stock-data-row">
                <span class="label">3日净流入</span>
                <span :class="['value', getColorClass(stock.netAmount3d)]">
                  {{ formatAmount(stock.netAmount3d) }}
                </span>
              </div>
              <div class="stock-data-row">
                <span class="label">5日净流入</span>
                <span :class="['value', getColorClass(stock.netAmount5d)]">
                  {{ formatAmount(stock.netAmount5d) }}
                </span>
              </div>
              <div class="stock-data-row">
                <span class="label">交易日期</span>
                <span class="value">{{ formatDate(stock.tradeDate) }}</span>
              </div>
            </div>
            <div class="stock-card-footer">
              <el-button 
                size="small" 
                type="primary" 
                @click="addToFavorite(stock)"
                style="width: 100%;">
                加入自选
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SideMenu from '../../components/SideMenu.vue'
import axios from 'axios'
import config from '../../config/config'

export default {
  name: 'HigherConceptDetail',
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
      if (isNaN(num)) return '0.00%'
      return num > 0 ? `+${num.toFixed(2)}%` : `${num.toFixed(2)}%`
    },
    getColorClass(value) {
      const num = Number(value)
      return {
        'up': num > 0,
        'down': num < 0
      }
    },
    getIntervalClass(days) {
      const num = Number(days)
      if (num <= 30) return 'interval-excellent'
      if (num <= 60) return 'interval-good'
      if (num <= 120) return 'interval-normal'
      return 'interval-long'
    },
    formatDate(date) {
      if (!date) return '-'
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
        const response = await axios.get(`${config.apiBaseUrl}/higher-concept-details/list`, {
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
            gain: item.gain,
            intervalDays: item.intervalDays,
            previousHighsDate: item.previousHighsDate,
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
          change: stock.gain,
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

/* 间隔天数标签样式 */
.interval-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.interval-excellent {
  background-color: #f0f9ff;
  color: #1d4ed8;
  border: 1px solid #93c5fd;
}

.interval-good {
  background-color: #f0fdf4;
  color: #16a34a;
  border: 1px solid #86efac;
}

.interval-normal {
  background-color: #fffbeb;
  color: #d97706;
  border: 1px solid #fcd34d;
}

.interval-long {
  background-color: #fef2f2;
  color: #dc2626;
  border: 1px solid #fca5a5;
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

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .concept-detail {
    flex-direction: column;
  }

  .content {
    padding: 68px 12px 12px 12px;
    overflow-y: auto;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
    padding: 16px;
    margin-bottom: 12px;
  }

  .title-section h2 {
    font-size: 20px;
  }

  .info-section {
    align-items: flex-start;
    margin-top: 12px;
    width: 100%;
  }

  .table-container {
    padding: 0;
    background: transparent;
    box-shadow: none;
  }

  .mobile-stock-list {
    display: block;
  }

  .mobile-stock-card {
    background: white;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  .stock-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding-bottom: 12px;
    border-bottom: 1px solid #f0f0f0;
    margin-bottom: 12px;
  }

  .stock-basic-info {
    flex: 1;
  }

  .stock-name {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 4px;
  }

  .stock-code {
    font-size: 13px;
    color: #909399;
  }

  .stock-price-info {
    text-align: right;
  }

  .stock-price {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 4px;
  }

  .stock-change {
    font-size: 14px;
    font-weight: 500;
  }

  .stock-card-body {
    margin-bottom: 12px;
  }

  .stock-data-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #f5f7fa;
  }

  .stock-data-row:last-child {
    border-bottom: none;
  }

  .stock-data-row .label {
    color: #909399;
    font-size: 13px;
  }

  .stock-data-row .value {
    color: #303133;
    font-size: 14px;
    font-weight: 500;
    text-align: right;
  }

  .stock-data-row .interval-badge {
    font-size: 12px;
    padding: 4px 8px;
  }

  .stock-card-footer {
    padding-top: 12px;
    border-top: 1px solid #f0f0f0;
  }

  .mobile-loading,
  .mobile-empty {
    text-align: center;
    padding: 40px 20px;
    color: #909399;
  }

  .mobile-loading i,
  .mobile-empty i {
    font-size: 48px;
    margin-bottom: 16px;
    display: block;
  }

  .mobile-loading p,
  .mobile-empty p {
    font-size: 14px;
    margin: 8px 0;
  }
}
</style>
