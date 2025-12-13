<template>
  <div class="agent-chatbox">
    <SideMenu />
    <div class="content">
      <div class="chat-container">
        <div class="chat-header">
          <div class="header-left">
            <div class="agent-selector">
              <label>选择 Agent:</label>
              <el-select
                v-model="agentId"
                placeholder="请选择 Agent"
                filterable
                @change="handleAgentChange"
                style="width: 250px;"
              >
                <el-option
                  v-for="agent in agentList"
                  :key="agent.id"
                  :label="agent.name"
                  :value="agent.id"
                >
                  <span style="float: left">{{ agent.name }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">{{ agent.model }}</span>
                </el-option>
              </el-select>
            </div>
            <div class="agent-info" v-if="currentAgent">
              <el-avatar :size="32" icon="el-icon-user"></el-avatar>
              <div class="agent-details">
                <h2>{{ currentAgent.name }}</h2>
                <span class="agent-desc">{{ currentAgent.description || '专属AI助手' }}</span>
              </div>
            </div>
          </div>
          <div class="header-actions">
            <el-button type="text" size="small" icon="el-icon-refresh" @click="getConversations">刷新会话</el-button>
            <el-button v-if="hasConversations" type="text" size="small" icon="el-icon-plus" @click="createNewConversation">新建会话</el-button>
            <el-button v-if="hasConversations" type="text" size="small" icon="el-icon-delete" @click="clearMessages">清空对话</el-button>
          </div>
        </div>
        
        <div class="chat-layout">
          <!-- 左侧历史会话列表 -->
          <div v-if="conversations && conversations.length > 0" class="chat-history-list">
            <div class="history-header">
              <h3>历史会话</h3>
            </div>
            <div class="history-items">
              <div 
                v-for="(conv, index) in conversations" 
                :key="conv.id"
                :class="['history-item', conv.id === conversationId ? 'active' : '']"
                @click="switchConversation(conv.id)"
              >
                <div class="history-item-title">{{ conv.title || `会话 ${index + 1}` }}</div>
                <div class="history-item-date">{{ formatTime(conv.created_at) }}</div>
                <div class="history-item-actions">
                  <el-button
                    type="text"
                    size="mini"
                    icon="el-icon-delete"
                    @click.stop="confirmDeleteConversation(conv.id, conv.title || `会话 ${index + 1}`)"
                    title="删除会话"
                  ></el-button>
                </div>
              </div>
            </div>
            <div class="history-actions">
              <el-button 
                type="primary" 
                size="small" 
                icon="el-icon-plus" 
                @click="createNewConversation"
              >新建会话</el-button>
            </div>
          </div>
          
          <!-- 右侧聊天区域 -->
          <div v-if="hasConversations || conversationId === null" :class="['chat-main-area', conversations && conversations.length > 0 ? '' : 'full-width']">
            <div class="chat-messages" ref="messagesContainer">
              <div v-if="messages.length === 0" class="empty-chat">
                <i class="el-icon-chat-dot-square"></i>
                <p>开始和{{ currentAgent ? currentAgent.name : 'AI助手' }}对话吧!</p>
              </div>
              
              <div v-for="(message, index) in messages" :key="index" :class="['message', message.role === 'user' ? 'user-message' : 'ai-message']">
                <div class="message-avatar">
                  <el-avatar :size="40" :src="message.role === 'user' ? userAvatar : aiAvatar"></el-avatar>
                </div>
                <div class="message-content">
                  <div class="message-bubble">
                    <p v-if="message.role === 'user'">{{ message.content }}</p>
                    <div v-else v-html="formatMessage(message.content)"></div>
                  </div>
                  <div class="message-time">{{ formatTime(message.time) }}</div>
                </div>
              </div>
              
              <div v-if="loading" class="message ai-message">
                <div class="message-avatar">
                  <el-avatar :size="40" :src="aiAvatar"></el-avatar>
                </div>
                <div class="message-content">
                  <div class="message-bubble typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="chat-input">
              <el-input
                v-model="userInput"
                type="textarea"
                :rows="3"
                placeholder="请输入您的问题..."
                :disabled="loading"
                @keyup.ctrl.enter.native="handleSend"
              ></el-input>
              <div class="input-actions">
                <span class="input-tip">按 Ctrl+Enter 发送</span>
                <el-button type="primary" :disabled="loading || !userInput.trim()" @click="handleSend">
                  <i class="el-icon-s-promotion"></i> 发送
                </el-button>
              </div>
            </div>
          </div>
          
          <!-- 无会话时显示的欢迎界面 -->
          <div v-else class="no-conversation-area">
            <div class="welcome-container">
              <i class="el-icon-chat-line-round welcome-icon"></i>
              <h3>欢迎使用 {{ currentAgent ? currentAgent.name : 'Agent 助手' }}</h3>
              <p>您目前没有会话记录，点击下方按钮开始您的第一次对话</p>
              <el-button 
                type="primary" 
                size="medium" 
                icon="el-icon-plus" 
                @click="createNewConversation"
                :loading="loading"
              >创建新会话</el-button>
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
  name: 'AgentChatbox',
  components: {
    SideMenu
  },
  data() {
    return {
      agentId: null,
      currentAgent: null,
      agentList: [], // Agent 列表
      userInput: '',
      messages: [],
      loading: false,
      userAvatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
      aiAvatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
      conversationId: null,
      reconnecting: false,
      conversations: [],
      loadingHistory: false
    }
  },
  computed: {
    hasConversations() {
      return this.conversations.length > 0;
    }
  },
  async created() {
    // 加载所有 Agent 列表
    await this.loadAgentList();
    
    // 从路由参数获取 agent_id（如果从 AgentManagement 跳转过来）
    const routeAgentId = this.$route.query.agent_id;
    
    if (routeAgentId) {
      // 从 AgentManagement 跳转过来，自动选择该 Agent
      this.agentId = routeAgentId;
      await this.loadAgentInfo();
      
      // 如果有 conversation_id，加载该会话
      if (this.$route.query.conversation_id) {
        this.conversationId = this.$route.query.conversation_id;
        await this.switchConversation(this.conversationId);
      } else {
        // 添加欢迎消息
        const welcomeMessage = `你好！我是${this.currentAgent?.name || 'Agent助手'}。${this.currentAgent?.description || '我很高兴为您服务！'}`;
        this.addMessage('ai', welcomeMessage);
      }
    } else if (this.agentList.length > 0) {
      // 没有指定 Agent，默认选择第一个
      this.agentId = this.agentList[0].id;
      await this.loadAgentInfo();
      
      const welcomeMessage = `你好！我是${this.currentAgent?.name || 'Agent助手'}。${this.currentAgent?.description || '我很高兴为您服务！'}`;
      this.addMessage('ai', welcomeMessage);
    }
  },
  async mounted() {
    this.scrollToBottom();
    
    // 获取会话列表（如果已选择 Agent）
    if (this.$store.getters['auth/isAuthenticated'] && this.agentId) {
      await this.getConversationsList();
    }
  },
  methods: {
    // 加载 Agent 列表
    async loadAgentList() {
      try {
        const response = await axios.get(`${config.aiApiBaseUrl}/agents`, {
          headers: {
            'accept': 'application/json'
          }
        });
        
        if (Array.isArray(response.data)) {
          this.agentList = response.data;
        }
      } catch (error) {
        console.error('加载Agent列表失败:', error);
        this.$message.error('加载Agent列表失败');
      }
    },
    
    // Agent 切换处理
    async handleAgentChange(newAgentId) {
      console.log('切换 Agent:', newAgentId);
      
      // 清空当前会话
      this.conversationId = null;
      this.conversations = [];
      this.messages = [];
      
      // 加载新 Agent 信息
      await this.loadAgentInfo();
      
      // 获取新 Agent 的会话列表
      await this.getConversationsList();
      
      // 显示欢迎消息
      const welcomeMessage = `你好！我是${this.currentAgent?.name || 'Agent助手'}。${this.currentAgent?.description || '我很高兴为您服务！'}`;
      this.addMessage('ai', welcomeMessage);
      
      // 更新 URL 参数（不刷新页面）
      this.$router.replace({
        path: this.$route.path,
        query: { agent_id: newAgentId }
      });
    },
    
    // 加载Agent信息
    async loadAgentInfo() {
      try {
        const response = await axios.get(`${config.aiApiBaseUrl}/agents/${this.agentId}`, {
          headers: {
            'accept': 'application/json'
          }
        });
        
        if (response.data) {
          this.currentAgent = response.data;
        }
      } catch (error) {
        console.error('加载Agent信息失败:', error);
        this.$message.error('加载Agent信息失败');
      }
    },
    
    // 获取会话列表（仅获取，不自动选择）
    async getConversationsList() {
      try {
        this.loadingHistory = true;
        console.log('获取Agent会话列表:', this.agentId);
        
        const response = await axios.get(`${config.aiApiBaseUrl}/agents/${this.agentId}/conversations`, {
          headers: {
            'accept': 'application/json'
          },
          timeout: 20000
        });
        
        console.log('会话列表响应:', response.data);
        
        if (response.data && Array.isArray(response.data)) {
          this.conversations = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }
      } catch (error) {
        console.error('获取会话列表失败:', error);
        this.$message.error('获取历史会话失败');
      } finally {
        this.loadingHistory = false;
      }
    },
    
    // 刷新会话列表（兼容旧接口）
    async getConversations() {
      await this.getConversationsList();
    },
    
    // 切换到指定会话
    async switchConversation(convId) {
      console.log('切换到Agent会话:', convId);
      
      if (!convId) {
        console.error('无效的会话ID');
        return;
      }
      
      this.loading = true;
      this.conversationId = convId;
      this.messages = [];
      
      try {
        // 使用Agent专用的历史记录接口
        console.log('获取Agent会话历史:', `${config.aiApiBaseUrl}/agents/${this.agentId}/conversations/${convId}/history`);
        const response = await axios.get(`${config.aiApiBaseUrl}/agents/${this.agentId}/conversations/${convId}/history`, {
          headers: {
            'accept': 'application/json'
          },
          timeout: 20000
        });
        
        console.log('会话历史响应:', response.data);
        
        if (response.data && Array.isArray(response.data)) {
          if (response.data.length > 0) {
            response.data.forEach(msg => {
              let role = msg.role === 'user' ? 'user' : 'ai';
              let content = msg.content || '';
              let timestamp = msg.created_at ? new Date(msg.created_at) : new Date();
              
              this.messages.push({
                role: role,
                content: content,
                time: timestamp,
                timestamp: timestamp.getTime()
              });
            });
          } else {
            const welcomeMessage = `你好！我是${this.currentAgent?.name || 'Agent助手'}。${this.currentAgent?.description || '我很高兴为您服务！'}`;
            this.addMessage('ai', welcomeMessage);
          }
        }
      } catch (error) {
        console.error('获取会话历史失败:', error);
        this.$message.error('获取对话历史失败');
        
        const welcomeMessage = `你好！我是${this.currentAgent?.name || 'Agent助手'}。${this.currentAgent?.description || '我很高兴为您服务！'}`;
        this.addMessage('ai', welcomeMessage);
      } finally {
        this.loading = false;
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }
    },
    
    // 创建新会话
    createNewConversation() {
      this.conversationId = null;
      this.messages = [];
      
      const welcomeMessage = `你好！我是${this.currentAgent?.name || 'Agent助手'}。${this.currentAgent?.description || '我很高兴为您服务！'}`;
      this.addMessage('ai', welcomeMessage);
      
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },
    
    handleSend() {
      if (!this.userInput.trim() || this.loading) return;
      
      this.sendMessage(this.userInput);
      this.userInput = '';
    },
    
    sendMessage(content) {
      this.addMessage('user', content);
      this.loading = true;
      
      setTimeout(() => {
        if (!this.conversationId) {
          console.log('没有活跃会话，创建新会话');
          this.createConversation(content);
        } else {
          this.sendMessageToConversation(content);
        }
      }, 300);
    },
    
    // 创建Agent会话
    createConversation(content) {
      if (this.reconnecting) return;
      
      this.reconnecting = true;
      console.log('创建Agent新会话:', this.agentId);
      
      // 使用Agent专用的会话创建接口
      axios.post(`${config.aiApiBaseUrl}/agents/${this.agentId}/conversations`, {}, {
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: 20000
      })
      .then(response => {
        console.log('创建Agent会话响应:', response.data);
        
        if (response.data && response.data.conversation_id) {
          this.conversationId = response.data.conversation_id;
          this.sendMessageToConversation(content);
          this.getConversations();
        } else {
          this.handleAPIError('创建会话失败，请重试。');
          this.loading = false;
        }
      })
      .catch(error => {
        console.error('创建Agent会话失败:', error);
        this.handleAPIError('网络连接失败，请检查您的网络连接后重试。');
        this.loading = false;
      })
      .finally(() => {
        this.reconnecting = false;
      });
    },
    
    // 发送消息到Agent会话（流式）
    sendMessageToConversation(content) {
      try {
        console.log('发送消息到Agent会话（流式）:', this.agentId, this.conversationId, '内容:', content);
        
        const streamingMessageIndex = this.messages.length;
        this.addMessage('ai', '正在思考...');
        
        let toolCalls = [];
        let finalContent = '';
        
        const token = this.$store.getters['auth/token'] || localStorage.getItem('auth_token');
        
        const headers = {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        // 使用Agent专用的流式消息接口
        fetch(`${config.aiApiBaseUrl}/agents/${this.agentId}/conversations/${this.conversationId}/messages/stream`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({ message: content })
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          
          const readStream = () => {
            reader.read().then(({ done, value }) => {
              if (done) {
                console.log('Agent流式响应完成');
                this.loading = false;
                this.$nextTick(() => {
                  this.scrollToBottom();
                });
                return;
              }
              
              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk.split('\n');
              
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const eventData = JSON.parse(line.substring(6));
                    console.log('收到Agent事件:', eventData);
                    
                    if (eventData.type === 'status') {
                      this.messages[streamingMessageIndex].content = `⏳ ${eventData.message}`;
                    } else if (eventData.type === 'tool_call') {
                      toolCalls.push({
                        name: eventData.tool_name,
                        args: eventData.tool_args
                      });
                      this.messages[streamingMessageIndex].content = `🛠️ ${eventData.message}`;
                    } else if (eventData.type === 'tool_summary') {
                      const toolsList = eventData.tools_used.join(', ');
                      this.messages[streamingMessageIndex].content = `✅ 已调用工具: ${toolsList}`;
                    } else if (eventData.type === 'message' || eventData.type === 'content') {
                      finalContent = eventData.content;
                      
                      let fullContent = '';
                      if (toolCalls.length > 0) {
                        fullContent += '📊 **使用的工具:**\n';
                        toolCalls.forEach((tc, idx) => {
                          fullContent += `${idx + 1}. ${tc.name}\n`;
                        });
                        fullContent += '\n---\n\n';
                      }
                      fullContent += finalContent;
                      
                      this.messages[streamingMessageIndex].content = fullContent;
                    } else if (eventData.type === 'complete') {
                      console.log('Agent消息处理完成');
                      this.loading = false;
                    } else if (eventData.type === 'error') {
                      this.messages[streamingMessageIndex].content = `❌ ${eventData.message}`;
                      this.loading = false;
                    }
                    
                    this.$nextTick(() => {
                      this.scrollToBottom();
                    });
                  } catch (e) {
                    console.error('解析事件数据失败:', e, line);
                  }
                }
              }
              
              readStream();
            }).catch(error => {
              console.error('读取流失败:', error);
              this.messages[streamingMessageIndex].content = `❌ 读取响应失败: ${error.message}`;
              this.loading = false;
            });
          };
          
          readStream();
        })
        .catch(error => {
          console.error('发送消息失败:', error);
          
          if (error.message && error.message.includes('404')) {
            console.log('Agent会话可能已过期，重新创建会话');
            this.$message.warning('会话已过期，正在重新创建...');
            this.conversationId = null;
            this.createConversation(content);
            return;
          }
          
          this.messages[streamingMessageIndex].content = `❌ 发送失败: ${error.message}`;
          this.loading = false;
        })
        .finally(() => {
          this.$nextTick(() => {
            this.scrollToBottom();
          });
        });
      } catch (error) {
        console.error('发送消息处理异常:', error);
        this.handleAPIError('发送消息出现异常，请重试。');
        this.loading = false;
      }
    },
    
    handleAPIError(errorMessage) {
      this.addMessage('ai', errorMessage);
    },
    
    addMessage(role, content) {
      const now = new Date();
      
      this.messages.push({
        role,
        content,
        time: now,
        timestamp: now.getTime()
      });
      
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },
    
    scrollToBottom() {
      if (this.$refs.messagesContainer) {
        this.$nextTick(() => {
          const container = this.$refs.messagesContainer;
          container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth'
          });
        });
      }
    },
    
    clearMessages() {
      this.$confirm('确定要清空所有对话记录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.messages = [];
        this.conversationId = null;
        this.$message({
          type: 'success',
          message: '对话已清空'
        });
        this.createNewConversation();
      }).catch(() => {});
    },
    
    formatMessage(content) {
      if (!content) return '';
      
      if (typeof content !== 'string') {
        try {
          content = JSON.stringify(content);
        } catch (e) {
          content = String(content);
        }
      }
      
      content = content.replace(/```([\s\S]*?)```/g, '<pre class="code-block">$1</pre>');
      content = content.replace(/\n/g, '<br>');
      
      return content;
    },
    
    formatTime(date) {
      if (!date) return '';
      const now = new Date();
      const messageDate = new Date(date);
      
      if (now.toDateString() === messageDate.toDateString()) {
        return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      
      return messageDate.toLocaleString([], { 
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    
    // 确认删除会话
    confirmDeleteConversation(convId, title) {
      this.$confirm(`确定要删除"${title}"吗? 此操作不可恢复。`, '删除会话', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger',
        closeOnClickModal: false
      }).then(() => {
        this.deleteConversation(convId);
      }).catch(() => {});
    },
    
    // 删除会话
    async deleteConversation(convId) {
      if (!convId) {
        this.$message.error('会话ID无效，无法删除');
        return;
      }
      
      try {
        console.log('删除Agent会话:', convId);
        
        const loadingInstance = this.$loading({
          lock: true,
          text: '正在删除...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        });
        
        try {
          // 使用Agent专用的删除接口
          const response = await axios.delete(`${config.aiApiBaseUrl}/agents/${this.agentId}/conversations/${convId}`, {
            headers: {
              'accept': 'application/json'
            },
            timeout: 20000
          });
          
          console.log('删除会话响应:', response.data);
          
          this.$message.success('会话已删除');
          
          if (convId === this.conversationId) {
            this.conversationId = null;
            this.messages = [];
            
            const welcomeMessage = `你好！我是${this.currentAgent?.name || 'Agent助手'}。${this.currentAgent?.description || '我很高兴为您服务！'}`;
            this.addMessage('ai', welcomeMessage);
          }
          
          this.conversations = this.conversations.filter(conv => conv.id !== convId);
          
          if (this.conversations.length === 0) {
            this.getConversationsList();
          }
        } catch (error) {
          console.error('删除会话失败:', error);
          
          if (error.response) {
            if (error.response.status === 404) {
              this.$message.error('会话不存在或已被删除');
              this.getConversationsList();
            } else {
              this.$message.error(`删除会话失败: 状态码 ${error.response.status}`);
            }
          } else if (error.request) {
            this.$message.error('网络请求失败，请检查您的网络连接');
          } else {
            this.$message.error('删除会话失败: ' + error.message);
          }
        } finally {
          loadingInstance.close();
        }
      } catch (error) {
        console.error('删除操作异常:', error);
        this.$message.error('操作异常，请重试');
      }
    }
  }
}
</script>

<style scoped>
/* 复用 AIChatbox 的样式 */
.agent-chatbox {
  display: flex;
  height: 100vh;
  background-color: #f5f7fa;
}

.content {
  flex: 1;
  padding: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.chat-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.chat-header {
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.agent-selector {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.agent-selector label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
  white-space: nowrap;
}

.agent-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.agent-details h2 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.agent-desc {
  font-size: 12px;
  color: #909399;
}

.chat-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.chat-history-list {
  width: 200px;
  border-right: 1px solid #ebeef5;
  display: flex;
  flex-direction: column;
  background-color: #f9f9f9;
}

.history-header {
  padding: 10px 15px;
  border-bottom: 1px solid #ebeef5;
}

.history-header h3 {
  margin: 0;
  font-size: 14px;
  color: #606266;
}

.history-items {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.history-item {
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.3s;
  background-color: #fff;
  border: 1px solid #ebeef5;
  position: relative;
  user-select: none;
}

.history-item:hover {
  background-color: #ecf5ff;
  transform: translateY(-2px);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.history-item.active {
  background-color: #ecf5ff;
  border-color: #409eff;
  font-weight: bold;
}

.history-item:active {
  transform: translateY(0);
  opacity: 0.8;
}

.history-item-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.history-item:hover .history-item-actions {
  opacity: 1;
}

.history-item-actions .el-button {
  padding: 4px;
  color: #909399;
  border-radius: 50%;
  height: 24px;
  width: 24px;
  min-height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.history-item-actions .el-button:hover {
  color: #f56c6c;
  background-color: rgba(245, 108, 108, 0.1);
}

.history-item-title {
  font-size: 14px;
  color: #303133;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 30px;
}

.history-item-date {
  font-size: 12px;
  color: #909399;
}

.history-actions {
  padding: 10px;
  border-top: 1px solid #ebeef5;
  text-align: center;
}

.chat-main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-main-area.full-width {
  width: 100%;
}

.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f9f9f9;
}

.message {
  display: flex;
  margin-bottom: 20px;
}

.user-message {
  flex-direction: row-reverse;
}

.message-avatar {
  margin: 0 10px;
}

.message-content {
  max-width: 70%;
}

.message-bubble {
  padding: 12px 16px;
  border-radius: 8px;
  word-break: break-word;
}

.user-message .message-bubble {
  background-color: #409EFF;
  color: white;
}

.ai-message .message-bubble {
  background-color: #EBEEF5;
  color: #303133;
}

.message-time {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
  text-align: right;
}

.user-message .message-time {
  text-align: left;
}

.chat-input {
  padding: 15px 20px;
  border-top: 1px solid #ebeef5;
}

.input-actions {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.input-tip {
  color: #909399;
  font-size: 12px;
}

.empty-chat {
  text-align: center;
  color: #909399;
  padding: 40px 0;
}

.empty-chat i {
  font-size: 60px;
  margin-bottom: 20px;
}

.typing-indicator {
  display: flex;
  align-items: center;
}

.typing-indicator span {
  height: 8px;
  width: 8px;
  background-color: #909399;
  border-radius: 50%;
  display: inline-block;
  margin: 0 2px;
  animation: bounce 1.5s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes bounce {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-5px);
  }
}

.code-block {
  background-color: #f5f7fa;
  padding: 8px;
  border-radius: 4px;
  font-family: monospace;
  white-space: pre-wrap;
  margin: 8px 0;
}

.no-conversation-area {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
}

.welcome-container {
  text-align: center;
  padding: 40px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.welcome-icon {
  font-size: 60px;
  margin-bottom: 20px;
  color: #409eff;
}

.welcome-container h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #303133;
}

.welcome-container p {
  margin: 0 0 20px 0;
  font-size: 14px;
  color: #909399;
}

.welcome-container .el-button {
  margin-top: 20px;
  border: 1px solid #409EFF;
  border-radius: 20px;
}
</style>

