<template>
  <div class="favorite-stocks">
    <SideMenu />
    <div class="content">
      <div class="content-wrapper">
        <div class="main-content">
          <el-table
            :data="tableData"
            style="width: 100%"
            :loading="loading">
            <el-table-column
              prop="symbol"
              label="股票代码"
              width="120">
            </el-table-column>
            <el-table-column
              prop="name"
              label="股票名称"
              width="120">
            </el-table-column>
            <el-table-column
              prop="type"
              label="类型"
              width="100">
              <template #default="scope">
                {{ scope.row.type === 'stock' ? '个股' : '概念' }}
              </template>
            </el-table-column>
            <el-table-column
              prop="price"
              label="当前价格"
              width="120">
            </el-table-column>
            <el-table-column
              prop="change"
              label="涨跌幅"
              width="120">
              <template #default="scope">
                <span :class="{ 'up': scope.row.change > 0, 'down': scope.row.change < 0 }">
                  {{ scope.row.change > 0 ? '+' : ''}}{{ scope.row.change }}%
                </span>
              </template>
            </el-table-column>
            <el-table-column
              prop="volume"
              label="成交量">
            </el-table-column>
            <el-table-column
              prop="createTime"
              label="加入时间"
              width="180">
              <template #default="scope">
                {{ formatDateTime(scope.row.createTime) }}
              </template>
            </el-table-column>
            <el-table-column
              label="操作"
              width="100">
              <template #default="scope">
                <el-button
                  size="mini"
                  type="danger"
                  @click="handleRemove(scope.row)">删除</el-button>
              </template>
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
        </div>

        <div class="search-panel">
          <div class="search-section">
            <h3>搜索条件</h3>
            <el-form :model="searchForm" label-width="80px" size="small">
              <el-form-item label="股票代码">
                <el-input v-model="searchForm.symbol" placeholder="请输入股票代码"></el-input>
              </el-form-item>
              <el-form-item label="日期">
                <el-date-picker
                  v-model="searchForm.date"
                  type="date"
                  placeholder="选择日期"
                  style="width: 100%">
                </el-date-picker>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleSearch" style="width: 100%">搜索</el-button>
                <el-button @click="handleReset" style="width: 100%; margin-left: 0; margin-top: 10px">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SideMenu from '../../components/SideMenu.vue'
import request from '@/utils/request'

export default {
  name: 'FavoriteStocks',
  components: {
    SideMenu
  },
  data() {
    return {
      searchForm: {
        symbol: '',
        date: ''
      },
      loading: false,
      currentPage: 1,
      pageSize: 20,
      total: 0,
      tableData: []
    }
  },
  methods: {
    formatDateTime(timestamp) {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    },

    // 搜索
    async handleSearch() {
      this.currentPage = 1
      await this.loadData()
    },

    // 重置
    async handleReset() {
      this.searchForm = {
        symbol: '',
        date: ''
      }
      this.currentPage = 1
      await this.loadData()
    },

    // 分页大小改变
    async handleSizeChange(val) {
      this.pageSize = val
      await this.loadData()
    },

    // 页码改变
    async handleCurrentChange(val) {
      this.currentPage = val
      await this.loadData()
    },

    // 删除自选股
    async handleRemove(row) {
      try {
        await this.$confirm('确认从自选股票中删除?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        const { data: res } = await request.delete(`/favorite-stock/${row.id}`)
        if (res.code === 0) {
          this.$message.success('删除成功!')
          await this.loadData()
        } else {
          this.$message.error(res.msg || '删除失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除失败:', error)
          this.$message.error('删除失败')
        }
      }
    },

    // 加载数据
    async loadData() {
      this.loading = true
      try {
        // 格式化日期
        let formattedDate = null
        if (this.searchForm.date) {
          const d = new Date(this.searchForm.date)
          formattedDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        }

        const { data: res } = await request.get('/favorite-stock/page', {
          params: {
            symbol: this.searchForm.symbol || undefined,
            date: formattedDate,
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

    // 添加自选股
    async addToFavorite(stock) {
      try {
        const { data: res } = await axios.post('/api/favorite-stock', {
          symbol: stock.symbol,
          name: stock.name,
          type: stock.type || 'stock',
          price: stock.price,
          change: stock.change,
          volume: stock.volume
        })
        
        if (res.code === 0) {
          this.$message.success('添加自选成功')
          await this.loadData()
        } else {
          this.$message.error(res.msg || '添加失败')
        }
      } catch (error) {
        console.error('添加失败:', error)
        this.$message.error('添加失败')
      }
    }
  },
  created() {
    this.loadData()
  }
}
</script>

<style scoped>
.favorite-stocks {
  display: flex;
  height: 100vh;
  background-color: #f5f7fa;
}

.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.content-wrapper {
  display: flex;
  gap: 20px;
  height: 100%;
}

.main-content {
  flex: 1;
  min-width: 0;
}

.search-panel {
  width: 300px;
  flex-shrink: 0;
}

.search-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 16px;
}

.pagination {
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

@media (max-width: 1200px) {
  .content-wrapper {
    flex-direction: column;
  }
  
  .search-panel {
    width: 100%;
    order: -1;
  }
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .favorite-stocks {
    flex-direction: column;
  }

  .content {
    padding: 68px 12px 12px 12px;
  }

  .stocks-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>