<template>
  <div class="market-dictionary">
    <SideMenu />
    <div class="content">
      <div class="dictionary-container">
        <!-- 左侧分类列表 -->
        <div class="category-list">
          <div class="search-box">
            <el-input
              v-model="searchQuery"
              placeholder="搜索概念..."
              prefix-icon="el-icon-search"
              clearable
              @clear="handleSearchClear">
            </el-input>
          </div>
          
          <el-menu
            :default-active="activeCategory"
            class="category-menu"
            @select="handleCategorySelect">
            <el-menu-item
              v-for="category in categories"
              :key="category.id"
              :index="category.id">
              <i :class="category.icon"></i>
              <span>{{ category.name }}</span>
              <el-badge
                :value="category.count"
                :max="99"
                class="category-badge"
                type="primary">
              </el-badge>
            </el-menu-item>
          </el-menu>
        </div>

        <!-- 右侧内容区 -->
        <div class="term-content">
          <div class="term-list">
            <el-collapse v-model="activeTerms" accordion>
              <el-collapse-item
                v-for="term in filteredTerms"
                :key="term.id"
                :name="term.id">
                <template slot="title">
                  <span class="term-title">{{ term.name }}</span>
                  <el-tag size="small" :type="term.type" class="term-tag">{{ term.category }}</el-tag>
                </template>
                <div class="term-detail">
                  <div class="term-description">{{ term.description }}</div>
                  
                  <div v-if="term.formula" class="term-formula">
                    <h4>计算公式</h4>
                    <div class="formula-content">{{ term.formula }}</div>
                  </div>
                  
                  <div v-if="term.example" class="term-example">
                    <h4>示例</h4>
                    <div class="example-content">{{ term.example }}</div>
                  </div>
                  
                  <div v-if="term.notes" class="term-notes">
                    <h4>注意事项</h4>
                    <ul>
                      <li v-for="(note, index) in term.notes" :key="index">{{ note }}</li>
                    </ul>
                  </div>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SideMenu from '../components/SideMenu.vue'

export default {
  name: 'MarketDictionary',
  components: {
    SideMenu
  },
  data() {
    return {
      searchQuery: '',
      activeCategory: '1',
      activeTerms: [],
      categories: [
        { id: '1', name: '基础概念', icon: 'el-icon-info', count: 5 },
        { id: '2', name: '技术指标', icon: 'el-icon-data-line', count: 3 },
        { id: '3', name: '异动规则', icon: 'el-icon-warning', count: 4 },
        { id: '4', name: '版块分类', icon: 'el-icon-folder', count: 6 },
        { id: '5', name: '交易规则', icon: 'el-icon-document', count: 3 }
      ],
      terms: [
        {
          id: '1',
          category: '异动规则',
          type: 'warning',
          name: '量能异动',
          description: '成交量突然放大，超过一定阈值的股票。通常表示市场对该股票的关注度突然增加。',
          formula: '当日成交量 > 过去N日平均成交量 × 2',
          example: '某股票过去20日平均成交量为100万股，当日成交量超过200万股，即被认为发生量能异动。',
          notes: [
            '成交量的突然放大可能预示着行情的变化',
            '需要结合价格走势一起分析',
            '不同市场环境下的异动阈值可能不同'
          ]
        },
        {
          id: '2',
          category: '版块分类',
          type: 'success',
          name: '概念板块',
          description: '具有相同题材、概念或者特定属性的股票组成的板块。',
          example: '新能源概念、人工智能概念、医疗器械概念等。',
          notes: [
            '概念板块的热点可能会轮动',
            '同一支股票可能属于多个概念板块',
            '新概念的出现往往伴随着政策或行业发展动向'
          ]
        },
        {
          id: '3',
          category: '基础概念',
          type: 'primary',
          name: '涨跌停板',
          description: '股票在一个交易日内的价格涨跌幅度限制。',
          formula: '涨停价 = 前一交易日收盘价 × (1 + 涨停幅度)\n跌停价 = 前一交易日收盘价 × (1 - 跌停幅度)',
          notes: [
            'A股主板涨跌停幅度为±10%',
            '科创板涨跌停幅度为±20%',
            '新股上市前5个交易日不设涨跌停限制'
          ]
        }
      ]
    }
  },
  computed: {
    filteredTerms() {
      return this.terms.filter(term => {
        if (this.searchQuery) {
          return term.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                 term.description.toLowerCase().includes(this.searchQuery.toLowerCase())
        }
        return true
      })
    }
  },
  methods: {
    handleCategorySelect(index) {
      this.activeCategory = index
      // 这里可以根据分类筛选术语
    },
    handleSearchClear() {
      this.searchQuery = ''
    }
  }
}
</script>

<style scoped>
.market-dictionary {
  display: flex;
  height: 100vh;
  background-color: #f5f7fa;
}

.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.dictionary-container {
  display: flex;
  gap: 20px;
  height: 100%;
}

.category-list {
  width: 260px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.search-box {
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.category-menu {
  flex: 1;
  border-right: none;
}

.category-badge {
  margin-left: auto;
  margin-right: 16px;
}

.term-content {
  flex: 1;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  min-width: 0;
}

.term-title {
  font-size: 16px;
  font-weight: 500;
  margin-right: 10px;
}

.term-tag {
  margin-left: 8px;
}

.term-detail {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 4px;
}

.term-description {
  color: #333;
  line-height: 1.6;
  margin-bottom: 16px;
}

.term-formula,
.term-example,
.term-notes {
  margin-top: 16px;
}

h4 {
  color: #666;
  font-size: 14px;
  margin-bottom: 8px;
}

.formula-content,
.example-content {
  background: #fff;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #eee;
  font-family: monospace;
}

.term-notes ul {
  margin: 0;
  padding-left: 20px;
}

.term-notes li {
  color: #666;
  line-height: 1.6;
  margin-bottom: 4px;
}

@media (max-width: 1200px) {
  .dictionary-container {
    flex-direction: column;
  }
  
  .category-list {
    width: 100%;
  }
}
</style>