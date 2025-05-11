<template>
  <div class="financial-news-container">
    <!-- Header with logo, search and login button -->
    <header class="header">
      <div class="logo">
        <i class="el-icon-data-analysis"></i>
        <h1>金融 AI Agent</h1>
      </div>
      <div class="search-container">
        <el-input
          placeholder="搜索股票代码、名称或概念"
          prefix-icon="el-icon-search"
          v-model="searchText"
          class="search-input">
          <el-button slot="append" icon="el-icon-search" @click="handleSearch"></el-button>
        </el-input>
      </div>
      <div class="login-button">
        <el-button type="primary" icon="el-icon-user" @click="goToLogin">登录</el-button>
      </div>
    </header>

    <!-- Hero section -->
    <div class="hero-section">
      <div class="hero-content">
        <h2>AI时代 最专业的证券市场解析</h2>
        <p>获取最新的大盘分析、个股资金流向分析</p>
      </div>
    </div>

    <!-- Loading and error states -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="6" animated />
    </div>
    
    <div v-else-if="error" class="error-container">
      <el-alert
        :title="error"
        type="error"
        show-icon
        :closable="false">
      </el-alert>
    </div>
    
    <!-- Tabs for report sections -->
    <div v-else class="tabs-container">
      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane label="AI大盘解析" name="market">
          <div class="report-grid">
            <el-card v-for="(report, index) in marketReports" :key="'market-'+index" class="report-card" shadow="hover">
              <div class="report-header">
                <h3>{{ report.title }}</h3>
                <el-tag size="small" type="primary">{{ report.date }}</el-tag>
              </div>
              <div class="tags-container" v-if="report.tags && report.tags.length">
                <el-tag v-for="(tag, idx) in report.tags" :key="idx" size="mini" effect="plain" class="report-tag">
                  {{ tag }}
                </el-tag>
              </div>
              <div class="report-content">
                <p>{{ report.summary }}</p>
              </div>
              <div class="report-footer">
                <el-button type="primary" plain size="small" @click="showReportDetail(report.reportId)">阅读完整报告</el-button>
              </div>
            </el-card>
          </div>
        </el-tab-pane>
        <el-tab-pane label="AI个股资金流向" name="stocks">
          <div class="report-grid">
            <el-card v-for="(report, index) in stockReports" :key="'stock-'+index" class="report-card" shadow="hover">
              <div class="report-header">
                <h3>{{ report.title }}</h3>
                <el-tag size="small" type="success">{{ report.date }}</el-tag>
              </div>
              <div class="stock-info">
                <el-tag type="info">{{ report.stockCode }}</el-tag>
                <strong>{{ report.stockName }}</strong>
              </div>
              <div class="tags-container" v-if="report.tags && report.tags.length">
                <el-tag v-for="(tag, idx) in report.tags" :key="idx" size="mini" effect="plain" class="report-tag">
                  {{ tag }}
                </el-tag>
              </div>
              <div class="report-content">
                <p>{{ report.summary }}</p>
              </div>
              <div class="report-footer">
                <el-button type="primary" plain size="small" @click="showReportDetail(report.reportId)">阅读完整报告</el-button>
              </div>
            </el-card>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- Risk disclaimer -->
    <div class="risk-disclaimer">
      <p>入市有风险，投资需谨慎</p>
    </div>

    <!-- Donation QR code -->
    <div class="donation-container" @mouseenter="showDonation = true" @mouseleave="showDonation = false">
      <div class="donation-button" :class="{ 'active': showDonation }">
        <i class="el-icon-coffee-cup"></i>
      </div>
      <div class="donation-box" :class="{ 'show': showDonation }">
        <div class="donation-header">
          <h3>请我喝杯咖啡</h3>
          <p>如果此网站对您有帮助，欢迎打赏支持</p>
        </div>
        <div class="donation-qr">
          <img src="/public/QRCode.jpg" alt="微信支付二维码" />
        </div>
        <div class="donation-footer">
          <p>感谢您的支持 ❤️</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import config from '../config/config'

