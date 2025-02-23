<template>
  <div class="trading-log">
    <SideMenu />
    <div class="content">
      <div class="content-header">
        <h2>复盘日志</h2>
        <el-button type="primary" @click="handleCreate">新建复盘</el-button>
      </div>
      
      <el-table
        :data="tableData"
        style="width: 100%"
        @row-click="handleDetail"
        :loading="loading">
        <el-table-column
          prop="date"
          label="日期"
          width="180">
          <template #default="scope">
            {{ formatDate(scope.row.date) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="title"
          label="复盘标题">
        </el-table-column>
      </el-table>
      
      <div class="pagination">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </div>

      <!-- 新建/编辑弹窗 -->
      <el-dialog
        :title="dialogTitle"
        :visible.sync="showCreateDialog"
        width="60%"
        :close-on-click-modal="false">
        <el-form :model="form" :rules="rules" ref="form" label-width="80px">
          <el-form-item label="日期" prop="date">
            <el-date-picker
              v-model="form.date"
              type="date"
              placeholder="选择日期"
              style="width: 100%">
            </el-date-picker>
          </el-form-item>
          
          <el-form-item label="标题" prop="title">
            <el-input v-model="form.title" placeholder="请输入复盘标题"></el-input>
          </el-form-item>
          
          <el-form-item label="内容" prop="content">
            <el-input
              type="textarea"
              v-model="form.content"
              :rows="15"
              placeholder="请输入复盘内容">
            </el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="showCreateDialog = false">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </div>
      </el-dialog>

      <!-- 详情弹窗 -->
      <el-dialog
        title="复盘详情"
        :visible.sync="showDetailDialog"
        width="60%">
        <div class="detail-content" v-loading="detailLoading">
          <h2>{{ detailData.title }}</h2>
          <div class="meta-info">
            <span>日期：{{ formatDate(detailData.date) }}</span>
          </div>
          <div class="content-text">
            {{ detailData.content }}
          </div>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import SideMenu from '../components/SideMenu.vue'

export default {
  name: 'TradingLogList',
  components: {
    SideMenu
  },
  data() {
    return {
      loading: false,
      tableData: [],
      currentPage: 1,
      pageSize: 10,
      total: 0,
      
      // 新建/编辑表单相关
      showCreateDialog: false,
      dialogTitle: '新建复盘日志',
      form: {
        date: '',
        title: '',
        content: ''
      },
      rules: {
        date: [
          { required: true, message: '请选择日期', trigger: 'change' }
        ],
        title: [
          { required: true, message: '请输入标题', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '请输入内容', trigger: 'blur' }
        ]
      },

      // 详情相关
      showDetailDialog: false,
      detailLoading: false,
      detailData: {
        title: '',
        date: '',
        content: ''
      }
    }
  },
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleDateString()
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.fetchData()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.fetchData()
    },
    handleCreate() {
      this.dialogTitle = '新建复盘日志'
      this.form = {
        date: '',
        title: '',
        content: ''
      }
      this.showCreateDialog = true
    },
    handleDetail(row) {
      this.detailLoading = true
      this.showDetailDialog = true
      // 模拟API调用
      setTimeout(() => {
        this.detailData = {
          title: row.title,
          date: row.date,
          content: '今日市场整体表现平稳，主要指数小幅上涨。\n\n热点板块：\n1. 新能源车持续活跃\n2. 芯片概念出现分化\n3. 医药板块企稳回升\n\n市场研判：\n短期市场仍在震荡筑底阶段，建议关注业绩超预期板块...'
        }
        this.detailLoading = false
      }, 500)
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          // 模拟API调用
          setTimeout(() => {
            this.$message.success('保存成功')
            this.showCreateDialog = false
            this.fetchData()
          }, 500)
        }
      })
    },
    fetchData() {
      this.loading = true
      // 模拟API调用
      setTimeout(() => {
        this.tableData = [
          {
            id: 1,
            date: '2024-03-20',
            title: '3月20日市场分析复盘'
          },
          {
            id: 2,
            date: '2024-03-19',
            title: '市场情绪分析与热点追踪'
          }
        ]
        this.total = 2
        this.loading = false
      }, 500)
    }
  },
  created() {
    this.fetchData()
  }
}
</script>

<style scoped>
.trading-log {
  display: flex;
  height: 100vh;
  background-color: #f5f7fa;
}

.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.meta-info {
  color: #666;
  margin: 10px 0 20px 0;
}

.content-text {
  line-height: 1.8;
  white-space: pre-wrap;
}

/* 弹窗内容样式 */
.detail-content {
  padding: 0 20px;
}

.detail-content h2 {
  margin-top: 0;
}
</style> 