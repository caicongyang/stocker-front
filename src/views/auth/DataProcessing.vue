<template>
  <div class="data-processing">
    <SideMenu />
    <div class="content">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span class="card-title">
            <i class="el-icon-data-analysis"></i>
            数据处理管理中心
          </span>
        </div>

        <!-- 日期选择器和操作区 -->
        <div class="control-section">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-date-picker
                v-model="selectedDate"
                type="date"
                placeholder="选择日期"
                format="yyyy-MM-dd"
                value-format="yyyy-MM-dd"
                style="width: 100%"
              />
            </el-col>
            <el-col :span="16">
              <el-button type="primary" @click="triggerFullProcess" :loading="processing">
                <i class="el-icon-refresh"></i>
                完整数据处理
              </el-button>
              <el-button type="success" @click="checkDataIntegrity" :loading="checking">
                <i class="el-icon-document-checked"></i>
                检查数据完整性
              </el-button>
              <el-button type="warning" @click="runJobNow" :loading="runningJob">
                <i class="el-icon-video-play"></i>
                立即执行定时任务
              </el-button>
            </el-col>
          </el-row>
        </div>

        <!-- 定时任务设置 -->
        <div class="scheduler-section">
          <el-card shadow="hover">
            <div slot="header">
              <i class="el-icon-time"></i>
              定时任务配置
            </div>
            <el-row :gutter="20" type="flex" align="middle">
              <el-col :span="6">
                <el-time-picker
                  v-model="scheduleTime"
                  format="HH:mm"
                  value-format="HH:mm"
                  placeholder="选择时间"
                  style="width: 100%"
                />
              </el-col>
              <el-col :span="6">
                <el-button type="primary" @click="setScheduleTime" :loading="settingSchedule">
                  <i class="el-icon-check"></i>
                  设置定时任务
                </el-button>
              </el-col>
              <el-col :span="12">
                <el-alert
                  title="当前定时任务默认为每天 18:30 执行"
                  type="info"
                  :closable="false"
                  show-icon
                />
              </el-col>
            </el-row>
          </el-card>
        </div>

        <!-- 数据完整性检查结果 -->
        <div v-if="integrityResult" class="integrity-section">
          <el-card shadow="hover">
            <div slot="header">
              <i class="el-icon-document-checked"></i>
              数据完整性检查结果 - {{ integrityResult.date }}
            </div>
            <el-row :gutter="20">
              <el-col :span="8">
                <div class="stat-box" :class="{'stat-success': integrityResult.all_complete, 'stat-warning': !integrityResult.all_complete}">
                  <div class="stat-icon">
                    <i :class="integrityResult.all_complete ? 'el-icon-success' : 'el-icon-warning'"></i>
                  </div>
                  <div class="stat-info">
                    <div class="stat-label">整体状态</div>
                    <div class="stat-value">{{ integrityResult.all_complete ? '完整' : '不完整' }}</div>
                  </div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="stat-box stat-info-box">
                  <div class="stat-icon">
                    <i class="el-icon-document"></i>
                  </div>
                  <div class="stat-info">
                    <div class="stat-label">总步骤数</div>
                    <div class="stat-value">{{ Object.keys(integrityResult.steps).length }}</div>
                  </div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="stat-box stat-info-box">
                  <div class="stat-icon">
                    <i class="el-icon-finished"></i>
                  </div>
                  <div class="stat-info">
                    <div class="stat-label">已完成步骤</div>
                    <div class="stat-value">{{ getCompletedStepsCount() }}</div>
                  </div>
                </div>
              </el-col>
            </el-row>

            <!-- 详细步骤列表 -->
            <el-divider></el-divider>
            <div class="steps-grid">
              <div 
                v-for="(status, stepName) in integrityResult.steps" 
                :key="stepName"
                class="step-card"
                :class="{'step-complete': status, 'step-incomplete': !status}"
              >
                <div class="step-header">
                  <i :class="status ? 'el-icon-circle-check' : 'el-icon-circle-close'"></i>
                  <span class="step-name">{{ getStepLabel(stepName) }}</span>
                </div>
                <div class="step-footer">
                  <el-tag :type="status ? 'success' : 'danger'" size="small">
                    {{ status ? '已完成' : '未完成' }}
                  </el-tag>
                  <el-button 
                    v-if="!status" 
                    size="mini" 
                    type="primary"
                    @click="retryStep(stepName, integrityResult.date)"
                  >
                    重试
                  </el-button>
                </div>
              </div>
            </div>
          </el-card>
        </div>

        <!-- 单步重试操作面板 -->
        <div class="retry-section">
          <el-card shadow="hover">
            <div slot="header">
              <i class="el-icon-refresh-right"></i>
              单步数据处理重试
            </div>
            <div class="retry-grid">
              <el-button 
                v-for="step in retrySteps" 
                :key="step.key"
                :type="step.type"
                @click="retryStep(step.key, selectedDate)"
                :loading="retryingSteps[step.key]"
              >
                <i :class="step.icon"></i>
                {{ step.label }}
              </el-button>
            </div>
          </el-card>
        </div>

        <!-- 处理日志 -->
        <div class="log-section">
          <el-card shadow="hover">
            <div slot="header">
              <i class="el-icon-document"></i>
              处理日志
              <el-button 
                style="float: right; padding: 3px 0" 
                type="text"
                @click="clearLogs"
              >
                清空日志
              </el-button>
            </div>
            <div class="log-content">
              <div 
                v-for="(log, index) in logs" 
                :key="index"
                class="log-item"
                :class="log.type"
              >
                <span class="log-time">{{ log.time }}</span>
                <span class="log-message">{{ log.message }}</span>
              </div>
              <div v-if="logs.length === 0" class="empty-logs">
                <i class="el-icon-document"></i>
                <p>暂无日志</p>
              </div>
            </div>
          </el-card>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import config from '@/config/config'
