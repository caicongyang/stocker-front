<template>
  <div class="platform-breakthrough-concept">
    <SideMenu />
    <div class="content">
      <div class="page-header">
        <h1>
          <i class="el-icon-trend-charts page-title-icon"></i>
          突破平台概念分析
        </h1>
        <div class="date-picker">
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
      
      <div class="stats-grid">
        <PlatformBreakthroughConceptStats
          title="突破平台概念统计 TOP20"
          :concepts="conceptStats"
          :tradeDate="selectedDate"
          class="concept-stats"
        />
      </div>
    </div>
  </div>
</template>

<script>
import SideMenu from '../../components/SideMenu.vue'
import PlatformBreakthroughConceptStats from '../../components/PlatformBreakthroughConceptStats.vue'
import axios from 'axios'
import config from '../../config/config'

export default {
  name: 'PlatformBreakthroughConcept',
  components: {
    SideMenu,
    PlatformBreakthroughConceptStats
  },
  data() {
    return {
      conceptStats: [],
      selectedDate: this.getDefaultDate(),
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
      this.fetchConceptStats()
    },
    
    async fetchConceptStats() {
      try {
        const response = await axios.get(`${config.apiBaseUrl}/platform-breakthrough-concept-stats/list`, {
          params: {
            tradeDate: this.selectedDate
          }
        })
        console.log('Platform Breakthrough Concept Stats Response:', response)
        
        if (response.data.code === 0) {
          this.conceptStats = response.data.data.map(item => ({
            conceptName: item.conceptName,
            stockCount: item.stockCount,
            avgVolumeRatio: Number(item.avgVolumeRatio),
            maxVolumeRatio: Number(item.maxVolumeRatio),
            avgIntervalDays: Number(item.avgIntervalDays),
            maxIntervalDays: item.maxIntervalDays,
            avgClosePrice: Number(item.avgClosePrice),
            tradeDate: new Date(item.tradeDate).toLocaleDateString()
          }))
        } else {
          console.error('获取突破平台概念统计数据失败:', {
            code: response.data.code,
            msg: response.data.message,
            fullResponse: response.data
          })
          this.$message.error('获取数据失败: ' + (response.data.message || '未知错误'))
        }
      } catch (error) {
        console.error('获取突破平台概念统计数据失败:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        })
        this.$message.error('网络请求失败，请稍后重试')
      }
    }
  },
  
  created() {
    this.fetchConceptStats()
  }
}
</script>

<style scoped>
.platform-breakthrough-concept {
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

.date-picker {
  display: flex;
  align-items: center;
}

/* Element UI 日期选择器样式覆盖 */
:deep(.el-date-editor.el-input) {
  width: 180px;
}

:deep(.el-input__inner) {
  border-radius: 4px;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.concept-stats {
  min-width: 0;
}

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
