<template>
  <div>
    <div class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>⚙️ 配置工具: {{ tool.display_name || tool.name }}</h2>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="config-tabs">
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
              <!-- 基本配置 -->
              <div v-if="activeTab === 'basic'" class="tab-pane">
                <div class="config-form">
                  <h4>基本设置</h4>
                  
                  <div class="form-group">
                    <label>工具状态</label>
                    <div class="switch-group">
                      <label class="switch">
                        <input 
                          type="checkbox" 
                          v-model="configData.is_enabled"
                          @change="markAsChanged"
                        />
                        <span class="slider"></span>
                      </label>
                      <span class="switch-label">
                        {{ configData.is_enabled ? '已启用' : '已禁用' }}
                      </span>
                    </div>
                    <div class="form-hint">
                      禁用后，工具将不会在AI对话中被调用
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label>显示名称</label>
                    <input 
                      type="text" 
                      v-model="configData.display_name"
                      @input="markAsChanged"
                      class="form-control"
                      placeholder="工具的显示名称"
                    />
                    <div class="form-hint">
                      用于在界面中显示的友好名称
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label>工具描述</label>
                    <textarea 
                      v-model="configData.description"
                      @input="markAsChanged"
                      class="form-control"
                      rows="3"
                      placeholder="描述工具的功能和用途"
                    ></textarea>
                    <div class="form-hint">
                      清晰的描述有助于AI更好地理解何时使用此工具
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label>优先级</label>
                    <select 
                      v-model="configData.priority"
                      @change="markAsChanged"
                      class="form-control"
                    >
                      <option value="high">高优先级</option>
                      <option value="normal">普通优先级</option>
                      <option value="low">低优先级</option>
                    </select>
                    <div class="form-hint">
                      高优先级的工具在相似情况下更容易被选择
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 性能配置 -->
              <div v-if="activeTab === 'performance'" class="tab-pane">
                <div class="config-form">
                  <h4>性能设置</h4>
                  
                  <div class="form-group">
                    <label>速率限制 (次/分钟)</label>
                    <input 
                      type="number" 
                      v-model.number="configData.rate_limit"
                      @input="markAsChanged"
                      class="form-control"
                      min="1"
                      max="1000"
                      placeholder="60"
                    />
                    <div class="form-hint">
                      限制工具每分钟的最大调用次数，0表示无限制
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label>超时时间 (秒)</label>
                    <input 
                      type="number" 
                      v-model.number="configData.timeout"
                      @input="markAsChanged"
                      class="form-control"
                      min="5"
                      max="300"
                      placeholder="30"
                    />
                    <div class="form-hint">
                      工具执行的最大等待时间，超时后将被取消
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label>重试次数</label>
                    <input 
                      type="number" 
                      v-model.number="configData.retry_count"
                      @input="markAsChanged"
                      class="form-control"
                      min="0"
                      max="5"
                      placeholder="3"
                    />
                    <div class="form-hint">
                      工具执行失败时的自动重试次数
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label>缓存设置</label>
                    <div class="checkbox-group">
                      <label class="checkbox-label">
                        <input 
                          type="checkbox" 
                          v-model="configData.enable_cache"
                          @change="markAsChanged"
                        />
                        启用结果缓存
                      </label>
                    </div>
                    <div v-if="configData.enable_cache" class="sub-form">
                      <div class="form-group">
                        <label>缓存时长 (分钟)</label>
                        <input 
                          type="number" 
                          v-model.number="configData.cache_duration"
                          @input="markAsChanged"
                          class="form-control"
                          min="1"
                          max="1440"
                          placeholder="15"
                        />
                      </div>
                    </div>
                    <div class="form-hint">
                      缓存可以提高响应速度，但可能返回过期数据
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 参数配置 -->
              <div v-if="activeTab === 'parameters'" class="tab-pane">
                <div class="config-form">
                  <h4>默认参数</h4>
                  <p class="section-description">
                    为工具参数设置默认值，这些值将在AI调用时自动使用
                  </p>
                  
                  <div v-if="loading.schema" class="loading-state">
                    <div class="spinner"></div>
                    <p>加载参数信息...</p>
                  </div>
                  
                  <div v-else-if="!toolSchema || !toolSchema.schema || Object.keys(toolSchema.schema.properties || {}).length === 0" class="empty-state">
                    <p>此工具没有可配置的参数</p>
                  </div>
                  
                  <div v-else class="parameters-config">
                    <div 
                      v-for="(param, paramName) in toolSchema.schema.properties" 
                      :key="paramName"
                      class="param-config"
                    >
                      <div class="param-header">
                        <h5>{{ paramName }}</h5>
                        <div class="param-meta">
                          <span class="param-type">{{ param.type }}</span>
                          <span v-if="isRequired(paramName)" class="required-badge">必需</span>
                          <span v-else class="optional-badge">可选</span>
                        </div>
                      </div>
                      
                      <p class="param-description">{{ param.description || '无描述' }}</p>
                      
                      <div class="param-control">
                        <label class="checkbox-label">
                          <input 
                            type="checkbox" 
                            v-model="configData.default_params_enabled[paramName]"
                            @change="markAsChanged"
                          />
                          使用默认值
                        </label>
                        
                        <div v-if="configData.default_params_enabled[paramName]" class="param-input">
                          <!-- 字符串类型 -->
                          <input 
                            v-if="param.type === 'string' && !param.enum"
                            v-model="configData.default_params[paramName]"
                            @input="markAsChanged"
                            type="text"
                            class="form-control"
                            :placeholder="param.default ? `原默认值: ${param.default}` : '请输入默认值'"
                          />
                          
                          <!-- 枚举选择 -->
                          <select 
                            v-else-if="param.enum"
                            v-model="configData.default_params[paramName]"
                            @change="markAsChanged"
                            class="form-control"
                          >
                            <option value="">请选择...</option>
                            <option v-for="option in param.enum" :key="option" :value="option">
                              {{ option }}
                            </option>
                          </select>
                          
                          <!-- 数字类型 -->
                          <input 
                            v-else-if="param.type === 'number' || param.type === 'integer'"
                            v-model.number="configData.default_params[paramName]"
                            @input="markAsChanged"
                            :type="param.type === 'integer' ? 'number' : 'number'"
                            :step="param.type === 'integer' ? '1' : 'any'"
                            class="form-control"
                            :min="param.minimum"
                            :max="param.maximum"
                          />
                          
                          <!-- 布尔类型 -->
                          <label v-else-if="param.type === 'boolean'" class="checkbox-label">
                            <input 
                              type="checkbox" 
                              v-model="configData.default_params[paramName]"
                              @change="markAsChanged"
                            />
                            启用
                          </label>
                          
                          <!-- 其他类型 -->
                          <textarea 
                            v-else
                            v-model="configData.default_params[paramName]"
                            @input="markAsChanged"
                            class="form-control"
                            rows="2"
                            :placeholder="param.type === 'array' ? 'JSON数组格式' : param.type === 'object' ? 'JSON对象格式' : '请输入值'"
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 高级配置 -->
              <div v-if="activeTab === 'advanced'" class="tab-pane">
                <div class="config-form">
                  <h4>高级设置</h4>
                  
                  <div class="form-group">
                    <label>日志级别</label>
                    <select 
                      v-model="configData.log_level"
                      @change="markAsChanged"
                      class="form-control"
                    >
                      <option value="debug">调试 (DEBUG)</option>
                      <option value="info">信息 (INFO)</option>
                      <option value="warning">警告 (WARNING)</option>
                      <option value="error">错误 (ERROR)</option>
                    </select>
                    <div class="form-hint">
                      控制工具执行时记录的日志详细程度
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label>错误处理</label>
                    <div class="radio-group">
                      <label class="radio-label">
                        <input 
                          type="radio" 
                          value="strict"
                          v-model="configData.error_handling"
                          @change="markAsChanged"
                        />
                        严格模式 - 任何错误都会中断执行
                      </label>
                      <label class="radio-label">
                        <input 
                          type="radio" 
                          value="graceful"
                          v-model="configData.error_handling"
                          @change="markAsChanged"
                        />
                        优雅模式 - 尝试恢复并继续执行
                      </label>
                      <label class="radio-label">
                        <input 
                          type="radio" 
                          value="ignore"
                          v-model="configData.error_handling"
                          @change="markAsChanged"
                        />
                        忽略模式 - 忽略非关键错误
                      </label>
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label>自定义配置 (JSON)</label>
                    <textarea 
                      v-model="customConfigJson"
                      @input="handleCustomConfigChange"
                      class="form-control code-editor"
                      rows="8"
                      placeholder="请输入有效的JSON配置..."
                    ></textarea>
                    <div class="form-hint">
                      <span v-if="customConfigError" class="error-text">
                        ❌ JSON格式错误: {{ customConfigError }}
                      </span>
                      <span v-else class="success-text">
                        ✅ JSON格式正确
                      </span>
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label>环境变量</label>
                    <div class="env-vars">
                      <div 
                        v-for="(envVar, index) in configData.environment_vars" 
                        :key="index"
                        class="env-var-item"
                      >
                        <input 
                          type="text" 
                          v-model="envVar.key"
                          @input="markAsChanged"
                          placeholder="变量名"
                          class="form-control env-key"
                        />
                        <input 
                          type="text" 
                          v-model="envVar.value"
                          @input="markAsChanged"
                          placeholder="变量值"
                          class="form-control env-value"
                        />
                        <button @click="removeEnvVar(index)" class="btn btn-danger btn-sm">
                          🗑️
                        </button>
                      </div>
                      <button @click="addEnvVar" class="btn btn-outline btn-sm">
                        ➕ 添加环境变量
                      </button>
                    </div>
                    <div class="form-hint">
                      工具执行时可用的环境变量
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <div class="footer-left">
            <button @click="resetToDefaults" class="btn btn-outline">
              🔄 重置为默认
            </button>
            <button @click="loadPreset" class="btn btn-outline">
              📋 加载预设
            </button>
          </div>
          
          <div class="footer-right">
            <button @click="previewConfig" class="btn btn-secondary">
              👁️ 预览配置
            </button>
            <button @click="saveConfig" :disabled="saving" class="btn btn-primary">
              <span v-if="saving">💾 保存中...</span>
              <span v-else>💾 保存配置</span>
            </button>
            <button @click="closeModal" class="btn btn-outline">
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 配置预览弹窗 -->
    <div v-if="showPreview" class="modal-overlay" @click="showPreview = false">
      <div class="preview-modal" @click.stop>
        <div class="preview-header">
          <h3>配置预览</h3>
          <button @click="showPreview = false" class="close-btn">&times;</button>
        </div>
        <div class="preview-content">
          <pre class="config-preview"><code>{{ JSON.stringify(getFullConfig(), null, 2) }}</code></pre>
        </div>
        <div class="preview-footer">
          <button @click="copyConfig" class="btn btn-secondary">📋 复制配置</button>
          <button @click="showPreview = false" class="btn btn-outline">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import request from '../utils/request'

