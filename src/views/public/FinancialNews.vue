<template>
  <div class="financial-news-container">
    <!-- Header with logo, search and login button -->
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
        <div class="search-container">
          <div class="search-wrapper">
            <i class="el-icon-search search-icon"></i>
            <input
              type="text"
              placeholder="搜索股票、概念或分析报告"
              v-model="searchText"
              class="search-input"
              @keyup.enter="handleSearch">
          </div>
        </div>
        <div class="login-button">
          <button class="btn-login" @click="goToLogin">
            <span>登录</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Hero section -->
    <div class="hero-section">
      <div class="hero-content">
        <h2 class="hero-title">专业的AI证券市场解析</h2>
        <p class="hero-subtitle">每日更新大盘分析、个股资金流向、港美股财报解读</p>
        <p class="hero-description">精准洞察市场动态，助力投资决策</p>
      </div>
    </div>

    <!-- Loading and error states -->
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
      </div>
    </div>
    
    <!-- Search results section -->
    <div v-if="showSearchResults" class="search-results-container">
      <div class="search-results-header">
        <div class="results-title-row">
          <h2>搜索结果</h2>
          <button class="btn-close" @click="closeSearchResults">
            <i class="el-icon-close"></i>
          </button>
        </div>
        <p v-if="searchResults.length" class="results-count">找到 {{ searchResults.length }} 条相关报告</p>
        <p v-else-if="!isSearching" class="no-results">未找到与 "{{ searchText }}" 相关的内容</p>
      </div>
      
      <div v-if="isSearching" class="loading-container">
        <div class="loading-spinner">
          <div class="spinner"></div>
        </div>
      </div>
      
      <div v-else-if="searchResults.length" class="search-results-list">
        <div v-for="(report, index) in searchResults" :key="'search-'+index" class="report-card search-result-card">
          <div class="card-header">
            <h3>{{ report.title }}</h3>
            <div class="meta-badges">
              <span class="badge badge-type">{{ report.type }}</span>
              <span class="badge badge-date">{{ report.date }}</span>
            </div>
          </div>
          
          <div v-if="report.stockCode !== '未知'" class="stock-info">
            <span class="stock-code">{{ report.stockCode }}</span>
            <span class="stock-name">{{ report.stockName }}</span>
          </div>
          
          <div class="tags-list" v-if="report.tags && report.tags.length">
            <span v-for="(tag, idx) in report.tags" :key="idx" class="tag">
              {{ tag }}
            </span>
          </div>
          
          <p class="report-summary">{{ report.summary }}</p>
          
          <button class="btn-read-more" @click="showReportDetail(report.reportId)">
            <span>阅读完整报告</span>
            <i class="el-icon-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Tabs for report sections -->
    <div v-else-if="!loading && !error" class="tabs-container">
      <div class="tabs-header">
        <button 
          v-for="tab in tabs" 
          :key="tab.name"
          :class="['tab-button', { active: activeTab === tab.name }]"
          @click="activeTab = tab.name">
          {{ tab.label }}
        </button>
      </div>

      <div class="tab-content">
        <!-- Market Reports -->
        <div v-show="activeTab === 'market'" class="report-grid">
          <div v-for="(report, index) in marketReports" :key="'market-'+index" class="report-card">
            <div class="card-header">
              <h3>{{ report.title }}</h3>
              <span class="badge badge-date">{{ report.date }}</span>
            </div>
            <div class="tags-list" v-if="report.tags && report.tags.length">
              <span v-for="(tag, idx) in report.tags" :key="idx" class="tag">{{ tag }}</span>
            </div>
            <p class="report-summary">{{ report.summary }}</p>
            <button class="btn-read-more" @click="showReportDetail(report.reportId)">
              <span>阅读完整报告</span>
              <i class="el-icon-arrow-right"></i>
            </button>
          </div>
        </div>

        <!-- Stock Reports -->
        <div v-show="activeTab === 'stocks'" class="report-grid">
          <div v-for="(report, index) in stockReports" :key="'stock-'+index" class="report-card">
            <div class="card-header">
              <h3>{{ report.title }}</h3>
              <span class="badge badge-date">{{ report.date }}</span>
            </div>
            <div class="stock-info">
              <span class="stock-code">{{ report.stockCode }}</span>
              <span class="stock-name">{{ report.stockName }}</span>
            </div>
            <div class="tags-list" v-if="report.tags && report.tags.length">
              <span v-for="(tag, idx) in report.tags" :key="idx" class="tag">{{ tag }}</span>
            </div>
            <p class="report-summary">{{ report.summary }}</p>
            <button class="btn-read-more" @click="showReportDetail(report.reportId)">
              <span>阅读完整报告</span>
              <i class="el-icon-arrow-right"></i>
            </button>
          </div>
        </div>

        <!-- Financial Reports -->
        <div v-show="activeTab === 'financial'" class="report-grid">
          <div v-for="(report, index) in financialReports" :key="'financial-'+index" class="report-card">
            <div class="card-header">
              <h3>{{ report.title }}</h3>
              <span class="badge badge-date">{{ report.date }}</span>
            </div>
            <div class="stock-info">
              <span class="stock-code">{{ report.stockCode }}</span>
              <span class="stock-name">{{ report.stockName }}</span>
            </div>
            <div class="tags-list" v-if="report.tags && report.tags.length">
              <span v-for="(tag, idx) in report.tags" :key="idx" class="tag">{{ tag }}</span>
            </div>
            <p class="report-summary">{{ report.summary }}</p>
            <button class="btn-read-more" @click="showFinancialReportDetail(report.reportId)">
              <span>查看完整财报</span>
              <i class="el-icon-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Risk disclaimer -->
    <div class="risk-disclaimer">
      <p>入市有风险，投资需谨慎</p>
    </div>

    <!-- Donation QR code -->
    <div class="donation-container" @mouseenter="showDonation = true" @mouseleave="showDonation = false">
      <div class="donation-button" :class="{ 'active': showDonation }">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" fill="white"/>
        </svg>
      </div>
      <div class="donation-box" :class="{ 'show': showDonation }">
        <div class="donation-header">
          <h3>请我喝杯咖啡</h3>
          <p>如果此网站对您有帮助，欢迎打赏支持</p>
        </div>
        <div class="donation-qr">
          <img src="/QRCode.jpg" alt="微信支付二维码" />
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
import config from '../../config/config'

