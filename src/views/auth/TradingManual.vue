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
          <h3 class="section-title">添加新词条</h3>
          <div class="input-row">
            <span class="label">词条：</span>
            <el-input
              v-model="newTerm.text"
              placeholder="请输入新词条"
              class="term-input">
            </el-input>
            <span class="label">权重：</span>
            <el-input-number 
              v-model="newTerm.weight" 
              :min="1" 
              :max="100"
              controls-position="right"
              class="weight-input">
            </el-input-number>
            <el-button type="primary" @click="handleAdd">添加</el-button>
          </div>
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
import SideMenu from '../../components/SideMenu.vue'
import * as echarts from 'echarts'
import 'echarts-wordcloud'
import axios from 'axios'  // 确保已经引入 axios

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
      termsList: [],
      loading: false
    }
  },
  methods: {
    // 获取词条列表
    async fetchTerms() {
      this.loading = true
      try {
        const { data: res } = await axios.get('/api/stock/term/list')
        if (res.code === 0) {
          this.termsList = res.data || []
          this.updateChart()
        } else {
          this.$message.error(res.msg || '获取词条列表失败')
        }
      } catch (error) {
        this.$message.error('获取词条列表失败')
        console.error('获取词条列表失败:', error)
      } finally {
        this.loading = false
      }
    },

    // 添加词条
    async handleAdd() {
      if (!this.newTerm.text.trim()) {
        this.$message.warning('请输入词条内容')
        return
      }

      this.loading = true
      try {
        const { data: res } = await axios.post('/api/stock/term', {
          text: this.newTerm.text.trim(),
          weight: this.newTerm.weight
        })
        
        if (res.code === 0) {
          this.$message.success('添加成功')
          await this.fetchTerms()
          this.newTerm = { text: '', weight: 1 }
        } else {
          this.$message.error(res.msg || '添加失败')
        }
      } catch (error) {
        this.$message.error(error.response?.data?.msg || '添加失败')
        console.error('添加词条失败:', error)
      } finally {
        this.loading = false
      }
    },

    // 删除词条
    async handleDeleteTerm(index) {
      const term = this.termsList[index]
      try {
        await this.$confirm('确认删除该词条?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        this.loading = true
        const { data: res } = await axios.delete(`/api/stock/term/${term.id}`)
        
        if (res.code === 0) {
          this.$message.success('删除成功')
          await this.fetchTerms()
        } else {
          this.$message.error(res.msg || '删除失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error(error.response?.data?.msg || '删除失败')
          console.error('删除词条失败:', error)
        }
      } finally {
        this.loading = false
      }
    },

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
    
    getWeightClass(weight) {
      if (weight > 80) return 'weight-high'
      if (weight > 60) return 'weight-medium'
      if (weight > 40) return 'weight-normal'
      return 'weight-low'
    }
  },
  mounted() {
    this.initChart()
    this.fetchTerms()  // 组件挂载时获取数据
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
  background: white;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.section-title {
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #333;
}

.input-row {
  display: flex;
  align-items: center;
}

.label {
  margin-right: 8px;
  color: #606266;
}

.term-input {
  margin-right: 15px;
  flex: 1;
}

.weight-input {
  width: 120px;
  margin-right: 15px;
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

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .trading-manual {
    flex-direction: column;
  }

  .content {
    padding: 68px 12px 12px 12px;
  }

  .manual-container {
    padding: 16px 12px;
  }

  .manual-header {
    padding: 16px;
  }

  .manual-header h2 {
    font-size: 20px;
  }

  .manual-body {
    padding: 16px;
  }
}
</style>