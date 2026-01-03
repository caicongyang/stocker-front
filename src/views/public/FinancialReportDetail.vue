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
          <div class="financial-badge">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 11H15M9 15H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>财报</span>
          </div>
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
        <!-- 直接渲染HTML内容，不使用marked转换 -->
        <div class="html-content" v-html="report.content"></div>
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
import config from '../../config/config'

export default {
  name: 'FinancialReportDetail',
  data() {
    return {
      loading: true,
      error: null,
      report: {},
      reportId: this.$route.params.id
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
          document.title = this.report.title || '财报详情'
        })
        .catch(error => {
          console.error('获取财报详情失败:', error)
          this.error = '获取财报详情失败，请稍后再试'
          this.loading = false
          
          // 如果出错，可以加载默认数据
          this.loadDefaultData()
        })
    },
    loadDefaultData() {
      // 当API失败时加载默认数据
      this.report = {
        title: '2023年腾讯Q2季度财报解析',
        created_at: '2023-07-15',
        code: '00700.HK',
        tags: '财报解析,Q2业绩,互联网',
        content: `
          <div class="financial-report">
            <h2>公司概览</h2>
            <p>腾讯控股是中国领先的互联网增值服务提供商，业务涵盖社交媒体、网络游戏、金融科技、云计算等多个领域。</p>
            
            <h2>财务摘要</h2>
            <table class="financial-table">
              <tr>
                <th>项目</th>
                <th>数值(百万元)</th>
                <th>同比增长</th>
              </tr>
              <tr>
                <td>总收入</td>
                <td>149,208</td>
                <td>+11%</td>
              </tr>
              <tr>
                <td>毛利润</td>
                <td>67,135</td>
                <td>+13%</td>
              </tr>
              <tr>
                <td>净利润</td>
                <td>35,630</td>
                <td>+15%</td>
              </tr>
            </table>
            
            <h2>业务分析</h2>
            <div class="business-segment">
              <h3>增值服务</h3>
              <p>增值服务收入达78,730百万元，同比增长8%。其中游戏业务收入同比增长5%，社交网络收入同比增长12%。</p>
            </div>
            
            <div class="business-segment">
              <h3>网络广告</h3>
              <p>网络广告收入达23,605百万元，同比增长17%，主要受益于电商广告和社交广告的强劲增长。</p>
            </div>
            
            <div class="business-segment">
              <h3>金融科技及企业服务</h3>
              <p>金融科技及企业服务收入达46,873百万元，同比增长15%，主要来自支付服务和云服务的增长。</p>
            </div>
            
            <h2>展望与风险</h2>
            <p>公司将继续加大在人工智能和产业互联网的投入，同时面临监管环境变化和市场竞争加剧的挑战。</p>
          </div>
        `
      }
      this.loading = false
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
  background: linear-gradient(135deg, rgba(255, 149, 0, 0.05) 0%, rgba(255, 59, 48, 0.05) 100%);
}

.financial-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #ff9500 0%, #ff3b30 100%);
  color: white;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(255, 149, 0, 0.25);
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
  background: rgba(255, 149, 0, 0.12);
  color: #ff9500;
  font-size: 13px;
  font-weight: 500;
}

.stock-info {
  display: inline-flex;
}

.stock-code {
  padding: 8px 16px;
  border-radius: 10px;
  background: rgba(255, 149, 0, 0.15);
  color: #ff9500;
  font-size: 15px;
  font-weight: 600;
  font-family: 'SF Mono', 'Monaco', 'Courier New', monospace;
  letter-spacing: 0.02em;
}

/* HTML Content Styles */
.html-content {
  padding: 40px;
  line-height: 1.8;
  color: #1d1d1f;
  font-size: 17px;
}

.html-content h1,
.html-content h2,
.html-content h3,
.html-content h4,
.html-content h5,
.html-content h6 {
  margin: 2em 0 0.8em 0;
  color: #1d1d1f;
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.3;
}

.html-content h1 {
  font-size: 28px;
  border-bottom: 2px solid #f5f5f7;
  padding-bottom: 0.5em;
}

.html-content h2 {
  font-size: 24px;
  border-bottom: 1px solid #f5f5f7;
  padding-bottom: 0.5em;
}

.html-content h3 {
  font-size: 21px;
}

.html-content h4 {
  font-size: 19px;
}

.html-content p {
  margin-bottom: 1.2em;
  line-height: 1.8;
  color: #1d1d1f;
}

.html-content ul,
.html-content ol {
  padding-left: 1.8em;
  margin-bottom: 1.2em;
}

.html-content li {
  margin-bottom: 0.5em;
  line-height: 1.7;
}

.html-content li::marker {
  color: #ff9500;
}

.html-content table {
  border-collapse: collapse;
  width: 100%;
  margin: 1.5em 0;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 0 0 1px #e8e8ed;
}

.html-content table th,
.html-content table td {
  border: 1px solid #e8e8ed;
  padding: 12px 16px;
  text-align: left;
}

.html-content table th {
  background: linear-gradient(135deg, rgba(255, 149, 0, 0.08) 0%, rgba(255, 59, 48, 0.08) 100%);
  font-weight: 600;
  color: #1d1d1f;
  font-size: 15px;
}

.html-content table tr:nth-child(even) {
  background: #fbfbfd;
}

.html-content table tr:hover {
  background: rgba(255, 149, 0, 0.03);
}

.html-content .financial-table {
  width: 100%;
  margin: 20px 0;
}

.html-content .business-segment {
  margin-bottom: 24px;
  padding: 20px;
  background: #fbfbfd;
  border-radius: 12px;
  border-left: 4px solid #ff9500;
}

.html-content .business-segment:last-child {
  margin-bottom: 0;
}

.html-content .business-segment h3 {
  margin-top: 0;
  color: #ff9500;
}

.html-content blockquote {
  padding: 16px 20px;
  color: #6e6e73;
  border-left: 4px solid #ff9500;
  background: rgba(255, 149, 0, 0.05);
  border-radius: 0 8px 8px 0;
  margin: 1.5em 0;
}

.html-content code {
  background: #f5f5f7;
  padding: 3px 8px;
  border-radius: 6px;
  font-family: 'SF Mono', 'Monaco', 'Courier New', monospace;
  font-size: 0.92em;
  color: #ff3b30;
}

.html-content pre {
  background: #1d1d1f;
  color: #f5f5f7;
  padding: 20px;
  border-radius: 12px;
  overflow: auto;
  margin: 1.5em 0;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.html-content pre code {
  background: transparent;
  padding: 0;
  color: #f5f5f7;
  border-radius: 0;
}

.html-content a {
  color: #ff9500;
  text-decoration: none;
  transition: opacity 0.2s ease;
}

.html-content a:hover {
  opacity: 0.7;
}

.html-content img {
  max-width: 100%;
  height: auto;
  border-radius: 12px;
  margin: 1.5em 0;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.1);
}

.html-content hr {
  border: none;
  height: 1px;
  background: #e8e8ed;
  margin: 2em 0;
}

.html-content strong {
  font-weight: 600;
  color: #1d1d1f;
}

.html-content em {
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

  .html-content {
    padding: 28px 24px;
    font-size: 16px;
  }

  .html-content h1 {
    font-size: 24px;
  }

  .html-content h2 {
    font-size: 21px;
  }

  .html-content h3 {
    font-size: 19px;
  }

  .html-content table {
    font-size: 14px;
  }

  .html-content .business-segment {
    padding: 16px;
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

  .html-content {
    font-size: 15px;
  }
}
</style> 