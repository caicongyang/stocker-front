<template>
  <div class="stock-flow-analysis">
    <SideMenu />
    <div class="content">
      <h1>个股资金流水分析</h1>
      
      <div class="operation-row">
        <el-input 
          v-model="formData.stockCode" 
          placeholder="请输入股票代码，例如: 600000" 
          style="width: 200px" 
          class="input-item"
          clearable
        ></el-input>
        
        <el-date-picker
          v-model="formData.date"
          type="date"
          placeholder="选择日期"
          format="yyyy-MM-dd"
          value-format="yyyy-MM-dd"
          :picker-options="dateOptions"
          style="width: 160px"
          class="input-item"
        ></el-date-picker>
        <el-button type="success" @click="submitForm" :loading="loading" class="btn-item">查询报告</el-button>
        
        <el-button type="primary" @click="generateReport" :loading="loading" class="btn-item">生成分析报告</el-button>
        
        <el-button type="warning" @click="generateMarketReport" :loading="marketLoading" class="btn-item">生成大盘报告</el-button>
        
        <el-button @click="resetForm" class="btn-item">重置</el-button>
      </div>
      
      <!-- 列表展示 -->
      <div class="reports-table">
        <el-table
          v-loading="loading"
          :data="reportsList"
          style="width: 100%"
          border
          @row-click="handleRowClick">
          <el-table-column
            prop="report_id"
            label="报告ID"
            width="220"
            align="center"
            show-overflow-tooltip>
            <template slot-scope="scope">
              <span class="nowrap-cell">{{ scope.row.report_id }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="code"
            label="股票代码"
            width="100"
            align="center">
          </el-table-column>
          <el-table-column
            prop="title"
            label="报告标题"
            show-overflow-tooltip>
          </el-table-column>
          <el-table-column
            prop="created_at"
            label="生成时间"
            width="120"
            align="center">
            <template slot-scope="scope">
              {{ formatDate(scope.row.created_at) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="tags"
            label="标签"
            width="180">
            <template slot-scope="scope">
              <div class="tag-group">
                <el-tag 
                  v-for="(tag, index) in scope.row.tags.split(',')" 
                  :key="index"
                  size="small"
                  effect="plain">
                  {{ tag }}
                </el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            width="80"
            align="center"
            fixed="right">
            <template slot-scope="scope">
              <el-button 
                type="text" 
                @click.stop="viewReport(scope.row)">
                查看
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="pagination.page"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="pagination.pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="pagination.total">
          </el-pagination>
        </div>

        <div v-if="noData" class="no-data">
          <el-empty description="暂无数据"></el-empty>
        </div>
      </div>
    </div>

    <!-- 报告详情对话框 -->
    <el-dialog
      title="资金流水分析报告详情"
      :visible.sync="dialogVisible"
      width="70%"
      :before-close="handleDialogClose">
      <div v-if="currentReport" class="report-detail">
        <h2>{{ currentReport.title }}</h2>
        <div class="report-meta">
          <span class="meta-item">报告ID: {{ currentReport.report_id }}</span>
          <span class="meta-item">股票代码: {{ currentReport.code }}</span>
          <span class="meta-item">生成时间: {{ formatDate(currentReport.created_at) }}</span>
        </div>
        <div class="report-content markdown-body" v-html="compiledMarkdown"></div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogVisible = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import SideMenu from '../../components/SideMenu.vue'
import axios from 'axios'
import config from '../../config/config'
import { marked } from 'marked'

export default {
  name: 'StockFlowAnalysis',
  components: {
    SideMenu
  },
  data() {
    return {
      formData: {
        stockCode: '',
        date: new Date().toISOString().split('T')[0]
      },
      rules: {
        stockCode: [
          { required: true, message: '请输入股票代码', trigger: 'blur' },
          { pattern: /^\d{6}$/, message: '股票代码必须是6位数字', trigger: 'blur' }
        ],
        date: [
          { required: true, message: '请选择日期', trigger: 'change' }
        ]
      },
      dateOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now()
        }
      },
      loading: false,
      marketLoading: false,
      reportsList: [],
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0
      },
      dialogVisible: false,
      currentReport: null
    }
  },
  computed: {
    noData() {
      return !this.loading && this.reportsList.length === 0
    },
    compiledMarkdown() {
      return this.currentReport ? marked(this.currentReport.content) : ''
    }
  },
  created() {
    this.fetchReportsList()
  },
  methods: {
    // 格式化日期为yyyy-MM-dd
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    
    // 获取报告列表
    fetchReportsList() {
      this.loading = true
      
      axios.get(`${config.aiApiBaseUrl}/stock-reports`, {
        params: {
          page: this.pagination.page,
          page_size: this.pagination.pageSize,
          code: this.formData.stockCode || undefined
        }
      })
      .then(response => {
        if (response.data) {
          this.reportsList = response.data.reports || []
          this.pagination.total = response.data.total || 0
          this.pagination.page = response.data.page || 1
          this.pagination.pageSize = response.data.page_size || 10
          
          if (this.reportsList.length > 0) {
            this.$message.success('获取报告列表成功')
          } else {
            this.$message.warning('没有找到相关报告')
          }
        } else {
          this.$message.error('获取报告列表失败')
          this.reportsList = []
        }
        this.loading = false
      })
      .catch(error => {
        console.error('获取报告列表失败:', error)
        this.$message.error('获取报告列表失败，请检查网络连接')
        this.reportsList = []
        this.loading = false
      })
    },
    
    // 查询报告列表
    submitForm() {
      // 简单验证
      if (this.formData.stockCode && !/^\d{6}$/.test(this.formData.stockCode)) {
        this.$message.error('请输入正确的股票代码')
        return
      }
      
      this.pagination.page = 1 // 重置到第一页
      this.fetchReportsList()
    },
    
    // 重置表单
    resetForm() {
      this.formData.stockCode = ''
      this.formData.date = new Date().toISOString().split('T')[0]
      this.pagination.page = 1
      this.fetchReportsList()
      this.$message.info('已重置表单')
    },
    
    // 处理每页显示数量变化
    handleSizeChange(val) {
      this.pagination.pageSize = val
      this.fetchReportsList()
    },
    
    // 处理页码变化
    handleCurrentChange(val) {
      this.pagination.page = val
      this.fetchReportsList()
    },
    
    // 行点击事件
    handleRowClick(row) {
      this.viewReport(row)
    },
    
    // 查看报告详情
    viewReport(report) {
      this.currentReport = report
      this.dialogVisible = true
    },
    
    // 关闭对话框
    handleDialogClose() {
      this.dialogVisible = false
      this.currentReport = null
    },
    
    // 生成新的分析报告
    generateReport() {
      // 简单验证
      if (!this.formData.stockCode || !/^\d{6}$/.test(this.formData.stockCode)) {
        this.$message.error('请输入正确的股票代码')
        return
      }
      
      if (!this.formData.date) {
        this.$message.error('请选择日期')
        return
      }
      
      this.loading = true
      
      axios.post(
        `${config.aiApiBaseUrl}/generate-stock-flow`, 
        {
          stock_code: this.formData.stockCode,
          date: this.formData.date
        }
      )
      .then(response => {
        if (response.data && response.data.message) {
          this.$message.success(response.data.message)
          // 刷新列表
          this.fetchReportsList()
        } else {
          this.$message.error('生成分析报告失败，请稍后再试')
        }
        this.loading = false
      })
      .catch(error => {
        console.error('生成资金流水分析失败:', error)
        this.$message.error(error.response?.data?.detail || '请求失败，请检查网络连接或联系管理员')
        this.loading = false
      })
    },
    
    // 生成大盘分析报告
    generateMarketReport() {
      this.marketLoading = true
      
      axios.post(
        `${config.aiApiBaseUrl}/generate-market-analysis`, 
        {
          target_date: this.formData.date,
          should_publish_wechat: false
        }
      )
      .then(response => {
        if (response.data && response.data.message) {
          this.$message.success(response.data.message)
          // 刷新列表以显示可能的新报告
          this.fetchReportsList()
        } else {
          this.$message.error('生成大盘分析报告失败，请稍后再试')
        }
        this.marketLoading = false
      })
      .catch(error => {
        console.error('生成大盘分析报告失败:', error)
        this.$message.error(error.response?.data?.detail || '请求失败，请检查网络连接或联系管理员')
        this.marketLoading = false
      })
    }
  }
}
</script>

