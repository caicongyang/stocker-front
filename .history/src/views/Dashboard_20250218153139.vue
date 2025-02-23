<template>
  <div class="dashboard">
    <SideMenu />
    <div class="content">
      <div class="dashboard-grid">
        <MarketHeat class="market-heat" />
        
        <StockList
          title="同花顺热股 TOP20"
          :stocks="hotStocks"
          class="hot-stocks"
          @click-item="goToDetail"
        />
        
        <ConceptVolumeList
          title="成交量异动概念 TOP20"
          :concepts="volumeStocks"
          class="volume-stocks"
        />
        
        <LimitUpConceptList
          title="涨停概念异动 TOP20"
          :concepts="limitUpStocks"
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
      etfRanking: []
    }
  },
  methods: {
    goToDetail(stock) {
      this.$router.push({
        name: 'StockDetail',
        query: { symbol: stock.symbol }
      })
    },
    
    async fetchVolumeStocks() {
      try {
        const response = await axios.get(`${config.apiBaseUrl}/concept-volume-stats/list`)
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
        const response = await axios.get(`${config.apiBaseUrl}/limit-up-concept-stats/list`)
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
        const response = await axios.get(`${config.apiBaseUrl}/t-etf/getTopGainEtfs`)
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

.market-heat {
  grid-column: 1 / -1;
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
</style>