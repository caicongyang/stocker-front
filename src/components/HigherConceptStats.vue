<template>
  <div class="concept-list-card">
    <h3>{{ title }}</h3>
    <div class="concept-table">
      <table>
        <thead>
          <tr>
            <th>排名</th>
            <th>概念名称</th>
            <th>创新高股数</th>
            <th>平均涨幅</th>
            <th>最大涨幅</th>
            <th>平均间隔天数</th>
            <th>最大间隔天数</th>
            <th>总成交量</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(concept, index) in concepts" :key="concept.conceptName" @click="handleClick(concept)" class="clickable-row">
            <td class="rank">{{ index + 1 }}</td>
            <td class="concept-name">{{ concept.conceptName }}</td>
            <td class="stock-count">{{ concept.stockCount }}只</td>
            <td :class="['percentage', getColorClass(concept.avgGain)]">
              {{ formatPercentage(concept.avgGain) }}
            </td>
            <td :class="['percentage', getColorClass(concept.maxGain)]">
              {{ formatPercentage(concept.maxGain) }}
            </td>
            <td class="days">{{ formatDays(concept.avgIntervalDays) }}天</td>
            <td class="days">{{ concept.maxIntervalDays }}天</td>
            <td class="volume">{{ formatVolume(concept.totalVolume) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="concepts.length === 0" class="no-data">
      <el-empty description="暂无数据"></el-empty>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HigherConceptStats',
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
    formatPercentage(value) {
      const num = Number(value)
      if (isNaN(num)) return '0.00%'
      return num > 0 ? `+${num.toFixed(2)}%` : `${num.toFixed(2)}%`
    },
    formatDays(value) {
      const num = Number(value)
      if (isNaN(num)) return '0.0'
      return num.toFixed(1)
    },
    formatVolume(volume) {
      if (!volume) return '0'
      if (volume >= 100000000) {
        return (volume / 100000000).toFixed(1) + '亿'
      }
      return (volume / 10000).toFixed(1) + '万'
    },
    getColorClass(value) {
      const num = Number(value)
      return {
        'up': num > 0,
        'down': num < 0,
        'neutral': num === 0
      }
    },
    handleClick(concept) {
      this.$router.push({
        name: 'HigherConceptDetail',
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

.concept-list-card h3 {
  margin: 0 0 20px 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.concept-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

th, td {
  padding: 12px 8px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  font-weight: 600;
  color: #666;
  background-color: #fafafa;
}

.up { color: #f56c6c; }
.down { color: #67c23a; }
.neutral { color: #909399; }

.rank {
  width: 60px;
  text-align: center;
  color: #666;
}

.concept-name {
  min-width: 120px;
  font-weight: 500;
  color: #409eff;
  cursor: pointer;
}

.stock-count {
  text-align: center;
  color: #666;
  width: 100px;
}

.percentage {
  text-align: right;
  padding-right: 20px !important;
  width: 120px;
}

.days {
  text-align: center;
  color: #666;
  width: 100px;
}

.volume {
  text-align: right;
  padding-right: 20px !important;
  color: #666;
  width: 120px;
}

.clickable-row {
  cursor: pointer;
  transition: background-color 0.2s;
}

.clickable-row:hover {
  background-color: #f5f7fa;
}

.no-data {
  text-align: center;
  padding: 40px 0;
}
</style>
