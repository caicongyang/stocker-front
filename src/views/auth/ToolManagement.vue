<template>
  <div class="tool-management">
    <SideMenu />
    <div class="content">
    <div class="header">
      <h1>🔧 工具管理中心</h1>
      <p class="subtitle">管理和配置AI助手的工具集合</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <h3>{{ statistics.total_tools || 0 }}</h3>
          <p>总工具数</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <h3>{{ statistics.enabled_tools || 0 }}</h3>
          <p>已启用</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">❌</div>
        <div class="stat-content">
          <h3>{{ statistics.disabled_tools || 0 }}</h3>
          <p>已禁用</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📈</div>
        <div class="stat-content">
          <h3>{{ statistics.total_usage || 0 }}</h3>
          <p>总使用次数</p>
        </div>
      </div>
    </div>

    <!-- 操作栏 -->
    <div class="toolbar">
      <div class="filters">
        <select v-model="filters.category" @change="fetchTools">
          <option value="">所有分类</option>
          <option v-for="category in categories" :key="category.value" :value="category.value">
            {{ category.label }}
          </option>
        </select>
        
        <select v-model="filters.status" @change="fetchTools">
          <option value="">所有状态</option>
          <option value="enabled">已启用</option>
          <option value="disabled">已禁用</option>
          <option value="beta">测试版</option>
          <option value="deprecated">已废弃</option>
        </select>
        
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="搜索工具..." 
          @input="debounceSearch"
          class="search-input"
        />
      </div>
      
      <div class="actions">
        <button @click="scanTools" class="btn btn-secondary" :disabled="scanning">
          <span v-if="scanning">🔄 扫描中...</span>
          <span v-else>🔍 扫描工具</span>
        </button>
        <button @click="syncMetadata" class="btn btn-secondary" :disabled="syncing">
          <span v-if="syncing">🔄 同步中...</span>
          <span v-else">📥 同步元数据</span>
        </button>
        <button @click="showBulkActions = !showBulkActions" class="btn btn-outline">
          ⚙️ 批量操作
        </button>
      </div>
    </div>

    <!-- 批量操作面板 -->
    <div v-if="showBulkActions" class="bulk-actions">
      <div class="bulk-controls">
        <label>
          <input type="checkbox" @change="selectAll" :checked="isAllSelected"> 全选
        </label>
        <span class="selected-count">已选择 {{ selectedTools.length }} 个工具</span>
        <div class="bulk-buttons">
          <button @click="bulkEnable" :disabled="selectedTools.length === 0" class="btn btn-success btn-sm">
            ✅ 批量启用
          </button>
          <button @click="bulkDisable" :disabled="selectedTools.length === 0" class="btn btn-danger btn-sm">
            ❌ 批量禁用
          </button>
        </div>
      </div>
    </div>

    <!-- 工具列表 -->
    <div class="tools-grid" v-if="!loading">
      <div 
        v-for="tool in filteredTools" 
        :key="tool.name" 
        class="tool-card"
        :class="{ 'disabled': !tool.is_enabled, 'selected': selectedTools.includes(tool.name) }"
      >
        <div class="tool-header">
          <div class="tool-info">
            <div class="tool-icon">{{ getCategoryIcon(tool.category) }}</div>
            <div>
              <h3>{{ tool.display_name || tool.name }}</h3>
              <span class="tool-category">{{ getCategoryLabel(tool.category) }}</span>
            </div>
          </div>
          
          <div class="tool-controls">
            <input 
              v-if="showBulkActions"
              type="checkbox" 
              :value="tool.name" 
              v-model="selectedTools"
              class="tool-checkbox"
            />
            <div class="tool-status">
              <span 
                class="status-badge" 
                :class="tool.is_enabled ? 'enabled' : 'disabled'"
              >
                {{ tool.is_enabled ? '已启用' : '已禁用' }}
              </span>
            </div>
            <label class="switch">
              <input 
                type="checkbox" 
                :checked="tool.is_enabled" 
                @change="toggleTool(tool)"
                :disabled="updatingTools.includes(tool.name)"
              />
              <span class="slider"></span>
            </label>
          </div>
        </div>

        <div class="tool-body">
          <p class="tool-description">{{ tool.description }}</p>
          
          <div class="tool-meta">
            <div class="meta-item">
              <span class="label">版本:</span>
              <span class="value">{{ tool.version || '1.0.0' }}</span>
            </div>
            <div class="meta-item">
              <span class="label">作者:</span>
              <span class="value">{{ tool.author || 'system' }}</span>
            </div>
            <div class="meta-item">
              <span class="label">使用次数:</span>
              <span class="value">{{ tool.usage_count || 0 }}</span>
            </div>
            <div class="meta-item" v-if="tool.last_used_at">
              <span class="label">最后使用:</span>
              <span class="value">{{ formatDate(tool.last_used_at) }}</span>
            </div>
          </div>

          <!-- 错误率显示 -->
          <div v-if="tool.usage_count > 0" class="tool-metrics">
            <div class="metric">
              <span class="metric-label">成功率:</span>
              <div class="metric-bar">
                <div 
                  class="metric-fill" 
                  :style="{ width: getSuccessRate(tool) + '%' }"
                  :class="getSuccessRateClass(tool)"
                ></div>
              </div>
              <span class="metric-value">{{ getSuccessRate(tool).toFixed(1) }}%</span>
            </div>
          </div>
        </div>

        <div class="tool-actions">
          <button @click="viewToolDetail(tool)" class="btn btn-outline btn-sm">
            📋 详情
          </button>
          <button @click="testTool(tool)" class="btn btn-secondary btn-sm" :disabled="!tool.is_enabled">
            🧪 测试
          </button>
          <button @click="configTool(tool)" class="btn btn-primary btn-sm">
            ⚙️ 配置
          </button>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>加载工具列表...</p>
    </div>

    <!-- 空状态 -->
    <div v-if="!loading && filteredTools.length === 0" class="empty-state">
      <div class="empty-icon">🔧</div>
      <h3>没有找到工具</h3>
      <p>尝试调整筛选条件或扫描新工具</p>
      <button @click="scanTools" class="btn btn-primary">🔍 扫描工具</button>
    </div>

    <!-- 工具详情弹窗 -->
    <ToolDetailModal 
      v-if="selectedTool" 
      :tool="selectedTool" 
      @close="selectedTool = null"
      @updated="fetchTools"
      @test-tool="handleTestTool"
      @config-tool="handleConfigTool"
    />

    <!-- 工具测试弹窗 -->
    <ToolTestModal 
      v-if="testingTool" 
      :tool="testingTool" 
      @close="testingTool = null"
    />

    <!-- 工具配置弹窗 -->
    <ToolConfigModal 
      v-if="configuringTool" 
      :tool="configuringTool" 
      @close="configuringTool = null"
      @updated="fetchTools"
    />

    <!-- 分页 -->
    <div v-if="pagination.pages > 1" class="pagination">
      <button 
        @click="changePage(pagination.page - 1)" 
        :disabled="pagination.page <= 1"
        class="btn btn-outline btn-sm"
      >
        ← 上一页
      </button>
      
      <span class="page-info">
        第 {{ pagination.page }} 页，共 {{ pagination.pages }} 页
      </span>
      
      <button 
        @click="changePage(pagination.page + 1)" 
        :disabled="pagination.page >= pagination.pages"
        class="btn btn-outline btn-sm"
      >
        下一页 →
      </button>
    </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import config from '@/config/config'
