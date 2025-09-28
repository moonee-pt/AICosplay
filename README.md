## 如何运行程序

### 环境准备

1. 确保已安装Node.js 18+和npm
2. 克隆或下载项目代码
3. 在项目根目录安装前端依赖：

```bash
npm install
```

4. 在`backend`文件夹安装后端依赖：

```bash
cd backend
npm install
cd ..
```

### API配置

应用使用讯飞星火API进行语音识别和合成，需要配置相应的API密钥：

1. 前往[讯飞开放平台](https://www.xfyun.cn/)注册账号并获取API密钥
2. 在`backend`文件夹中创建`.env`文件，添加以下内容：

```
SPARK_API_PASSWORD=您的讯飞API密码
```

3. 在`src/services/apiService.js`和`src/services/ttsService.js`中配置您的讯飞API信息

### 启动应用

#### 方法1：分别启动前后端

1. 启动后端代理服务（在`backend`文件夹）：

```bash
cd backend
npm start
```

2. 启动前端开发服务器（在项目根目录）：

```bash
npm run dev
```

#### 方法2：使用批处理文件（Windows系统）

直接运行项目根目录下的`start-all.bat`文件，自动启动前后端服务。

### 访问应用

前端应用启动后，可以通过浏览器访问：http://localhost:5173/

后端代理服务运行在：http://localhost:3000/

### 构建生产版本

在项目根目录运行以下命令构建生产版本：

```bash
npm run build
```

构建后的文件将位于`dist`文件夹中，可以部署到任何静态文件服务器。

