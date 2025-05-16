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
            <el-tag type="warning">{{ report.code }}</el-tag>
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
import config from '../config/config'

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

/* HTML 内容样式 */
.html-content {
  line-height: 1.8;
  color: #303133;
  font-size: 16px;
}

.html-content h1,
.html-content h2,
.html-content h3,
.html-content h4,
.html-content h5,
.html-content h6 {
  margin-top: 1.5em;
  margin-bottom: 0.8em;
  color: #303133;
}

.html-content h2 {
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 0.5em;
}

.html-content p {
  margin-bottom: 1em;
}

.html-content table {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 1.5em;
}

.html-content table th,
.html-content table td {
  border: 1px solid #dcdfe6;
  padding: 10px 12px;
  text-align: left;
}

.html-content table th {
  background-color: #f5f7fa;
  font-weight: 600;
}

.html-content table tr:nth-child(even) {
  background-color: #fafafa;
}

.financial-table {
  width: 100%;
  margin: 20px 0;
}

.business-segment {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px dashed #ebeef5;
}

.business-segment:last-child {
  border-bottom: none;
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
  
  .html-content {
    font-size: 15px;
  }
}
</style> 