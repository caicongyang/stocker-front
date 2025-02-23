<template>
  <div class="trading-manual">
    <SideMenu />
    <div class="content">
      <div class="manual-container">
        <!-- 词云展示区域 -->
        <div class="wordcloud-section">
          <el-card>
            <div slot="header" class="wordcloud-header">
              <span>交易词云</span>
            </div>
            <div ref="wordcloud" class="wordcloud"></div>
          </el-card>
        </div>

        <!-- 添加新词条 -->
        <div class="add-term-section">
          <el-card class="add-term-card">
            <div slot="header" class="add-term-header">
              <span>添加新词条</span>
            </div>
            <el-form :inline="true" size="small" @submit.native.prevent>
              <el-form-item label="词条">
                <el-input v-model="newTerm.text" placeholder="请输入词条"></el-input>
              </el-form-item>
              <el-form-item label="权重">
                <el-input-number 
                  v-model="newTerm.weight" 
                  :min="1" 
                  :max="100"
                  controls-position="right"
                  style="width: 120px">
                </el-input-number>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleAddTerm">添加</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </div>

        <!-- 词条列表 -->
        <div class="terms-list-section">
          <el-card>
            <div slot="header" class="terms-list-header">
              <span>词条列表</span>
              <span class="term-count">共 {{ termsList.length }} 个词条</span>
            </div>
            <el-table 
              :data="termsList" 
              style="width: 100%"
              :max-height="400"
              v-loading="loading">
              <el-table-column prop="text" label="词条" min-width="180"></el-table-column>
              <el-table-column prop="weight" label="权重" width="120" align="center">
                <template slot-scope="scope">
                  <span :class="getWeightClass(scope.row.weight)">{{ scope.row.weight }}</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120" align="center">
                <template slot-scope="scope">
                  <el-button
                    size="mini"
                    type="danger"
                    @click="handleDeleteTerm(scope.$index)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SideMenu from '../components/SideMenu.vue'
import * as echarts from 'echarts'
import 'echarts-wordcloud'

export default {
  name: 'TradingManual',
  components: {
    SideMenu
  },
  data() {
    return {
      chart: null,
      newTerm: {
        text: '',
        weight: 1
      },
      termsList: [
        { text: '止损', weight: 100 },
        { text: '仓位控制', weight: 90 },
        { text: '趋势', weight: 85 },
        { text: '波段', weight: 80 },
        { text: '突破', weight: 75 },
        { text: '支撑', weight: 70 },
        { text: '压力', weight: 65 },
        { text: '回调', weight: 60 },
        { text: '成交量', weight: 55 },
        { text: '均线', weight: 50 },
        { text: '反弹', weight: 45 },
        { text: '调整', weight: 40 },
        { text: '筹码', weight: 35 },
        { text: '主力', weight: 30 }
      ],
      loading: false
    }
  },
  methods: {
    initChart() {
      if (this.chart) {
        this.chart.dispose()
      }
      
      this.chart = echarts.init(this.$refs.wordcloud)
      this.updateChart()
      
      // 监听容器大小变化
      window.addEventListener('resize', this.handleResize)
    },
    
    updateChart() {
      const option = {
        series: [{
          type: 'wordCloud',
          shape: 'circle',
          left: 'center',
          top: 'center',
          width: '90%',
          height: '90%',
          right: null,
          bottom: null,
          sizeRange: [12, 60],
          rotationRange: [0, 0], // 修改为[0, 0]使所有文字水平
          rotationStep: 0, // 修改为0取消旋转
          gridSize: 8,
          drawOutOfBound: false,
          textStyle: {
            fontFamily: 'sans-serif',
            fontWeight: 'bold'
          },
          emphasis: {
            focus: 'self',
            textStyle: {
              shadowBlur: 10,
              shadowColor: '#333'
            }
          },
          layoutAnimation: true, // 添加布局动画
          data: this.termsList.map(term => ({
            name: term.text,
            value: term.weight,
            textStyle: {
              color: this.getWordColor(term.weight)
            }
          }))
        }]
      }
      
      this.chart.setOption(option)
    },
    
    handleResize() {
      if (this.chart) {
        this.chart.resize()
      }
    },
    
    getWordColor(weight) {
      if (weight > 80) return '#f56c6c'
      if (weight > 60) return '#e6a23c'
      if (weight > 40) return '#409eff'
      return '#67c23a'
    },
    
    handleAddTerm() {
      if (!this.newTerm.text.trim()) {
        this.$message.warning('请输入词条内容')
        return
      }
      
      if (this.termsList.some(term => term.text === this.newTerm.text.trim())) {
        this.$message.warning('该词条已存在')
        return
      }
      
      this.loading = true
      
      this.termsList.push({
        text: this.newTerm.text.trim(),
        weight: this.newTerm.weight
      })
      
      this.$nextTick(() => {
        this.updateChart()
        this.loading = false
      })
      
      this.$message.success('添加成功')
      
      this.newTerm = {
        text: '',
        weight: 1
      }
    },
    
    handleDeleteTerm(index) {
      this.$confirm('确认删除该词条?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        this.termsList.splice(index, 1)
        this.$nextTick(() => {
          this.updateChart()
          this.loading = false
        })
        this.$message.success('删除成功')
      }).catch(() => {})
    },

    getWeightClass(weight) {
      if (weight > 80) return 'weight-high'
      if (weight > 60) return 'weight-medium'
      if (weight > 40) return 'weight-normal'
      return 'weight-low'
    }
  },
  mounted() {
    this.initChart()
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose()
      this.chart = null
    }
    window.removeEventListener('resize', this.handleResize)
  },
  watch: {
    termsList: {
      deep: true,
      handler() {
        this.$nextTick(() => {
          this.updateChart()
        })
      }
    }
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
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.wordcloud-section {
  width: 100%;
}

.wordcloud {
  height: 400px;
  width: 100%;
}

.wordcloud-header {
  font-weight: bold;
}

.add-term-section {
  display: flex;
  justify-content: center;
}

.add-term-card {
  width: 100%;
  max-width: 800px;
}

.add-term-header {
  display: flex;
  align-items: center;
}

.terms-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.term-count {
  font-size: 14px;
  color: #909399;
}

.terms-list-section {
  margin-bottom: 20px;
}

/* 权重颜色样式 */
.weight-high {
  color: #f56c6c !important;
  font-weight: bold;
}

.weight-medium {
  color: #e6a23c !important;
  font-weight: bold;
}

.weight-normal {
  color: #409eff !important;
}

.weight-low {
  color: #67c23a !important;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .add-term-card {
    width: 100%;
  }
  
  .el-form--inline .el-form-item {
    margin-right: 10px;
  }
}

/* Element UI 表单样式优化 */
:deep(.el-form--inline .el-form-item) {
  margin-right: 10px;
  margin-bottom: 0;
}

:deep(.el-form--inline .el-form-item__content) {
  display: flex;
  align-items: center;
}
</style>