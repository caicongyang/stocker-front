<template>
  <div class="concept-list-card">
    <h3>{{ title }}</h3>
    <div class="concept-table">
      <table>
        <thead>
          <tr>
            <th>排名</th>
            <th>概念名称</th>
            <th>平均涨幅</th>
            <th>最大涨幅</th>
            <th>涨停股数量</th>
            <th>总成交量</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(concept, index) in concepts" :key="concept.conceptName" @click="handleClick(concept)" class="clickable-row">
            <td class="rank">{{ index + 1 }}</td>
            <td class="concept-name">{{ concept.conceptName }}</td>
            <td :class="['percentage', getColorClass(concept.avgIncrease)]">
              {{ formatNumber(concept.avgIncrease) }}%
            </td>
            <td :class="['percentage', getColorClass(concept.maxIncrease)]">
              {{ formatNumber(concept.maxIncrease) }}%
            </td>
            <td class="stock-count">{{ concept.stockCount }}只</td>
            <td class="volume">{{ formatVolume(concept.totalVolume) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LimitUpConceptList',
  props: {
    title: {
      type: String,
      required: true
    },
    concepts: {
      type: Array,
      required: true
    },
    tradeDate: String
  },
  methods: {
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
    },
    handleClick(concept) {
      this.$router.push({
        name: 'LimitUpConceptDetail',
        params: { 
          name: concept.conceptName,
          date: this.tradeDate
        }
      })
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

.concept-name {
  min-width: 120px;
}

.percentage {
  text-align: right;
  padding-right: 20px !important;
}

.stock-count {
  text-align: center;
  color: #666;
}

.volume {
  text-align: right;
  padding-right: 20px !important;
  color: #666;
}

.clickable-row {
  cursor: pointer;
  transition: background-color 0.2s;
}

.clickable-row:hover {
  background-color: #f5f7fa;
}
</style> 