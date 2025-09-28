# AI角色对话应用架构设计文档

## 1. 整体架构设计

本项目采用前后端分离的架构模式，主要由以下部分组成：

- **前端应用**：基于React的SPA（单页应用），负责用户界面渲染和用户交互
- **后端代理服务**：基于Express的Node.js服务，用于解决前端跨域问题和API请求转发
- **第三方API集成**：讯飞星火API（语音识别和文本转语音）

![整体架构图](示意图)

## 2. 前端架构

前端采用现代React技术栈，使用功能模块化和组件化的设计理念，遵循以下分层结构：

### 2.1 目录结构

```
/src
  /components   # 可复用UI组件
  /pages        # 页面级组件
  /services     # API服务和业务逻辑
  /utils        # 工具函数和本地存储
  /assets       # 静态资源（CSS、图片等）
  /config       # 配置文件
```

### 2.2 核心技术

- **React 19**：用于构建用户界面的JavaScript库
- **React Router 7**：处理前端路由和页面导航
- **LocalStorage**：本地存储用户数据和聊天记录
- **WebSocket**：实时语音识别和合成功能
- **Vite**：现代前端构建工具

### 2.3 组件层次结构

```
App.jsx (根组件)
  ├── Navbar.jsx (导航栏)
  ├── Pages
  │   ├── Home.jsx (首页)
  │   ├── Chat.jsx (聊天页面)
  │   ├── CustomAIsPage.jsx (自定义AI页面)
  │   ├── Profile.jsx (个人资料页面)
  │   └── ...
  └── Components
      ├── ChatHeader.jsx (聊天头部)
      ├── ChatInput.jsx (聊天输入框)
      ├── ChatMessages.jsx (消息列表)
      ├── CharacterCard.jsx (角色卡片)
      └── ...
```

## 3. 后端架构

后端采用轻量级设计，主要作为前端和第三方API之间的代理，解决浏览器跨域问题。

### 3.1 目录结构

```
/backend
  server.js    # 后端服务入口文件
  package.json # 后端依赖配置
```

### 3.2 核心技术

- **Express**：轻量级Web应用框架
- **Axios**：HTTP客户端，用于调用第三方API
- **CORS**：跨域资源共享中间件
- **Dotenv**：环境变量管理

## 4. 核心模块规格

### 4.1 聊天模块

**功能描述**：实现与AI角色的对话功能，包括消息发送、接收和展示。

**主要组件**：
- **Chat.jsx**：聊天页面主组件，管理聊天状态和逻辑
- **ChatInput.jsx**：消息输入组件，支持文本和语音输入
- **ChatMessages.jsx**：消息列表组件，显示对话历史
- **ChatHeader.jsx**：聊天头部组件，显示角色信息和操作按钮
- **ChatSidebar.jsx**：聊天侧边栏，显示最近聊天和收藏的角色

**关键功能**：
- 消息发送与接收
- 消息历史记录管理
- 收藏角色功能
- 实时打字效果

### 4.2 自定义AI模块

**功能描述**：允许用户创建和管理自己的AI角色。

**主要组件**：
- **CustomAIsPage.jsx**：自定义AI管理页面
- **CustomAICreator.jsx**：自定义AI创建和编辑组件

**关键功能**：
- 创建新的自定义AI
- 编辑和删除现有AI
- 设置AI的名称、背景、技能、头像和声音
- 保存到本地存储

### 4.3 语音处理模块

**功能描述**：提供语音输入和语音合成功能。

**主要服务**：
- **apiService.js**：语音识别API服务（基于讯飞实时转写API）
- **ttsService.js**：文本转语音服务（基于讯飞TTS API）
- **audioProcessor.js**：音频处理工具函数

**关键功能**：
- 语音录制和音频数据处理
- 实时语音转文本
- 文本转语音合成
- 音频缓存和播放控制

### 4.4 数据存储模块

**功能描述**：负责用户数据、聊天记录和自定义AI的本地存储管理。

**主要服务**：
- **storage.js**：提供统一的存储API接口

