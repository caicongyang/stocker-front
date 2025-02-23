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
            <th>概念股数量</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(concept, index) in concepts" :key="concept.conceptName">
            <td>{{ index + 1 }}</td>
            <td>{{ concept.conceptName }}</td>
            <td :class="getColorClass(concept.avgIncrease)">
              {{ formatPercentage(concept.avgIncrease) }}
            </td>
            <td :class="getColorClass(concept.maxIncrease)">
              {{ formatPercentage(concept.maxIncrease) }}
            </td>
            <td>{{ concept.stockCount }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ConceptVolumeList',
  props: {
    title: {
      type: String,
      required: true
    },
    concepts: {
      type: Array,
      required: true
    }
  },
  methods: {
    formatPercentage(value) {
      return value > 0 ? `+${value.toFixed(2)}%` : `${value.toFixed(2)}%`
    },
    getColorClass(value) {
      return {
        'up': value > 0,
        'down': value < 0
      }
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
</style> 