export default {
  name: 'FinancialNews',
  data() {
    return {
      activeTab: 'market',
      searchText: '',
      showDonation: false,
      marketReports: [],
      stockReports: [],
      financialReports: [],
      loading: true,
      error: null,
      isSearching: false,
      searchResults: [],
      showSearchResults: false,
      tabs: [
        { name: 'market', label: 'AI大盘解析' },
        { name: 'stocks', label: 'AI个股资金流向' },
        { name: 'financial', label: 'AI财报' }
      ]
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
          
          // 获取财报数据
          if (response.data.finance_reports) {
            this.financialReports = response.data.finance_reports.map(report => ({
              title: report.title,
              date: this.formatDate(report.created_at),
              stockName: report.code ? this.extractStockName(report.title, report.code) : '未知',
              stockCode: report.code || '未知',
              summary: this.generateSummary(report.content, 150),
              reportId: report.report_id,
              tags: report.tags ? report.tags.split(',') : [],
              contentType: 'html'
            }))
          }
          
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
      
      // 默认财报数据
      this.financialReports = [
        {
          title: '2023年Q2季度财报解析',
          date: '2023-07-15',
          stockName: '腾讯控股',
          stockCode: '00700.HK',
          summary: '腾讯Q2营收同比增长11%，净利润同比增长15%，游戏业务增长放缓，广告和金融科技业务表现亮眼。整体业绩超出市场预期。',
          tags: ['财报解析', 'Q2业绩'],
          reportId: 'financial-001',
          contentType: 'html'
        },
        {
          title: '2023年中报业绩预览',
          date: '2023-07-10',
          stockName: '比亚迪',
          stockCode: '002594',
          summary: '比亚迪上半年新能源汽车销量突破120万辆，同比增长98%，预计营收增长65%以上，净利润增长超过200%，创历史新高。',
          tags: ['中报预览', '新能源车'],
          reportId: 'financial-002',
          contentType: 'html'
        },
        {
          title: '2023年Q1财务分析',
          date: '2023-05-20',
          stockName: '茅台',
          stockCode: '600519',
          summary: '茅台Q1收入389亿元，同比增长17.4%，净利润208亿元，同比增长19.1%。渠道改革成效显著，直营比例提升，批价稳定。',
          tags: ['财报分析', '白酒龙头'],
          reportId: 'financial-003',
          contentType: 'html'
        }
      ]
    },
    
    showReportDetail(reportId) {
      // 导航到报告详情页
      this.$router.push(`/report/${reportId}`)
    },
    
    showFinancialReportDetail(reportId) {
      // 导航到财报详情页，使用不同的路由以区分HTML内容
      this.$router.push(`/financial-report/${reportId}`)
    },
    
    goToLogin() {
      this.$router.push('/login')
    },
    
    handleSearch() {
      if (!this.searchText.trim()) {
        return
      }
      
      this.isSearching = true
      this.showSearchResults = true
      
      axios.get(`${config.aiApiBaseUrl}/search`, {
        params: {
          keyword: this.searchText.trim(),
          limit: 10
        }
      })
        .then(response => {
          this.searchResults = response.data.reports ? response.data.reports.map(report => ({
            title: report.title,
            date: this.formatDate(report.created_at),
            stockName: report.code ? this.extractStockName(report.title, report.code) : '未知',
            stockCode: report.code || '未知',
            summary: this.generateSummary(report.content, 150),
            reportId: report.report_id,
            type: report.report_type === 'market' ? '大盘分析' : '个股分析',
            tags: report.tags ? report.tags.split(',') : []
          })) : []
          this.isSearching = false
        })
        .catch(error => {
          console.error('搜索失败:', error)
          if (error.response && error.response.status === 422) {
            const errorMsg = error.response.data && error.response.data.detail 
              ? `参数错误: ${error.response.data.detail}` 
              : '搜索参数无效，请修改搜索词';
            this.$message.error(errorMsg);
          } else {
            this.$message.error('搜索失败，请稍后再试')
          }
          this.isSearching = false
        })
    },
    
    closeSearchResults() {
      this.showSearchResults = false
      this.searchText = ''
      this.searchResults = []
    }
  }
}
</script>

