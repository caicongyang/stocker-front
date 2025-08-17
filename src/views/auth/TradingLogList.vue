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
import SideMenu from '../../components/SideMenu.vue'
import axios from 'axios'

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
    // 获取分页数据
    async fetchData() {
      this.loading = true
      try {
        const { data: res } = await axios.get('/api/trading-log/page', {
          params: {
            pageNum: this.currentPage,
            pageSize: this.pageSize
          }
        })
        if (res.code === 0) {
          this.tableData = res.data.records
          this.total = res.data.total
        } else {
          this.$message.error(res.msg || '获取数据失败')
        }
      } catch (error) {
        console.error('获取数据失败:', error)
        this.$message.error('获取数据失败')
      } finally {
        this.loading = false
      }
    },

    // 获取详情
    async handleDetail(row) {
      this.detailLoading = true
      this.showDetailDialog = true
      try {
        const { data: res } = await axios.get(`/api/trading-log/${row.id}`)
        if (res.code === 0) {
          this.detailData = res.data
        } else {
          this.$message.error(res.msg || '获取详情失败')
        }
      } catch (error) {
        console.error('获取详情失败:', error)
        this.$message.error('获取详情失败')
      } finally {
        this.detailLoading = false
      }
    },

    // 提交表单
    submitForm() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          try {
            // 格式化日期
            const formattedDate = this.formatDateTimeForSubmit(this.form.date);
            
            const { data: res } = await axios.post('/api/trading-log', {
              date: formattedDate,
              title: this.form.title,
              content: this.form.content
            })
            
            if (res.code === 0) {
              this.$message.success('保存成功')
              this.showCreateDialog = false
              this.fetchData()
            } else {
              this.$message.error(res.msg || '保存失败')
            }
          } catch (error) {
            console.error('保存失败:', error)
            this.$message.error('保存失败')
          }
        }
      })
    },

    // 用于显示的日期格式化
    formatDate(date) {
      if (!date) return ''
      const d = new Date(date)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },

    // 用于提交的日期时间格式化
    formatDateTimeForSubmit(date) {
      if (!date) return ''
      const d = new Date(date)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      const hours = String(d.getHours()).padStart(2, '0')
      const minutes = String(d.getMinutes()).padStart(2, '0')
      const seconds = String(d.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
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
        date: new Date(),
        title: '',
        content: ''
      }
      this.showCreateDialog = true
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