import SideMenu from '../../components/SideMenu.vue'

export default {
  name: 'DataProcessing',
  components: {
    SideMenu
  },
  
  data() {
    return {
      selectedDate: new Date().toISOString().split('T')[0],
      scheduleTime: '18:30',
      processing: false,
      checking: false,
      runningJob: false,
      settingSchedule: false,
      integrityResult: null,
      retryingSteps: {},
      logs: [],
      
      // 重试步骤配置
      retrySteps: [
        { key: 'tx-tick-data', label: '腾讯分笔数据', type: 'primary', icon: 'el-icon-tickets' },
        { key: 'stock-data', label: '股票历史数据', type: 'success', icon: 'el-icon-s-data' },
        { key: 'etf-data', label: 'ETF历史数据', type: 'success', icon: 'el-icon-s-finance' },
        { key: 'stock-volume', label: '股票成交量', type: 'warning', icon: 'el-icon-data-line' },
        { key: 'etf-volume', label: 'ETF成交量', type: 'warning', icon: 'el-icon-data-analysis' },
        { key: 'stock-limit', label: '涨停数据', type: 'danger', icon: 'el-icon-top' },
        { key: 'concept-data', label: '概念数据', type: 'info', icon: 'el-icon-box' },
        { key: 'volume-concepts', label: '成交量概念', type: 'primary', icon: 'el-icon-pie-chart' },
        { key: 'limit-concepts', label: '涨停概念', type: 'danger', icon: 'el-icon-star-on' },
        { key: 'higher-stocks', label: '创新高股票', type: 'success', icon: 'el-icon-top-right' },
        { key: 'higher-concepts', label: '创新高概念', type: 'success', icon: 'el-icon-trophy' },
        { key: 'platform-concepts', label: '突破平台概念', type: 'warning', icon: 'el-icon-top-left' },
        { key: 'net-inflow', label: '净流入数据', type: 'info', icon: 'el-icon-money' }
      ],
      
      // 步骤名称映射
      stepLabels: {
        'tx_tick_data': '腾讯分笔数据',
        'stock_data': '股票历史数据',
        'etf_data': 'ETF历史数据',
        'stock_volume': '股票成交量',
        'etf_volume': 'ETF成交量',
        'stock_limit': '涨停数据',
        'concept_data': '概念数据',
        'volume_concepts': '成交量概念',
        'limit_concepts': '涨停概念',
        'higher_stocks': '创新高股票',
        'higher_concepts': '创新高概念',
        'platform_concepts': '突破平台概念',
        'net_inflow': '净流入数据'
      }
    }
  },
  
  methods: {
    // 完整数据处理
    async triggerFullProcess() {
      if (!this.selectedDate) {
        this.$message.warning('请选择日期')
        return
      }
      
      this.processing = true
      this.addLog('info', `开始处理 ${this.selectedDate} 的完整数据`)
      
      try {
        const response = await axios.post(
          `${config.aiApiBaseUrl}/process-daily-data/${this.selectedDate}`,
          {},
          {
            headers: {
              'accept': 'application/json'
            }
          }
        )
        
        if (response.data && response.data.status === 'processing') {
          this.$message.success(response.data.message)
          this.addLog('success', response.data.message)
        }
      } catch (error) {
        console.error('触发数据处理失败:', error)
        this.$message.error('触发数据处理失败: ' + (error.response?.data?.detail || error.message))
        this.addLog('error', '触发数据处理失败: ' + (error.response?.data?.detail || error.message))
      } finally {
        this.processing = false
      }
    },
    
    // 检查数据完整性
    async checkDataIntegrity() {
      if (!this.selectedDate) {
        this.$message.warning('请选择日期')
        return
      }
      
      this.checking = true
      this.addLog('info', `检查 ${this.selectedDate} 的数据完整性`)
      
      try {
        const response = await axios.get(
          `${config.aiApiBaseUrl}/check-data-integrity/${this.selectedDate}`,
          {
            headers: {
              'accept': 'application/json'
            }
          }
        )
        
        if (response.data) {
          this.integrityResult = response.data
          const status = response.data.all_complete ? '完整' : '不完整'
          this.$message.success(`数据完整性检查完成: ${status}`)
          this.addLog('success', `数据完整性检查完成: ${status}`)
        }
      } catch (error) {
        console.error('检查数据完整性失败:', error)
        this.$message.error('检查数据完整性失败: ' + (error.response?.data?.detail || error.message))
        this.addLog('error', '检查数据完整性失败: ' + (error.response?.data?.detail || error.message))
      } finally {
        this.checking = false
      }
    },
    
    // 立即执行定时任务
    async runJobNow() {
      this.runningJob = true
      this.addLog('info', '立即执行定时任务')
      
      try {
        const response = await axios.post(
          `${config.aiApiBaseUrl}/scheduler/run-now`,
          {},
          {
            headers: {
              'accept': 'application/json'
            }
          }
        )
        
        if (response.data && response.data.status === 'running') {
          this.$message.success(response.data.message)
          this.addLog('success', response.data.message)
        }
      } catch (error) {
        console.error('执行任务失败:', error)
        this.$message.error('执行任务失败: ' + (error.response?.data?.detail || error.message))
        this.addLog('error', '执行任务失败: ' + (error.response?.data?.detail || error.message))
      } finally {
        this.runningJob = false
      }
    },
    
    // 设置定时任务时间
    async setScheduleTime() {
      if (!this.scheduleTime) {
        this.$message.warning('请选择时间')
        return
      }
      
      this.settingSchedule = true
      this.addLog('info', `设置定时任务时间: ${this.scheduleTime}`)
      
      try {
        const response = await axios.post(
          `${config.aiApiBaseUrl}/scheduler/set-time`,
          {
            time: this.scheduleTime
          },
          {
            headers: {
              'accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }
        )
        
        if (response.data && response.data.status === 'success') {
          this.$message.success(response.data.message)
          this.addLog('success', response.data.message)
        }
      } catch (error) {
        console.error('设置定时任务失败:', error)
        this.$message.error('设置定时任务失败: ' + (error.response?.data?.detail || error.message))
        this.addLog('error', '设置定时任务失败: ' + (error.response?.data?.detail || error.message))
      } finally {
        this.settingSchedule = false
      }
    },
    
    // 重试单个步骤
    async retryStep(stepKey, date) {
      if (!date) {
        this.$message.warning('请选择日期')
        return
      }
      
      this.$set(this.retryingSteps, stepKey, true)
      this.addLog('info', `重试 ${this.getStepLabel(stepKey)}: ${date}`)
      
      try {
        const response = await axios.post(
          `${config.aiApiBaseUrl}/retry/${stepKey}/${date}`,
          {},
          {
            headers: {
              'accept': 'application/json'
            }
          }
        )
        
        if (response.data && response.data.status === 'processing') {
          this.$message.success(response.data.message)
          this.addLog('success', response.data.message)
        }
      } catch (error) {
        console.error('重试失败:', error)
        this.$message.error('重试失败: ' + (error.response?.data?.detail || error.message))
        this.addLog('error', '重试失败: ' + (error.response?.data?.detail || error.message))
      } finally {
        this.$set(this.retryingSteps, stepKey, false)
      }
    },
    
    // 获取步骤标签
    getStepLabel(stepName) {
      return this.stepLabels[stepName] || stepName
    },
    
    // 获取已完成步骤数量
    getCompletedStepsCount() {
      if (!this.integrityResult || !this.integrityResult.steps) return 0
      return Object.values(this.integrityResult.steps).filter(status => status).length
    },
    
    // 添加日志
    addLog(type, message) {
      const now = new Date()
      const time = now.toLocaleTimeString('zh-CN')
      this.logs.unshift({ type, message, time })
      
      // 限制日志数量
      if (this.logs.length > 100) {
        this.logs.pop()
      }
    },
    
    // 清空日志
    clearLogs() {
      this.logs = []
      this.$message.success('日志已清空')
    }
  }
}
</script>

<style scoped>
.data-processing {
  display: flex;
  height: 100vh;
  background-color: #f5f7fa;
}

.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.card-title {
  font-size: 18px;
  font-weight: bold;
}

.control-section {
  margin-bottom: 20px;
}

.scheduler-section {
  margin-bottom: 20px;
}

.integrity-section {
  margin-bottom: 20px;
}

.stat-box {
  display: flex;
  align-items: center;
  padding: 20px;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.stat-box.stat-success {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  box-shadow: 0 4px 12px rgba(17, 153, 142, 0.3);
}

.stat-box.stat-warning {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  box-shadow: 0 4px 12px rgba(240, 147, 251, 0.3);
}

.stat-box.stat-info-box {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3);
}

.stat-icon {
  font-size: 2.5rem;
  margin-right: 15px;
  opacity: 0.9;
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: bold;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.step-card {
  padding: 15px;
  border-radius: 8px;
  border: 2px solid #e6e6e6;
  transition: all 0.3s ease;
}

.step-card.step-complete {
  border-color: #67c23a;
  background-color: #f0f9ff;
}

.step-card.step-incomplete {
  border-color: #f56c6c;
  background-color: #fef0f0;
}

.step-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.step-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.step-header i {
  font-size: 20px;
  margin-right: 8px;
}

.step-complete .step-header i {
  color: #67c23a;
}

.step-incomplete .step-header i {
  color: #f56c6c;
}

.step-name {
  font-weight: 500;
  font-size: 14px;
}

.step-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.retry-section {
  margin-bottom: 20px;
}

.retry-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
}

.retry-grid .el-button {
  width: 100%;
}

.log-section {
  margin-bottom: 20px;
}

.log-content {
  max-height: 400px;
  overflow-y: auto;
  background-color: #fafafa;
  padding: 15px;
  border-radius: 4px;
}

.log-item {
  padding: 8px 12px;
  margin-bottom: 8px;
  border-radius: 4px;
  border-left: 4px solid #409eff;
  background-color: white;
  transition: all 0.3s ease;
}

.log-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.log-item.success {
  border-left-color: #67c23a;
}

.log-item.error {
  border-left-color: #f56c6c;
}

.log-item.warning {
  border-left-color: #e6a23c;
}

.log-item.info {
  border-left-color: #909399;
}

.log-time {
  color: #909399;
  font-size: 12px;
  margin-right: 10px;
}

.log-message {
  color: #333;
  font-size: 14px;
}

.empty-logs {
  text-align: center;
  padding: 40px;
  color: #909399;
}

.empty-logs i {
  font-size: 3rem;
  margin-bottom: 10px;
  opacity: 0.5;
}

@media (max-width: 768px) {
  .content {
    padding: 15px;
  }
  
  .steps-grid,
  .retry-grid {
    grid-template-columns: 1fr;
  }
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .data-processing {
    flex-direction: column;
  }

  .content {
    padding: 68px 12px 12px 12px;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
  }

  .header h2 {
    font-size: 20px;
  }

  .processing-container {
    padding: 12px;
  }
}
</style>

