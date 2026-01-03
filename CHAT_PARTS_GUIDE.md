# Chat Parts 前端使用指南

## 概述

`chat_parts` 是用于在前端渲染AI对话完整处理流程的数据结构。它记录了从意图识别到最终回复的所有中间步骤，让用户可以看到AI是如何处理他们的问题的。

## 数据结构

### Chat Parts 类型

```javascript
message.chat_parts = [
  {
    type: "intent_check",      // 意图检查
    status: "passed|rejected", // 检查结果
    message: "检查说明"
  },
  {
    type: "tool_call",          // 工具调用
    tool_name: "工具名称",
    tool_args: {...},           // 工具参数
    result_preview: "结果预览"  // 前200字符
  },
  {
    type: "auto_summary",       // 自动摘要
    message: "数据摘要处理"
  },
  {
    type: "satisfaction_check", // 满意度检查
    message: "回复质量检查"
  },
  {
    type: "final_summary",      // 最终总结
    message: "生成最终总结"
  },
  {
    type: "ai_response",        // AI回复
    content: "完整的AI回复内容"
  }
]
```

## 前端渲染实现

### 1. 消息数据结构

```javascript
{
  role: 'user' | 'ai',
  content: '消息内容',
  time: Date,
  timestamp: Number,
  chat_parts: [] // 仅AI消息有此字段
}
```

### 2. 实时流式渲染

在 SSE 事件流中实时构建 `chat_parts`：

```javascript
let chatParts = [];

// 收到意图检查通过事件
if (eventData.type === 'status' && eventData.message.includes('意图检查通过')) {
  chatParts.push({
    type: 'intent_check',
    status: 'passed',
    message: '问题通过意图检查'
  });
}

// 收到工具调用事件
if (eventData.type === 'tool_call') {
  chatParts.push({
    type: 'tool_call',
    tool_name: eventData.tool_name,
    tool_args: eventData.tool_args,
    result_preview: eventData.result_preview || ''
  });
  
  // 实时更新消息的 chat_parts
  this.messages[streamingMessageIndex].chat_parts = [...chatParts];
}

// 收到最终回复
if (eventData.type === 'message') {
  chatParts.push({
    type: 'ai_response',
    content: eventData.content
  });
  
  this.messages[streamingMessageIndex].chat_parts = [...chatParts];
}
```

### 3. 历史对话渲染

从后端加载历史消息时，`chat_parts` 已经存储在数据库中：

```javascript
response.data.forEach(msg => {
  this.messages.push({
    role: msg.role,
    content: msg.content,
    time: new Date(msg.timestamp),
    timestamp: new Date(msg.timestamp).getTime(),
    chat_parts: msg.chat_parts || [] // 直接使用存储的 chat_parts
  });
});
```

### 4. 模板渲染

```vue
<template>
  <div v-if="message.chat_parts && message.chat_parts.length > 0" class="chat-parts-container">
    <div v-for="(part, partIndex) in message.chat_parts" :key="partIndex" class="chat-part">
      
      <!-- 意图检查 -->
      <div v-if="part.type === 'intent_check'" class="intent-check-part">
        <div :class="['part-badge', part.status === 'passed' ? 'badge-success' : 'badge-warning']">
          <i :class="part.status === 'passed' ? 'el-icon-success' : 'el-icon-warning'"></i>
          {{ part.status === 'passed' ? '意图检查通过' : '意图检查未通过' }}
        </div>
        <div v-if="part.message" class="part-message">{{ part.message }}</div>
      </div>
      
      <!-- 工具调用 -->
      <div v-else-if="part.type === 'tool_call'" class="tool-call-part">
        <div class="part-badge badge-info">
          <i class="el-icon-setting"></i>
          工具调用: {{ part.tool_name }}
        </div>
        <div v-if="part.tool_args" class="tool-args">
          <strong>参数:</strong>
          <pre>{{ JSON.stringify(part.tool_args, null, 2) }}</pre>
        </div>
        <div v-if="part.result_preview" class="tool-result">
          <strong>结果预览:</strong> {{ part.result_preview }}
        </div>
      </div>
      
      <!-- AI回复 -->
      <div v-else-if="part.type === 'ai_response'" class="ai-response-part">
        <div class="message-bubble">
          <div v-html="formatMessage(part.content)"></div>
        </div>
      </div>
      
    </div>
  </div>
  
  <!-- 兼容没有 chat_parts 的旧消息 -->
  <div v-else class="message-bubble">
    <div v-html="formatMessage(message.content)"></div>
  </div>
</template>
```

## 样式设计

### 徽章颜色系统

```css
.badge-success {  /* 成功 - 绿色系 */
  background-color: #f0f9ff;
  color: #67c23a;
  border: 1px solid #b3e19d;
}

.badge-warning {  /* 警告 - 红色系 */
  background-color: #fef0f0;
  color: #f56c6c;
  border: 1px solid #fbc4c4;
}

.badge-info {     /* 信息 - 蓝色系 */
  background-color: #ecf5ff;
  color: #409eff;
  border: 1px solid #b3d8ff;
}

.badge-primary {  /* 次要 - 灰色系 */
  background-color: #f4f4f5;
  color: #909399;
  border: 1px solid #d3d4d6;
}
```

### 组件样式

- **意图检查**: 绿色/红色左边框，浅色背景
- **工具调用**: 蓝色左边框，带参数和结果预览的卡片
- **处理步骤**: 灰色左边框，简洁提示
- **AI回复**: 标准消息气泡样式

## 用户体验

### 实时反馈
- ✅ 用户发送消息后立即看到"正在思考..."
- ✅ 意图检查完成后显示检查结果
- ✅ 每次工具调用都实时显示工具名称和参数
- ✅ 最终回复展示时，完整流程已经呈现

### 历史重现
- ✅ 打开历史会话时，完整重现对话流程
- ✅ 可以看到历史对话中使用了哪些工具
- ✅ 可以看到工具调用的参数和结果
- ✅ 了解AI的完整思考过程

### 视觉层次
- 🎯 使用颜色编码区分不同步骤
- 🎯 使用图标增强识别性
- 🎯 使用卡片式设计突出重要信息
- 🎯 使用动画提升流畅度

## 优势

1. **透明度**: 用户可以看到AI的完整处理过程
2. **可调试**: 开发者可以追踪每个步骤
3. **可信度**: 展示工具调用增强用户信任
4. **教育性**: 用户了解AI如何工作
5. **可审计**: 完整记录便于问题排查

## 兼容性

- ✅ 向后兼容：没有 `chat_parts` 的旧消息使用原有渲染方式
- ✅ 渐进增强：新消息自动使用 chat_parts 渲染
- ✅ 移动端适配：响应式设计支持各种屏幕尺寸

