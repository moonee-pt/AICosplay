# React + Vite

# AI角色对话应用

一个基于React和豆包API构建的AI角色对话应用，可以与不同角色进行智能对话。

## 功能特性

- 🎭 多角色选择（哈利波特、夏洛克·福尔摩斯、爱因斯坦、居里夫人）
- 💬 实时AI对话，使用豆包API生成智能回复
- 🎨 现代化界面设计，响应式布局
- 🚀 快速开发和热重载支持

## 快速开始

### 环境准备

1. 确保已安装Node.js 18+和npm
2. 克隆仓库
3. 安装依赖：

```bash
npm install
```

### 设置豆包API

要使用AI对话功能，您需要设置豆包API密钥：

1. 前往[百度智能云](https://console.cloud.baidu.com/)注册账号并获取豆包API密钥
2. 在`src/config/apiConfig.js`文件中配置您的API密钥：

```javascript
// 修改以下配置
keys: {
    doubao: {
        apiKey: '您的API密钥',
        secretKey: '您的密钥'
    }
}
```

### 设置后端代理服务

由于直接在浏览器中调用豆包API会遇到CORS问题，您需要设置一个后端代理服务：

#### 简易Node.js后端代理示例

1. 在项目根目录创建一个`backend`文件夹
2. 在`backend`文件夹中创建`server.js`文件：

```javascript
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// 代理LLM API请求
app.post('/api/llm', async (req, res) => {
  try {
    const { url, method, headers, data } = req.body;
    
    const response = await axios({
      url,
      method,
      headers,
      data,
      responseType: 'stream'
    });
    
    // 转发响应
    res.writeHead(200, response.headers);
    response.data.pipe(res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`后端代理服务运行在 http://localhost:${PORT}`);
});
```

3. 在`backend`文件夹中创建`package.json`文件：

```json
{
  "name": "ai-chat-backend",
  "version": "1.0.0",
  "description": "AI聊天应用的后端代理服务",
  "main": "server.js",
  "dependencies": {
    "express": "^4.18.2",
    "axios": "^1.6.2",
    "cors": "^2.8.5"
  }
}
```

4. 安装后端依赖并启动服务：

```bash
cd backend
npm install
npm start
```

### 启动前端应用

在项目根目录运行：

```bash
npm run dev
```

应用将在 http://localhost:5173/ 启动

## 项目结构

```
/src
  /components   # React组件
  /pages        # 页面组件
  /services     # API服务
  /config       # 配置文件
  /assets       # 静态资源
```

## 主要组件

- **Chat.jsx**: 聊天页面主组件，集成豆包API调用
- **ChatMessages.jsx**: 消息显示组件
- **ChatInput.jsx**: 消息输入组件
- **ChatHeader.jsx**: 聊天头部组件
- **ChatSidebar.jsx**: 聊天侧边栏组件

## API服务

- **apiService.js**: 包含LLM API调用逻辑和豆包API集成
- **apiConfig.js**: 包含API配置信息

## 注意事项

1. **安全性**：在生产环境中，不要在前端直接存储API密钥。建议通过后端服务转发所有API请求。
2. **后端代理**：当前配置要求启用后端代理服务，否则会遇到CORS问题。
3. **性能**：大型应用应考虑添加消息分页和性能优化。

## License

MIT
