# Stocker Front

股票数据分析展示系统前端项目。

## 功能特性

- 成交量异动概念 TOP20
- 涨停概念异动 TOP20
- ETF涨幅排名 TOP20
- 同花顺热股 TOP20
- 异动ETF TOP20

## 开发环境

### 环境要求

- Node.js 16+
- npm 8+

### 本地开发

1. 安装依赖

    npm install

2. 启动开发服务器

    npm run dev

3. 构建生产版本

    npm run build

## Docker 部署

### 构建镜像

    docker build -t stocker-front .
    docker tag stocker-front:latest caicongyang/stocker-front:latest
    docker push caicongyang/stocker-front:latest

### 运行容器

基本运行：

    docker run -d -p 80:80 stocker-front

指定后端 API 地址：

    docker run -d -p 80:80 -e VITE_API_URL=http://your-api-server:8888 stocker-front

### 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|---------|
| VITE_API_URL | 后端 API 地址 | http://localhost:8888 |

## 项目结构

    src/
    ├── components/         # 组件目录
    │   ├── ConceptVolumeList.vue    # 成交量概念列表组件
    │   ├── LimitUpConceptList.vue   # 涨停概念列表组件
    │   ├── ETFRankingList.vue       # ETF排名列表组件
    │   └── StockList.vue            # 股票列表组件
    ├── views/             # 页面视图
    │   └── Dashboard.vue  # 主面板页面
    ├── config/            # 配置文件
    │   └── config.js      # 环境配置
    └── App.vue            # 根组件

## 开发指南

### 添加新的数据展示

1. 在 src/components 创建新的组件
2. 在 Dashboard.vue 中引入并使用组件
3. 在 config.js 中添加新的 API 配置（如需要）

### 修改 API 地址

开发环境：
- 修改 src/config/config.js 中的 development.apiBaseUrl

生产环境：
- 通过环境变量 VITE_API_URL 指定

## 注意事项

1. 开发环境使用 Vite 的代理功能处理跨域
2. 生产环境需要正确配置后端 CORS 或使用反向代理
3. Docker 部署时建议使用环境变量指定后端地址

## License

MIT License