import SideMenu from '../../components/SideMenu.vue'
import ToolDetailModal from '../../components/ToolDetailModal.vue'
import ToolTestModal from '../../components/ToolTestModal.vue'
import ToolConfigModal from '../../components/ToolConfigModal.vue'

export default {
  name: 'ToolManagement',
  components: {
    SideMenu,
    ToolDetailModal,
    ToolTestModal,
    ToolConfigModal
  },
  
  data() {
    return {
      tools: [],
      categories: [],
      statistics: {},
      loading: true,
      scanning: false,
      syncing: false,
      showBulkActions: false,
      selectedTools: [],
      updatingTools: [],
      
      // 筛选和搜索
      filters: {
        category: '',
        status: ''
      },
      searchQuery: '',
      searchTimeout: null,
      
      // 分页
      pagination: {
        page: 1,
        page_size: 12,
        total: 0,
        pages: 0
      },
      
      // 弹窗状态
      selectedTool: null,
      testingTool: null,
      configuringTool: null
    }
  },
  
  computed: {
    filteredTools() {
      let filtered = this.tools
      
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(tool => 
          tool.name.toLowerCase().includes(query) ||
          (tool.display_name && tool.display_name.toLowerCase().includes(query)) ||
          tool.description.toLowerCase().includes(query)
        )
      }
      
      return filtered
    },
    
    isAllSelected() {
      return this.tools.length > 0 && this.selectedTools.length === this.tools.length
    }
  },
  
  async mounted() {
    await this.initializeData()
  },
  
  methods: {
    async initializeData() {
      try {
        await Promise.all([
          this.fetchCategories(),
          this.fetchStatistics(),
          this.fetchTools()
        ])
      } catch (error) {
        console.error('初始化数据失败:', error)
        this.$message.error('加载数据失败')
      }
    },
    
    async fetchTools() {
      this.loading = true
      try {
        const params = {
          page: this.pagination.page,
          page_size: this.pagination.page_size,
          category: this.filters.category,
          status: this.filters.status
        }
        
        const response = await axios.get(`${config.aiApiBaseUrl}/api/tools/list`, { params })
        
        if (response.data.success) {
          this.tools = response.data.data.tools
          this.pagination = response.data.data.pagination
        } else {
          throw new Error(response.data.message || '获取工具列表失败')
        }
      } catch (error) {
        console.error('获取工具列表失败:', error)
        this.$message.error('获取工具列表失败')
      } finally {
        this.loading = false
      }
    },
    
    async fetchCategories() {
      try {
        const response = await axios.get(`${config.aiApiBaseUrl}/api/tools/categories`)
        if (response.data.success) {
          this.categories = response.data.data
        }
      } catch (error) {
        console.error('获取分类失败:', error)
      }
    },
    
    async fetchStatistics() {
      try {
        const response = await axios.get(`${config.aiApiBaseUrl}/api/tools/statistics`)
        if (response.data.success) {
          this.statistics = response.data.data
        }
      } catch (error) {
        console.error('获取统计信息失败:', error)
      }
    },
    
    async toggleTool(tool) {
      if (this.updatingTools.includes(tool.name)) return
      
      this.updatingTools.push(tool.name)
      
      try {
        const response = await axios.put(`${config.aiApiBaseUrl}/api/tools/${tool.name}/status`, {
          is_enabled: !tool.is_enabled
        })
        
        if (response.data.success) {
          tool.is_enabled = !tool.is_enabled
          this.$message.success(response.data.message)
          await this.fetchStatistics() // 更新统计信息
        } else {
          throw new Error(response.data.message)
        }
      } catch (error) {
        console.error('切换工具状态失败:', error)
        this.$message.error('操作失败: ' + error.message)
      } finally {
        this.updatingTools = this.updatingTools.filter(name => name !== tool.name)
      }
    },
    
    async scanTools() {
      this.scanning = true
      try {
        const response = await axios.post(`${config.aiApiBaseUrl}/api/tools/scan`, {
          auto_register: true
        })
        
        if (response.data.success) {
          this.$message.success(response.data.message)
          await this.fetchTools()
          await this.fetchStatistics()
        } else {
          throw new Error(response.data.message)
        }
      } catch (error) {
        console.error('扫描工具失败:', error)
        this.$message.error('扫描失败: ' + error.message)
      } finally {
        this.scanning = false
      }
    },
    
    async syncMetadata() {
      this.syncing = true
      try {
        const response = await axios.post(`${config.aiApiBaseUrl}/api/tools/sync`)
        
        if (response.data.success) {
          this.$message.success('元数据同步完成')
          await this.fetchTools()
        } else {
          throw new Error(response.data.message)
        }
      } catch (error) {
        console.error('同步元数据失败:', error)
        this.$message.error('同步失败: ' + error.message)
      } finally {
        this.syncing = false
      }
    },
    
    selectAll(event) {
      if (event.target.checked) {
        this.selectedTools = this.tools.map(tool => tool.name)
      } else {
        this.selectedTools = []
      }
    },
    
    async bulkEnable() {
      await this.bulkUpdateStatus(true)
    },
    
    async bulkDisable() {
      await this.bulkUpdateStatus(false)
    },
    
    async bulkUpdateStatus(isEnabled) {
      if (this.selectedTools.length === 0) return
      
      const action = isEnabled ? '启用' : '禁用'
      const confirmed = confirm(`确定要${action} ${this.selectedTools.length} 个工具吗？`)
      
      if (!confirmed) return
      
      try {
        const promises = this.selectedTools.map(toolName =>
          axios.put(`${config.aiApiBaseUrl}/api/tools/${toolName}/status`, { is_enabled: isEnabled })
        )
        
        await Promise.all(promises)
        
        this.$message.success(`批量${action}完成`)
        this.selectedTools = []
        await this.fetchTools()
        await this.fetchStatistics()
      } catch (error) {
        console.error(`批量${action}失败:`, error)
        this.$message.error(`批量${action}失败`)
      }
    },
    
    debounceSearch() {
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        this.pagination.page = 1
        this.fetchTools()
      }, 500)
    },
    
    changePage(page) {
      if (page < 1 || page > this.pagination.pages) return
      this.pagination.page = page
      this.fetchTools()
    },
    
    viewToolDetail(tool) {
      this.selectedTool = tool
    },
    
    testTool(tool) {
      if (!tool.is_enabled) {
        this.$message.warning('工具已禁用，无法测试')
        return
      }
      this.testingTool = tool
    },
    
    configTool(tool) {
      this.configuringTool = tool
    },
    
    handleTestTool(tool) {
      this.selectedTool = null
      this.testingTool = tool
    },
    
    handleConfigTool(tool) {
      this.selectedTool = null
      this.configuringTool = tool
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
    
    getSuccessRate(tool) {
      if (!tool.usage_count || tool.usage_count === 0) return 0
      const successCount = tool.usage_count - (tool.error_count || 0)
      return (successCount / tool.usage_count) * 100
    },
    
    getSuccessRateClass(tool) {
      const rate = this.getSuccessRate(tool)
      if (rate >= 90) return 'success'
      if (rate >= 70) return 'warning'
      return 'danger'
    },
    
    formatDate(dateString) {
      if (!dateString) return '-'
      return new Date(dateString).toLocaleDateString('zh-CN')
    }
  }
}
</script>

