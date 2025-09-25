# 后端代理服务启动指南

此服务用于解决前端应用调用豆包API时遇到的CORS问题。

## 快速启动步骤

1. 确保已安装Node.js 16+和npm

2. 在当前目录安装依赖：
```bash
npm install
```

3. 启动服务：
```bash
npm start
```

   开发环境下，您也可以使用nodemon实现热重载：
```bash
npm run dev
```

4. 服务启动后，可以通过以下URL访问：
```bash
curl http://localhost:3000/api/health
```
   - 健康检查: http://localhost:3000/api/health
   - 代理端点: http://localhost:3000/api/llm

## 重要说明

1. 请确保前端配置文件 `src/config/apiConfig.js` 中的 `backendProxy.url` 设置为 `http://localhost:3000/api/llm`

2. 此服务默认监听3000端口，如果需要修改，请同时更新前端配置

3. 在生产环境中，建议为后端服务添加更多安全措施，如请求验证、日志记录等

## 常见问题排查

- **服务无法启动**: 检查3000端口是否被占用，或尝试修改server.js中的PORT变量
- **请求失败**: 确认前端配置中的后端代理URL是否正确
- **权限问题**: 确保您的API密钥和密钥正确配置在前端apiConfig.js文件中

## 注意事项

此代理服务仅作为开发和演示使用。在生产环境中，建议添加更完善的安全机制和错误处理。