export default {
  name: 'FinancialNews',
  data() {
    return {
      activeTab: 'market',
      searchText: '',
      showDonation: false,
      marketReports: [],
      stockReports: [],
      loading: true,
      error: null
    }
  },
  created() {
    // If already logged in, redirect to dashboard
    if (localStorage.getItem('isLoggedIn')) {
      this.$router.push('/dashboard')
    } else {
      this.fetchReports()
    }
  },
  methods: {
    fetchReports() {
      this.loading = true
      this.error = null
      
      axios.get(`${config.aiApiBaseUrl}/recent-analysis`)
        .then(response => {
          this.marketReports = response.data.market_reports.map(report => ({
            title: report.title,
            date: this.formatDate(report.created_at),
            summary: this.generateSummary(report.content, 200),
            reportId: report.report_id,
            tags: report.tags ? report.tags.split(',') : []
          }))
          
          this.stockReports = response.data.stock_reports.map(report => ({
            title: report.title,
            date: this.formatDate(report.created_at),
            stockName: report.code ? this.extractStockName(report.title, report.code) : '未知',
            stockCode: report.code || '未知',
            summary: this.generateSummary(report.content, 150),
            reportId: report.report_id,
            tags: report.tags ? report.tags.split(',') : []
          }))
          
          this.loading = false
        })
        .catch(error => {
          console.error('获取报告失败:', error)
          this.error = '获取数据失败，请稍后再试'
          this.loading = false
          
          // 加载失败时使用默认数据
          this.loadDefaultData()
        })
    },
    
    formatDate(dateString) {
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('zh-CN', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit' 
        })
      } catch (e) {
        return dateString
      }
    },
    
    generateSummary(content, maxLength) {
      if (!content) return ''
      
      // 移除Markdown标记
      let summary = content.replace(/#+\s+/g, '')
        .replace(/\*\*/g, '')
        .replace(/\n+/g, ' ')
        .replace(/```markdown|```/g, '')
        .replace(/\|.*?\|/g, '')
        .replace(/---/g, '')
        .replace(/\*+/g, '')
        
      // 截取适当长度
      if (summary.length > maxLength) {
        summary = summary.substring(0, maxLength) + '...'
      }
      
      return summary
    },
    
    extractStockName(title, code) {
      // 尝试从标题中提取股票名称
      if (title.includes('（') && title.includes('）')) {
        const match = title.match(/（(.+?)）/)
        if (match && match[1]) {
          const fullName = match[1]
          // 如果包含股票代码，提取前面的部分作为名称
          if (fullName.includes(code)) {
            return fullName.split(code)[0].trim()
          }
          return fullName
        }
      }
      
      // 实在无法提取，返回替代文本
      return '个股'
    },
    
    loadDefaultData() {
      // 当API失败时的默认数据
      this.marketReports = [
        {
          title: '全球经济形势与A股市场展望',
          date: '2023-06-15',
          summary: '本周A股市场震荡上行，上证指数收盘于3280点，涨幅1.2%。科技板块表现活跃，芯片、人工智能领域个股走强。市场风险偏好有所提升，外资持续流入。展望后市，随着政策支持力度加大，A股有望维持震荡上行格局。',
          tags: ['大盘', '市场分析']
        },
        {
          title: '行业轮动与投资机会分析',
          date: '2023-06-14',
          summary: '近期市场呈现明显的行业轮动特征，新能源、半导体、医药板块轮番表现。从资金流向看，外资重点布局大消费和科技领域。结合基本面和技术面分析，建议关注政策支持方向和业绩确定性较强的板块。',
          tags: ['行业分析', '市场分析']
        },
        {
          title: '宏观经济数据解读及货币政策影响',
          date: '2023-06-12',
          summary: '5月经济数据整体向好，工业增加值同比增长4.5%，社会消费品零售总额同比增长6.8%，均好于市场预期。货币政策维持稳健，流动性合理充裕，有利于资本市场稳定发展。',
          tags: ['宏观经济', '货币政策']
        }
      ]
      
      this.stockReports = [
        {
          title: '龙头科技股投资价值分析',
          date: '2023-06-15',
          stockName: '阿里巴巴',
          stockCode: '9988.HK',
          summary: '公司业务稳健复苏，云计算和国际电商业务增长强劲，估值处于历史低位，具备较高安全边际。',
          tags: ['科技股', '投资价值']
        },
        {
          title: '新能源车产业链投资机会',
          date: '2023-06-14',
          stockName: '宁德时代',
          stockCode: '300750',
          summary: '全球动力电池龙头地位稳固，技术优势明显，新一代CTP电池技术即将量产，有望进一步提升市场份额。',
          tags: ['新能源', '产业链']
        },
        {
          title: '半导体行业核心标的分析',
          date: '2023-06-13',
          stockName: '中芯国际',
          stockCode: '688981',
          summary: '国内领先晶圆代工企业，受益于国产替代进程加速，先进制程研发稳步推进，长期成长确定性强。',
          tags: ['半导体', '标的分析']
        }
      ]
    },
    
    showReportDetail(reportId) {
      // 导航到报告详情页
      this.$router.push(`/report/${reportId}`)
    },
    
    goToLogin() {
      this.$router.push('/login')
    },
    
    handleSearch() {
      if (this.searchText.trim()) {
        this.$message({
          message: '需要登录后才能查看详细搜索结果',
          type: 'info'
        })
        setTimeout(() => {
          this.goToLogin()
        }, 1000)
      }
    }
  }
}
</script>