<style scoped>
.tool-management {
  display: flex;
  height: 100vh;
  background-color: #f5f7fa;
}

.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  max-width: 1400px;
  margin: 0 auto;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.subtitle {
  color: #7f8c8d;
  font-size: 16px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  font-size: 2rem;
}

.stat-content h3 {
  margin: 0;
  font-size: 2rem;
  color: #2c3e50;
}

.stat-content p {
  margin: 5px 0 0 0;
  color: #7f8c8d;
}

.toolbar {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.filters {
  display: flex;
  gap: 15px;
  align-items: center;
}

.filters select,
.search-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.search-input {
  min-width: 200px;
}

.actions {
  display: flex;
  gap: 10px;
}

.bulk-actions {
  background: #f8f9fa;
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.bulk-controls {
  display: flex;
  align-items: center;
  gap: 20px;
}

.selected-count {
  color: #6c757d;
  font-size: 14px;
}

.bulk-buttons {
  display: flex;
  gap: 10px;
  margin-left: auto;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.tool-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  overflow: hidden;
}

.tool-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.15);
}

.tool-card.disabled {
  opacity: 0.7;
  background: #f8f9fa;
}

.tool-card.selected {
  border: 2px solid #007bff;
}

.tool-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.tool-info {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.tool-icon {
  font-size: 1.5rem;
}

.tool-info h3 {
  margin: 0 0 5px 0;
  color: #2c3e50;
  font-size: 18px;
}

.tool-category {
  color: #6c757d;
  font-size: 12px;
  background: #e9ecef;
  padding: 2px 8px;
  border-radius: 12px;
}

.tool-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-badge {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.status-badge.enabled {
  background: #d4edda;
  color: #155724;
}

.status-badge.disabled {
  background: #f8d7da;
  color: #721c24;
}

.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #28a745;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.tool-body {
  padding: 20px;
}

.tool-description {
  color: #6c757d;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 15px;
}

.tool-meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 15px;
}

