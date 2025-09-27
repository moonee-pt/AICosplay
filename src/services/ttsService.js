// 系统配置
const config = {
  hostUrl: "wss://tts-api.xfyun.cn/v2/tts",
  host: "tts-api.xfyun.cn",
  appid: "72bda1bd",
  apiSecret: "ZmIxN2JlYjdlOWZlMDVhOWU3MGMxY2Vk",
  apiKey: "a8ad09199802c3dba845f04c7b9f9c68",
  uri: "/v2/tts"
};

// 缓存解码后的 AudioBuffer
const audioCache = new Map();
// 跟踪当前正在播放的音频
let currentAudioControl = null;
// 音频上下文实例
let audioContext = null;
// 存储等待处理的语音合成任务
let pendingSpeechTask = null;

/**
 * 绑定到用户交互事件的初始化函数
 * 确保所有音频操作在用户交互事件循环中完成
 */
function bindAudioInitToUserInteraction() {
  // 如果已初始化则无需处理
  if (audioContext && audioContext.state === 'running') return;

  // 创建临时点击监听器
  const handleUserInteraction = async () => {
    try {
      // 初始化或恢复AudioContext
      if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        window.__ttsAudioContext = audioContext;
      } else if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      console.log('AudioContext已在用户交互中激活:', audioContext.state);

      // 如果有等待的语音任务，立即执行
      if (pendingSpeechTask) {
        const { text, resolve, reject } = pendingSpeechTask;
        pendingSpeechTask = null;
        try {
          const audioBuffer = await textToSpeechInternal(text);
          resolve(audioBuffer);
        } catch (error) {
          reject(error);
        }
      }
    } catch (error) {
      console.error('用户交互中初始化音频失败:', error);
    } finally {
      // 移除监听器，避免重复绑定
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    }
  };

  // 绑定到点击和触摸事件（覆盖各种交互方式）
  document.addEventListener('click', handleUserInteraction, { once: true });
  document.addEventListener('touchstart', handleUserInteraction, { once: true });
}

// 页面加载时就绑定交互监听
bindAudioInitToUserInteraction();

/**
 * 根据声音类型获取对应的vcn参数
 */
function getVoiceVcn(voiceType) {
  const voiceMap = {
    'male1': 'aisjiuxu', // 讯飞男声1
    'female1': 'x4_yezi', // 讯飞女声1
    'female2': 'x4_xiaoyan', // 讯飞女声2
  };
  return voiceMap[voiceType] || 'aisjinger'; // 默认中性声
}

/**
 * 内部语音合成实现
 * @param {string} text 要转换的文本
 * @param {string} voice 声音类型
 */
async function textToSpeechInternal(text, voice = 'neutral') {
  const cacheKey = `${text}_${voice}`;
  if (audioCache.has(cacheKey)) {
    return audioCache.get(cacheKey);
  }

  const date = new Date().toUTCString();
  const authStr = await getAuthStr(date);
  const wssUrl = config.hostUrl + "?authorization=" + authStr + "&date=" + date + "&host=" + config.host;
  
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wssUrl);
    const audioDataChunks = [];
    
    ws.onopen = () => {
      console.log('TTS WebSocket连接已建立');
      
      const frame = {
        "common": { "app_id": config.appid },
        "business": {
          "aue": "lame",
          "auf": "audio/L16;rate=16000",
          "vcn": getVoiceVcn(voice),
          "tte": "UTF8"
        },
        "data": {
          "text": btoa(unescape(encodeURIComponent(text))),
          "status": 2
        }
      };
      
      ws.send(JSON.stringify(frame));
    };
    
    ws.onmessage = (event) => {
      const data = event.data;
      const res = JSON.parse(data);
      
      if (res.code !== 0) {
        console.error('TTS错误:', res.code, res.message);
        ws.close();
        reject(new Error(`${res.code}: ${res.message}`));
        return;
      }
      
      const audio = res.data.audio;
      if (audio) {
        const binaryString = atob(audio);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        audioDataChunks.push(bytes);
      }
      
      if (res.code === 0 && res.data.status === 2) {
        ws.close();
        
        const totalLength = audioDataChunks.reduce((acc, chunk) => acc + chunk.length, 0);
        const mergedArray = new Uint8Array(totalLength);
        
        let offset = 0;
        for (const chunk of audioDataChunks) {
          mergedArray.set(chunk, offset);
          offset += chunk.length;
        }
        
        // 确保在同一个AudioContext中解码
        audioContext.decodeAudioData(mergedArray.buffer)
          .then(audioBuffer => {
            audioCache.set(text, audioBuffer);
            resolve(audioBuffer);
          })
          .catch(error => {
            console.error('音频解码失败:', error);
            reject(new Error('音频解码失败: ' + error.message));
          });
      }
    };
    
    ws.onclose = () => {
      console.log('TTS WebSocket连接已关闭');
      if (audioDataChunks.length === 0 && !ws._rejected) {
        reject(new Error('TTS连接意外关闭，未收到音频数据'));
      }
    };
    
    ws.onerror = (error) => {
      console.error('TTS WebSocket连接错误:', error);
      ws._rejected = true;
      reject(error);
    };
  });
}

