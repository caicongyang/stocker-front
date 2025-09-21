<template>
  <div class="concept-list-card">
    <h3>{{ title }}</h3>
    <div class="concept-table">
      <table>
        <thead>
          <tr>
            <th>排名</th>
            <th>概念名称</th>
            <th>突破股数量</th>
            <th>平均成交量增幅</th>
            <th>最大成交量增幅</th>
            <th>平均突破天数</th>
            <th>最大突破天数</th>
            <th>平均收盘价</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(concept, index) in concepts" :key="concept.conceptName" @click="handleClick(concept)" class="clickable-row">
            <td class="rank">{{ index + 1 }}</td>
            <td class="concept-name">{{ concept.conceptName }}</td>
            <td class="stock-count">{{ concept.stockCount }}只</td>
            <td :class="['percentage', getColorClass(concept.avgVolumeRatio)]">
              {{ formatRatio(concept.avgVolumeRatio) }}
            </td>
            <td :class="['percentage', getColorClass(concept.maxVolumeRatio)]">
              {{ formatRatio(concept.maxVolumeRatio) }}
            </td>
            <td class="days">{{ formatDays(concept.avgIntervalDays) }}天</td>
            <td class="days">{{ concept.maxIntervalDays }}天</td>
            <td class="price">¥{{ formatPrice(concept.avgClosePrice) }}</td>
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
  name: 'PlatformBreakthroughConceptStats',
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
    formatRatio(value) {
      const num = Number(value)
      if (isNaN(num)) return '0.00'
      return num.toFixed(2) + '倍'
    },
    formatDays(value) {
      const num = Number(value)
      if (isNaN(num)) return '0.0'
      return num.toFixed(1)
    },
    formatPrice(value) {
      const num = Number(value)
      if (isNaN(num)) return '0.00'
      return num.toFixed(2)
    },
    getColorClass(value) {
      const num = Number(value)
      return {
        'up': num > 1,
        'down': num < 1,
        'neutral': num === 1
      }
    },
    handleClick(concept) {
      this.$router.push({
        name: 'PlatformBreakthroughConceptDetail',
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

.price {
  text-align: right;
  padding-right: 20px !important;
  color: #666;
  width: 100px;
}

.clickable-row {
  cursor: pointer;
  transition: background-color 0.2s;
}

.clickable-row:hover {
  background-color: #f5f7fa;
}

.no-data {
  padding: 40px 0;
  text-align: center;
}
</style>
