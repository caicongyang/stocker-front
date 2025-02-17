<template>
  <div class="trading-manual">
    <SideMenu />
    <div class="content">
      <div class="manual-container">
        <div class="manual-content">
          <h2>交易前必看清单</h2>
          
          <div class="section">
            <h3>交易前三问</h3>
            <div class="question-list">
              <el-alert
                title="这是热点板块吗？"
                type="warning"
                description="确认该股票是否属于当前市场热点板块，避免追涨已经过热的板块。"
                :closable="false"
                show-icon>
              </el-alert>
              <el-alert
                title="目前是启动阶段吗？"
                type="warning"
                description="分析当前走势是否处于启动初期，避免追高。"
                :closable="false"
                show-icon>
              </el-alert>
              <el-alert
                title="资金量是否匹配？"
                type="warning"
                description="观察成交量是否放大，确认资金推动力度。"
                :closable="false"
                show-icon>
              </el-alert>
            </div>
          </div>

          <div class="section">
            <h3>操作纪律</h3>
            <div class="discipline-list">
              <el-card shadow="hover">
                <div slot="header">
                  <span>止损原则</span>
                </div>
                <p>单笔交易亏损不超过总资金的 <strong class="highlight">2%</strong></p>
              </el-card>
              
              <el-card shadow="hover">
                <div slot="header">
                  <span>仓位控制</span>
                </div>
                <p>单个标的持仓不超过总资金的 <strong class="highlight">10%</strong></p>
              </el-card>
              
              <el-card shadow="hover">
                <div slot="header">
                  <span>交易时机</span>
                </div>
                <p>避免在开盘前 <strong class="highlight">30分钟</strong> 内和收盘前 <strong class="highlight">30分钟</strong> 内交易</p>
              </el-card>
            </div>
          </div>

          <div class="section">
            <h3>风险提示</h3>
            <div class="risk-alerts">
              <el-alert
                title="大盘走势优先"
                type="error"
                description="个股再好，也要以大盘为准。大盘走弱时保持谨慎。"
                :closable="false"
                show-icon>
              </el-alert>
              <el-alert
                title="不恋战"
                type="error"
                description="出现明显卖出信号时，果断止损。不要期待反弹。"
                :closable="false"
                show-icon>
              </el-alert>
              <el-alert
                title="控制回撤"
                type="error"
                description="账户总体回撤不超过20%，超过后强制休息一周。"
                :closable="false"
                show-icon>
              </el-alert>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SideMenu from '../components/SideMenu.vue'

export default {
  name: 'TradingManual',
  components: {
    SideMenu
  }
}
</script>

<style scoped>
.trading-manual {
  display: flex;
  height: 100vh;
  background-color: #f5f7fa;
}

.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.manual-container {
  height: 100%;
}

.manual-content {
  background: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

h2 {
  color: #303133;
  margin-bottom: 30px;
  text-align: center;
}

.section {
  margin-bottom: 40px;
}

h3 {
  color: #606266;
  margin-bottom: 20px;
  font-size: 18px;
}

.question-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.discipline-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.highlight {
  color: #f56c6c;
  font-size: 1.2em;
}

.risk-alerts {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.el-card {
  margin-bottom: 0;
}

.el-card__header {
  padding: 15px 20px;
}

.el-card__body {
  padding: 20px;
}

@media (max-width: 768px) {
  .discipline-list {
    grid-template-columns: 1fr;
  }
  
  .manual-content {
    padding: 20px;
  }
}
</style>