<style scoped>
/* Apple-inspired Design System */
* {
  box-sizing: border-box;
}

.financial-news-container {
  width: 100%;
  min-height: 100vh;
  background: #fbfbfd;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif;
  position: relative;
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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
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

/* Search Styles */
.search-container {
  flex: 1;
  max-width: 500px;
}

.search-wrapper {
  position: relative;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #86868b;
  font-size: 18px;
  pointer-events: none;
}

.search-input {
  width: 100%;
  height: 40px;
  padding: 0 16px 0 48px;
  border: none;
  border-radius: 10px;
  background: #f5f5f7;
  font-size: 15px;
  color: #1d1d1f;
  outline: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-input::placeholder {
  color: #86868b;
}

.search-input:focus {
  background: #e8e8ed;
  box-shadow: 0 0 0 4px rgba(0, 125, 250, 0.1);
}

/* Button Styles */
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

.btn-login:active {
  transform: translateY(0);
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
  padding: 80px 24px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)" /></svg>');
  opacity: 0.5;
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: 48px;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: white;
  margin: 0 0 16px 0;
  line-height: 1.1;
}

.hero-subtitle {
  font-size: 21px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.hero-description {
  font-size: 17px;
  color: rgba(255, 255, 255, 0.75);
  margin: 0;
  line-height: 1.4;
}

/* Loading Styles */
.loading-container {
  max-width: 1200px;
  margin: 60px auto;
  padding: 0 24px;
  display: flex;
  justify-content: center;
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
}

/* Error Styles */
.error-container {
  max-width: 1200px;
  margin: 60px auto;
  padding: 0 24px;
}

.error-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
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
  margin: 0;
}

/* Search Results */
.search-results-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px 80px;
}

.search-results-header {
  margin-bottom: 32px;
}

.results-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.results-title-row h2 {
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #1d1d1f;
  margin: 0;
}

.btn-close {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: #f5f5f7;
  color: #1d1d1f;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  background: #e8e8ed;
}

.results-count,
.no-results {
  color: #86868b;
  font-size: 17px;
  margin: 0;
}

.search-results-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Tabs */
.tabs-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px 100px;
}

.tabs-header {
  display: flex;
  gap: 8px;
  margin-bottom: 32px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.tab-button {
  padding: 12px 24px;
  border: none;
  background: transparent;
  color: #86868b;
  font-size: 17px;
  font-weight: 500;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
}

.tab-button:hover {
  color: #1d1d1f;
}

.tab-button.active {
  color: #007AFF;
  border-bottom-color: #007AFF;
}

/* Report Grid */
.report-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
}

