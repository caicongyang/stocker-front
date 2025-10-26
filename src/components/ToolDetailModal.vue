<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>{{ tool.display_name || tool.name }}</h2>
        <button @click="closeModal" class="close-btn">&times;</button>
      </div>
      
      <div class="modal-body">
        <div class="tool-detail-tabs">
          <div class="tabs">
            <button 
              v-for="tab in tabs" 
              :key="tab.key"
              @click="activeTab = tab.key"
              class="tab"
              :class="{ active: activeTab === tab.key }"
            >
              {{ tab.icon }} {{ tab.label }}
            </button>
          </div>
          
          <div class="tab-content">
            <!-- 基本信息 -->
            <div v-if="activeTab === 'basic'" class="tab-pane">
              <div class="info-grid">
                <div class="info-item">
                  <label>工具名称</label>
                  <span>{{ tool.name }}</span>
                </div>
                <div class="info-item">
                  <label>显示名称</label>
                  <span>{{ tool.display_name || tool.name }}</span>
                </div>
                <div class="info-item">
                  <label>分类</label>
                  <span class="category-badge">
                    {{ getCategoryIcon(tool.category) }} {{ getCategoryLabel(tool.category) }}
                  </span>
                </div>
                <div class="info-item">
                  <label>状态</label>
                  <span class="status-badge" :class="tool.is_enabled ? 'enabled' : 'disabled'">
                    {{ tool.is_enabled ? '✅ 已启用' : '❌ 已禁用' }}
                  </span>
                </div>
                <div class="info-item">
                  <label>版本</label>
                  <span>{{ tool.version || '1.0.0' }}</span>
                </div>
                <div class="info-item">
                  <label>作者</label>
                  <span>{{ tool.author || 'system' }}</span>
                </div>
                <div class="info-item">
                  <label>创建时间</label>
                  <span>{{ formatDateTime(tool.created_at) }}</span>
                </div>
                <div class="info-item">
                  <label>更新时间</label>
                  <span>{{ formatDateTime(tool.updated_at) }}</span>
                </div>
              </div>
              
              <div class="description-section">
                <h4>工具描述</h4>
                <p>{{ tool.description || '暂无描述' }}</p>
              </div>
              
              <div v-if="toolMetadata && toolMetadata.tags && toolMetadata.tags.length > 0" class="tags-section">
                <h4>标签</h4>
                <div class="tags">
                  <span v-for="tag in toolMetadata.tags" :key="tag" class="tag">{{ tag }}</span>
                </div>
              </div>
            </div>
            
            <!-- 参数信息 -->
            <div v-if="activeTab === 'parameters'" class="tab-pane">
              <div v-if="loading.schema" class="loading-state">
                <div class="spinner"></div>
                <p>加载参数信息...</p>
              </div>
              
              <div v-else-if="toolSchema && toolSchema.schema" class="parameters-section">
                <div v-if="Object.keys(toolSchema.schema.properties || {}).length === 0" class="empty-state">
                  <p>此工具无需参数</p>
                </div>
                
                <div v-else class="parameters-list">
                  <div 
                    v-for="(param, paramName) in toolSchema.schema.properties" 
                    :key="paramName"
                    class="parameter-item"
                  >
                    <div class="param-header">
                      <h5>{{ paramName }}</h5>
                      <div class="param-meta">
                        <span class="param-type">{{ param.type }}</span>
                        <span 
                          v-if="toolSchema.schema.required && toolSchema.schema.required.includes(paramName)"
                          class="required-badge"
                        >
                          必需
                        </span>
                        <span v-else class="optional-badge">可选</span>
                      </div>
                    </div>
                    
                    <p class="param-description">{{ param.description || '无描述' }}</p>
                    
                    <div class="param-details">
                      <div v-if="param.default !== undefined" class="param-detail">
                        <span class="detail-label">默认值:</span>
                        <code>{{ param.default }}</code>
                      </div>
                      
                      <div v-if="param.enum" class="param-detail">
                        <span class="detail-label">可选值:</span>
                        <div class="enum-values">
                          <code v-for="value in param.enum" :key="value" class="enum-value">{{ value }}</code>
                        </div>
                      </div>
                      
                      <div v-if="param.minimum !== undefined || param.maximum !== undefined" class="param-detail">
                        <span class="detail-label">范围:</span>
                        <span>
                          {{ param.minimum !== undefined ? param.minimum : '-∞' }} ~ 
                          {{ param.maximum !== undefined ? param.maximum : '+∞' }}
                        </span>
                      </div>
                      
                      <div v-if="param.pattern" class="param-detail">
                        <span class="detail-label">格式:</span>
                        <code>{{ param.pattern }}</code>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- 使用示例 -->
                <div v-if="toolSchema.examples && toolSchema.examples.length > 0" class="examples-section">
                  <h4>使用示例</h4>
                  <div class="examples">
                    <div v-for="(example, index) in toolSchema.examples" :key="index" class="example-item">
                      <h5>{{ example.description || `示例 ${index + 1}` }}</h5>
                      <div class="example-code">
                        <div class="code-section">
                          <h6>输入参数:</h6>
                          <pre><code>{{ JSON.stringify(example.input, null, 2) }}</code></pre>
                        </div>
                        <div class="code-section">
                          <h6>期望输出:</h6>
                          <pre><code>{{ JSON.stringify(example.output, null, 2) }}</code></pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 使用统计 -->
            <div v-if="activeTab === 'usage'" class="tab-pane">
              <div v-if="loading.usage" class="loading-state">
                <div class="spinner"></div>
                <p>加载使用统计...</p>
              </div>
              
              <div v-else class="usage-stats">
                <div class="stats-grid">
                  <div class="stat-card">
                    <div class="stat-icon">📊</div>
                    <div class="stat-content">
                      <h3>{{ usageStats.usage_count || 0 }}</h3>
                      <p>总使用次数</p>
                    </div>
                  </div>
                  
                  <div class="stat-card">
                    <div class="stat-icon">❌</div>
                    <div class="stat-content">
                      <h3>{{ usageStats.error_count || 0 }}</h3>
                      <p>错误次数</p>
                    </div>
                  </div>
                  
                  <div class="stat-card">
                    <div class="stat-icon">✅</div>
                    <div class="stat-content">
                      <h3>{{ usageStats.success_rate.toFixed(1) }}%</h3>
                      <p>成功率</p>
                    </div>
                  </div>
                  
                  <div class="stat-card">
                    <div class="stat-icon">🕒</div>
                    <div class="stat-content">
                      <h3>{{ formatDate(usageStats.last_used_at) }}</h3>
                      <p>最后使用</p>
                    </div>
                  </div>
                </div>
                
                <!-- 成功率图表 -->
                <div class="success-rate-chart">
                  <h4>成功率趋势</h4>
                  <div class="chart-placeholder">
                    <div class="rate-bar">
                      <div 
                        class="rate-fill" 
                        :style="{ width: usageStats.success_rate + '%' }"
                        :class="getSuccessRateClass(usageStats.success_rate)"
                      ></div>
                    </div>
                    <p class="rate-text">{{ usageStats.success_rate.toFixed(1) }}% 成功率</p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 配置信息 -->
            <div v-if="activeTab === 'config'" class="tab-pane">
              <div class="config-section">
                <h4>工具配置</h4>
                
                <div v-if="Object.keys(tool.config_data || {}).length === 0" class="empty-state">
                  <p>暂无配置项</p>
                  <button @click="openConfigEditor" class="btn btn-primary btn-sm">
                    ⚙️ 添加配置
                  </button>
                </div>
                
                <div v-else class="config-list">
                  <div v-for="(value, key) in tool.config_data" :key="key" class="config-item">
                    <div class="config-header">
                      <span class="config-key">{{ key }}</span>
                      <span class="config-type">{{ getValueType(value) }}</span>
                    </div>
                    <div class="config-value">
                      <code>{{ formatConfigValue(value) }}</code>
                    </div>
                  </div>
                  
                  <div class="config-actions">
                    <button @click="openConfigEditor" class="btn btn-primary btn-sm">
                      ✏️ 编辑配置
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- 元数据信息 -->
              <div v-if="toolMetadata" class="metadata-section">
                <h4>元数据信息</h4>
                <div class="metadata-grid">
                  <div v-if="toolMetadata.rate_limit" class="metadata-item">
                    <label>速率限制</label>
                    <span>{{ toolMetadata.rate_limit }} 次/分钟</span>
                  </div>
                  <div v-if="toolMetadata.timeout" class="metadata-item">
                    <label>超时时间</label>
                    <span>{{ toolMetadata.timeout }} 秒</span>
                  </div>
                  <div v-if="toolMetadata.dependencies && toolMetadata.dependencies.length > 0" class="metadata-item">
                    <label>依赖项</label>
                    <div class="dependencies">
                      <span v-for="dep in toolMetadata.dependencies" :key="dep" class="dependency">{{ dep }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button @click="toggleToolStatus" class="btn" :class="tool.is_enabled ? 'btn-danger' : 'btn-success'">
          {{ tool.is_enabled ? '❌ 禁用工具' : '✅ 启用工具' }}
        </button>
        <button @click="openTestModal" class="btn btn-secondary" :disabled="!tool.is_enabled">
          🧪 测试工具
        </button>
        <button @click="openConfigModal" class="btn btn-primary">
          ⚙️ 配置工具
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
  name: 'ToolDetailModal',
  props: {
    tool: {
      type: Object,
      required: true
    }
  },
  
  data() {
    return {
      activeTab: 'basic',
      toolSchema: null,
      toolMetadata: null,
      usageStats: null,
      loading: {
        schema: false,
        usage: false
      },
      
      tabs: [
        { key: 'basic', label: '基本信息', icon: 'ℹ️' },
        { key: 'parameters', label: '参数信息', icon: '⚙️' },
        { key: 'usage', label: '使用统计', icon: '📊' },
        { key: 'config', label: '配置信息', icon: '🔧' }
      ]
    }
  },
  
  async mounted() {
    await this.loadToolDetails()
  },
  
  methods: {
    async loadToolDetails() {
      // 加载工具Schema
      this.loading.schema = true
      try {
        const schemaResponse = await axios.get(`${config.aiApiBaseUrl}/api/tools/${this.tool.name}/schema`)
        if (schemaResponse.data.success) {
          this.toolSchema = schemaResponse.data.data
        }
      } catch (error) {
        console.error('加载工具Schema失败:', error)
      } finally {
        this.loading.schema = false
      }
      
      // 加载使用统计
      this.loading.usage = true
      try {
        const usageResponse = await axios.get(`${config.aiApiBaseUrl}/api/tools/${this.tool.name}/usage`)
        if (usageResponse.data.success) {
          this.usageStats = usageResponse.data.data
        }
      } catch (error) {
        console.error('加载使用统计失败:', error)
      } finally {
        this.loading.usage = false
      }
      
      // 从工具元数据中提取信息
      if (this.tool.metadata) {
        this.toolMetadata = this.tool.metadata
      }
    },
    
    async toggleToolStatus() {
      try {
        const response = await axios.put(`${config.aiApiBaseUrl}/api/tools/${this.tool.name}/status`, {
          is_enabled: !this.tool.is_enabled
        })
        
        if (response.data.success) {
          this.tool.is_enabled = !this.tool.is_enabled
          this.$message.success(response.data.message)
          this.$emit('updated')
        } else {
          throw new Error(response.data.message)
        }
      } catch (error) {
        console.error('切换工具状态失败:', error)
        this.$message.error('操作失败: ' + error.message)
      }
    },
    
    openTestModal() {
      if (!this.tool.is_enabled) {
        this.$message.warning('工具已禁用，无法测试')
        return
      }
      this.$emit('test-tool', this.tool)
    },
    
    openConfigModal() {
      this.$emit('config-tool', this.tool)
    },
    
    openConfigEditor() {
      this.$emit('config-tool', this.tool)
    },
    
    closeModal() {
      this.$emit('close')
    },
    
    getCategoryIcon(category) {
      const icons = {
        'stock_data': '📊',
        'news_analysis': '📰',
        'technical_analysis': '📈',
        'fundamental_analysis': '📋',
        'market_analysis': '🏛️',
        'risk_management': '⚠️',
        'portfolio': '💼',
        'custom': '🔧'
      }
      return icons[category] || '🔧'
    },
    
    getCategoryLabel(category) {
      const labels = {
        'stock_data': '股票数据',
        'news_analysis': '新闻分析',
        'technical_analysis': '技术分析',
        'fundamental_analysis': '基本面分析',
        'market_analysis': '市场分析',
        'risk_management': '风险管理',
        'portfolio': '投资组合',
        'custom': '自定义'
      }
      return labels[category] || '未知'
    },
    
    getSuccessRateClass(rate) {
      if (rate >= 90) return 'success'
      if (rate >= 70) return 'warning'
      return 'danger'
    },
    
    getValueType(value) {
      if (value === null) return 'null'
      if (Array.isArray(value)) return 'array'
      return typeof value
    },
    
    formatConfigValue(value) {
      if (typeof value === 'object') {
        return JSON.stringify(value, null, 2)
      }
      return String(value)
    },
    
    formatDate(dateString) {
      if (!dateString) return '-'
      return new Date(dateString).toLocaleDateString('zh-CN')
    },
    
    formatDateTime(dateString) {
      if (!dateString) return '-'
      return new Date(dateString).toLocaleString('zh-CN')
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
  max-width: 800px;
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
  padding: 0;
}

.tool-detail-tabs {
  height: 100%;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
}

.tab {
  padding: 15px 20px;
  background: none;
  border: none;
  cursor: pointer;
  color: #6c757d;
  font-size: 14px;
  transition: all 0.3s ease;
}

.tab:hover {
  background: #e9ecef;
  color: #495057;
}

.tab.active {
  background: white;
  color: #007bff;
  border-bottom: 2px solid #007bff;
}

.tab-content {
  padding: 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 25px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-item label {
  font-weight: 500;
  color: #6c757d;
  font-size: 13px;
}

.info-item span {
  color: #2c3e50;
}

.category-badge,
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.category-badge {
  background: #e3f2fd;
  color: #1976d2;
}

.status-badge.enabled {
  background: #d4edda;
  color: #155724;
}

.status-badge.disabled {
  background: #f8d7da;
  color: #721c24;
}

.description-section,
.tags-section {
  margin-bottom: 25px;
}

.description-section h4,
.tags-section h4 {
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 16px;
}

.description-section p {
  color: #6c757d;
  line-height: 1.6;
  margin: 0;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  background: #e9ecef;
  color: #495057;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.parameters-list {
  space-y: 20px;
}

.parameter-item {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
}

.param-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.param-header h5 {
  margin: 0;
  color: #2c3e50;
  font-size: 16px;
}

.param-meta {
  display: flex;
  gap: 8px;
  align-items: center;
}

.param-type {
  background: #e3f2fd;
  color: #1976d2;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.required-badge {
  background: #ffebee;
  color: #c62828;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.optional-badge {
  background: #f3e5f5;
  color: #7b1fa2;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.param-description {
  color: #6c757d;
  margin: 0 0 10px 0;
  font-size: 14px;
}

.param-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.param-detail {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.detail-label {
  color: #6c757d;
  font-weight: 500;
  min-width: 60px;
}

.enum-values {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.enum-value {
  background: #f8f9fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
}

.examples-section {
  margin-top: 25px;
}

.examples-section h4 {
  margin: 0 0 15px 0;
  color: #2c3e50;
}

.example-item {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
}

.example-item h5 {
  margin: 0 0 10px 0;
  color: #2c3e50;
}

.example-code {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.code-section h6 {
  margin: 0 0 8px 0;
  color: #6c757d;
  font-size: 13px;
}

.code-section pre {
  background: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
  margin: 0;
  overflow-x: auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 25px;
}

.stat-card {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.stat-icon {
  font-size: 1.5rem;
}

.stat-content h3 {
  margin: 0;
  font-size: 1.5rem;
  color: #2c3e50;
}

.stat-content p {
  margin: 5px 0 0 0;
  color: #6c757d;
  font-size: 12px;
}

.success-rate-chart {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

.success-rate-chart h4 {
  margin: 0 0 15px 0;
  color: #2c3e50;
}

.chart-placeholder {
  text-align: center;
}

.rate-bar {
  height: 20px;
  background: #e9ecef;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 10px;
}

.rate-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.rate-fill.success {
  background: #28a745;
}

.rate-fill.warning {
  background: #ffc107;
}

.rate-fill.danger {
  background: #dc3545;
}

.rate-text {
  margin: 0;
  color: #6c757d;
  font-size: 14px;
}

.config-list {
  space-y: 15px;
}

.config-item {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.config-key {
  font-weight: 500;
  color: #2c3e50;
}

.config-type {
  background: #e3f2fd;
  color: #1976d2;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
}

.config-value {
  background: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  white-space: pre-wrap;
  overflow-x: auto;
}

.config-actions {
  margin-top: 15px;
  text-align: right;
}

.metadata-section {
  margin-top: 25px;
  padding-top: 25px;
  border-top: 1px solid #e9ecef;
}

.metadata-section h4 {
  margin: 0 0 15px 0;
  color: #2c3e50;
}

.metadata-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.metadata-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.metadata-item label {
  font-weight: 500;
  color: #6c757d;
  font-size: 13px;
}

.dependencies {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.dependency {
  background: #e9ecef;
  color: #495057;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #6c757d;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #1e7e34;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #c82333;
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
  
  .info-grid,
  .metadata-grid {
    grid-template-columns: 1fr;
  }
  
  .example-code {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .modal-footer {
    flex-wrap: wrap;
  }
  
  .tabs {
    flex-wrap: wrap;
  }
  
  .tab {
    flex: 1;
    min-width: 120px;
  }
}
</style>
