<template>
  <div class="dashboard">
    <SideMenu />
    <div class="content">
      <div class="dashboard-grid">
        <div class="market-heat-header">
          <MarketHeat class="market-heat" />
          <div class="date-picker">
            <el-date-picker
              v-model="selectedDate"
              type="date"
              placeholder="选择日期"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
              :clearable="false"
              :picker-options="pickerOptions"
              @change="handleDateChange">
            </el-date-picker>
          </div>
        </div>
        
       
        
        <ConceptVolumeList
          title="成交量异动概念 TOP20"
          :concepts="volumeStocks"
          :tradeDate="selectedDate"
          class="volume-stocks"
        />
        
        <LimitUpConceptList
          title="涨停概念异动 TOP20"
          :concepts="limitUpStocks"
          :tradeDate="selectedDate"
          class="limit-up-stocks"
        />
        
        <StockList
          title="异动ETF TOP20"
          :stocks="abnormalETFs"
          class="abnormal-etfs"
          @click-item="goToDetail"
        />
        
        <ETFRankingList
          title="ETF涨幅排名 TOP20"
          :etfs="etfRanking"
          class="etf-ranking"
        />
        <StockList
          title="同花顺热股 TOP20"
          :stocks="hotStocks"
          class="hot-stocks"
          @click-item="goToDetail"
        />
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
            <img src="/QRCode.jpg" alt="微信支付二维码" />
          </div>
          <div class="donation-footer">
            <p>感谢您的支持 ❤️</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MarketHeat from '../components/MarketHeat.vue'
import StockList from '../components/StockList.vue'
import ConceptVolumeList from '../components/ConceptVolumeList.vue'
import LimitUpConceptList from '../components/LimitUpConceptList.vue'
import ETFRankingList from '../components/ETFRankingList.vue'
import SideMenu from '../components/SideMenu.vue'
import axios from 'axios'
import config from '../config/config'

export default {
  name: 'Dashboard',
  components: {
    MarketHeat,
    StockList,
    ConceptVolumeList,
    LimitUpConceptList,
    ETFRankingList,
    SideMenu
  },
  data() {
    return {
      hotStocks: [
        {
          symbol: '600000',
          name: '浦发银行',
          price: 28.45,
          change: 2.15,
          volume: '2345.6万'
        }
      ],
      volumeStocks: [],
      limitUpStocks: [],
      abnormalETFs: [
        {
          symbol: '159915',
          name: '创业板ETF',
          price: 2.856,
          change: 1.85,
          volume: '12.3亿'
        }
      ],
      etfRanking: [],
      selectedDate: new Date().toISOString().split('T')[0],
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now()
        }
      },
      showDonation: false
    }
  },
  methods: {
    goToDetail(stock) {
      this.$router.push({
        name: 'StockDetail',
        query: { symbol: stock.symbol }
      })
    },
    
    handleDateChange() {
      this.fetchVolumeStocks()
      this.fetchLimitUpConcepts()
      this.fetchETFRanking()
    },
    
    async fetchVolumeStocks() {
      try {
        const response = await axios.get(`${config.apiBaseUrl}/concept-volume-stats/list`, {
          params: {
            tradeDate: this.selectedDate
          }
        })
        console.log('API Response:', response)
        
        if (response.data.code === 0) {
          this.volumeStocks = response.data.data.map(item => ({
            conceptName: item.conceptName,
            avgIncrease: Number(item.avgIncrease),
            maxIncrease: Number(item.maxIncrease),
            stockCount: item.stockCount,
            tradeDate: new Date(item.tradeDate).toLocaleDateString()
          }))
        } else {
          console.error('获取数据失败:', {
            code: response.data.code,
            msg: response.data.message,
            fullResponse: response.data
          })
        }
      } catch (error) {
        console.error('获取成交量异动概念数据失败:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        })
      }
    },
    
    async fetchLimitUpConcepts() {
      try {
        const response = await axios.get(`${config.apiBaseUrl}/limit-up-concept-stats/list`, {
          params: {
            tradeDate: this.selectedDate
          }
        })
        console.log('Limit Up Concepts Response:', response)
        
        if (response.data.code === 0) {
          this.limitUpStocks = response.data.data.map(item => ({
            conceptName: item.conceptName,
            avgIncrease: Number(item.avgIncrease),
            maxIncrease: Number(item.maxIncrease),
            stockCount: item.stockCount,
            tradeDate: new Date(item.tradeDate).toLocaleDateString(),
            totalVolume: item.totalVolume
          }))
        } else {
          console.error('获取涨停概念数据失败:', {
            code: response.data.code,
            msg: response.data.message,
            fullResponse: response.data
          })
        }
      } catch (error) {
        console.error('获取涨停概念数据失败:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        })
      }
    },

    async fetchETFRanking() {
      try {
        const response = await axios.get(`${config.apiBaseUrl}/t-etf/getTopGainEtfs`, {
          params: {
            tradeDate: this.selectedDate
          }
        })
        console.log('ETF Ranking Response:', response)
        
        if (response.data.code === 0) {
          this.etfRanking = response.data.data.map(item => ({
            code: item.stockCode,
            name: item.stockName,
            price: Number(item.close),
            changePercent: Number(item.pctChg),
            volume: Number(item.volume),
            high: Number(item.high),
            low: Number(item.low),
            amount: Number(item.amount),
            tradeDate: item.tradeDate
          }))
        } else {
          console.error('获取ETF排名数据失败:', {
            code: response.data.code,
            msg: response.data.message,
            fullResponse: response.data
          })
        }
      } catch (error) {
        console.error('获取ETF排名数据失败:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        })
      }
    }
  },
  
  created() {
    this.fetchVolumeStocks()
    this.fetchLimitUpConcepts()
    this.fetchETFRanking()
  }
}
</script>

<style scoped>
.dashboard {
  display: flex;
  height: 100vh;
  background-color: #f5f7fa;
}

.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.market-heat-header {
  grid-column: 1 / -1;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.market-heat {
  flex: 1;
}

.date-picker {
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
}

/* Element UI 日期选择器样式覆盖 */
:deep(.el-date-editor.el-input) {
  width: 180px;
}

:deep(.el-input__inner) {
  border-radius: 4px;
}

.hot-stocks,
.volume-stocks,
.limit-up-stocks,
.abnormal-etfs,
.etf-ranking {
  min-width: 0;
}

@media (max-width: 1200px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .hot-stocks,
  .volume-stocks,
  .limit-up-stocks,
  .abnormal-etfs,
  .etf-ranking {
    grid-column: 1 / -1;
  }
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
</style>