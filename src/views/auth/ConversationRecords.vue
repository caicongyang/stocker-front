<template>
  <div class="conversation-records">
    <SideMenu />
    <div class="content">
      <el-card class="header-card">
      <div slot="header" class="card-header">
        <h2>对话记录分析</h2>
        <el-button type="primary" icon="el-icon-refresh" @click="loadConversations">刷新</el-button>
      </div>
      
      <!-- 统计信息 -->
      <div class="statistics" v-if="statistics">
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="stat-item">
              <i class="el-icon-chat-dot-round stat-icon"></i>
              <div class="stat-content">
                <div class="stat-value">{{ statistics.total_conversations }}</div>
                <div class="stat-label">总对话数</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <i class="el-icon-message stat-icon"></i>
              <div class="stat-content">
                <div class="stat-value">{{ statistics.total_messages }}</div>
                <div class="stat-label">总消息数</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <i class="el-icon-time stat-icon"></i>
              <div class="stat-content">
                <div class="stat-value">{{ statistics.recent_conversations }}</div>
                <div class="stat-label">活跃对话(7天)</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <i class="el-icon-data-line stat-icon"></i>
              <div class="stat-content">
                <div class="stat-value">{{ statistics.average_messages_per_conversation?.toFixed(1) || 0 }}</div>
                <div class="stat-label">平均消息数</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- 对话列表 -->
    <el-card class="list-card">
      <div slot="header" class="list-header">
        <h3>对话列表</h3>
        <div class="filter-section">
          <el-select 
            v-model="selectedAgentFilter" 
            placeholder="按Agent过滤" 
            clearable 
            @change="handleAgentFilterChange"
            style="width: 200px;"
          >
            <el-option label="全部对话" value=""></el-option>
            <el-option 
              v-for="agent in agents" 
              :key="agent.id" 
              :label="agent.name" 
              :value="agent.id"
            >
              <span>{{ agent.name }}</span>
              <span style="color: #8492a6; font-size: 12px; margin-left: 8px;">({{ agent.id }})</span>
            </el-option>
          </el-select>
        </div>
      </div>
      
      <el-table
        :data="conversations"
        style="width: 100%"
        v-loading="loading"
        @row-click="handleConversationClick"
        highlight-current-row
        stripe
      >
        <el-table-column prop="id" label="对话ID" width="200" show-overflow-tooltip></el-table-column>
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip></el-table-column>
        <el-table-column prop="message_count" label="消息数" width="100" align="center"></el-table-column>
        <el-table-column prop="agent_id" label="Agent" width="150" show-overflow-tooltip>
          <template slot-scope="scope">
            <el-tag v-if="scope.row.agent_id" size="small">{{ scope.row.agent_id }}</el-tag>
            <span v-else style="color: #999;">默认</span>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template slot-scope="scope">
            {{ formatDateTime(scope.row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column prop="last_active" label="最后活跃" width="180">
          <template slot-scope="scope">
            {{ formatDateTime(scope.row.last_active) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template slot-scope="scope">
            <el-button
              type="text"
              size="small"
              @click.stop="viewConversationDetails(scope.row.id)"
            >
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 对话详情对话框 -->
    <el-dialog
      :title="'对话详情 - ' + (selectedConversation?.title || '')"
      :visible.sync="detailDialogVisible"
      width="90%"
      top="5vh"
      @close="handleDialogClose"
    >
      <div v-if="conversationDetails" class="conversation-details">
        <!-- 标签页 -->
        <el-tabs v-model="activeTab" type="border-card">
          <!-- 消息历史 -->
          <el-tab-pane label="消息历史" name="messages">
            <div class="messages-panel">
              <el-timeline>
                <el-timeline-item
                  v-for="(msg, index) in conversationDetails.messages"
                  :key="index"
                  :timestamp="formatDateTime(msg.timestamp)"
                  :color="msg.role === 'user' ? '#409EFF' : '#67C23A'"
                >
                  <el-card :class="'message-card message-' + msg.role">
                    <div slot="header" class="message-header">
                      <el-tag :type="msg.role === 'user' ? 'primary' : 'success'" size="small">
                        {{ msg.role === 'user' ? '用户' : '助手' }}
                      </el-tag>
                    </div>
                    <div class="message-content">{{ msg.content }}</div>
                  </el-card>
                </el-timeline-item>
              </el-timeline>
              <el-empty v-if="!conversationDetails.messages || conversationDetails.messages.length === 0" description="暂无消息"></el-empty>
            </div>
          </el-tab-pane>

          <!-- 工具调用记录 -->
          <el-tab-pane name="tools">
            <span slot="label">
              工具调用 
              <el-badge :value="conversationDetails.statistics?.tool_call_count || 0" class="tab-badge"></el-badge>
            </span>
            <div class="tool-calls-panel">
              <el-table :data="conversationDetails.tool_calls" style="width: 100%" stripe>
                <el-table-column type="expand">
                  <template slot-scope="props">
                    <div class="tool-details">
                      <el-descriptions :column="2" border>
                        <el-descriptions-item label="工具ID">{{ props.row.tool_call_id || 'N/A' }}</el-descriptions-item>
                        <el-descriptions-item label="状态">
                          <el-tag :type="getStatusType(props.row.status)" size="small">
                            {{ props.row.status || '未知' }}
                          </el-tag>
                        </el-descriptions-item>
                        <el-descriptions-item label="参数" :span="2">
                          <pre class="json-code">{{ formatJSON(props.row.arguments) }}</pre>
                        </el-descriptions-item>
                        <el-descriptions-item label="结果预览" :span="2">
                          <div v-if="props.row.result_preview" class="result-preview">{{ props.row.result_preview }}</div>
                          <span v-else style="color: #999;">无</span>
                        </el-descriptions-item>
                        <el-descriptions-item label="错误信息" :span="2" v-if="props.row.error">
                          <el-alert type="error" :closable="false">{{ props.row.error }}</el-alert>
                        </el-descriptions-item>
                      </el-descriptions>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="tool_name" label="工具名称" width="200"></el-table-column>
                <el-table-column prop="status" label="状态" width="100">
                  <template slot-scope="scope">
                    <el-tag :type="getStatusType(scope.row.status)" size="small">
                      {{ scope.row.status || '未知' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="result_preview" label="结果预览" min-width="200" show-overflow-tooltip></el-table-column>
                <el-table-column prop="created_at" label="调用时间" width="180">
                  <template slot-scope="scope">
                    {{ formatDateTime(scope.row.created_at) }}
                  </template>
                </el-table-column>
              </el-table>
              <el-empty v-if="!conversationDetails.tool_calls || conversationDetails.tool_calls.length === 0" description="暂无工具调用记录"></el-empty>
            </div>
          </el-tab-pane>

          <!-- 推理轨迹 -->
          <el-tab-pane name="traces">
            <span slot="label">
              推理轨迹 
              <el-badge :value="conversationDetails.statistics?.reasoning_trace_count || 0" class="tab-badge"></el-badge>
            </span>
            <div class="traces-panel">
              <el-timeline>
                <el-timeline-item
                  v-for="(trace, index) in conversationDetails.reasoning_traces"
                  :key="index"
                  :timestamp="formatDateTime(trace.created_at)"
                  color="#E6A23C"
                >
                  <el-card class="trace-card">
                    <div slot="header" class="trace-header">
                      <el-tag type="warning" size="small">{{ trace.stage }}</el-tag>
                    </div>
                    <div class="trace-content">
                      <el-descriptions :column="1" border v-if="trace.state_snapshot || trace.metadata">
                        <el-descriptions-item label="状态快照" v-if="trace.state_snapshot">
                          <pre class="json-code">{{ formatJSON(trace.state_snapshot) }}</pre>
                        </el-descriptions-item>
                        <el-descriptions-item label="元数据" v-if="trace.metadata">
                          <pre class="json-code">{{ formatJSON(trace.metadata) }}</pre>
                        </el-descriptions-item>
                      </el-descriptions>
                    </div>
                  </el-card>
                </el-timeline-item>
              </el-timeline>
              <el-empty v-if="!conversationDetails.reasoning_traces || conversationDetails.reasoning_traces.length === 0" description="暂无推理轨迹"></el-empty>
            </div>
          </el-tab-pane>

          <!-- 统计信息 -->
          <el-tab-pane label="统计信息" name="stats">
            <div class="stats-panel">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="对话ID">{{ conversationDetails.conversation?.id }}</el-descriptions-item>
                <el-descriptions-item label="标题">{{ conversationDetails.conversation?.title }}</el-descriptions-item>
                <el-descriptions-item label="创建时间">{{ formatDateTime(conversationDetails.conversation?.created_at) }}</el-descriptions-item>
                <el-descriptions-item label="最后活跃">{{ formatDateTime(conversationDetails.conversation?.last_active) }}</el-descriptions-item>
                <el-descriptions-item label="消息数量">{{ conversationDetails.statistics?.message_count || 0 }}</el-descriptions-item>
                <el-descriptions-item label="工具调用次数">{{ conversationDetails.statistics?.tool_call_count || 0 }}</el-descriptions-item>
                <el-descriptions-item label="推理轨迹数">{{ conversationDetails.statistics?.reasoning_trace_count || 0 }}</el-descriptions-item>
                <el-descriptions-item label="Agent ID">
                  <el-tag v-if="conversationDetails.conversation?.agent_id" size="small">
                    {{ conversationDetails.conversation.agent_id }}
                  </el-tag>
                  <span v-else style="color: #999;">默认</span>
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
      
      <div v-loading="detailLoading" v-if="detailLoading" style="min-height: 300px;"></div>
    </el-dialog>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import config from '@/config/config';
import SideMenu from '@/components/SideMenu.vue';

export default {
  name: 'ConversationRecords',
  components: {
    SideMenu
  },
  data() {
    return {
      loading: false,
      detailLoading: false,
      conversations: [],
      agents: [],
      statistics: null,
      detailDialogVisible: false,
      selectedConversation: null,
      conversationDetails: null,
      activeTab: 'messages',
      selectedAgentFilter: ''
    };
  },
  mounted() {
    this.loadAgents();
    this.loadConversations();
    this.loadStatistics();
  },
  methods: {
    async loadAgents() {
      try {
        const response = await axios.get(`${config.aiApiBaseUrl}/agents`);
        this.agents = response.data || [];
      } catch (error) {
        console.error('加载Agent列表失败:', error);
      }
    },
    
    async loadConversations() {
      this.loading = true;
      try {
        // 使用新的对话记录API,支持按agent_id过滤
        let url = `${config.aiApiBaseUrl}/conversation-records/conversations`;
        if (this.selectedAgentFilter) {
          url += `?agent_id=${this.selectedAgentFilter}`;
        }
        const response = await axios.get(url);
        this.conversations = response.data || [];
      } catch (error) {
        console.error('加载对话列表失败:', error);
        this.$message.error('加载对话列表失败: ' + (error.response?.data?.detail || error.message));
      } finally {
        this.loading = false;
      }
    },
    
    handleAgentFilterChange() {
      this.loadConversations();
    },
    
    async loadStatistics() {
      try {
        const response = await axios.get(`${config.aiApiBaseUrl}/conversation-records/statistics`);
        this.statistics = response.data;
      } catch (error) {
        console.error('加载统计信息失败:', error);
      }
    },
    
    handleConversationClick(row) {
      this.viewConversationDetails(row.id);
    },
    
    async viewConversationDetails(conversationId) {
      this.selectedConversation = this.conversations.find(c => c.id === conversationId);
      this.detailDialogVisible = true;
      this.detailLoading = true;
      this.activeTab = 'messages';
      
      try {
        const response = await axios.get(`${config.aiApiBaseUrl}/conversation-records/${conversationId}/full-records`);
        this.conversationDetails = response.data;
      } catch (error) {
        console.error('加载对话详情失败:', error);
        this.$message.error('加载对话详情失败: ' + (error.response?.data?.detail || error.message));
      } finally {
        this.detailLoading = false;
      }
    },
    
    handleDialogClose() {
      this.conversationDetails = null;
      this.selectedConversation = null;
    },
    
    formatDateTime(dateTime) {
      if (!dateTime) return 'N/A';
      try {
        const date = new Date(dateTime);
        return date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      } catch (e) {
        return dateTime;
      }
    },
    
    formatJSON(jsonStr) {
      if (!jsonStr) return 'N/A';
      try {
        const obj = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr;
        return JSON.stringify(obj, null, 2);
      } catch (e) {
        return jsonStr;
      }
    },
    
    getStatusType(status) {
      const statusMap = {
        'success': 'success',
        'completed': 'success',
        'error': 'danger',
        'failed': 'danger',
        'pending': 'warning',
        'running': 'info'
      };
      return statusMap[status?.toLowerCase()] || 'info';
    }
  }
};
</script>

<style scoped>
.conversation-records {
  display: flex;
  height: 100vh;
  background-color: #f5f7fa;
}

.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.header-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.statistics {
  padding: 10px 0;
}

.stat-item {
  display: flex;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  color: white;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.stat-item:nth-child(2) .stat-item {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon {
  font-size: 48px;
  margin-right: 20px;
  opacity: 0.8;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

.list-card {
  margin-top: 20px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.list-header h3 {
  margin: 0;
}

.filter-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.conversation-details {
  max-height: 70vh;
  overflow-y: auto;
}

.messages-panel {
  padding: 20px;
}

.message-card {
  margin-bottom: 10px;
}

.message-header {
  display: flex;
  align-items: center;
}

.message-content {
  padding: 10px 0;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.message-user {
  background-color: #ecf5ff;
}

.message-assistant {
  background-color: #f0f9ff;
}

.tool-calls-panel,
.traces-panel,
.stats-panel {
  padding: 20px;
}

.tool-details {
  padding: 20px;
  background-color: #f9f9f9;
}

.trace-card {
  margin-bottom: 10px;
}

.trace-header {
  display: flex;
  align-items: center;
}

.json-code {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.5;
  margin: 0;
}

.result-preview {
  padding: 10px;
  background-color: #f0f9ff;
  border-radius: 4px;
  border-left: 3px solid #409eff;
}

.tab-badge {
  margin-left: 8px;
}

.el-table {
  cursor: pointer;
}

::v-deep .el-table__row:hover {
  background-color: #f5f7fa !important;
}

::v-deep .el-dialog__body {
  padding: 10px 20px;
}

::v-deep .el-tabs--border-card {
  box-shadow: none;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .conversation-records {
    flex-direction: column;
  }

  .content {
    padding: 68px 12px 12px 12px;
  }

  .header {
    padding: 16px;
  }

  .header h2 {
    font-size: 20px;
  }

  .records-container {
    padding: 12px;
  }

  :deep(.el-tabs__item) {
    padding: 0 12px;
    font-size: 14px;
  }
}
</style>

