<template>
  <div class="stock-net-inflow-list">
    <SideMenu />
    <div class="content">
      <div class="page-header">
        <h1>
          <i class="el-icon-s-finance page-title-icon"></i>
          股票净流入分析
        </h1>
        <div class="header-controls">
          <el-input
            v-model="searchStockCode"
            placeholder="输入股票代码搜索"
            prefix-icon="el-icon-search"
            clearable
            class="search-input"
            @clear="handleSearch"
            @keyup.enter.native="handleSearch">
          </el-input>
          <el-date-picker
            v-model="selectedDate"
            type="date"
            placeholder="选择日期"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            :clearable="false"
            :picker-options="pickerOptions"
            @change="handleDateChange">
          </el-date-picker>
        </div>
      </div>
      
      <div class="data-container">
        <el-card shadow="hover">
          <div slot="header" class="card-header">
            <span class="card-title">
              <i class="el-icon-data-line"></i>
              股票净流入数据 ({{ selectedDate }})
            </span>
            <el-tag :type="stockNetInflowData.length > 0 ? 'success' : 'info'" size="small">
              共 {{ stockNetInflowData.length }} 条记录
            </el-tag>
          </div>
          
          <el-table
            :data="stockNetInflowData"
            style="width: 100%"
            v-loading="loading"
            :default-sort="{prop: 'netAmount1d', order: 'descending'}"
            height="calc(100vh - 250px)">
            
            <el-table-column
              prop="stockCode"
              label="股票代码"
              width="120"
              fixed="left">
            </el-table-column>
            
            <el-table-column
              prop="stockName"
              label="股票名称"
              width="120"
              fixed="left">
            </el-table-column>
            
            <el-table-column
              prop="tradeDate"
              label="交易日期"
              width="120"
              :formatter="formatDate">
            </el-table-column>
            
            <el-table-column label="1天数据" align="center">
              <el-table-column
                prop="netAmount1d"
                label="净流入额"
                width="120"
                sortable>
                <template slot-scope="scope">
                  <span :class="getAmountClass(scope.row.netAmount1d)">
                    {{ formatMoneyValue(scope.row.netAmount1d) }}
                  </span>
                </template>
              </el-table-column>
              
              <el-table-column
                prop="largeNetAmount1d"
                label="大单净流入"
                width="120"
                sortable>
                <template slot-scope="scope">
                  <span :class="getAmountClass(scope.row.largeNetAmount1d)">
                    {{ formatMoneyValue(scope.row.largeNetAmount1d) }}
                  </span>
                </template>
              </el-table-column>
              
              <el-table-column
                prop="superLargeNetAmount1d"
                label="超大单净流入"
                width="140"
                sortable>
                <template slot-scope="scope">
                  <span :class="getAmountClass(scope.row.superLargeNetAmount1d)">
                    {{ formatMoneyValue(scope.row.superLargeNetAmount1d) }}
                  </span>
                </template>
              </el-table-column>
            </el-table-column>
            
            <el-table-column label="3天累计" align="center">
              <el-table-column
                prop="netAmount3d"
                label="净流入额"
                width="120"
                sortable>
                <template slot-scope="scope">
                  <span :class="getAmountClass(scope.row.netAmount3d)">
                    {{ formatMoneyValue(scope.row.netAmount3d) }}
                  </span>
                </template>
              </el-table-column>
              
              <el-table-column
                prop="largeNetAmount3d"
                label="大单净流入"
                width="120"
                sortable>
                <template slot-scope="scope">
                  <span :class="getAmountClass(scope.row.largeNetAmount3d)">
                    {{ formatMoneyValue(scope.row.largeNetAmount3d) }}
                  </span>
                </template>
              </el-table-column>
              
              <el-table-column
                prop="superLargeNetAmount3d"
                label="超大单净流入"
                width="140"
                sortable>
                <template slot-scope="scope">
                  <span :class="getAmountClass(scope.row.superLargeNetAmount3d)">
                    {{ formatMoneyValue(scope.row.superLargeNetAmount3d) }}
                  </span>
                </template>
              </el-table-column>
            </el-table-column>
            
            <el-table-column label="5天累计" align="center">
              <el-table-column
                prop="netAmount5d"
                label="净流入额"
                width="120"
                sortable>
                <template slot-scope="scope">
                  <span :class="getAmountClass(scope.row.netAmount5d)">
                    {{ formatMoneyValue(scope.row.netAmount5d) }}
                  </span>
                </template>
              </el-table-column>
              
              <el-table-column
                prop="largeNetAmount5d"
                label="大单净流入"
                width="120"
                sortable>
                <template slot-scope="scope">
                  <span :class="getAmountClass(scope.row.largeNetAmount5d)">
                    {{ formatMoneyValue(scope.row.largeNetAmount5d) }}
                  </span>
                </template>
              </el-table-column>
              
              <el-table-column
                prop="superLargeNetAmount5d"
                label="超大单净流入"
                width="140"
                sortable>
                <template slot-scope="scope">
                  <span :class="getAmountClass(scope.row.superLargeNetAmount5d)">
                    {{ formatMoneyValue(scope.row.superLargeNetAmount5d) }}
                  </span>
                </template>
              </el-table-column>
            </el-table-column>
            
          </el-table>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script>
