<template>
  <div class="report-detail-container">
    <header class="header">
      <div class="logo">
        <i class="el-icon-data-analysis"></i>
        <h1>金融 AI Agent</h1>
      </div>
      <div class="actions">
        <el-button type="text" icon="el-icon-back" @click="goBack">返回</el-button>
        <el-button type="primary" icon="el-icon-user" @click="goToLogin">登录</el-button>
      </div>
    </header>

    <div class="content">
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="20" animated />
      </div>
      
      <div v-else-if="error" class="error-container">
        <el-alert
          :title="error"
          type="error"
          show-icon>
        </el-alert>
        <div class="error-actions">
          <el-button type="primary" @click="goBack">返回</el-button>
          <el-button @click="fetchReport">重试</el-button>
        </div>
      </div>

      <div v-else class="report-content">
        <div class="report-header">
          <h1>{{ report.title }}</h1>
          <div class="report-meta">
            <span class="date">{{ report.created_at }}</span>
            <div class="tags" v-if="report.tags">
              <el-tag v-for="tag in report.tags.split(',')" :key="tag" size="small" effect="plain">{{ tag }}</el-tag>
            </div>
          </div>
          <div class="stock-info" v-if="report.code">
            <el-tag type="success">{{ report.code }}</el-tag>
          </div>
        </div>
        <div class="markdown-content" v-html="renderedContent"></div>
      </div>
    </div>

    <!-- Risk disclaimer -->
    <div class="risk-disclaimer">
      <p>入市有风险，投资需谨慎</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { marked } from 'marked'
import config from '../../config/config'

export default {
  name: 'ReportDetail',
  data() {
    return {
      loading: true,
      error: null,
      report: {},
      reportId: this.$route.params.id
    }
  },
  computed: {
    renderedContent() {
      if (!this.report.content) return ''
      return marked(this.report.content)
    }
  },
  created() {
    this.fetchReport()
  },
  methods: {
    fetchReport() {
      this.loading = true
      this.error = null
      
      axios.get(`${config.aiApiBaseUrl}/report/${this.reportId}`)
        .then(response => {
          this.report = response.data
          this.loading = false
          
          // 设置页面标题
          document.title = this.report.title || '报告详情'
        })
        .catch(error => {
          console.error('获取报告详情失败:', error)
          this.error = '获取报告详情失败，请稍后再试'
          this.loading = false
        })
    },
    goBack() {
      this.$router.push('/')
    },
    goToLogin() {
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.report-detail-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8fafc;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 40px;
  background-color: white;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
}

.logo {
  display: flex;
  align-items: center;
}

.logo i {
  font-size: 28px;
  color: #409EFF;
  margin-right: 10px;
}

.logo h1 {
  margin: 0;
  color: #303133;
  font-size: 22px;
  font-weight: 600;
}

.actions {
  display: flex;
  gap: 15px;
}

.content {
  flex: 1;
  max-width: 900px;
  margin: 30px auto;
  padding: 0 20px 80px;
}

.loading-container,
.error-container {
  margin: 40px auto;
  text-align: center;
}

.error-actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 15px;
}

.report-content {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  padding: 30px;
}

.report-header {
  border-bottom: 1px solid #eaeaea;
  padding-bottom: 20px;
  margin-bottom: 30px;
}

.report-header h1 {
  margin: 0 0 15px 0;
  font-size: 24px;
  color: #303133;
  font-weight: 600;
  line-height: 1.4;
}

.report-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 10px;
}

.date {
  color: #909399;
  font-size: 14px;
}

.tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.stock-info {
  margin-bottom: 15px;
}

.markdown-content {
  line-height: 1.8;
  color: #303133;
  font-size: 16px;
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3,
.markdown-content h4,
.markdown-content h5,
.markdown-content h6 {
  margin-top: 1.5em;
  margin-bottom: 0.8em;
}

.markdown-content p {
  margin-bottom: 1em;
}

.markdown-content ul,
.markdown-content ol {
  padding-left: 2em;
  margin-bottom: 1em;
}

.markdown-content table {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 1em;
}

.markdown-content table th,
.markdown-content table td {
  border: 1px solid #dcdfe6;
  padding: 8px 12px;
}

.markdown-content table th {
  background-color: #f5f7fa;
}

.markdown-content blockquote {
  padding: 0 1em;
  color: #606266;
  border-left: 0.25em solid #dcdfe6;
  margin-bottom: 1em;
}

.markdown-content code {
  background-color: #f5f7fa;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: monospace;
  font-size: 0.9em;
}

.markdown-content pre {
  background-color: #f5f7fa;
  padding: 16px;
  border-radius: 4px;
  overflow: auto;
  margin-bottom: 1em;
}

.markdown-content pre code {
  background-color: transparent;
  padding: 0;
}

/* Risk disclaimer styles */
.risk-disclaimer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: rgba(253, 246, 236, 0.9);
  text-align: center;
  padding: 8px 0;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 98;
}

.risk-disclaimer p {
  margin: 0;
  color: #e6a23c;
  font-size: 14px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .header {
    padding: 15px 20px;
  }
  
  .logo h1 {
    font-size: 18px;
  }
  
  .report-header h1 {
    font-size: 20px;
  }
  
  .report-content {
    padding: 20px;
  }
  
  .markdown-content {
    font-size: 15px;
  }
}
</style> 