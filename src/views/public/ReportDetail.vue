<template>
  <div class="report-detail-container">
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="url(#gradient)"/>
            <path d="M8 20L12 12L16 16L20 8L24 14" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="32" y2="32">
                <stop offset="0%" stop-color="#007AFF"/>
                <stop offset="100%" stop-color="#5856D6"/>
              </linearGradient>
            </defs>
          </svg>
          <h1>金融 AI</h1>
        </div>
        <div class="actions">
          <button class="btn-back" @click="goBack">
            <i class="el-icon-arrow-left"></i>
            <span>返回</span>
          </button>
          <button class="btn-login" @click="goToLogin">
            <span>登录</span>
          </button>
        </div>
      </div>
    </header>

    <div class="content">
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner">
          <div class="spinner"></div>
          <p>加载中...</p>
        </div>
      </div>
      
      <div v-else-if="error" class="error-container">
        <div class="error-card">
          <i class="el-icon-warning"></i>
          <p>{{ error }}</p>
          <div class="error-actions">
            <button class="btn-primary" @click="goBack">返回</button>
            <button class="btn-secondary" @click="fetchReport">重试</button>
          </div>
        </div>
      </div>

      <div v-else class="report-content">
        <div class="report-header">
          <h1>{{ report.title }}</h1>
          <div class="report-meta">
            <span class="date">
              <i class="el-icon-time"></i>
              {{ report.created_at }}
            </span>
            <div class="tags" v-if="report.tags">
              <span v-for="tag in report.tags.split(',')" :key="tag" class="tag">{{ tag }}</span>
            </div>
          </div>
          <div class="stock-info" v-if="report.code">
            <span class="stock-code">{{ report.code }}</span>
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
/* Apple-inspired Design System */
* {
  box-sizing: border-box;
}

.report-detail-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fbfbfd;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif;
}

/* Header Styles */
.header {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 24px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.logo:hover {
  opacity: 0.7;
}

.logo h1 {
  margin: 0;
  font-size: 21px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: #1d1d1f;
}

.actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* Button Styles */
.btn-back {
  height: 36px;
  padding: 0 16px;
  border: none;
  border-radius: 980px;
  background: #f5f5f7;
  color: #1d1d1f;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-back:hover {
  background: #e8e8ed;
}

.btn-login {
  height: 36px;
  padding: 0 20px;
  border: none;
  border-radius: 980px;
  background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
  color: white;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.2);
}

.btn-login:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

/* Content */
.content {
  flex: 1;
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 24px 80px;
  width: 100%;
}

/* Loading */
.loading-container {
  display: flex;
  justify-content: center;
  padding: 80px 0;
}

.loading-spinner {
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f5f5f7;
  border-top-color: #007AFF;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-spinner p {
  color: #86868b;
  font-size: 15px;
  margin: 0;
}

/* Error */
.error-container {
  padding: 60px 0;
}

.error-card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06);
}

.error-card i {
  font-size: 48px;
  color: #ff3b30;
  margin-bottom: 16px;
}

.error-card p {
  color: #1d1d1f;
  font-size: 17px;
  margin: 0 0 24px 0;
}

.error-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.btn-primary,
.btn-secondary {
  height: 40px;
  padding: 0 24px;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.btn-secondary {
  background: #f5f5f7;
  color: #1d1d1f;
}

.btn-secondary:hover {
  background: #e8e8ed;
}

/* Report Content */
.report-content {
  background: white;
  border-radius: 20px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  animation: fadeInUp 0.5s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.report-header {
  padding: 40px 40px 32px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  background: linear-gradient(135deg, rgba(0, 122, 255, 0.03) 0%, rgba(88, 86, 214, 0.03) 100%);
}

.report-header h1 {
  margin: 0 0 20px 0;
  font-size: 32px;
  color: #1d1d1f;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.2;
}

.report-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 20px;
}

.date {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #86868b;
  font-size: 15px;
  font-weight: 500;
}

.date i {
  font-size: 16px;
}

.tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  padding: 6px 12px;
  border-radius: 8px;
  background: rgba(0, 122, 255, 0.1);
  color: #007AFF;
  font-size: 13px;
  font-weight: 500;
}

.stock-info {
  display: inline-flex;
}

.stock-code {
  padding: 8px 16px;
  border-radius: 10px;
  background: rgba(0, 122, 255, 0.12);
  color: #007AFF;
  font-size: 15px;
  font-weight: 600;
  font-family: 'SF Mono', 'Monaco', 'Courier New', monospace;
  letter-spacing: 0.02em;
}

