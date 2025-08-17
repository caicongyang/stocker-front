# 🚀 Google登录快速设置指南

## 当前状态 ✅
- Google登录按钮已显示
- 配置系统正常工作
- 只需要真实的Google客户端ID即可完成

## 获取Google客户端ID (5分钟)

### 1. 访问Google Cloud Console
🔗 https://console.cloud.google.com/

### 2. 创建或选择项目
- 点击项目选择器
- 创建新项目或选择现有项目

### 3. 启用API
- 搜索"Google+ API"并启用
- 或者直接启用"Google Identity Services API"

### 4. 创建OAuth客户端ID
- 导航到：API和服务 → 凭据
- 点击"创建凭据" → "OAuth 2.0 客户端ID"
- 应用程序类型：**Web应用程序**

### 5. 配置授权来源
**已获授权的JavaScript来源**：
```
http://localhost:5173
http://127.0.0.1:5173
```

**已获授权的重定向URI**：
```
http://localhost:5173/login
http://127.0.0.1:5173/login
```

### 6. 复制客户端ID
- 创建完成后会显示客户端ID
- 格式类似：`123456789-abc123def456.apps.googleusercontent.com`

## 更新配置

### 方法1：直接修改.env文件
```bash
cd /Users/caicongyang/IdeaProjects/tom/stocker-front
# 编辑.env文件，将test-client-id-123替换为真实ID
nano .env
```

### 方法2：使用命令替换
```bash
cd /Users/caicongyang/IdeaProjects/tom/stocker-front
sed -i '' 's/test-client-id-123/你的真实客户端ID/g' .env
```

## 测试完整流程

1. **更新配置后刷新页面**
2. **点击Google登录按钮**
3. **应该弹出Google授权窗口**
4. **选择Google账号并授权**
5. **成功后自动登录并跳转到dashboard**

## 故障排除

如果遇到问题：
1. 检查客户端ID是否正确复制
2. 确认域名配置正确
3. 检查浏览器控制台错误信息
4. 确认Google项目中API已启用

---
**注意**：目前使用测试ID，所以会显示"The given client ID is not found"错误，这是正常的。
