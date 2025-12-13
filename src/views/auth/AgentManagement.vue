<template>
  <div class="agent-management">
    <SideMenu />
    <div class="content">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span class="card-title">
            <i class="el-icon-user"></i>
            Agent 管理中心
          </span>
          <el-button 
            style="float: right; padding: 3px 0" 
            type="primary" 
            size="small"
            @click="showCreateDialog = true"
          >
            <i class="el-icon-plus"></i>
            新建 Agent
          </el-button>
        </div>

        <!-- 统计信息卡片 -->
        <div class="stats-section">
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="stat-card">
                <div class="stat-icon">
                  <i class="el-icon-user"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-number">{{ agentList.length }}</div>
                  <div class="stat-label">总 Agent 数</div>
                </div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-card">
                <div class="stat-icon">
                  <i class="el-icon-chat-dot-square"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-number">{{ getTotalConversations() }}</div>
                  <div class="stat-label">总会话数</div>
                </div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-card">
                <div class="stat-icon">
                  <i class="el-icon-time"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-number">{{ recentlyUpdated }}</div>
                  <div class="stat-label">最近更新</div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- 搜索和筛选 -->
        <div class="filter-section">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-input
                v-model="searchKeyword"
                placeholder="搜索 Agent 名称或描述"
                prefix-icon="el-icon-search"
                clearable
                @input="handleSearch"
              />
            </el-col>
            <el-col :span="6">
              <el-select
                v-model="filterModel"
                placeholder="筛选模型"
                clearable
                @change="handleSearch"
              >
                <el-option label="DeepSeek Chat" value="deepseek-chat" />
                <el-option label="DeepSeek Reasoner" value="deepseek-reasoner" />
              </el-select>
            </el-col>
            <el-col :span="6">
              <el-button type="primary" @click="loadAgentList">
                <i class="el-icon-refresh"></i>
                刷新
              </el-button>
            </el-col>
          </el-row>
        </div>

        <!-- Agent 列表 -->
        <div class="agents-grid" v-loading="loading">
          <div 
            v-for="agent in filteredAgents" 
            :key="agent.id" 
            class="agent-card"
          >
            <div class="agent-header">
              <div class="agent-info">
                <h3>{{ agent.name }}</h3>
                <el-tag v-if="agent.reasoning_mode" type="warning" size="mini">推理模式</el-tag>
                <el-tag v-if="agent.model" type="info" size="mini">{{ agent.model }}</el-tag>
              </div>
              <div class="agent-actions">
                <el-dropdown @command="handleCommand">
                  <el-button type="text" icon="el-icon-more"></el-button>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item :command="{action: 'edit', agent}">
                      <i class="el-icon-edit"></i> 编辑
                    </el-dropdown-item>
                    <el-dropdown-item :command="{action: 'conversations', agent}">
                      <i class="el-icon-chat-dot-square"></i> 查看会话
                    </el-dropdown-item>
                    <el-dropdown-item :command="{action: 'delete', agent}" divided>
                      <i class="el-icon-delete"></i> 删除
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </div>
            </div>

            <div class="agent-body">
              <p class="agent-description">{{ agent.description || '暂无描述' }}</p>
              
              <div class="agent-meta">
                <div class="meta-item">
                  <span class="label">温度:</span>
                  <span class="value">{{ agent.temperature }}</span>
                </div>
                <div class="meta-item">
                  <span class="label">工具模式:</span>
                  <span class="value">{{ getToolModeLabel(agent.tool_mode) }}</span>
                </div>
                <div class="meta-item">
                  <span class="label">工具数:</span>
                  <span class="value">{{ agent.tool_ids ? agent.tool_ids.length : 0 }}</span>
                </div>
                <div class="meta-item">
                  <span class="label">创建时间:</span>
                  <span class="value">{{ formatDate(agent.created_at) }}</span>
                </div>
              </div>

              <div v-if="agent.system_prompt" class="agent-prompt">
                <el-collapse>
                  <el-collapse-item title="系统提示词" name="1">
                    <div class="prompt-content">{{ agent.system_prompt }}</div>
                  </el-collapse-item>
                </el-collapse>
              </div>
            </div>

            <div class="agent-footer">
              <el-button size="small" @click="viewAgentDetail(agent)">
                <i class="el-icon-view"></i> 查看详情
              </el-button>
              <el-button size="small" type="primary" @click="chatWithAgent(agent)">
                <i class="el-icon-chat-dot-square"></i> 开始对话
              </el-button>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="!loading && filteredAgents.length === 0" class="empty-state">
          <i class="el-icon-user"></i>
          <h3>{{ searchKeyword || filterModel ? '没有找到匹配的 Agent' : '还没有创建 Agent' }}</h3>
          <p>{{ searchKeyword || filterModel ? '尝试调整搜索条件' : '点击上方按钮创建第一个 Agent' }}</p>
          <el-button v-if="!searchKeyword && !filterModel" type="primary" @click="showCreateDialog = true">
            <i class="el-icon-plus"></i> 创建 Agent
          </el-button>
        </div>
      </el-card>

      <!-- 创建/编辑 Agent 对话框 -->
      <el-dialog
        :title="dialogType === 'create' ? '创建 Agent' : '编辑 Agent'"
        :visible.sync="showCreateDialog"
        width="70%"
        :close-on-click-modal="false"
      >
        <el-form :model="agentForm" :rules="formRules" ref="agentForm" label-width="120px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="名称" prop="name">
                <el-input v-model="agentForm.name" placeholder="请输入 Agent 名称" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="模型" prop="model">
                <el-select v-model="agentForm.model" placeholder="选择模型" style="width: 100%">
                  <el-option label="DeepSeek Chat" value="deepseek-chat" />
                  <el-option label="DeepSeek Reasoner" value="deepseek-reasoner" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="描述" prop="description">
            <el-input
              v-model="agentForm.description"
              type="textarea"
              :rows="2"
              placeholder="请输入 Agent 描述"
            />
          </el-form-item>

          <el-form-item label="系统提示词" prop="system_prompt">
            <el-input
              v-model="agentForm.system_prompt"
              type="textarea"
              :rows="6"
              placeholder="请输入系统提示词，用于定义 Agent 的行为和角色"
            />
          </el-form-item>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="温度" prop="temperature">
                <el-slider
                  v-model="agentForm.temperature"
                  :min="0"
                  :max="2"
                  :step="0.1"
                  show-input
                />
                <span class="form-tip">较低值使输出更确定，较高值使输出更随机</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="工具模式" prop="tool_mode">
                <el-select v-model="agentForm.tool_mode" placeholder="选择工具模式" style="width: 100%">
                  <el-option label="自动" value="auto" />
                  <el-option label="必须使用" value="required" />
                  <el-option label="禁用" value="none" />
                </el-select>
                <span class="form-tip">控制 Agent 如何使用工具</span>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="推理模式">
                <el-switch v-model="agentForm.reasoning_mode" />
                <span class="form-tip">启用深度推理能力</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="工具 IDs">
                <el-select
                  v-model="agentForm.tool_ids"
                  multiple
                  filterable
                  allow-create
                  placeholder="选择或输入工具 ID"
                  style="width: 100%"
                >
                  <el-option
                    v-for="tool in availableTools"
                    :key="tool"
                    :label="tool"
                    :value="tool"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>

        <div slot="footer" class="dialog-footer">
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button type="primary" @click="submitAgent" :loading="submitting">
            {{ dialogType === 'create' ? '创建' : '更新' }}
          </el-button>
        </div>
      </el-dialog>

      <!-- Agent 详情对话框 -->
      <el-dialog
        title="Agent 详情"
        :visible.sync="showDetailDialog"
        width="70%"
      >
        <div v-if="currentAgent">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="名称">{{ currentAgent.name }}</el-descriptions-item>
            <el-descriptions-item label="模型">{{ currentAgent.model }}</el-descriptions-item>
            <el-descriptions-item label="温度">{{ currentAgent.temperature }}</el-descriptions-item>
            <el-descriptions-item label="工具模式">{{ getToolModeLabel(currentAgent.tool_mode) }}</el-descriptions-item>
            <el-descriptions-item label="推理模式">
              <el-tag :type="currentAgent.reasoning_mode ? 'success' : 'info'" size="small">
                {{ currentAgent.reasoning_mode ? '已启用' : '未启用' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="工具数量">
              {{ currentAgent.tool_ids ? currentAgent.tool_ids.length : 0 }}
            </el-descriptions-item>
            <el-descriptions-item label="创建时间" :span="2">
              {{ formatDate(currentAgent.created_at) }}
            </el-descriptions-item>
            <el-descriptions-item label="更新时间" :span="2">
              {{ formatDate(currentAgent.updated_at) }}
            </el-descriptions-item>
            <el-descriptions-item label="描述" :span="2">
              {{ currentAgent.description || '暂无描述' }}
            </el-descriptions-item>
            <el-descriptions-item label="系统提示词" :span="2">
              <div class="prompt-display">{{ currentAgent.system_prompt || '暂无' }}</div>
            </el-descriptions-item>
            <el-descriptions-item label="工具列表" :span="2">
              <el-tag
                v-for="tool in currentAgent.tool_ids"
                :key="tool"
                size="small"
                style="margin-right: 8px;"
              >
                {{ tool }}
              </el-tag>
              <span v-if="!currentAgent.tool_ids || currentAgent.tool_ids.length === 0">无</span>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div slot="footer" class="dialog-footer">
          <el-button @click="showDetailDialog = false">关闭</el-button>
          <el-button type="primary" @click="editAgent(currentAgent)">
            <i class="el-icon-edit"></i> 编辑
          </el-button>
          <el-button type="success" @click="chatWithAgent(currentAgent)">
            <i class="el-icon-chat-dot-square"></i> 开始对话
          </el-button>
        </div>
      </el-dialog>

      <!-- Agent 会话列表对话框 -->
      <el-dialog
        :title="`${currentAgent ? currentAgent.name : ''} 的会话列表`"
        :visible.sync="showConversationsDialog"
        width="60%"
      >
        <el-table
          v-loading="loadingConversations"
          :data="agentConversations"
          style="width: 100%"
        >
          <el-table-column prop="title" label="标题" />
          <el-table-column prop="created_at" label="创建时间" width="180">
            <template slot-scope="scope">
              {{ formatDate(scope.row.created_at) }}
            </template>
          </el-table-column>
          <el-table-column prop="last_active" label="最后活动" width="180">
            <template slot-scope="scope">
              {{ formatDate(scope.row.last_active) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template slot-scope="scope">
              <el-button size="mini" @click="viewConversation(scope.row)">
                查看
              </el-button>
              <el-button size="mini" type="danger" @click="deleteConversation(scope.row.id)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div slot="footer" class="dialog-footer">
          <el-button @click="showConversationsDialog = false">关闭</el-button>
          <el-button type="primary" @click="createNewConversation(currentAgent)">
            <i class="el-icon-plus"></i> 新建会话
          </el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import config from '@/config/config'
import SideMenu from '../../components/SideMenu.vue'

export default {
  name: 'AgentManagement',
  components: {
    SideMenu
  },
  
  data() {
    return {
      loading: false,
      submitting: false,
      loadingConversations: false,
      showCreateDialog: false,
      showDetailDialog: false,
      showConversationsDialog: false,
      dialogType: 'create',
      
      // 搜索和筛选
      searchKeyword: '',
      filterModel: '',
      
      // 统计数据
      recentlyUpdated: 0,
      
      // Agent 列表
      agentList: [],
      currentAgent: null,
      agentConversations: [],
      
      // 可用工具列表（从后端动态加载）
      availableTools: [],
      
      // 表单数据
      agentForm: {
        name: '',
        description: '',
        system_prompt: '',
        model: 'deepseek-chat',
        temperature: 0.3,
        reasoning_mode: false,
        tool_mode: 'auto',
        tool_ids: []
      },
      
      // 表单验证规则
      formRules: {
        name: [
          { required: true, message: '请输入 Agent 名称', trigger: 'blur' }
        ],
        model: [
          { required: true, message: '请选择模型', trigger: 'change' }
        ]
      }
    }
  },
  
  computed: {
    filteredAgents() {
      let filtered = this.agentList
      
      if (this.searchKeyword) {
        const keyword = this.searchKeyword.toLowerCase()
        filtered = filtered.filter(agent => 
          agent.name.toLowerCase().includes(keyword) ||
          (agent.description && agent.description.toLowerCase().includes(keyword))
        )
      }
      
      if (this.filterModel) {
        filtered = filtered.filter(agent => agent.model === this.filterModel)
      }
      
      return filtered
    }
  },
  
  mounted() {
    this.loadAgentList()
    this.loadAvailableTools()
  },
  
  methods: {
    // 加载 Agent 列表
    async loadAgentList() {
      this.loading = true
      try {
        // axios.defaults 应该已经设置了 Authorization header
        console.log('发送请求到:', `${config.aiApiBaseUrl}/agents`)
        console.log('当前 axios 默认 headers:', axios.defaults.headers.common)
        
        const response = await axios.get(`${config.aiApiBaseUrl}/agents`, {
          headers: {
            'accept': 'application/json'
          }
        })
        
        if (Array.isArray(response.data)) {
          this.agentList = response.data
          this.calculateStats()
        } else {
          this.$message.error('获取 Agent 列表失败')
        }
      } catch (error) {
        console.error('获取 Agent 列表失败:', error)
        console.error('错误详情:', error.response)
        this.$message.error('获取 Agent 列表失败: ' + (error.response?.data?.detail || error.message))
      } finally {
        this.loading = false
      }
    },
    
    // 加载可用工具列表
    async loadAvailableTools() {
      try {
        const response = await axios.get(`${config.aiApiBaseUrl}/api/tools/list`, {
          headers: {
            'accept': 'application/json'
          },
          params: {
            enabled_only: true,
            page_size: 100
          }
        })
        
        if (response.data && response.data.success && response.data.data && response.data.data.tools) {
          // 提取工具名称
          this.availableTools = response.data.data.tools.map(tool => tool.name)
        }
      } catch (error) {
        console.error('加载工具列表失败:', error)
        // 如果加载失败，使用默认的工具列表
        this.availableTools = [
          'get_stock_data',
          'get_stock_news',
          'get_stock_news_em',
          'technical_analysis',
          'market_overview',
          'get_stock_tick_analysis'
        ]
      }
    },
    
    // 计算统计数据
    calculateStats() {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      
      this.recentlyUpdated = this.agentList.filter(agent => {
        const updatedAt = new Date(agent.updated_at)
        return updatedAt >= sevenDaysAgo
      }).length
    },
    
    // 获取总会话数
    getTotalConversations() {
      // 这里可以根据实际情况累计所有 Agent 的会话数
      return 0
    },
    
    // 搜索处理
    handleSearch() {
      // 实时筛选，不需要额外操作
    },
    
    // 查看 Agent 详情
    viewAgentDetail(agent) {
      this.currentAgent = agent
      this.showDetailDialog = true
    },
    
    // 编辑 Agent
    editAgent(agent) {
      this.dialogType = 'edit'
      this.agentForm = {
        id: agent.id,
        name: agent.name,
        description: agent.description || '',
        system_prompt: agent.system_prompt || '',
        model: agent.model || 'deepseek-chat',
        temperature: agent.temperature || 0.3,
        reasoning_mode: agent.reasoning_mode || false,
        tool_mode: agent.tool_mode || 'auto',
        tool_ids: agent.tool_ids || []
      }
      this.showDetailDialog = false
      this.showCreateDialog = true
    },
    
    // 删除 Agent
    async deleteAgent(agent) {
      try {
        await this.$confirm(`确定要删除 Agent "${agent.name}" 吗？此操作不可恢复。`, '确认删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        const response = await axios.delete(`${config.aiApiBaseUrl}/agents/${agent.id}`, {
          headers: {
            'accept': 'application/json'
          }
        })
        
        if (response.data && response.data.success) {
          this.$message.success('删除成功')
          this.loadAgentList()
        } else {
          this.$message.success('删除成功')
          this.loadAgentList()
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除 Agent 失败:', error)
          this.$message.error('删除失败: ' + (error.response?.data?.detail || error.message))
        }
      }
    },
    
    // 提交表单
    async submitAgent() {
      this.$refs.agentForm.validate(async (valid) => {
        if (valid) {
          this.submitting = true
          try {
            const formData = {
              name: this.agentForm.name,
              description: this.agentForm.description,
              system_prompt: this.agentForm.system_prompt,
              model: this.agentForm.model,
              temperature: this.agentForm.temperature,
              reasoning_mode: this.agentForm.reasoning_mode,
              tool_mode: this.agentForm.tool_mode,
              tool_ids: this.agentForm.tool_ids
            }
            
            let response
            if (this.dialogType === 'create') {
              response = await axios.post(`${config.aiApiBaseUrl}/agents`, formData, {
                headers: {
                  'accept': 'application/json',
                  'Content-Type': 'application/json'
                }
              })
            } else {
              response = await axios.put(`${config.aiApiBaseUrl}/agents/${this.agentForm.id}`, formData, {
                headers: {
                  'accept': 'application/json',
                  'Content-Type': 'application/json'
                }
              })
            }
            
            if (response.data) {
              this.$message.success(this.dialogType === 'create' ? '创建成功' : '更新成功')
              this.showCreateDialog = false
              this.resetForm()
              this.loadAgentList()
            }
          } catch (error) {
            console.error((this.dialogType === 'create' ? '创建' : '更新') + ' Agent 失败:', error)
            this.$message.error((this.dialogType === 'create' ? '创建' : '更新') + '失败: ' + (error.response?.data?.detail || error.message))
          } finally {
            this.submitting = false
          }
        }
      })
    },
    
    // 重置表单
    resetForm() {
      this.agentForm = {
        name: '',
        description: '',
        system_prompt: '',
        model: 'deepseek-chat',
        temperature: 0.3,
        reasoning_mode: false,
        tool_mode: 'auto',
        tool_ids: []
      }
      this.$refs.agentForm && this.$refs.agentForm.resetFields()
    },
    
    // 查看 Agent 会话列表
    async viewAgentConversations(agent) {
      this.currentAgent = agent
      this.loadingConversations = true
      this.showConversationsDialog = true
      
      try {
        const response = await axios.get(`${config.aiApiBaseUrl}/agents/${agent.id}/conversations`, {
          headers: {
            'accept': 'application/json'
          }
        })
        
        if (Array.isArray(response.data)) {
          this.agentConversations = response.data
        }
      } catch (error) {
        console.error('获取会话列表失败:', error)
        this.$message.error('获取会话列表失败: ' + (error.response?.data?.detail || error.message))
      } finally {
        this.loadingConversations = false
      }
    },
    
    // 创建新会话
    async createNewConversation(agent) {
      try {
        const response = await axios.post(
          `${config.aiApiBaseUrl}/agents/${agent.id}/conversations`,
          {},
          {
            headers: {
              'accept': 'application/json'
            }
          }
        )
        
        if (response.data && response.data.conversation_id) {
          this.$message.success('创建会话成功')
          this.viewAgentConversations(agent)
        }
      } catch (error) {
        console.error('创建会话失败:', error)
        this.$message.error('创建会话失败: ' + (error.response?.data?.detail || error.message))
      }
    },
    
    // 查看会话
    viewConversation(conversation) {
      // 跳转到 AI 聊天页面并加载该会话
      this.$router.push({
        path: '/ai-chatbox',
        query: {
          conversation_id: conversation.id,
          agent_id: this.currentAgent.id
        }
      })
    },
    
    // 删除会话
    async deleteConversation(conversationId) {
      try {
        await this.$confirm('确定要删除这个会话吗？', '确认删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        // 这里需要根据实际 API 调整
        this.$message.info('会话删除功能待实现')
      } catch (error) {
        // 用户取消
      }
    },
    
    // 与 Agent 对话
    chatWithAgent(agent) {
      this.$router.push({
        path: '/ai-chatbox',
        query: {
          agent_id: agent.id
        }
      })
    },
    
    // 处理下拉菜单命令
    handleCommand(command) {
      const { action, agent } = command
      switch (action) {
        case 'edit':
          this.editAgent(agent)
          break
        case 'conversations':
          this.viewAgentConversations(agent)
          break
        case 'delete':
          this.deleteAgent(agent)
          break
      }
    },
    
    // 获取工具模式标签
    getToolModeLabel(mode) {
      const labels = {
        'auto': '自动',
        'required': '必须使用',
        'none': '禁用'
      }
      return labels[mode] || mode
    },
    
    // 格式化日期
    formatDate(dateStr) {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  },
  
  watch: {
    showCreateDialog(val) {
      if (!val) {
        this.resetForm()
        this.dialogType = 'create'
      }
    }
  }
}
</script>

<style scoped>
.agent-management {
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

.stats-section {
  margin-bottom: 20px;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 20px;
  color: white;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.stat-card:nth-child(2n) {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  box-shadow: 0 4px 12px rgba(240, 147, 251, 0.3);
}

.stat-card:nth-child(3n) {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3);
}

.stat-icon {
  font-size: 2.5rem;
  margin-right: 15px;
  opacity: 0.8;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

.filter-section {
  margin-bottom: 20px;
}

.agents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.agent-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  overflow: hidden;
}

.agent-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.agent-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.agent-info h3 {
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 18px;
}

.agent-info .el-tag {
  margin-right: 5px;
}

.agent-body {
  padding: 20px;
}

.agent-description {
  color: #6c757d;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 15px;
  min-height: 40px;
}

.agent-meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
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

.agent-prompt {
  margin-top: 10px;
}

.prompt-content {
  background: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
  font-size: 13px;
  line-height: 1.5;
  color: #495057;
  max-height: 150px;
  overflow-y: auto;
}

.agent-footer {
  padding: 15px 20px;
  background: #f8f9fa;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
}

.empty-state i {
  font-size: 4rem;
  margin-bottom: 20px;
  color: #d0d0d0;
}

.empty-state h3 {
  margin-bottom: 10px;
  color: #2c3e50;
}

.form-tip {
  display: block;
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.prompt-display {
  background: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-word;
}

@media (max-width: 768px) {
  .content {
    padding: 15px;
  }
  
  .agents-grid {
    grid-template-columns: 1fr;
  }
}
</style>