<style scoped>
.stock-flow-analysis {
  display: flex;
  height: 100vh;
}

.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

h1 {
  margin-bottom: 30px;
  font-size: 24px;
  color: #303133;
}

.operation-row {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.input-item {
  margin-right: 10px;
}

.btn-item {
  margin-right: 10px;
}

.reports-table {
  margin-top: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.up { 
  color: #f56c6c; 
}

.down { 
  color: #67c23a; 
}

.no-data {
  margin-top: 30px;
  text-align: center;
}

.tag-group {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.report-detail {
  padding: 0 20px;
}

.report-meta {
  margin-bottom: 20px;
  color: #606266;
  font-size: 14px;
}

.meta-item {
  margin-right: 15px;
}

.report-content {
  line-height: 1.6;
  font-size: 14px;
}

.markdown-body h3 {
  font-size: 20px;
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  border-bottom: 1px solid #eaecef;
  padding-bottom: 8px;
}

.markdown-body h4 {
  font-size: 16px;
  margin-top: 20px;
  margin-bottom: 12px;
  font-weight: 600;
}

.markdown-body p {
  margin-top: 0;
  margin-bottom: 16px;
}

.markdown-body ul, .markdown-body ol {
  padding-left: 2em;
  margin-bottom: 16px;
}

.markdown-body table {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 16px;
}

.markdown-body table th, .markdown-body table td {
  border: 1px solid #dfe2e5;
  padding: 6px 13px;
}

.markdown-body table th {
  background-color: #f6f8fa;
}

.nowrap-cell {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}
</style> 