.report-card {
  background: white;
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.report-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #007AFF, #5856D6);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}

.report-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.report-card:hover::before {
  transform: scaleX(1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}

.card-header h3 {
  flex: 1;
  margin: 0;
  font-size: 19px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: #1d1d1f;
  line-height: 1.3;
}

/* Badges */
.badge {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
}

.badge-date {
  background: #f5f5f7;
  color: #86868b;
}

.badge-type {
  background: #007AFF;
  color: white;
}

.meta-badges {
  display: flex;
  gap: 8px;
  flex-direction: column;
  align-items: flex-end;
}

/* Stock Info */
.stock-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.stock-code {
  padding: 4px 10px;
  border-radius: 6px;
  background: #f5f5f7;
  color: #007AFF;
  font-size: 13px;
  font-weight: 600;
  font-family: 'SF Mono', 'Monaco', 'Courier New', monospace;
}

.stock-name {
  color: #1d1d1f;
  font-size: 15px;
  font-weight: 500;
}

/* Tags */
.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.tag {
  padding: 4px 10px;
  border-radius: 6px;
  background: rgba(0, 122, 255, 0.08);
  color: #007AFF;
  font-size: 12px;
  font-weight: 500;
}

/* Report Summary */
.report-summary {
  color: #6e6e73;
  font-size: 15px;
  line-height: 1.6;
  margin: 0 0 20px 0;
  flex-grow: 1;
}

/* Read More Button */
.btn-read-more {
  width: 100%;
  height: 40px;
  padding: 0 20px;
  border: none;
  border-radius: 10px;
  background: #f5f5f7;
  color: #007AFF;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-read-more:hover {
  background: #e8e8ed;
}

.btn-read-more i {
  font-size: 14px;
  transition: transform 0.2s ease;
}

.btn-read-more:hover i {
  transform: translateX(3px);
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

/* Donation Styles */
.donation-container {
  position: fixed;
  right: 24px;
  bottom: 60px;
  z-index: 99;
}

.donation-button {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
  box-shadow: 0 4px 16px rgba(0, 122, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.donation-button:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 122, 255, 0.4);
}

.donation-button.active {
  transform: scale(0.95);
}

.donation-box {
  position: absolute;
  right: 0;
  bottom: 72px;
  width: 280px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  transform: translateY(16px) scale(0.95);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.donation-box.show {
  transform: translateY(0) scale(1);
  opacity: 1;
  visibility: visible;
}

.donation-header {
  padding: 20px;
  text-align: center;
  background: #fbfbfd;
}

.donation-header h3 {
  margin: 0 0 8px 0;
  font-size: 19px;
  font-weight: 600;
  color: #1d1d1f;
  letter-spacing: -0.01em;
}

.donation-header p {
  margin: 0;
  font-size: 13px;
  color: #86868b;
  line-height: 1.4;
}

.donation-qr {
  padding: 20px;
  text-align: center;
  background: white;
}

.donation-qr img {
  width: 200px;
  height: 200px;
  border-radius: 12px;
  object-fit: contain;
}

.donation-footer {
  padding: 16px;
  text-align: center;
  background: #fbfbfd;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.donation-footer p {
  margin: 0;
  font-size: 13px;
  color: #86868b;
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-content {
    flex-wrap: wrap;
    height: auto;
    padding: 12px 16px;
    gap: 12px;
  }

  .logo h1 {
    font-size: 18px;
  }

  .search-container {
    order: 3;
    width: 100%;
    max-width: 100%;
  }

  .hero-title {
    font-size: 36px;
  }

  .hero-subtitle {
    font-size: 19px;
  }

  .hero-description {
    font-size: 15px;
  }

  .report-grid {
    grid-template-columns: 1fr;
  }

  .tabs-header {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .tab-button {
    white-space: nowrap;
  }

  .donation-button {
    width: 48px;
    height: 48px;
  }

  .donation-box {
    width: 260px;
  }

  .donation-qr img {
    width: 180px;
    height: 180px;
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: 60px 20px;
  }

  .hero-title {
    font-size: 28px;
  }

  .hero-subtitle {
    font-size: 17px;
  }

  .results-title-row h2 {
    font-size: 24px;
  }

  .card-header h3 {
    font-size: 17px;
  }
}
</style> 