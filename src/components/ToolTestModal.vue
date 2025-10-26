<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>🧪 测试工具: {{ tool.display_name || tool.name }}</h2>
        <button @click="closeModal" class="close-btn">&times;</button>
      </div>
      
      <div class="modal-body">
        <div v-if="loading.schema" class="loading-state">
          <div class="spinner"></div>
          <p>加载工具参数...</p>
        </div>
        
        <div v-else class="test-content">
          <!-- 参数输入表单 -->
          <div class="parameters-form">
            <h3>输入参数</h3>
            
            <div v-if="!toolSchema || !toolSchema.schema || Object.keys(toolSchema.schema.properties || {}).length === 0" class="no-params">
              <p>此工具无需参数，可以直接执行测试。</p>
            </div>
            
            <div v-else class="form-grid">
              <div 
                v-for="(param, paramName) in toolSchema.schema.properties" 
                :key="paramName"
                class="form-group"
              >
                <label :class="{ required: isRequired(paramName) }">
                  {{ paramName }}
                  <span v-if="isRequired(paramName)" class="required-mark">*</span>
                </label>
                
                <div class="param-info">
                  <span class="param-type">{{ param.type }}</span>
                  <span v-if="param.description" class="param-description">{{ param.description }}</span>
                </div>
                
                <!-- 字符串类型输入 -->
                <input 
                  v-if="param.type === 'string' && !param.enum"
                  v-model="formData[paramName]"
                  type="text"
                  class="form-control"
                  :placeholder="param.default ? `默认: ${param.default}` : '请输入值'"
                  :pattern="param.pattern"
                />
                
                <!-- 枚举选择 -->
                <select 
                  v-else-if="param.enum"
                  v-model="formData[paramName]"
                  class="form-control"
                >
                  <option value="">请选择...</option>
                  <option v-for="option in param.enum" :key="option" :value="option">
                    {{ option }}
                  </option>
                </select>
                
                <!-- 数字类型输入 -->
                <input 
                  v-else-if="param.type === 'number' || param.type === 'integer'"
                  v-model.number="formData[paramName]"
                  :type="param.type === 'integer' ? 'number' : 'number'"
                  :step="param.type === 'integer' ? '1' : 'any'"
                  class="form-control"
                  :placeholder="param.default ? `默认: ${param.default}` : '请输入数值'"
                  :min="param.minimum"
                  :max="param.maximum"
                />
                
                <!-- 布尔类型输入 -->
                <label v-else-if="param.type === 'boolean'" class="checkbox-label">
                  <input 
                    v-model="formData[paramName]"
                    type="checkbox"
                  />
                  启用此选项
                </label>
                
                <!-- 数组类型输入 -->
                <textarea 
                  v-else-if="param.type === 'array'"
                  v-model="formData[paramName]"
                  class="form-control"
                  placeholder="请输入JSON数组，如: [1, 2, 3]"
                  rows="3"
                ></textarea>
                
                <!-- 对象类型输入 -->
                <textarea 
                  v-else-if="param.type === 'object'"
                  v-model="formData[paramName]"
                  class="form-control"
                  placeholder="请输入JSON对象，如: {&quot;key&quot;: &quot;value&quot;}"
                  rows="4"
                ></textarea>
                
                <!-- 其他类型 -->
                <input 
                  v-else
                  v-model="formData[paramName]"
                  type="text"
                  class="form-control"
                  :placeholder="param.default ? `默认: ${param.default}` : '请输入值'"
                />
                
                <!-- 参数提示信息 -->
                <div v-if="param.minimum !== undefined || param.maximum !== undefined" class="param-hint">
                  范围: {{ param.minimum !== undefined ? param.minimum : '-∞' }} ~ {{ param.maximum !== undefined ? param.maximum : '+∞' }}
                </div>
                
                <div v-if="param.pattern" class="param-hint">
                  格式: <code>{{ param.pattern }}</code>
                </div>
              </div>
            </div>
            
            <!-- 预设示例 -->
            <div v-if="toolSchema && toolSchema.examples && toolSchema.examples.length > 0" class="examples-section">
              <h4>快速填入示例</h4>
              <div class="examples-buttons">
                <button 
                  v-for="(example, index) in toolSchema.examples" 
                  :key="index"
                  @click="loadExample(example)"
                  class="btn btn-outline btn-sm"
                >
                  {{ example.description || `示例 ${index + 1}` }}
                </button>
              </div>
            </div>
          </div>
          
          <!-- 测试结果 -->
          <div class="test-results">
            <div class="results-header">
              <h3>测试结果</h3>
              <div class="test-actions">
                <button @click="runTest" :disabled="testing" class="btn btn-primary">
                  <span v-if="testing">🔄 测试中...</span>
                  <span v-else>▶️ 运行测试</span>
                </button>
                <button @click="clearResults" :disabled="!hasResults" class="btn btn-outline btn-sm">
                  🗑️ 清空结果
                </button>
              </div>
            </div>
            
            <div v-if="!hasResults && !testing" class="empty-results">
              <div class="empty-icon">🧪</div>
              <p>点击"运行测试"按钮开始测试工具</p>
            </div>
            
            <div v-if="testing" class="testing-state">
              <div class="spinner"></div>
              <p>正在执行测试，请稍候...</p>
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: testProgress + '%' }"></div>
              </div>
            </div>
            
            <div v-if="hasResults" class="result-content">
              <!-- 测试状态 -->
              <div class="result-status" :class="lastResult.success ? 'success' : 'error'">
                <div class="status-icon">
                  {{ lastResult.success ? '✅' : '❌' }}
                </div>
                <div class="status-text">
                  <h4>{{ lastResult.success ? '测试成功' : '测试失败' }}</h4>
                  <p>执行时间: {{ lastResult.executionTime }}ms</p>
                </div>
              </div>
              
              <!-- 输入参数 -->
              <div class="result-section">
                <h5>输入参数</h5>
                <pre class="code-block"><code>{{ JSON.stringify(lastResult.input, null, 2) }}</code></pre>
              </div>
              
              <!-- 输出结果 -->
              <div class="result-section">
                <h5>输出结果</h5>
                <pre class="code-block" :class="lastResult.success ? 'success' : 'error'">
                  <code>{{ JSON.stringify(lastResult.output, null, 2) }}</code>
                </pre>
              </div>
              
              <!-- 错误信息 -->
              <div v-if="!lastResult.success && lastResult.error" class="result-section">
                <h5>错误信息</h5>
                <div class="error-message">
                  {{ lastResult.error }}
                </div>
              </div>
              
              <!-- 结果分析 -->
              <div v-if="lastResult.success && lastResult.analysis" class="result-section">
                <h5>结果分析</h5>
                <div class="analysis-content">
                  <div v-if="lastResult.analysis.dataCount" class="analysis-item">
                    <span class="analysis-label">数据条数:</span>
                    <span class="analysis-value">{{ lastResult.analysis.dataCount }}</span>
                  </div>
                  <div v-if="lastResult.analysis.dataType" class="analysis-item">
                    <span class="analysis-label">数据类型:</span>
                    <span class="analysis-value">{{ lastResult.analysis.dataType }}</span>
                  </div>
                  <div v-if="lastResult.analysis.summary" class="analysis-item">
                    <span class="analysis-label">结果摘要:</span>
                    <span class="analysis-value">{{ lastResult.analysis.summary }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 测试历史 -->
          <div v-if="testHistory.length > 1" class="test-history">
            <h4>测试历史</h4>
            <div class="history-list">
              <div 
                v-for="(result, index) in testHistory.slice().reverse()" 
                :key="index"
                class="history-item"
                :class="result.success ? 'success' : 'error'"
                @click="viewHistoryResult(result)"
              >
                <div class="history-status">
                  {{ result.success ? '✅' : '❌' }}
                </div>
                <div class="history-info">
                  <div class="history-time">{{ formatTime(result.timestamp) }}</div>
                  <div class="history-duration">{{ result.executionTime }}ms</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button @click="exportResults" :disabled="!hasResults" class="btn btn-secondary">
          📤 导出结果
        </button>
        <button @click="runTest" :disabled="testing" class="btn btn-primary">
          {{ testing ? '🔄 测试中...' : '🧪 重新测试' }}
        </button>
        <button @click="closeModal" class="btn btn-outline">
          关闭
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import config from '@/config/config'

export default {
  name: 'ToolTestModal',
  props: {
    tool: {
      type: Object,
      required: true
    }
  },
  
  data() {
    return {
      toolSchema: null,
      formData: {},
      testing: false,
      testProgress: 0,
      testHistory: [],
      lastResult: null,
      
      loading: {
        schema: false
      }
    }
  },
  
  computed: {
    hasResults() {
      return this.lastResult !== null
    }
  },
  
  async mounted() {
    await this.loadToolSchema()
    this.initializeFormData()
  },
  
  methods: {
    async loadToolSchema() {
      this.loading.schema = true
      try {
        const response = await axios.get(`${config.aiApiBaseUrl}/api/tools/${this.tool.name}/schema`)
        if (response.data.success) {
          this.toolSchema = response.data.data
        }
      } catch (error) {
        console.error('加载工具Schema失败:', error)
        this.$message.error('加载工具参数失败')
      } finally {
        this.loading.schema = false
      }
    },
    
    initializeFormData() {
      if (!this.toolSchema || !this.toolSchema.schema) return
      
      const properties = this.toolSchema.schema.properties || {}
      
      // 初始化表单数据，使用默认值
      Object.keys(properties).forEach(paramName => {
        const param = properties[paramName]
        
        if (param.default !== undefined) {
          this.formData[paramName] = param.default
        } else if (param.type === 'boolean') {
          this.formData[paramName] = false
        } else if (param.type === 'array') {
          this.formData[paramName] = '[]'
        } else if (param.type === 'object') {
          this.formData[paramName] = '{}'
        } else {
          this.formData[paramName] = ''
        }
      })
    },
    
    isRequired(paramName) {
      if (!this.toolSchema || !this.toolSchema.schema) return false
      const required = this.toolSchema.schema.required || []
      return required.includes(paramName)
    },
    
    loadExample(example) {
      if (!example.input) return
      
      // 清空现有数据
      this.initializeFormData()
      
      // 加载示例数据
      Object.keys(example.input).forEach(key => {
        if (key in this.formData) {
          const value = example.input[key]
          
          // 处理不同类型的数据
          if (typeof value === 'object') {
            this.formData[key] = JSON.stringify(value, null, 2)
          } else {
            this.formData[key] = value
          }
        }
      })
      
      this.$message.success('已加载示例数据')
    },
    
    validateFormData() {
      if (!this.toolSchema || !this.toolSchema.schema) return { valid: true, params: {} }
      
      const properties = this.toolSchema.schema.properties || {}
      const required = this.toolSchema.schema.required || []
      const params = {}
      const errors = []
      
      // 验证每个参数
      Object.keys(properties).forEach(paramName => {
        const param = properties[paramName]
        const value = this.formData[paramName]
        
        // 检查必需参数
        if (required.includes(paramName) && (value === '' || value === null || value === undefined)) {
          errors.push(`参数 "${paramName}" 是必需的`)
          return
        }
        
        // 跳过空值的可选参数
        if (!required.includes(paramName) && (value === '' || value === null || value === undefined)) {
          return
        }
        
        // 类型转换和验证
        try {
          if (param.type === 'array') {
            params[paramName] = typeof value === 'string' ? JSON.parse(value) : value
          } else if (param.type === 'object') {
            params[paramName] = typeof value === 'string' ? JSON.parse(value) : value
          } else if (param.type === 'number' || param.type === 'integer') {
            const numValue = Number(value)
            if (isNaN(numValue)) {
              errors.push(`参数 "${paramName}" 必须是数字`)
              return
            }
            
            if (param.minimum !== undefined && numValue < param.minimum) {
              errors.push(`参数 "${paramName}" 不能小于 ${param.minimum}`)
              return
            }
            
            if (param.maximum !== undefined && numValue > param.maximum) {
              errors.push(`参数 "${paramName}" 不能大于 ${param.maximum}`)
              return
            }
            
            params[paramName] = param.type === 'integer' ? Math.floor(numValue) : numValue
          } else if (param.type === 'boolean') {
            params[paramName] = Boolean(value)
          } else {
            params[paramName] = String(value)
            
            // 验证字符串格式
            if (param.pattern && !new RegExp(param.pattern).test(params[paramName])) {
              errors.push(`参数 "${paramName}" 格式不正确`)
              return
            }
          }
        } catch (e) {
          errors.push(`参数 "${paramName}" 格式错误: ${e.message}`)
        }
      })
      
      return {
        valid: errors.length === 0,
        params,
        errors
      }
    },
    
    async runTest() {
      // 验证表单数据
      const validation = this.validateFormData()
      
      if (!validation.valid) {
        this.$message.error('参数验证失败: ' + validation.errors.join(', '))
        return
      }
      
      this.testing = true
      this.testProgress = 0
      
      // 模拟进度
      const progressInterval = setInterval(() => {
        if (this.testProgress < 90) {
          this.testProgress += Math.random() * 20
        }
      }, 200)
      
      const startTime = Date.now()
      
      try {
        const response = await axios.post(`${config.aiApiBaseUrl}/api/tools/${this.tool.name}/test`, validation.params)
        
        const executionTime = Date.now() - startTime
        this.testProgress = 100
        
        const result = {
          timestamp: new Date(),
          input: validation.params,
          output: response.data.data,
          success: response.data.success,
          error: response.data.success ? null : response.data.message,
          executionTime,
          analysis: this.analyzeResult(response.data.data)
        }
        
        this.lastResult = result
        this.testHistory.push(result)
        
        if (response.data.success) {
          this.$message.success('测试执行成功')
        } else {
          this.$message.error('测试执行失败')
        }
        
      } catch (error) {
        const executionTime = Date.now() - startTime
        this.testProgress = 100
        
        const result = {
          timestamp: new Date(),
          input: validation.params,
          output: null,
          success: false,
          error: error.message || '测试执行出错',
          executionTime,
          analysis: null
        }
        
        this.lastResult = result
        this.testHistory.push(result)
        
        console.error('测试执行失败:', error)
        this.$message.error('测试执行失败: ' + error.message)
        
      } finally {
        clearInterval(progressInterval)
        this.testing = false
        this.testProgress = 0
      }
    },
    
    analyzeResult(result) {
      if (!result || typeof result !== 'object') return null
      
      const analysis = {}
      
      // 分析数据数量
      if (result.data && Array.isArray(result.data)) {
        analysis.dataCount = result.data.length
        analysis.dataType = 'array'
      } else if (result.data && typeof result.data === 'object') {
        analysis.dataCount = Object.keys(result.data).length
        analysis.dataType = 'object'
      }
      
      // 生成摘要
      if (result.success) {
        if (analysis.dataCount !== undefined) {
          analysis.summary = `成功返回 ${analysis.dataCount} 条数据`
        } else {
          analysis.summary = '执行成功'
        }
      }
      
      return Object.keys(analysis).length > 0 ? analysis : null
    },
    
    clearResults() {
      this.lastResult = null
      this.testHistory = []
    },
    
    viewHistoryResult(result) {
      this.lastResult = result
    },
    
    exportResults() {
      if (!this.hasResults) return
      
      const exportData = {
        tool: {
          name: this.tool.name,
          display_name: this.tool.display_name,
          version: this.tool.version
        },
        test_results: this.testHistory,
        export_time: new Date().toISOString()
      }
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `${this.tool.name}_test_results_${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      
      URL.revokeObjectURL(url)
      
      this.$message.success('测试结果已导出')
    },
    
    formatTime(timestamp) {
      return timestamp.toLocaleTimeString('zh-CN')
    },
    
    closeModal() {
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 1000px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  flex: 1;
  overflow: auto;
  padding: 20px;
}

.test-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  height: 100%;
}

.parameters-form h3,
.test-results h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 18px;
}

.no-params {
  text-align: center;
  padding: 40px 20px;
  color: #6c757d;
  background: #f8f9fa;
  border-radius: 8px;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 500;
  color: #2c3e50;
  font-size: 14px;
}

.form-group label.required {
  color: #dc3545;
}

.required-mark {
  color: #dc3545;
  margin-left: 2px;
}

.param-info {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 5px;
}

.param-type {
  background: #e3f2fd;
  color: #1976d2;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.param-description {
  color: #6c757d;
  font-size: 12px;
}

.form-control {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.form-control:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: normal !important;
  color: #2c3e50 !important;
  cursor: pointer;
}

.param-hint {
  font-size: 12px;
  color: #6c757d;
  margin-top: -3px;
}

.examples-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.examples-section h4 {
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 14px;
}

.examples-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.test-actions {
  display: flex;
  gap: 8px;
}

.empty-results {
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

.testing-state {
  text-align: center;
  padding: 40px 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
  margin-top: 15px;
}

.progress-fill {
  height: 100%;
  background: #007bff;
  transition: width 0.3s ease;
}

.result-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.result-status {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border-radius: 8px;
}

.result-status.success {
  background: #d4edda;
  border: 1px solid #c3e6cb;
}

.result-status.error {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
}

.status-icon {
  font-size: 2rem;
}

.status-text h4 {
  margin: 0 0 5px 0;
  color: #2c3e50;
}

.status-text p {
  margin: 0;
  color: #6c757d;
  font-size: 14px;
}

.result-section {
  margin-bottom: 20px;
}

.result-section h5 {
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 14px;
  font-weight: 600;
}

.code-block {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 15px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  overflow-x: auto;
  margin: 0;
}

.code-block.success {
  background: #f8fff8;
  border-color: #c3e6cb;
}

.code-block.error {
  background: #fff8f8;
  border-color: #f5c6cb;
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 10px 15px;
  border-radius: 6px;
  font-size: 14px;
}

.analysis-content {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
}

.analysis-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.analysis-item:last-child {
  margin-bottom: 0;
}

.analysis-label {
  color: #6c757d;
  font-weight: 500;
}

.analysis-value {
  color: #2c3e50;
}

.test-history {
  grid-column: 1 / -1;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.test-history h4 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 16px;
}

.history-list {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 10px;
}

.history-item {
  min-width: 120px;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.history-item.success {
  background: #d4edda;
  border: 1px solid #c3e6cb;
}

.history-item.error {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
}

.history-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.history-status {
  font-size: 1.2rem;
}

.history-info {
  text-align: center;
}

.history-time {
  font-size: 11px;
  color: #6c757d;
}

.history-duration {
  font-size: 10px;
  color: #6c757d;
  font-weight: 500;
}

.loading-state {
  text-align: center;
  padding: 40px 20px;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #545b62;
}

.btn-outline {
  background: transparent;
  color: #6c757d;
  border: 1px solid #dee2e6;
}

.btn-outline:hover {
  background: #f8f9fa;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

@media (max-width: 768px) {
  .modal-overlay {
    padding: 10px;
  }
  
  .modal-content {
    max-height: 95vh;
  }
  
  .test-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .results-header {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  
  .test-actions {
    justify-content: center;
  }
  
  .modal-footer {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .examples-buttons {
    justify-content: center;
  }
}
</style>