<style scoped>
.financial-news-container {
  width: 100%;
  min-height: 100vh;
  background-color: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  position: relative;
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

.search-container {
  flex: 1;
  max-width: 500px;
  margin: 0 40px;
}

.search-input {
  width: 100%;
}

.hero-section {
  height: 200px;
  background: linear-gradient(135deg, #409EFF 0%, #36CCCB 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
  margin-bottom: 30px;
}

.hero-content h2 {
  font-size: 32px;
  margin-bottom: 10px;
  text-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
}

.hero-content p {
  font-size: 18px;
  opacity: 0.9;
}

.loading-container,
.error-container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
}

.tabs-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px 40px;
}

.report-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
  margin-top: 20px;
}

.report-card {
  border-radius: 8px;
  border: none;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.report-header h3 {
  margin: 0 0 5px 0;
  font-size: 18px;
  color: #303133;
  font-weight: 600;
}

.stock-info {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  gap: 10px;
}

.stock-info strong {
  color: #303133;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 10px;
}

.report-tag {
  margin-right: 5px;
}

.report-content {
  color: #606266;
  margin-bottom: 20px;
  line-height: 1.6;
  flex-grow: 1;
}

.report-footer {
  text-align: right;
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

/* Donation styles */
.donation-container {
  position: fixed;
  right: 20px;
  bottom: 50px;
  z-index: 99;
}

.donation-button {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #409EFF;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.donation-button i {
  font-size: 24px;
  color: white;
}

.donation-button.active {
  background-color: #67c23a;
  transform: scale(0.9);
}

.donation-box {
  position: absolute;
  right: 0;
  bottom: 60px;
  width: 240px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  transform: translateY(20px);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.donation-box.show {
  transform: translateY(0);
  opacity: 1;
  visibility: visible;
}

.donation-header {
  padding: 15px;
  text-align: center;
  background-color: #f5f7fa;
}

.donation-header h3 {
  margin: 0 0 5px 0;
  font-size: 16px;
  color: #303133;
}

.donation-header p {
  margin: 0;
  font-size: 12px;
  color: #606266;
}

.donation-qr {
  padding: 15px;
  text-align: center;
}

.donation-qr img {
  width: 180px;
  height: 180px;
  object-fit: contain;
}

.donation-footer {
  padding: 10px;
  text-align: center;
  background-color: #f5f7fa;
  font-size: 12px;
  color: #909399;
}

.donation-footer p {
  margin: 0;
}

/* Tab styles */
.el-tabs__item {
  font-size: 16px;
  padding: 0 25px;
  height: 50px;
  line-height: 50px;
}

/* Responsive layout */
@media (max-width: 1200px) {
  .report-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
    padding: 15px 20px;
  }
  
  .search-container {
    width: 100%;
    max-width: 100%;
    margin: 10px 0;
  }
  
  .login-button {
    align-self: flex-end;
  }
  
  .hero-section {
    height: 220px;
  }
  
  .hero-content h2 {
    font-size: 28px;
  }
  
  .hero-content p {
    font-size: 16px;
  }
  
  .report-grid {
    grid-template-columns: 1fr;
  }
  
  .donation-button {
    width: 45px;
    height: 45px;
  }
  
  .donation-box {
    width: 220px;
  }
  
  .donation-qr img {
    width: 160px;
    height: 160px;
  }
  
  .risk-disclaimer p {
    font-size: 12px;
  }
}
</style> 