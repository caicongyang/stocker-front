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
        
        <StockList
          title="成交量异动概念 TOP20"
          :stocks="volumeStocks"
          class="volume-stocks"
          @click-item="goToDetail"
        />
        
        <StockList
          title="涨停概念异动 TOP20"
          :stocks="limitUpStocks"
          class="limit-up-stocks"
          @click-item="goToDetail"
        />
        
        <StockList
          title="异动ETF TOP20"
          :stocks="abnormalETFs"
          class="abnormal-etfs"
          @click-item="goToDetail"
        />
        
        <StockList
          title="ETF涨幅排名 TOP20"
          :stocks="etfRanking"
          :showVolume="false"
          class="etf-ranking"
          @click-item="goToDetail"
        />
      </div>
    </div>
  </div>
</template>

<script>
import MarketHeat from '../components/MarketHeat.vue'
import StockList from '../components/StockList.vue'
import SideMenu from '../components/SideMenu.vue'

export default {
  name: 'Dashboard',
  components: {
    MarketHeat,
    StockList,
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
      volumeStocks: [
        {
          symbol: '601318',
          name: '中国平安',
          price: 66.89,
          change: -1.23,
          volume: '3421.2万'
        }
      ],
      limitUpStocks: [
        {
          symbol: '000001',
          name: '平安银行',
          price: 18.22,
          change: 9.98,
          volume: '1234.5万'
        }
      ],
      abnormalETFs: [
        {
          symbol: '159915',
          name: '创业板ETF',
          price: 2.856,
          change: 1.85,
          volume: '12.3亿'
        }
      ],
      etfRanking: [
        {
          symbol: '512480',
          name: '半导体ETF',
          price: 1.625,
          change: 2.56
        }
      ]
    }
  },
  methods: {
    goToDetail(stock) {
      this.$router.push({
        name: 'StockDetail',
        query: { symbol: stock.symbol }
      })
    }
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