import fetch from 'node-fetch';

// 关键：API Password 直接作为 Bearer Token
const API_PASSWORD = 'euzpYzarhgKWvUtcelKv:GRlNMDTUfBSggTozucqs'; // 你的API Password
const API_URL = 'https://spark-api-open.xf-yun.com/v1/chat/completions';

// 对话历史
let historyList = [];

async function sendChatMessage(message) {
    try {
        // 构建消息列表
        const messages = [...historyList, {
            role: 'user',
            content: message
        }];
        
        // 请求体
        const requestBody = {
            model: 'lite', // 明确指定lite模型
            user: '1',    // 用户标识
            messages: messages,
            stream: false
        };
        
        // 最简化的请求头（仅需这两个）
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_PASSWORD}` // 直接使用API Password作为Token
        };
        
        // 发送请求
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody)
        });
        
        console.log('状态码:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API错误:', errorText);
            return null;
        }
        
        const responseData = await response.json();
        
        // 提取回复
        if (responseData.choices && responseData.choices.length > 0) {
            const reply = responseData.choices[0].message.content;
            
            // 更新历史
            historyList.push({ role: 'user', content: message });
            historyList.push({ role: 'assistant', content: reply });
            
            return reply;
        }
        
        return null;
        
    } catch (error) {
        console.error('请求失败:', error);
        return null;
    }
}

// 测试
async function test() {
    const message = "1+1=？";
    console.log(`我: ${message}`);
    
    const reply = await sendChatMessage(message);
    if (reply) {
        console.log(`星火: ${reply}`);
    }
}

test();
