<template>
  <div class="concept-list-card">
    <h3>{{ title }}</h3>
    <div class="concept-table">
      <table>
        <thead>
          <tr>
            <th>排名</th>
            <th>ETF名称</th>
            <th>代码</th>
            <th>最新价</th>
            <th>涨跌幅</th>
            <th>成交量</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(etf, index) in etfs" :key="etf.code">
            <td class="rank">{{ index + 1 }}</td>
            <td class="etf-name">{{ etf.name }}</td>
            <td class="etf-code">{{ etf.code }}</td>
            <td class="price">{{ formatPrice(etf.price) }}</td>
            <td :class="['percentage', getColorClass(etf.changePercent)]">
              {{ formatNumber(etf.changePercent) }}%
            </td>
            <td class="volume">{{ formatVolume(etf.volume) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ETFRankingList',
  props: {
    title: {
      type: String,
      required: true
    },
    etfs: {
      type: Array,
      required: true
    }
  },
  methods: {
    formatPrice(value) {
      return Number(value).toFixed(3)
    },
    formatNumber(value) {
      const num = Number(value)
      if (isNaN(num)) return '0.00'
      return num > 0 ? `+${num.toFixed(2)}` : `${num.toFixed(2)}`
    },
    getColorClass(value) {
      const num = Number(value)
      return {
        'up': num > 0,
        'down': num < 0
      }
    },
    formatVolume(volume) {
      if (!volume) return '0'
      if (volume >= 100000000) {
        return (volume / 100000000).toFixed(1) + '亿'
      }
      return (volume / 10000).toFixed(1) + '万'
    }
  }
}
</script>

<style scoped>
.concept-list-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.concept-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px 8px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  font-weight: 600;
  color: #666;
}

.up { color: #f56c6c; }
.down { color: #67c23a; }

.rank {
  width: 60px;
  text-align: center;
  color: #666;
}

.etf-name {
  min-width: 120px;
}

.etf-code {
  color: #666;
  font-family: monospace;
}

.price, .percentage {
  text-align: right;
  padding-right: 20px !important;
}

.volume {
  text-align: right;
  padding-right: 20px !important;
  color: #666;
}
</style> 