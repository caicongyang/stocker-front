<template>
  <div class="prompt-management">
    <SideMenu />
    <div class="content">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span class="card-title">
          <i class="el-icon-document-copy"></i>
          提示词管理
        </span>
        <el-button 
          style="float: right; padding: 3px 0" 
          type="primary" 
          size="small"
          @click="showCreateDialog = true"
        >
          <i class="el-icon-plus"></i>
          新增提示词
        </el-button>
      </div>

      <!-- 统计信息卡片 -->
      <div class="stats-section">
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon">
                <i class="el-icon-document-copy"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ pagination.total }}</div>
                <div class="stat-label">总提示词</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon">
                <i class="el-icon-folder-opened"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ categories.length }}</div>
                <div class="stat-label">分类数量</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon">
                <i class="el-icon-time"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ recentlyUpdated }}</div>
                <div class="stat-label">最近更新</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon">
                <i class="el-icon-star-on"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ favoriteCount }}</div>
                <div class="stat-label">常用提示词</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 搜索和筛选 -->
      <div class="filter-section">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-input
              v-model="searchForm.keyword"
              placeholder="搜索提示词名称、描述或内容"
              prefix-icon="el-icon-search"
              clearable
              @input="debounceSearch"
            />
          </el-col>
          <el-col :span="6">
            <el-select
              v-model="searchForm.category"
              placeholder="选择分类"
              clearable
              @change="handleSearch"
            >
              <el-option
                v-for="category in categories"
                :key="category"
                :label="category"
                :value="category"
              />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select
              v-model="searchForm.sortBy"
              placeholder="排序方式"
              @change="handleSearch"
            >
              <el-option label="最新创建" value="created_desc" />
              <el-option label="最新更新" value="updated_desc" />
              <el-option label="名称排序" value="name_asc" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" @click="handleSearch">
              <i class="el-icon-search"></i>
              搜索
            </el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 提示词列表 -->
      <el-table
        v-loading="loading"
        :data="promptList"
        style="width: 100%"
        @row-click="handleRowClick"
      >
        <el-table-column prop="name" label="名称" width="200">
          <template slot-scope="scope">
            <el-button type="text" @click="handleRowClick(scope.row)">
              {{ scope.row.name }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column prop="category" label="分类" width="120">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.category" size="mini" type="info">
              {{ scope.row.category }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="tags" label="标签" width="150">
          <template slot-scope="scope">
            <el-tag
              v-for="tag in parseTagsString(scope.row.tags)"
              :key="tag"
              size="mini"
              style="margin-right: 5px;"
            >
              {{ tag }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updated_at" label="更新时间" width="160">
          <template slot-scope="scope">
            {{ formatDate(scope.row.updated_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template slot-scope="scope">
            <el-button size="mini" @click.stop="editPrompt(scope.row)">
              编辑
            </el-button>
            <el-button
              size="mini"
              type="danger"
              @click.stop="deletePrompt(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-section">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pagination.page"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pagination.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
        />
      </div>
    </el-card>

    <!-- 创建/编辑提示词对话框 -->
    <el-dialog
      :title="dialogType === 'create' ? '新增提示词' : '编辑提示词'"
      :visible.sync="showCreateDialog"
      width="80%"
      :close-on-click-modal="false"
    >
      <el-form :model="promptForm" :rules="formRules" ref="promptForm" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="名称" prop="name">
              <el-input v-model="promptForm.name" placeholder="请输入提示词名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分类" prop="category">
              <el-input v-model="promptForm.category" placeholder="请输入分类" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="promptForm.description"
            type="textarea"
            :rows="2"
            placeholder="请输入提示词描述"
          />
        </el-form-item>
        <el-form-item label="标签" prop="tags">
          <el-input v-model="promptForm.tags" placeholder="请输入标签，用逗号分隔" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <div class="content-editor">
            <el-tabs v-model="activeTab">
              <el-tab-pane label="编辑" name="edit">
                <el-input
                  v-model="promptForm.content"
                  type="textarea"
                  :rows="15"
                  placeholder="请输入提示词内容，支持Markdown格式"
                />
              </el-tab-pane>
              <el-tab-pane label="预览" name="preview">
                <div class="markdown-preview" v-html="previewContent"></div>
              </el-tab-pane>
            </el-tabs>
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="submitPrompt" :loading="submitting">
          {{ dialogType === 'create' ? '创建' : '更新' }}
        </el-button>
      </div>
    </el-dialog>

    <!-- 查看提示词详情对话框 -->
    <el-dialog
      title="提示词详情"
      :visible.sync="showDetailDialog"
      width="80%"
      :close-on-click-modal="false"
    >
      <div v-if="currentPrompt">
        <div class="prompt-header">
          <h3>{{ currentPrompt.name }}</h3>
          <div class="prompt-meta">
            <el-tag v-if="currentPrompt.category" type="info">{{ currentPrompt.category }}</el-tag>
            <span class="meta-info">
              创建时间: {{ formatDate(currentPrompt.created_at) }}
            </span>
            <span class="meta-info">
              更新时间: {{ formatDate(currentPrompt.updated_at) }}
            </span>
          </div>
          <p v-if="currentPrompt.description" class="prompt-description">
            {{ currentPrompt.description }}
          </p>
          <div v-if="currentPrompt.tags" class="prompt-tags">
            <el-tag
              v-for="tag in parseTagsString(currentPrompt.tags)"
              :key="tag"
              size="small"
              style="margin-right: 8px;"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>
        <el-divider />
        <div class="prompt-content">
          <h4>内容:</h4>
          <div class="markdown-content" v-html="renderMarkdown(currentPrompt.content)"></div>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showDetailDialog = false">关闭</el-button>
        <el-button type="primary" @click="editPrompt(currentPrompt)">
          编辑
        </el-button>
      </div>
    </el-dialog>
    </div>
  </div>
</template>

<script>
import { marked } from 'marked'
import axios from 'axios'
import config from '@/config/config'
import SideMenu from '../../components/SideMenu.vue'

export default {
  name: 'PromptManagement',
  components: {
    SideMenu
  },
  data() {
    return {
      loading: false,
      submitting: false,
      showCreateDialog: false,
      showDetailDialog: false,
      dialogType: 'create', // 'create' 或 'edit'
      activeTab: 'edit',
      
      // 搜索表单
      searchForm: {
        keyword: '',
        category: '',
        sortBy: 'updated_desc'
      },
      
      // 统计数据
      recentlyUpdated: 0,
      favoriteCount: 0,
      searchTimeout: null,
      
      // 分页信息
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0
      },
      
      // 数据列表
      promptList: [],
      categories: [],
      currentPrompt: null,
      
      // 表单数据
      promptForm: {
        name: '',
        content: '',
        description: '',
        category: '',
        tags: ''
      },
      
      // 表单验证规则
      formRules: {
        name: [
          { required: true, message: '请输入提示词名称', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '请输入提示词内容', trigger: 'blur' }
        ]
      }
    }
  },
  
  computed: {
    previewContent() {
      return this.renderMarkdown(this.promptForm.content)
    }
  },
  
  mounted() {
    this.loadPromptList()
    this.loadCategories()
  },
  
  methods: {
    // 加载提示词列表
    async loadPromptList() {
      this.loading = true
      try {
        const params = {
          page: this.pagination.page,
          page_size: this.pagination.pageSize
        }
        
        if (this.searchForm.keyword) {
          params.keyword = this.searchForm.keyword
        }
        
        if (this.searchForm.category) {
          params.category = this.searchForm.category
        }
        
        const response = await axios.get(`${config.aiApiBaseUrl}/api/prompts/`, { params })
        
        if (response.data.status === 'success') {
          const data = response.data.data
          this.promptList = data.data
          this.pagination.total = data.total
          this.pagination.page = data.page
          this.pagination.pageSize = data.page_size
          
          // 计算统计数据
          this.calculateStats()
        } else {
          this.$message.error(response.data.message)
        }
      } catch (error) {
        this.$message.error('加载提示词列表失败: ' + error.message)
      } finally {
        this.loading = false
      }
    },
    
    // 加载分类列表
    async loadCategories() {
      try {
        const response = await axios.get(`${config.aiApiBaseUrl}/api/prompts/categories/list`)
        if (response.data.status === 'success') {
          this.categories = response.data.data
        }
      } catch (error) {
        console.error('加载分类失败:', error)
      }
    },
    
    // 防抖搜索
    debounceSearch() {
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        this.handleSearch()
      }, 500)
    },
    
    // 搜索处理
    handleSearch() {
      this.pagination.page = 1
      this.loadPromptList()
    },
    
    // 计算统计数据
    calculateStats() {
      // 计算最近7天更新的提示词数量
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      
      this.recentlyUpdated = this.promptList.filter(prompt => {
        const updatedAt = new Date(prompt.updated_at)
        return updatedAt >= sevenDaysAgo
      }).length
      
      // 这里可以根据实际需求计算常用提示词数量
      // 暂时使用总数的30%作为示例
      this.favoriteCount = Math.ceil(this.pagination.total * 0.3)
    },
    
    // 分页处理
    handleSizeChange(val) {
      this.pagination.pageSize = val
      this.pagination.page = 1
      this.loadPromptList()
    },
    
    handleCurrentChange(val) {
      this.pagination.page = val
      this.loadPromptList()
    },
    
    // 行点击处理
    handleRowClick(row) {
      this.viewPromptDetail(row.id)
    },
    
    // 查看提示词详情
    async viewPromptDetail(promptId) {
      try {
        const response = await axios.get(`${config.aiApiBaseUrl}/api/prompts/${promptId}`)
        if (response.data.status === 'success') {
          this.currentPrompt = response.data.data
          this.showDetailDialog = true
        } else {
          this.$message.error(response.data.message)
        }
      } catch (error) {
        this.$message.error('获取提示词详情失败: ' + error.message)
      }
    },
    
    // 编辑提示词
    editPrompt(row) {
      this.dialogType = 'edit'
      this.promptForm = {
        id: row.id,
        name: row.name,
        content: row.content || '',
        description: row.description || '',
        category: row.category || '',
        tags: row.tags || ''
      }
      this.showDetailDialog = false
      this.showCreateDialog = true
      this.activeTab = 'edit'
    },
    
    // 删除提示词
    deletePrompt(row) {
      this.$confirm('确定要删除这个提示词吗？', '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const response = await axios.delete(`${config.aiApiBaseUrl}/api/prompts/${row.id}`)
          if (response.data.status === 'success') {
            this.$message.success('删除成功')
            this.loadPromptList()
          } else {
            this.$message.error(response.data.message)
          }
        } catch (error) {
          this.$message.error('删除失败: ' + error.message)
        }
      }).catch(() => {
        // 用户取消删除
      })
    },
    
    // 提交表单
    submitPrompt() {
      this.$refs.promptForm.validate(async (valid) => {
        if (valid) {
          this.submitting = true
          try {
            let response
            const formData = {
              name: this.promptForm.name,
              content: this.promptForm.content,
              description: this.promptForm.description,
              category: this.promptForm.category,
              tags: this.promptForm.tags
            }
            
            if (this.dialogType === 'create') {
              response = await axios.post(`${config.aiApiBaseUrl}/api/prompts/`, formData)
            } else {
              response = await axios.put(`${config.aiApiBaseUrl}/api/prompts/${this.promptForm.id}`, formData)
            }
            
            if (response.data.status === 'success') {
              this.$message.success(this.dialogType === 'create' ? '创建成功' : '更新成功')
              this.showCreateDialog = false
              this.resetForm()
              this.loadPromptList()
              this.loadCategories() // 重新加载分类
            } else {
              this.$message.error(response.data.message)
            }
          } catch (error) {
            this.$message.error((this.dialogType === 'create' ? '创建' : '更新') + '失败: ' + error.message)
          } finally {
            this.submitting = false
          }
        }
      })
    },
    
    // 重置表单
    resetForm() {
      this.promptForm = {
        name: '',
        content: '',
        description: '',
        category: '',
        tags: ''
      }
      this.$refs.promptForm && this.$refs.promptForm.resetFields()
    },
    
    // 渲染Markdown
    renderMarkdown(content) {
      if (!content) return ''
      return marked(content)
    },
    
    // 解析标签字符串
    parseTagsString(tagsStr) {
      if (!tagsStr) return []
      return tagsStr.split(',').map(tag => tag.trim()).filter(tag => tag)
    },
    
    // 格式化日期
    formatDate(dateStr) {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  },
  
  watch: {
    showCreateDialog(val) {
      if (!val) {
        this.resetForm()
        this.dialogType = 'create'
        this.activeTab = 'edit'
      }
    }
  }
}
</script>

<style scoped>
.prompt-management {
  display: flex;
  height: 100vh;
  background-color: #f5f7fa;
}

.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.card-title {
  font-size: 18px;
  font-weight: bold;
}

.stats-section {
  margin-bottom: 20px;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 20px;
  color: white;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.stat-card:nth-child(2n) {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  box-shadow: 0 4px 12px rgba(240, 147, 251, 0.3);
}

.stat-card:nth-child(2n):hover {
  box-shadow: 0 8px 20px rgba(240, 147, 251, 0.4);
}

.stat-card:nth-child(3n) {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3);
}

.stat-card:nth-child(3n):hover {
  box-shadow: 0 8px 20px rgba(79, 172, 254, 0.4);
}

.stat-card:nth-child(4n) {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  box-shadow: 0 4px 12px rgba(67, 233, 123, 0.3);
}

.stat-card:nth-child(4n):hover {
  box-shadow: 0 8px 20px rgba(67, 233, 123, 0.4);
}

.stat-icon {
  font-size: 2.5rem;
  margin-right: 15px;
  opacity: 0.8;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

.filter-section {
  margin-bottom: 20px;
}

.pagination-section {
  margin-top: 20px;
  text-align: center;
}

.content-editor {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.markdown-preview {
  min-height: 300px;
  padding: 15px;
  background-color: #fafafa;
  border-radius: 4px;
}

.markdown-content {
  padding: 15px;
  background-color: #fafafa;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.prompt-header {
  margin-bottom: 20px;
}

.prompt-header h3 {
  margin: 0 0 10px 0;
  color: #303133;
}

.prompt-meta {
  margin-bottom: 10px;
}

.meta-info {
  margin-left: 15px;
  color: #909399;
  font-size: 12px;
}

.prompt-description {
  color: #606266;
  margin: 10px 0;
}

.prompt-tags {
  margin-top: 10px;
}

.prompt-content h4 {
  margin: 0 0 10px 0;
  color: #303133;
}

/* Markdown样式 */
.markdown-preview h1,
.markdown-content h1 {
  font-size: 24px;
  font-weight: bold;
  margin: 20px 0 10px 0;
  color: #303133;
}

.markdown-preview h2,
.markdown-content h2 {
  font-size: 20px;
  font-weight: bold;
  margin: 18px 0 8px 0;
  color: #303133;
}

.markdown-preview h3,
.markdown-content h3 {
  font-size: 16px;
  font-weight: bold;
  margin: 16px 0 6px 0;
  color: #303133;
}

.markdown-preview p,
.markdown-content p {
  margin: 8px 0;
  line-height: 1.6;
  color: #606266;
}

.markdown-preview ul,
.markdown-content ul,
.markdown-preview ol,
.markdown-content ol {
  margin: 8px 0;
  padding-left: 20px;
}

.markdown-preview li,
.markdown-content li {
  margin: 4px 0;
  color: #606266;
}

.markdown-preview code,
.markdown-content code {
  background-color: #f5f5f5;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: monospace;
  color: #e6a23c;
}

.markdown-preview pre,
.markdown-content pre {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 10px 0;
}

.markdown-preview blockquote,
.markdown-content blockquote {
  border-left: 4px solid #409eff;
  margin: 10px 0;
  padding: 5px 0 5px 10px;
  background-color: #f4f4f5;
}
</style>