/**
 * 对外暴露的文本转语音接口
 * @param {string} text 要转换的文本
 * @param {string} voice 声音类型
 * @returns {Promise<AudioBuffer>} 解码后的音频缓冲区
 */
export const textToSpeech = async (text, voice = 'neutral') => {
  // 检查AudioContext状态
  if (!audioContext || audioContext.state !== 'running') {
    // 如果AudioContext未就绪，将任务放入等待队列
    return new Promise((resolve, reject) => {
      pendingSpeechTask = { text, voice, resolve, reject };
      // 触发交互提示（如果需要）
      bindAudioInitToUserInteraction();
    });
  }

  // 如果AudioContext已就绪，直接执行
  return textToSpeechInternal(text, voice);
};

/**
 * 试听声音
 * @param {string} voice 声音类型
 * @param {string} previewText 试听文本
 * @returns {Promise<Object>} 音频控制对象
 */
export const previewVoice = async (voice) => {
  const previewText = "你好，这是声音试听示例，欢迎使用自定义AI。";
  try {
    const audioBuffer = await textToSpeech(previewText, voice);
    return playAudio(audioBuffer);
  } catch (error) {
    console.error('试听声音失败:', error);
    throw error;
  }
};

// 鉴权签名（保持不变）
async function getAuthStr(date) {
  try {
    const signatureOrigin = `host: ${config.host}\ndate: ${date}\nGET ${config.uri} HTTP/1.1`;
    
    const encoder = new TextEncoder();
    const keyData = encoder.encode(config.apiSecret);
    const messageData = encoder.encode(signatureOrigin);
    
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, messageData);
    const signature = arrayBufferToBase64(signatureBuffer);
    
    const authorizationOrigin = `api_key="${config.apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
    const authStrData = encoder.encode(authorizationOrigin);
    const authStr = arrayBufferToBase64(authStrData);
    
    return authStr;
  } catch (error) {
    console.error('生成鉴权字符串失败:', error);
    throw error;
  }
}

// ArrayBuffer转Base64（保持不变）
function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * 播放音频数据
 * @param {AudioBuffer} audioBuffer 解码后的音频缓冲区
 * @param {Function} onEnded 音频播放结束回调函数
 * @returns {Promise<Object>} 包含audioContext和source的对象
 */
export const playAudio = async (audioBuffer, onEnded) => {
  try {
    if (currentAudioControl) {
      stopAudio(currentAudioControl);
    }
    
    // 确保AudioContext处于运行状态
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    
    const handleEnded = () => {
      currentAudioControl = null;
      if (typeof onEnded === 'function') {
        onEnded();
      }
    };
    source.onended = handleEnded;
    
    // 关键：确保在用户交互事件循环中启动播放
    // 使用Promise包装以确保异步播放
    return new Promise((resolve) => {
      // 创建微任务以确保在当前事件循环结束后执行
      Promise.resolve().then(() => {
        source.start(0);
        currentAudioControl = { audioContext, source };
        resolve(currentAudioControl);
      });
    });
    
    currentAudioControl = { audioContext, source };
    return currentAudioControl;
  } catch (error) {
    console.error('播放音频失败:', error);
    throw error;
  }
};

/**
 * 停止音频播放
 * @param {Object} control 包含audioContext和source的对象
 */
export const stopAudio = (control) => {
  try {
    if (control) {
      if (control.source && typeof control.source.stop === 'function') {
        try {
          control.source.stop(0);
        } catch (e) {
          console.warn('停止音频失败:', e);
        }
      }
      
      if (control.source && typeof control.source.disconnect === 'function') {
        try {
          control.source.disconnect();
        } catch (e) {
          console.warn('断开音频连接失败:', e);
        }
      }
      
      if (currentAudioControl === control) {
        currentAudioControl = null;
      }
    }
  } catch (error) {
    console.error('停止音频时出错:', error);
  }
};
    