**关键功能**：
- 用户信息管理
- 收藏角色管理
- 聊天历史管理
- 自定义AI管理
- 聊天消息管理
- 数据持久化（LocalStorage + SessionStorage）

### 4.5 后端代理模块

**功能描述**：提供API代理服务，解决前端跨域问题和API请求转发。

**主要服务**：
- **server.js**：后端代理服务入口和主要逻辑

**关键功能**：
- LLM API请求代理
- API密钥安全管理
- 请求日志记录
- 错误处理和响应

## 5. 数据流设计

### 5.1 数据流向

1. **用户界面操作** → **组件状态更新** → **API调用** → **数据存储** → **界面更新**

2. **AI响应** → **数据接收** → **消息处理** → **数据存储** → **界面更新**

### 5.2 状态管理

项目采用React内置的状态管理机制（useState, useEffect, useRef等）进行组件级状态管理，对于全局数据则通过LocalStorage进行持久化存储。

**主要状态**：
- 聊天消息列表
- 当前选中的角色
- 用户信息
- 自定义AI列表
- 收藏的角色列表
- 语音识别和合成状态

## 6. API设计

### 6.1 前端API服务接口

#### 6.1.1 聊天API

- **callLLMApi(prompt, characterName)**：调用LLM API获取AI回复
  - 参数：prompt（提示词）、characterName（角色名称）
  - 返回：Promise<string>（AI回复文本）

- **buildCharacterPrompt(characterName, characterBio, userMessage, skills)**：构建角色提示词
  - 参数：角色名称、角色背景、用户消息、技能列表
  - 返回：string（构建好的提示词）

#### 6.1.2 语音API

- **textToSpeech(text, voice)**：将文本转换为语音
  - 参数：text（文本内容）、voice（声音类型）
  - 返回：Promise<AudioBuffer>（音频缓冲区）

- **previewVoice(voice)**：试听指定声音
  - 参数：voice（声音类型）
  - 返回：Promise<Object>（音频控制对象）

#### 6.1.3 存储API

- **getUserInfo()**：获取用户信息
- **saveUserInfo(userInfo)**：保存用户信息
- **getFavorites()**：获取收藏的角色列表
- **toggleFavoriteCharacter(characterId)**：切换角色收藏状态
- **getChatMessages(characterId)**：获取指定角色的聊天消息
- **saveChatMessages(characterId, messages)**：保存聊天消息
- **getCustomAIs()**：获取自定义AI列表
- **addCustomAI(customAI)**：添加自定义AI
- **updateCustomAI(customAI)**：更新自定义AI
- **deleteCustomAI(aiId)**：删除自定义AI

### 6.2 后端API接口

#### 6.2.1 LLM API代理

- **POST /api/llm**：代理LLM API请求
  - 请求体：{ url, data }
  - 返回：LLM API的原始响应

#### 6.2.2 健康检查

- **GET /api/health**：检查服务健康状态
  - 返回：{ status: "ok", timestamp: "当前时间" }

## 7. 安全性考虑

1. **API密钥保护**：使用环境变量存储API密钥，不在前端代码中直接暴露
2. **数据本地存储**：敏感数据使用浏览器本地存储，不经过网络传输
3. **后端代理**：所有API请求通过后端代理转发，避免在前端暴露API密钥
4. **错误处理**：对API调用错误进行适当处理，避免泄露敏感信息

## 8. 性能优化

1. **音频缓存**：语音合成结果进行缓存，避免重复请求
2. **组件优化**：使用React.memo等技术优化组件渲染性能
3. **延迟加载**：对大型组件和资源进行按需加载
4. **数据分批处理**：对大量数据进行分批处理，避免阻塞UI

## 9. 可扩展性设计

1. **模块化架构**：采用模块化设计，便于添加新功能和维护
2. **接口抽象**：对API和服务进行抽象，便于替换和升级
3. **可配置化**：关键参数和设置支持配置化，便于调整

## 10. 总结

AI角色对话应用采用现代化的前后端分离架构，基于React和Express构建，集成了讯飞API的语音识别和合成功能，提供了多角色对话和自定义AI创建等核心功能。系统设计注重模块化、可扩展性和用户体验，同时考虑了安全性和性能优化。