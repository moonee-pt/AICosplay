// 注意：此代码需在浏览器环境中运行（如HTML页面的<script>标签内）
// 依赖 CryptoJS（处理签名），需提前引入

// 系统配置（替换为你的讯飞账号信息）
const config = {
  hostUrl: "wss://rtasr.xfyun.cn/v1/ws",
  appid: "72bda1bd",
  apiKey: "6dd7d775e6cc838328d785f0a57b439e",
  sampleRate: 16000, // 采样率，需与麦克风一致
  frameSize: 1280 // 每帧音频大小
};

// 全局变量
let ws = null;
let mediaRecorder = null;
let audioContext = null;
let isRecording = false;

// 开始录音并连接WebSocket
async function startRecording() {
  // 1. 获取麦克风音频流
  const stream = await navigator.mediaDevices.getUserMedia({ 
    audio: { 
      sampleRate: config.sampleRate,
      channelCount: 1, // 单声道
      echoCancellation: true // 降噪
    } 
  });

  // 2. 创建音频处理上下文（用于实时获取音频数据）
  audioContext = new AudioContext({ sampleRate: config.sampleRate });
  const source = audioContext.createMediaStreamSource(stream);
  const processor = audioContext.createScriptProcessor(config.frameSize, 1, 1);

  // 3. 连接语音转写服务
  const ts = parseInt(new Date().getTime() / 1000);
  const wssUrl = `${config.hostUrl}?appid=${config.appid}&ts=${ts}&signa=${getSigna(ts)}`;
  ws = new WebSocket(wssUrl);

  // 4. WebSocket连接成功后，开始发送音频帧
  ws.onopen = () => {
    console.log("WebSocket连接成功，开始录音...");
    isRecording = true;
    
    // 实时获取麦克风音频数据并发送
    source.connect(processor);
    processor.connect(audioContext.destination);
    processor.onaudioprocess = (e) => {
      if (isRecording && ws.readyState === WebSocket.OPEN) {
        // 获取音频原始数据（Float32Array）
        const inputData = e.inputBuffer.getChannelData(0);
        // 转换为16位PCM格式（讯飞要求的格式）
        const pcmData = convertFloat32ToInt16(inputData);
        ws.send(pcmData); // 发送音频帧
      }
    };
  };

  // 5. 处理转写结果
  ws.onmessage = (event) => {
    const res = JSON.parse(event.data);
    switch (res.action) {
      case 'result':
        const data = JSON.parse(res.data);
        // 提取转写文本（简化处理，实际需按讯飞格式解析）
        let text = '';
        data.cn?.st?.rt?.forEach(rt => {
          rt.ws?.forEach(ws => {
            ws.cw?.forEach(cw => {
              text += cw.w;
            });
          });
        });
        if (text) {
          console.log("实时转写结果：", text);
          // 这里可以将文本发送给LLM处理
        }
        break;
      case 'error':
        console.error("转写错误：", res.code, res.desc);
        break;
    }
  };

  ws.onerror = (err) => console.error("WebSocket错误：", err);
  ws.onclose = () => console.log("WebSocket连接关闭");
}

// 停止录音
function stopRecording() {
  isRecording = false;
  if (ws) {
    ws.send(JSON.stringify({ end: true })); // 发送结束标志
    setTimeout(() => ws.close(), 1000);
  }
  if (audioContext) {
    audioContext.close();
  }
  console.log("录音已停止");
}

// 辅助函数：Float32Array转16位PCM
function convertFloat32ToInt16(buffer) {
  const l = buffer.length;
  const buf = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    buf[i] = Math.min(1, Math.max(-1, buffer[i])) < 0 ? 
      buffer[i] * 0x8000 : buffer[i] * 0x7FFF;
  }
  return buf.buffer;
}

// 鉴权签名（与原代码相同）
function getSigna(ts) {
  const md5 = CryptoJS.MD5(config.appid + ts).toString();
  const sha1 = CryptoJS.HmacSHA1(md5, config.apiKey);
  const base64 = CryptoJS.enc.Base64.stringify(sha1);
  return encodeURIComponent(base64);
}

// 页面按钮绑定（示例）
// 开始录音按钮：<button onclick="startRecording()">开始说话</button>
// 停止录音按钮：<button onclick="stopRecording()">停止说话</button>
