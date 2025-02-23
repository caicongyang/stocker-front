<template>
  <div class="market-heat-card">
    <h3>大盘热度</h3>
    <div class="heat-value" :class="heatClass">
      {{ heatValue }}
    </div>
    <div class="heat-description">
      {{ heatDescription }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'MarketHeat',
  data() {
    return {
      heatValue: 78,
      heatDescription: '市场热度适中'
    }
  },
  computed: {
    heatClass() {
      if (this.heatValue >= 80) return 'very-hot'
      if (this.heatValue >= 60) return 'hot'
      if (this.heatValue >= 40) return 'normal'
      return 'cold'
    }
  }
}
</script>

<style scoped>
.market-heat-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.heat-value {
  font-size: 48px;
  font-weight: bold;
  margin: 20px 0;
}

.very-hot { color: #ff4d4f; }
.hot { color: #ff7a45; }
.normal { color: #ffa940; }
.cold { color: #13c2c2; }

.heat-description {
  color: #666;
  font-size: 16px;
}
</style>