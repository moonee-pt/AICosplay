import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";

// 加载环境变量
dotenv.config();
const app = express();
const PORT = 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 核心代理接口：使用API Password作为Bearer Token
app.post("/api/llm", async (req, res) => {
  try {
    const { url, data } = req.body;
    const API_PASSWORD = globalThis.process?.env.SPARK_API_PASSWORD;
    
    if (!API_PASSWORD) {
      console.error("错误: SPARK_API_PASSWORD环境变量未设置");
      return res.status(500).json({ error: "服务器未配置API密码" });
    }
    
    if (!url) {
      console.error("错误: 请求中未提供API URL");
      return res.status(400).json({ error: "请求中未提供API URL" });
    }
    
    console.log("代理API请求:", { url });
    
    // 发送请求到讯飞星火AI API
    const response = await axios({
      url: url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_PASSWORD}` // 直接使用API Password
      },
      data: data
    });
    
    // 返回API响应
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error("API调用失败:", error.message);
    console.error("错误详情:", error.response?.data || "无详细信息");
    
    const statusCode = error.response?.status || 500;
    const errorMessage = error.message || "未知错误";
    
    res.status(statusCode).json({
      error: `后端代理请求失败 (状态码: ${statusCode}): ${errorMessage}`,
      details: error.response?.data || {}
    });
  }
});

// 健康检查
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// 启动服务
app.listen(PORT, () => {
  // console.log(`后端代理运行在 http://localhost:${PORT}`);
});