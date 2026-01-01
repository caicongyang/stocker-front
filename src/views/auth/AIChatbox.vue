<template>
  <div class="ai-chatbox">
    <SideMenu />
    <div class="content">
      <div class="chat-container">
        <div class="chat-header">
          <h2>AI 助手</h2>
          <div class="header-actions">
            <el-button type="text" size="small" icon="el-icon-refresh" @click="getConversations">刷新会话</el-button>
            <el-button v-if="hasConversations" type="text" size="small" icon="el-icon-plus" @click="createNewConversation">新建会话</el-button>
            <el-button v-if="hasConversations" type="text" size="small" icon="el-icon-delete" @click="clearMessages">清空对话</el-button>
            <el-button v-if="hasConversations && conversationId" type="text" size="small" icon="el-icon-document" @click="reloadCurrentConversation">重载当前会话</el-button>
          </div>
        </div>
        
        <div class="chat-layout">
          <!-- 左侧历史会话列表 - 仅当有会话时显示 -->
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
          
          <!-- 右侧聊天区域 - 根据有无会话列表调整宽度 -->
          <div v-if="hasConversations || conversationId === null" :class="['chat-main-area', conversations && conversations.length > 0 ? '' : 'full-width']">
            <div class="chat-messages" ref="messagesContainer">
              <div v-if="messages.length === 0" class="empty-chat">
                <i class="el-icon-chat-dot-square"></i>
                <p>开始和AI助手对话吧!</p>
                <div class="suggested-questions">
                  <el-button 
                    v-for="(question, index) in suggestedQuestions" 
                    :key="index" 
                    type="text" 
                    @click="sendMessage(question)"
                  >
                    {{ question }}
                  </el-button>
                </div>
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
          
          <!-- 无会话时显示的欢迎界面 - 现在只有在无会话列表时才显示 -->
          <div v-else class="no-conversation-area">
            <div class="welcome-container">
              <i class="el-icon-chat-line-round welcome-icon"></i>
              <h3>欢迎使用 AI 股票助手</h3>
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
  name: 'AIChatbox',
  components: {
    SideMenu
  },
  data() {
    return {
      userInput: '',
      messages: [],
      loading: false,
      userAvatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
      aiAvatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
      suggestedQuestions: [
        '今日大盘走势如何？',
        '哪些行业板块近期表现较好？',
        '如何分析股票的K线图？',
        '什么是量比和换手率？',
        '如何判断股票的买入时机？'
      ],
      conversationId: null, // 存储会话ID
      reconnecting: false,   // 是否正在重新连接
      conversations: [],     // 存储历史会话列表
      loadingHistory: false  // 是否正在加载历史
    }
  },
  computed: {
    // 判断是否有会话列表
    hasConversations() {
      return this.conversations.length > 0;
    }
  },
  created() {
    // 清空会话ID，准备开始新会话
    this.conversationId = null;
    
    // 添加欢迎消息
    const welcomeMessage = '你好！我是StockBot，您的智能股票分析助手。请提供您想查询的股票代码或相关市场数据，我将为您提供专业的分析和建议。'
    this.addMessage('ai', welcomeMessage);
  },
  async mounted() {
    this.scrollToBottom();
    
    // 确保用户已登录后再获取会话列表
    if (this.$store.getters['auth/isAuthenticated']) {
      await this.getConversationsList();
    } else {
      // 如果用户未登录，监听登录状态变化
      this.$store.watch(
        (state) => state.auth.isAuthenticated,
        (isAuthenticated) => {
          if (isAuthenticated) {
            this.getConversationsList();
          }
        }
      );
    }
  },
  methods: {
    // 新增一个只获取会话列表但不自动选择会话或创建会话的方法
    async getConversationsList() {
      try {
        this.loadingHistory = true;
        console.log('开始获取会话列表 - 只获取不选择');
        
        const response = await axios.get(`${config.aiApiBaseUrl}/conversations`, {
          headers: {
            'accept': 'application/json'
          },
          timeout: 20000
        });
        
        console.log('会话列表响应:', response.data);
        
        // 只保存会话列表，不自动选择会话
        if (response.data && Array.isArray(response.data)) {
          // 按创建时间降序排序
          this.conversations = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        } else {
          console.error('返回的会话列表格式不正确:', response.data);
        }
      } catch (error) {
        console.error('获取会话列表失败:', error);
        this.$message.error('获取历史会话失败');
      } finally {
        this.loadingHistory = false;
      }
    },
    
    // 修改原有获取会话方法，保持兼容性
    async getConversations(autoCreate = false) {
      try {
        this.loadingHistory = true;
        console.log('开始获取会话列表 - API URL:', `${config.aiApiBaseUrl}/conversations`);
        
        const response = await axios.get(`${config.aiApiBaseUrl}/conversations`, {
          headers: {
            'accept': 'application/json'
          },
          timeout: 20000
        });
        
        console.log('会话列表响应:', response.data);
        
        if (response.data && Array.isArray(response.data)) {
          this.conversations = response.data;
          
          // 仅当传入参数要求时才自动选择第一个会话或创建新会话
          if (autoCreate && !this.conversationId && this.conversations.length > 0) {
            // 按创建时间降序排序
            this.conversations.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            
            // 选择第一个会话
            this.conversationId = this.conversations[0].id;
          } else if (autoCreate && !this.conversationId) {
            // 只有在明确要求时才创建新会话
            this.initializeConversation();
          }
        } else {
          console.error('返回的会话列表格式不正确:', response.data);
          // 仅当明确要求时才创建新会话
          if (autoCreate && !this.conversationId) {
            this.initializeConversation();
          }
        }
      } catch (error) {
        console.error('获取会话列表失败:', error);
        this.$message.error('获取历史会话失败');
        
        // 仅当明确要求时才创建新会话
        if (autoCreate && !this.conversationId) {
          this.initializeConversation();
        }
      } finally {
        this.loadingHistory = false;
      }
    },
    
    // 切换到指定会话
    async switchConversation(convId) {
      // 调试信息
      console.log('尝试切换到会话:', convId, '当前会话:', this.conversationId);
      
      // 确保传入的会话ID有效 - 移除相同ID返回的逻辑，允许重新加载当前会话
      if (!convId) {
        console.error('无效的会话ID');
        return;
      }
      
      this.loading = true;
      this.conversationId = convId;
      this.messages = [];
      
      try {
        // 获取历史对话消息 - 使用messages接口
        console.log('正在获取会话历史:', `${config.aiApiBaseUrl}/conversations/${convId}/history`);
        const response = await axios.get(`${config.aiApiBaseUrl}/conversations/${convId}/history`, {
          headers: {
            'accept': 'application/json'
          },
          // 设置超时时间，避免无限等待
          timeout: 20000
        });
        
        console.log('会话历史响应:', response.data);
        
        // 解析历史消息
        if (response.data && Array.isArray(response.data)) {
          // 将历史消息添加到界面上
          if (response.data.length > 0) {
            console.log('历史消息数量:', response.data.length);
            response.data.forEach(msg => {
              // 检查消息格式，增加容错处理
              let role = 'ai';
              let content = '';
              let timestamp = new Date();
              
              // 检查role字段
              if (msg.role === 'user') {
                role = 'user';
              }
              
              // 获取消息内容 - 适配新的数据结构
              if (role === 'user' && msg.content) {
                content = msg.content;
              } else if (role === 'user' && msg.message) {
                content = msg.message;
              } else if (role === 'ai' && msg.content) {
                content = msg.content;
              } else if (role === 'ai' && msg.response) {
                content = msg.response;
              } else if (typeof msg === 'string') {
                content = msg;
              } else {
                console.warn('无法解析的消息格式:', msg);
                content = JSON.stringify(msg);
              }
              
              // 获取时间戳
              if (msg.created_at) {
                timestamp = new Date(msg.created_at);
              } else if (msg.timestamp) {
                timestamp = new Date(msg.timestamp);
              }
              
              this.messages.push({
                role: role,
                content: content,
                time: timestamp,
                timestamp: timestamp.getTime()
              });
            });
          } else {
            console.log('会话历史为空，显示欢迎消息');
            const welcomeMessage = '你好！我是StockBot，您的智能股票分析助手。请提供您想查询的股票代码或相关市场数据，我将为您提供专业的分析和建议。';
            this.addMessage('ai', welcomeMessage);
          }
        } else {
          console.warn('历史消息格式不是数组:', response.data);
          // 显示默认欢迎消息
          const welcomeMessage = '你好！我是StockBot，您的智能股票分析助手。请提供您想查询的股票代码或相关市场数据，我将为您提供专业的分析和建议。';
          this.addMessage('ai', welcomeMessage);
        }
      } catch (error) {
        console.error('获取会话历史失败:', error);
        this.$message.error('获取对话历史失败: ' + (error.response ? `状态码: ${error.response.status}` : error.message));
        
        // 显示默认欢迎消息
        const welcomeMessage = '你好！我是StockBot，您的智能股票分析助手。请提供您想查询的股票代码或相关市场数据，我将为您提供专业的分析和建议。';
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
      // 清空当前会话ID和消息
      this.conversationId = null;
      this.messages = [];
      
      // 添加空会话问候消息，但不调用API创建会话
      const welcomeMessage = '你好！我是StockBot，您的智能股票分析助手。请提供您想查询的股票代码或相关市场数据，我将为您提供专业的分析和建议。'
      this.addMessage('ai', welcomeMessage)
      
      // 滚动到底部
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },
    
    handleSend() {
      if (!this.userInput.trim() || this.loading) return
      
      this.sendMessage(this.userInput)
      this.userInput = ''
    },
    
    sendMessage(content) {
      // 添加用户消息
      this.addMessage('user', content)
      
      // 发送请求到API
      this.loading = true
      
      setTimeout(() => {
        if (!this.conversationId) {
          // 如果没有会话ID，先创建会话
          console.log('没有活跃会话，创建新会话');
          this.createConversation(content)
        } else {
          // 已有会话ID，直接发送消息
          this.sendMessageToConversation(content)
        }
      }, 300)
    },
    
    createConversation(content) {
      // 防止重复请求
      if (this.reconnecting) return
      
      this.reconnecting = true
      console.log('创建新会话开始，用户消息:', content)
      
      // 创建会话请求体
      const requestData = {};
      
      // 可选：如果API支持，可以设置标题
      if (content && content.trim()) {
        // 使用消息内容作为会话标题
        requestData.title = content.substring(0, 30) + (content.length > 30 ? '...' : '');
      } else {
        // 如果没有内容，使用时间戳
        requestData.title = '新会话 - ' + new Date().toLocaleString();
      }
      
      console.log('创建会话请求体:', requestData);
      
      // 创建会话
      axios.post(`${config.aiApiBaseUrl}/conversations`, requestData, {
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: 20000
      })
      .then(response => {
        console.log('创建会话响应:', response.data)
        
        if (response.data && (response.data.id || response.data.conversation_id)) {
          // 支持两种可能的字段名
          this.conversationId = response.data.id || response.data.conversation_id;
          // 使用返回的会话ID发送消息
          this.sendMessageToConversation(content)
          
          // 刷新会话列表
          this.getConversations()
        } else {
          this.handleAPIError('创建会话失败，请重试。')
          this.loading = false
        }
      })
      .catch(error => {
        console.error('创建会话失败:', error)
        this.handleAPIError('网络连接失败，请检查您的网络连接后重试。')
        this.loading = false
      })
      .finally(() => {
        this.reconnecting = false
      })
    },
    
    sendMessageToConversation(content) {
      try {
        // 在指定会话中发送消息（流式）
        console.log('发送消息到会话（流式）:', this.conversationId, '内容:', content);
        
        // 使用 EventSource 进行流式通信
        const requestData = { message: content };
        
        // 创建一个临时的AI消息用于显示流式内容
        const streamingMessageIndex = this.messages.length;
        this.addMessage('ai', '正在思考...');
        
        // 存储工具调用信息
        let toolCalls = [];
        let finalContent = '';
        
        // 获取认证token
        const token = this.$store.getters['auth/token'] || localStorage.getItem('auth_token');
        
        // 使用fetch进行POST请求以支持SSE
        const headers = {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        };
        
        // 添加认证token
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        fetch(`${config.aiApiBaseUrl}/conversations/${this.conversationId}/messages/stream`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(requestData)
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
                console.log('流式响应完成');
                this.loading = false;
                this.$nextTick(() => {
                  this.scrollToBottom();
                });
                return;
              }
              
              // 解码数据
              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk.split('\n');
              
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const eventData = JSON.parse(line.substring(6));
                    console.log('收到事件:', eventData);
                    
                    // 处理不同类型的事件
                    if (eventData.type === 'status') {
                      // 更新状态消息
                      this.messages[streamingMessageIndex].content = `⏳ ${eventData.message}`;
                    } else if (eventData.type === 'tool_call') {
                      // 记录工具调用
                      toolCalls.push({
                        name: eventData.tool_name,
                        args: eventData.tool_args
                      });
                      this.messages[streamingMessageIndex].content = `🛠️ ${eventData.message}`;
                    } else if (eventData.type === 'tool_summary') {
                      // 工具调用摘要
                      const toolsList = eventData.tools_used.join(', ');
                      this.messages[streamingMessageIndex].content = `✅ 已调用工具: ${toolsList}`;
                    } else if (eventData.type === 'message') {
                      // 最终消息
                      finalContent = eventData.content;
                      
                      // 构建完整的消息内容，包含工具调用信息
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
                      // 处理完成
                      console.log('消息处理完成');
                      this.loading = false;
                    } else if (eventData.type === 'error') {
                      // 错误处理
                      this.messages[streamingMessageIndex].content = `❌ ${eventData.message}`;
                      this.loading = false;
                    }
                    
                    // 滚动到底部
                    this.$nextTick(() => {
                      this.scrollToBottom();
                    });
                  } catch (e) {
                    console.error('解析事件数据失败:', e, line);
                  }
                }
              }
              
              // 继续读取
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
          
          // 如果是会话过期，尝试重新创建会话
          if (error.message && error.message.includes('404')) {
            console.log('会话可能已过期，重新创建会话');
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
      this.addMessage('ai', errorMessage)
    },
    
    addMessage(role, content) {
      const now = new Date();
      
      this.messages.push({
        role,
        content,
        time: now, // 存储完整日期对象
        timestamp: now.getTime()
      });
      
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },
    
    scrollToBottom() {
      if (this.$refs.messagesContainer) {
        // 使用nextTick确保DOM更新后再滚动
        this.$nextTick(() => {
          const container = this.$refs.messagesContainer;
          // 平滑滚动到底部
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
        this.messages = []
        this.conversationId = null // 清空会话ID，下次会创建新会话
        this.$message({
          type: 'success',
          message: '对话已清空'
        })
        // 创建新会话
        this.initializeConversation()
      }).catch(() => {})
    },
    
    formatMessage(content) {
      // 简单处理换行和代码块
      if (!content) return ''
      
      console.log('格式化消息类型:', typeof content);
      
      // 如果内容不是字符串，尝试转换
      if (typeof content !== 'string') {
        try {
          content = JSON.stringify(content);
        } catch (e) {
          content = String(content);
        }
      }
      
      // 处理代码块
      content = content.replace(/```([\s\S]*?)```/g, '<pre class="code-block">$1</pre>')
      
      // 处理换行
      content = content.replace(/\n/g, '<br>')
      
      return content
    },
    
    // 添加格式化日期时间的方法
    formatTime(date) {
      if (!date) return '';
      const now = new Date();
      const messageDate = new Date(date);
      
      // 如果是今天的消息，只显示时间
      if (now.toDateString() === messageDate.toDateString()) {
        return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      
      // 否则显示日期和时间
      return messageDate.toLocaleString([], { 
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    
    // 初始化会话
    async initializeConversation() {
      try {
        this.loading = true
        
        // 创建空请求体
        const requestData = {};
        console.log('初始化会话请求体:', requestData);
        
        const response = await axios.post(`${config.aiApiBaseUrl}/conversations`, requestData, {
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json'
          },
          timeout: 20000
        })
        
        if (response.data && (response.data.id || response.data.conversation_id)) {
          // 支持两种可能的字段名
          this.conversationId = response.data.id || response.data.conversation_id;
          console.log('会话已创建，ID:', this.conversationId)
          
          // 添加一个符合StockBot风格的欢迎消息
          const welcomeMessage = '你好！我是StockBot，您的智能股票分析助手。请提供您想查询的股票代码或相关市场数据，我将为您提供专业的分析和建议。'
          this.addMessage('ai', welcomeMessage)
          
          // 刷新会话列表
          this.getConversations()
        }
      } catch (error) {
        console.error('初始化会话失败:', error)
        // 添加一个错误提示，但不显示为消息
        this.$message.error('初始化会话失败，请刷新页面重试')
      } finally {
        this.loading = false
      }
    },
    
    // 强制重新加载当前会话 - 用于调试
    reloadCurrentConversation() {
      if (!this.conversationId) {
        this.$message.warning('没有选择任何会话');
        return;
      }
      
      console.log('手动重载会话:', this.conversationId);
      this.switchConversation(this.conversationId);
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
      }).catch(() => {
        // 用户取消删除，不做操作
      });
    },
    
    // 删除会话
    async deleteConversation(convId) {
      if (!convId) {
        this.$message.error('会话ID无效，无法删除');
        return;
      }
      
      try {
        console.log('删除会话:', convId);
        
        // 显示加载状态
        const loadingInstance = this.$loading({
          lock: true,
          text: '正在删除...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        });
        
        try {
          // 调用删除API
          const response = await axios.delete(`${config.aiApiBaseUrl}/conversations/${convId}`, {
            headers: {
              'accept': 'application/json'
            },
            timeout: 20000
          });
          
          console.log('删除会话响应:', response.data);
          
          // 处理删除后的UI更新
          this.$message.success('会话已删除');
          
          // 如果删除的是当前选中的会话，清空当前会话
          if (convId === this.conversationId) {
            this.conversationId = null;
            this.messages = [];
            
            // 显示欢迎消息
            const welcomeMessage = '你好！我是StockBot，您的智能股票分析助手。请提供您想查询的股票代码或相关市场数据，我将为您提供专业的分析和建议。';
            this.addMessage('ai', welcomeMessage);
          }
          
          // 从本地会话列表中移除被删除的会话
          this.conversations = this.conversations.filter(conv => conv.id !== convId);
          
          // 如果本地处理后会话列表为空，调用接口刷新列表
          if (this.conversations.length === 0) {
            this.getConversationsList();
          }
        } catch (error) {
          console.error('删除会话失败:', error);
          
          // 根据错误状态码给出不同提示
          if (error.response) {
            if (error.response.status === 404) {
              this.$message.error('会话不存在或已被删除');
              // 如果会话不存在，强制刷新列表
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
          // 关闭加载状态
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
.ai-chatbox {
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

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .ai-chatbox {
    flex-direction: column;
  }

  .content {
    padding: 68px 12px 12px 12px;
    height: calc(100vh - 68px);
  }
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

.chat-header h2 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

@media screen and (max-width: 768px) {
  .chat-header {
    padding: 12px 16px;
    flex-wrap: wrap;
  }

  .chat-header h2 {
    font-size: 16px;
    width: 100%;
    margin-bottom: 8px;
  }

  .header-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .header-actions .el-button {
    font-size: 12px;
    padding: 6px 10px;
  }
}

.chat-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

@media screen and (max-width: 768px) {
  .chat-layout {
    flex-direction: column;
  }
}

.chat-history-list {
  width: 200px;
  border-right: 1px solid #ebeef5;
  display: flex;
  flex-direction: column;
  background-color: #f9f9f9;
}

@media screen and (max-width: 768px) {
  .chat-history-list {
    width: 100%;
    max-width: 100%;
    border-right: none;
    border-bottom: 1px solid #ebeef5;
    max-height: 150px;
    overflow-y: auto;
  }
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
  /* 添加点击效果 */
  user-select: none;
}

.history-item:hover {
  background-color: #ecf5ff;
  /* 增强悬停效果 */
  transform: translateY(-2px);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.history-item.active {
  background-color: #ecf5ff;
  border-color: #409eff;
  /* 增强选中效果 */
  font-weight: bold;
}

/* 添加点击反馈效果 */
.history-item:active {
  transform: translateY(0);
  opacity: 0.8;
}

/* 添加删除按钮样式 */
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
  padding-right: 30px; /* 为删除按钮留出足够空间 */
}

.history-item-date {
  font-size: 12px;
  color: #909399;
}

.history-empty {
  text-align: center;
  padding: 20px 0;
  color: #909399;
  font-size: 14px;
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

/* 当没有会话列表时，聊天区域占满整个宽度 */
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

@media screen and (max-width: 768px) {
  .message-content {
    max-width: 85%;
  }
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

@media screen and (max-width: 768px) {
  .chat-input {
    padding: 12px;
  }

  .chat-input :deep(.el-textarea__inner) {
    font-size: 14px;
  }

  .input-actions {
    flex-wrap: wrap;
  }

  .input-tip {
    font-size: 11px;
  }
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

.suggested-questions {
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.suggested-questions .el-button {
  margin: 5px;
  border: 1px solid #DCDFE6;
  border-radius: 20px;
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
}

.welcome-container h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.welcome-container p {
  margin: 0;
  font-size: 14px;
  color: #909399;
}

.welcome-container .el-button {
  margin-top: 20px;
  border: 1px solid #409EFF;
  border-radius: 20px;
}

@media screen and (max-width: 768px) {
  .welcome-container {
    padding: 24px 16px;
  }

  .welcome-icon {
    font-size: 48px !important;
  }

  .welcome-container h3 {
    font-size: 16px;
  }

  .welcome-container p {
    font-size: 13px;
  }
}
</style> 