export default {
  name: 'ToolConfigModal',
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
      configData: {
        is_enabled: true,
        display_name: '',
        description: '',
        priority: 'normal',
        rate_limit: 60,
        timeout: 30,
        retry_count: 3,
        enable_cache: false,
        cache_duration: 15,
        default_params: {},
        default_params_enabled: {},
        log_level: 'info',
        error_handling: 'graceful',
        custom_config: {},
        environment_vars: []
      },
      
      customConfigJson: '{}',
      customConfigError: null,
      hasChanges: false,
      saving: false,
      showPreview: false,
      
      loading: {
        schema: false
      },
      
      tabs: [
        { key: 'basic', label: '基本配置', icon: '⚙️' },
        { key: 'performance', label: '性能设置', icon: '⚡' },
        { key: 'parameters', label: '参数配置', icon: '📝' },
        { key: 'advanced', label: '高级设置', icon: '🔧' }
      ]
    }
  },
  
  async mounted() {
    await this.loadToolSchema()
    this.initializeConfigData()
  },
  
  methods: {
    async loadToolSchema() {
      this.loading.schema = true
      try {
        const response = await request.get(`/api/tools/${this.tool.name}/schema`)
        if (response.data.success) {
          this.toolSchema = response.data.data
        }
      } catch (error) {
        console.error('加载工具Schema失败:', error)
      } finally {
        this.loading.schema = false
      }
    },
    
    initializeConfigData() {
      // 从工具数据初始化配置
      this.configData.is_enabled = this.tool.is_enabled
      this.configData.display_name = this.tool.display_name || this.tool.name
      this.configData.description = this.tool.description || ''
      
      // 合并现有配置数据
      if (this.tool.config_data) {
        Object.assign(this.configData, this.tool.config_data)
      }
      
      // 初始化自定义配置JSON
      this.customConfigJson = JSON.stringify(this.configData.custom_config || {}, null, 2)
      
      // 初始化环境变量
      if (!this.configData.environment_vars || this.configData.environment_vars.length === 0) {
        this.configData.environment_vars = []
      }
      
      // 初始化默认参数设置
      if (this.toolSchema && this.toolSchema.schema && this.toolSchema.schema.properties) {
        Object.keys(this.toolSchema.schema.properties).forEach(paramName => {
          if (!(paramName in this.configData.default_params_enabled)) {
            this.configData.default_params_enabled[paramName] = false
          }
          if (!(paramName in this.configData.default_params)) {
            this.configData.default_params[paramName] = ''
          }
        })
      }
    },
    
    isRequired(paramName) {
      if (!this.toolSchema || !this.toolSchema.schema) return false
      const required = this.toolSchema.schema.required || []
      return required.includes(paramName)
    },
    
    markAsChanged() {
      this.hasChanges = true
    },
    
    handleCustomConfigChange() {
      this.markAsChanged()
      
      try {
        const parsed = JSON.parse(this.customConfigJson)
        this.configData.custom_config = parsed
        this.customConfigError = null
      } catch (error) {
        this.customConfigError = error.message
      }
    },
    
    addEnvVar() {
      this.configData.environment_vars.push({ key: '', value: '' })
      this.markAsChanged()
    },
    
    removeEnvVar(index) {
      this.configData.environment_vars.splice(index, 1)
      this.markAsChanged()
    },
    
    resetToDefaults() {
      const confirmed = confirm('确定要重置为默认配置吗？这将丢失所有自定义设置。')
      if (!confirmed) return
      
      // 重置为默认值
      this.configData = {
        is_enabled: true,
        display_name: this.tool.name,
        description: this.tool.description || '',
        priority: 'normal',
        rate_limit: 60,
        timeout: 30,
        retry_count: 3,
        enable_cache: false,
        cache_duration: 15,
        default_params: {},
        default_params_enabled: {},
        log_level: 'info',
        error_handling: 'graceful',
        custom_config: {},
        environment_vars: []
      }
      
      this.customConfigJson = '{}'
      this.customConfigError = null
      this.markAsChanged()
      
      this.$message.success('已重置为默认配置')
    },
    
    loadPreset() {
      // 这里可以实现加载预设配置的功能
      this.$message.info('预设配置功能开发中...')
    },
    
    previewConfig() {
      this.showPreview = true
    },
    
    getFullConfig() {
      // 过滤掉空的环境变量
      const envVars = this.configData.environment_vars.filter(
        envVar => envVar.key && envVar.value
      )
      
      // 过滤掉未启用的默认参数
      const defaultParams = {}
      Object.keys(this.configData.default_params_enabled).forEach(paramName => {
        if (this.configData.default_params_enabled[paramName]) {
          defaultParams[paramName] = this.configData.default_params[paramName]
        }
      })
      
      return {
        ...this.configData,
        environment_vars: envVars,
        default_params: defaultParams
      }
    },
    
    async saveConfig() {
      if (this.customConfigError) {
        this.$message.error('请修复JSON格式错误后再保存')
        return
      }
      
      this.saving = true
      
      try {
        const fullConfig = this.getFullConfig()
        
        // 分别更新状态和配置
        await Promise.all([
          // 更新工具状态
          request.put(`/api/tools/${this.tool.name}/status`, {
            is_enabled: fullConfig.is_enabled
          }),
          
          // 更新工具配置
          request.put(`/api/tools/${this.tool.name}/config`, fullConfig)
        ])
        
        this.hasChanges = false
        this.$message.success('配置保存成功')
        this.$emit('updated')
        
      } catch (error) {
        console.error('保存配置失败:', error)
        this.$message.error('保存失败: ' + error.message)
      } finally {
        this.saving = false
      }
    },
    
    copyConfig() {
      const configText = JSON.stringify(this.getFullConfig(), null, 2)
      
      if (navigator.clipboard) {
        navigator.clipboard.writeText(configText).then(() => {
          this.$message.success('配置已复制到剪贴板')
        }).catch(() => {
          this.fallbackCopy(configText)
        })
      } else {
        this.fallbackCopy(configText)
      }
    },
    
    fallbackCopy(text) {
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      
      try {
        document.execCommand('copy')
        this.$message.success('配置已复制到剪贴板')
      } catch (error) {
        this.$message.error('复制失败，请手动复制')
      }
      
      document.body.removeChild(textArea)
    },
    
    closeModal() {
      if (this.hasChanges) {
        const confirmed = confirm('有未保存的更改，确定要关闭吗？')
        if (!confirmed) return
      }
      
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
  max-width: 900px;
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

.config-tabs {
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
  flex: 1;
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
  padding: 25px;
  height: calc(100% - 60px);
  overflow: auto;
}

.config-form h4 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 18px;
}

.section-description {
  color: #6c757d;
  margin-bottom: 25px;
  font-size: 14px;
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 8px;
  font-size: 14px;
}

.form-control {
  width: 100%;
  padding: 10px 12px;
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

.form-hint {
  margin-top: 5px;
  font-size: 12px;
  color: #6c757d;
}

.switch-group {
  display: flex;
  align-items: center;
  gap: 10px;
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

.switch-label {
  font-size: 14px;
  color: #2c3e50;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: normal !important;
  color: #2c3e50 !important;
  cursor: pointer;
  margin-bottom: 10px;
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.radio-label {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-weight: normal !important;
  color: #2c3e50 !important;
  cursor: pointer;
  font-size: 14px;
}

.sub-form {
  margin-left: 20px;
  margin-top: 15px;
  padding-left: 15px;
  border-left: 2px solid #e9ecef;
}

.code-editor {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.4;
  background: #f8f9fa;
}

.error-text {
  color: #dc3545;
}

.success-text {
  color: #28a745;
}

.parameters-config {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.param-config {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
}

.param-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  margin: 0 0 15px 0;
  font-size: 14px;
}

.param-control {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.param-input {
  margin-left: 20px;
}

.env-vars {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.env-var-item {
  display: flex;
  gap: 10px;
  align-items: center;
}

.env-key {
  flex: 1;
}

.env-value {
  flex: 2;
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
  justify-content: space-between;
  align-items: center;
}

.footer-left,
.footer-right {
  display: flex;
  gap: 10px;
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

/* 预览弹窗样式 */
.preview-modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.preview-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-header h3 {
  margin: 0;
  color: #2c3e50;
}

.preview-content {
  flex: 1;
  overflow: auto;
  padding: 20px;
}

.config-preview {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 15px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  margin: 0;
  overflow-x: auto;
}

.preview-footer {
  padding: 15px 20px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .modal-overlay {
    padding: 10px;
  }
  
  .modal-content {
    max-height: 95vh;
  }
  
  .tabs {
    flex-wrap: wrap;
  }
  
  .tab {
    flex: none;
    min-width: 120px;
  }
  
  .modal-footer {
    flex-direction: column;
    gap: 15px;
  }
  
  .footer-left,
  .footer-right {
    justify-content: center;
    width: 100%;
  }
  
  .env-var-item {
    flex-direction: column;
    align-items: stretch;
  }
  
  .param-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
}
</style>
