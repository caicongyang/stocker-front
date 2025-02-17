<template>
  <div class="stock-list-card">
    <h3>{{ title }}</h3>
    <div class="stock-table">
      <table>
        <thead>
          <tr>
            <th>排名</th>
            <th>名称</th>
            <th>价格</th>
            <th>涨跌幅</th>
            <th v-if="showVolume">成交量</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(stock, index) in stocks" :key="stock.symbol">
            <td>{{ index + 1 }}</td>
            <td>
              <div class="stock-name">
                <span>{{ stock.name }}</span>
                <span class="stock-symbol">{{ stock.symbol }}</span>
              </div>
            </td>
            <td>¥{{ stock.price }}</td>
            <td :class="{ 'up': stock.change > 0, 'down': stock.change < 0 }">
              {{ stock.change > 0 ? '+' : ''}}{{ stock.change }}%
            </td>
            <td v-if="showVolume">{{ stock.volume }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StockList',
  props: {
    title: {
      type: String,
      required: true
    },
    stocks: {
      type: Array,
      required: true
    },
    showVolume: {
      type: Boolean,
      default: true
    }
  }
}
</script>

<style scoped>
.stock-list-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stock-table {
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

.stock-name {
  display: flex;
  flex-direction: column;
}

.stock-symbol {
  font-size: 12px;
  color: #999;
}

.up { color: #f56c6c; }
.down { color: #67c23a; }
</style>