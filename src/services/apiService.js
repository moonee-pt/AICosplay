// 讯飞星火API服务

// 使用后端代理调用API，避免跨域问题
const API_URL = 'http://localhost:3000/api/llm'; // 后端代理地址

// 对话历史管理
const chatHistories = new Map();

// 构建角色提示词
export const buildCharacterPrompt = (characterName, characterBio, userMessage) => {
  return `你是${characterName}，${characterBio}。请以${characterName}的身份回答用户的问题。用户问：${userMessage}`;
};

// 调用LLM API
export const callLLMApi = async (prompt, characterName = 'AI助手') => {
  try {
    // 为每个角色创建独立的历史记录
    const chatKey = characterName || 'default';
    if (!chatHistories.has(chatKey)) {
      chatHistories.set(chatKey, []);
    }
    
    const historyList = chatHistories.get(chatKey);
    
    // 构建消息列表
    const messages = [...historyList, {
      role: 'user',
      content: prompt
    }];
    
    // 请求体 - 确保模型参数正确
    const requestBody = {
      model: 'lite', // 匹配免费版Spark Lite模型
      user: '1',    // 用户标识（可自定义）
      messages: messages,
      stream: false
    };
    
    // 请求头
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // 构建代理请求体 - 与后端代理期望的格式一致
    const proxyRequestBody = {
      url: 'https://spark-api-open.xf-yun.com/v1/chat/completions', // 目标API地址
      data: requestBody // 原始请求体
    };
    
    // 发送请求
    console.log('发送代理API请求:', API_URL);
    console.log('代理请求体:', proxyRequestBody);
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(proxyRequestBody)
    });
    
    console.log('API响应状态码:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API错误:', errorText);
      throw new Error(`API调用失败: ${response.status} - ${errorText}`);
    }
    
    const responseData = await response.json();
    console.log('API响应数据:', responseData);
    
    // 提取回复
    if (responseData.choices && responseData.choices.length > 0) {
      const reply = responseData.choices[0].message.content;
      
      // 更新历史
      historyList.push({ role: 'user', content: prompt });
      historyList.push({ role: 'assistant', content: reply });
      
      // 限制历史记录长度，避免过多请求
      if (historyList.length > 20) {
        historyList.splice(0, 2); // 保留最近的对话
      }
      
      chatHistories.set(chatKey, historyList);
      return reply;
    }
    
    throw new Error('API返回格式不正确，未找到choices字段');
    
  } catch (error) {
    console.error('API请求失败:', error);
    throw error;
  }
};

// 重置对话历史
export const resetChatHistory = (characterName = 'default') => {
  chatHistories.set(characterName, []);
};

// API配置导出（修复错误引用）
export const API_CONFIG = {
  provider: 'xunfei',
  settings: {
    models: {
      doubao: 'lite' // 兼容现有代码的模型名称
    }
  },
  backendProxy: {
    enabled: true, // 已启用后端代理，修正为true
    url: API_URL    // 使用实际代理地址
  },
  keys: {
    doubao: {
      apiKey: '已通过后端代理配置', // 前端不再直接存储密钥
      secretKey: '已通过后端代理配置'
    }
  }
};

export default API_CONFIG;
    