.meta-item {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.meta-item .label {
  color: #6c757d;
}

.meta-item .value {
  color: #2c3e50;
  font-weight: 500;
}

.tool-metrics {
  margin-bottom: 15px;
}

.metric {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
}

.metric-label {
  color: #6c757d;
  min-width: 60px;
}

.metric-bar {
  flex: 1;
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
}

.metric-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.metric-fill.success {
  background: #28a745;
}

.metric-fill.warning {
  background: #ffc107;
}

.metric-fill.danger {
  background: #dc3545;
}

.metric-value {
  color: #2c3e50;
  font-weight: 500;
  min-width: 40px;
}

.tool-actions {
  padding: 15px 20px;
  background: #f8f9fa;
  display: flex;
  gap: 8px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
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
  color: #007bff;
  border: 1px solid #007bff;
}

.btn-outline:hover {
  background: #007bff;
  color: white;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.loading {
  text-align: center;
  padding: 60px 20px;
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

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.empty-state h3 {
  margin-bottom: 10px;
  color: #2c3e50;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 30px;
}

.page-info {
  color: #6c757d;
  font-size: 14px;
}

@media (max-width: 768px) {
  .content {
    padding: 15px;
  }
  
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filters {
    flex-wrap: wrap;
  }
  
  .search-input {
    min-width: 100%;
  }
  
  .tools-grid {
    grid-template-columns: 1fr;
  }
  
  .bulk-controls {
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .bulk-buttons {
    margin-left: 0;
  }
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .tool-management {
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

  .tools-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>