/* Markdown Content Styles */
.markdown-content {
  padding: 40px;
  line-height: 1.8;
  color: #1d1d1f;
  font-size: 17px;
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3,
.markdown-content h4,
.markdown-content h5,
.markdown-content h6 {
  margin: 2em 0 0.8em 0;
  color: #1d1d1f;
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.3;
}

.markdown-content h1 {
  font-size: 28px;
  border-bottom: 2px solid #f5f5f7;
  padding-bottom: 0.5em;
}

.markdown-content h2 {
  font-size: 24px;
  border-bottom: 1px solid #f5f5f7;
  padding-bottom: 0.5em;
}

.markdown-content h3 {
  font-size: 21px;
}

.markdown-content h4 {
  font-size: 19px;
}

.markdown-content p {
  margin-bottom: 1.2em;
  line-height: 1.8;
  color: #1d1d1f;
}

.markdown-content ul,
.markdown-content ol {
  padding-left: 1.8em;
  margin-bottom: 1.2em;
}

.markdown-content li {
  margin-bottom: 0.5em;
  line-height: 1.7;
}

.markdown-content li::marker {
  color: #007AFF;
}

.markdown-content table {
  border-collapse: collapse;
  width: 100%;
  margin: 1.5em 0;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 0 0 1px #e8e8ed;
}

.markdown-content table th,
.markdown-content table td {
  border: 1px solid #e8e8ed;
  padding: 12px 16px;
  text-align: left;
}

.markdown-content table th {
  background: #f5f5f7;
  font-weight: 600;
  color: #1d1d1f;
  font-size: 15px;
}

.markdown-content table tr:nth-child(even) {
  background: #fbfbfd;
}

.markdown-content table tr:hover {
  background: rgba(0, 122, 255, 0.03);
}

.markdown-content blockquote {
  padding: 16px 20px;
  color: #6e6e73;
  border-left: 4px solid #007AFF;
  background: rgba(0, 122, 255, 0.03);
  border-radius: 0 8px 8px 0;
  margin: 1.5em 0;
}

.markdown-content code {
  background: #f5f5f7;
  padding: 3px 8px;
  border-radius: 6px;
  font-family: 'SF Mono', 'Monaco', 'Courier New', monospace;
  font-size: 0.92em;
  color: #ff3b30;
}

.markdown-content pre {
  background: #1d1d1f;
  color: #f5f5f7;
  padding: 20px;
  border-radius: 12px;
  overflow: auto;
  margin: 1.5em 0;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.markdown-content pre code {
  background: transparent;
  padding: 0;
  color: #f5f5f7;
  border-radius: 0;
}

.markdown-content a {
  color: #007AFF;
  text-decoration: none;
  transition: opacity 0.2s ease;
}

.markdown-content a:hover {
  opacity: 0.7;
}

.markdown-content img {
  max-width: 100%;
  height: auto;
  border-radius: 12px;
  margin: 1.5em 0;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.1);
}

.markdown-content hr {
  border: none;
  height: 1px;
  background: #e8e8ed;
  margin: 2em 0;
}

.markdown-content strong {
  font-weight: 600;
  color: #1d1d1f;
}

.markdown-content em {
  font-style: italic;
  color: #6e6e73;
}

/* Risk Disclaimer */
.risk-disclaimer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: rgba(255, 249, 240, 0.9);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  text-align: center;
  padding: 10px 0;
  border-top: 1px solid rgba(255, 149, 0, 0.1);
  z-index: 98;
}

.risk-disclaimer p {
  margin: 0;
  color: #ff9500;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.01em;
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-content {
    padding: 0 16px;
  }

  .logo h1 {
    font-size: 18px;
  }

  .content {
    padding: 24px 16px 60px;
  }

  .report-header {
    padding: 28px 24px 24px;
  }

  .report-header h1 {
    font-size: 24px;
  }

  .report-meta {
    flex-direction: column;
    align-items: flex-start;
  }

  .markdown-content {
    padding: 28px 24px;
    font-size: 16px;
  }

  .markdown-content h1 {
    font-size: 24px;
  }

  .markdown-content h2 {
    font-size: 21px;
  }

  .markdown-content h3 {
    font-size: 19px;
  }

  .markdown-content table {
    font-size: 14px;
  }

  .markdown-content pre {
    padding: 16px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .actions {
    gap: 8px;
  }

  .btn-back span {
    display: none;
  }

  .btn-back {
    padding: 0 12px;
  }

  .report-header h1 {
    font-size: 22px;
  }

  .markdown-content {
    font-size: 15px;
  }
}
</style> 