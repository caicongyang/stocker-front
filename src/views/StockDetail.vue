<template>
  <div class="stock-detail">
    <SideMenu />
    <div class="content">
      <div class="content-header">
        <div class="header-left">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="pickerOptions">
          </el-date-picker>
        </div>
        <div class="header-right">
          <el-input
            placeholder="请输入搜索内容"
            v-model="searchQuery"
            class="search-input"
            prefix-icon="el-icon-search">
          </el-input>
        </div>
      </div>
      
      <el-table
        :data="tableData"
        style="width: 100%"
        :loading="loading">
        <el-table-column
          prop="date"
          label="日期"
          width="180">
        </el-table-column>
        <el-table-column
          prop="open"
          label="开盘价"
          width="120">
        </el-table-column>
        <el-table-column
          prop="high"
          label="最高价"
          width="120">
        </el-table-column>
        <el-table-column
          prop="low"
          label="最低价"
          width="120">
        </el-table-column>
        <el-table-column
          prop="close"
          label="收盘价"
          width="120">
        </el-table-column>
        <el-table-column
          prop="volume"
          label="成交量">
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
  </div>
</template>

<script>
import SideMenu from '../components/SideMenu.vue'

export default {
  name: 'StockDetail',
  components: {
    SideMenu
  },
  data() {
    return {
      dateRange: '',
      searchQuery: '',
      loading: false,
      currentPage: 1,
      pageSize: 20,
      total: 0,
      tableData: [],
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setMonth(start.getMonth() - 1)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setMonth(start.getMonth() - 3)
            picker.$emit('pick', [start, end])
          }
        }]
      }
    }
  },
  methods: {
    handleSizeChange(val) {
      this.pageSize = val
      this.loadData()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.loadData()
    },
    loadData() {
      this.loading = true
      setTimeout(() => {
        this.tableData = Array(this.pageSize).fill().map((_, index) => ({
          date: `2024-03-${String(index + 1).padStart(2, '0')}`,
          open: (Math.random() * 100).toFixed(2),
          high: (Math.random() * 100).toFixed(2),
          low: (Math.random() * 100).toFixed(2),
          close: (Math.random() * 100).toFixed(2),
          volume: Math.floor(Math.random() * 1000000)
        }))
        this.total = 100
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
.stock-detail {
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

.search-input {
  width: 300px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>