import SideMenu from '../../components/SideMenu.vue'
import axios from 'axios'
import config from '../../config/config'

export default {
  name: 'StockNetInflowList',
  components: {
    SideMenu
  },
  data() {
    return {
      stockNetInflowData: [],
      selectedDate: this.getDefaultDate(),
      searchStockCode: '',
      loading: false,
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now()
        }
      }
    }
  },
  methods: {
    getDefaultDate() {
      const today = new Date()
      const dayOfWeek = today.getDay() // 0 = 周日, 1 = 周一, ..., 6 = 周六
      
      // 如果是周六(6)或周日(0)，选择上一个周五
      if (dayOfWeek === 0) { // 周日
        today.setDate(today.getDate() - 2) // 回到周五
      } else if (dayOfWeek === 6) { // 周六
        today.setDate(today.getDate() - 1) // 回到周五
      }
      
      return today.toISOString().split('T')[0]
    },
    
    handleDateChange() {
      this.fetchStockNetInflowData()
    },
    
    handleSearch() {
      this.fetchStockNetInflowData()
    },
    
    async fetchStockNetInflowData() {
      this.loading = true
      try {
        const params = {
          tradeDate: this.selectedDate
        }
        
        // 如果有搜索股票代码，添加到参数中
        if (this.searchStockCode && this.searchStockCode.trim()) {
          params.stockCode = this.searchStockCode.trim()
        }
        
        // 使用全局 axios，token 会自动添加到请求头
        const response = await axios.get(`${config.apiBaseUrl}/stock-net-inflow/list`, {
          params
        })
        
        console.log('Stock Net Inflow Response:', response)
        
        if (response.data.code === 0) {
          this.stockNetInflowData = response.data.data || []
          if (this.stockNetInflowData.length === 0) {
            this.$message.info('该日期暂无数据')
          }
        } else {
          console.error('获取股票净流入数据失败:', {
            code: response.data.code,
            msg: response.data.message,
            fullResponse: response.data
          })
          this.$message.error('获取数据失败: ' + (response.data.message || '未知错误'))
        }
      } catch (error) {
        console.error('获取股票净流入数据失败:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        })
        this.$message.error('网络请求失败，请稍后重试')
      } finally {
        this.loading = false
      }
    },
    
    formatDate(row, column, cellValue) {
      if (!cellValue) return '-'
      const date = new Date(cellValue)
      return date.toLocaleDateString('zh-CN')
    },
    
    // 用于 el-table formatter 属性（接收3个参数）
    formatMoney(row, column, cellValue) {
      if (cellValue === null || cellValue === undefined) return '-'
      const value = Number(cellValue)
      if (isNaN(value)) return '-'
      
      const absValue = Math.abs(value)
      
      // 大于等于1亿，显示为亿
      if (absValue >= 100000000) {
        const valueInYi = value / 100000000
        return valueInYi.toLocaleString('zh-CN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }) + '亿'
      }
      
      // 小于1亿，显示为万
      const valueInWan = value / 10000
      return valueInWan.toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }) + '万'
    },
    
    // 用于模板中直接调用（接收1个参数）
    formatMoneyValue(value) {
      if (value === null || value === undefined) return '-'
      const numValue = Number(value)
      if (isNaN(numValue)) return '-'
      
      const absValue = Math.abs(numValue)
      
      // 大于等于1亿，显示为亿
      if (absValue >= 100000000) {
        const valueInYi = numValue / 100000000
        return valueInYi.toLocaleString('zh-CN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }) + '亿'
      }
      
      // 小于1亿，显示为万
      const valueInWan = numValue / 10000
      return valueInWan.toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }) + '万'
    },
    
    getAmountClass(value) {
      if (value === null || value === undefined) return ''
      const numValue = Number(value)
      if (numValue > 0) return 'positive-amount'
      if (numValue < 0) return 'negative-amount'
      return ''
    }
  },
  created() {
    this.fetchStockNetInflowData()
  }
}
</script>

<style scoped>
.stock-net-inflow-list {
  display: flex;
  height: 100vh;
  background-color: #f5f7fa;
}

.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.page-header h1 {
  margin: 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.page-title-icon {
  margin-right: 12px;
  color: #409eff;
  font-size: 26px;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-input {
  width: 220px;
}

:deep(.el-date-editor.el-input) {
  width: 180px;
}

:deep(.el-input__inner) {
  border-radius: 4px;
}

.data-container {
  max-width: 100%;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
}

.positive-amount {
  color: #f56c6c;
  font-weight: 600;
}

.negative-amount {
  color: #67c23a;
  font-weight: 600;
}

:deep(.el-table) {
  font-size: 13px;
}

:deep(.el-table th) {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 600;
}

:deep(.el-table td) {
  padding: 8px 0;
}

:deep(.el-table__header-wrapper) {
  border-radius: 4px 4px 0 0;
}

@media (max-width: 1200px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .header-controls {
    width: 100%;
    flex-wrap: wrap;
  }
  
  .search-input {
    flex: 1;
    min-width: 200px;
  }
}
</style>

