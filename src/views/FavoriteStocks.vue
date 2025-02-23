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
              <el-form-item label="股票名称">
                <el-input v-model="searchForm.name" placeholder="请输入股票名称"></el-input>
              </el-form-item>
              <el-form-item label="日期">
                <el-date-picker
                  v-model="searchForm.date"
                  type="date"
                  placeholder="选择日期"
                  style="width: 100%">
                </el-date-picker>
              </el-form-item>
              <el-form-item label="涨跌幅">
                <el-select v-model="searchForm.changeRange" placeholder="请选择" style="width: 100%">
                  <el-option label="全部" value=""></el-option>
                  <el-option label="上涨" value="up"></el-option>
                  <el-option label="下跌" value="down"></el-option>
                  <el-option label=">5%" value="gt5"></el-option>
                  <el-option label="<-5%" value="lt-5"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="成交量">
                <el-select v-model="searchForm.volumeRange" placeholder="请选择" style="width: 100%">
                  <el-option label="全部" value=""></el-option>
                  <el-option label="100万以下" value="lt100w"></el-option>
                  <el-option label="100-500万" value="100w-500w"></el-option>
                  <el-option label="500万以上" value="gt500w"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleSearch" style="width: 100%">搜索</el-button>
                <el-button @click="handleReset" style="width: 100%; margin-left: 0; margin-top: 10px">重置</el-button>
              </el-form-item>
            </el-form>
          </div>

          <div class="filter-tags">
            <h3>快速筛选</h3>
            <el-tag
              v-for="tag in filterTags"
              :key="tag.value"
              effect="plain"
              class="filter-tag"
              :type="tag.type"
              @click="handleTagClick(tag)">
              {{ tag.label }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SideMenu from '../components/SideMenu.vue'

export default {
  name: 'FavoriteStocks',
  components: {
    SideMenu
  },
  data() {
    return {
      searchForm: {
        symbol: '',
        name: '',
        date: '',
        changeRange: '',
        volumeRange: '',
        type: ''
      },
      filterTags: [
        { label: '今日上涨', value: 'up_today', type: 'success' },
        { label: '今日下跌', value: 'down_today', type: 'danger' },
        { label: '近期高点', value: 'high', type: 'warning' },
        { label: '近期低点', value: 'low', type: 'info' },
        { label: '量能突破', value: 'volume_break', type: '' },
        { label: '创年内新高', value: 'year_high', type: 'success' }
      ],
      searchQuery: '',
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
    handleSearch() {
      this.loadData()
      this.$message.success('搜索成功')
    },
    handleReset() {
      this.searchForm = {
        symbol: '',
        name: '',
        date: '',
        changeRange: '',
        volumeRange: '',
        type: ''
      }
      this.loadData()
    },
    handleTagClick(tag) {
      this.$message.info(`已选择: ${tag.label}`)
      this.loadData()
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.loadData()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.loadData()
    },
    handleRemove(row) {
      this.$confirm('确认从自选股票中删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    loadData() {
      this.loading = true
      setTimeout(() => {
        this.tableData = [
          {
            symbol: '600000',
            name: '浦发银行',
            type: 'stock',
            price: 28.45,
            change: 2.15,
            volume: '2345.6万',
            createTime: new Date('2024-03-01 09:30:00').getTime()
          },
          {
            symbol: '601318',
            name: '中国平安',
            type: 'stock',
            price: 66.89,
            change: -1.23,
            volume: '3421.2万',
            createTime: new Date('2024-03-02 14:20:00').getTime()
          },
          {
            symbol: 'BK0740',
            name: '证券概念',
            type: 'concept',
            price: 2341.45,
            change: 3.21,
            volume: '892.3亿',
            createTime: new Date('2024-03-03 10:15:00').getTime()
          }
        ]
        this.total = 3
        this.loading = false
      }, 500)
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

.filter-tags {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.filter-tag {
  margin: 5px;
  cursor: pointer;
}

.filter-tag:hover {
  opacity: 0.8;
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
</style>