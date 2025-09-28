import { useState, useRef} from 'react';
import CryptoJS from 'crypto-js';

const ChatInput = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [setRecognitionResult] = useState('');

  const isRecordingRef = useRef(false);
  const audioContextRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const wsRef = useRef(null);
  const rtasrResultRef = useRef([]);
  const textareaRef = useRef(null);

  const config = {
    hostUrl: "wss://rtasr.xfyun.cn/v1/ws",
    appid: "72bda1bd",
    apiKey: "6dd7d775e6cc838328d785f0a57b439e",
    sampleRate: 16000,  // 严格按照官方要求使用16000Hz
    channels: 1,  // 单声道
    scriptBufferSize: 1024,      
    highWaterMark: 1280 // 与官方示例保持一致的缓冲区大小
  };

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
      setRecognitionResult('');
      setCurrentTranscript('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !disabled) {
      e.preventDefault();
      handleSend();
    }
  };

  // 鉴权签名，与官方保持一致
  const getSigna = (ts) => {
    const md5 = CryptoJS.MD5(config.appid + ts).toString();
    const sha1 = CryptoJS.HmacSHA1(md5, config.apiKey);
    const base64 = CryptoJS.enc.Base64.stringify(sha1);
    return encodeURIComponent(base64);
  };

  const initWebSocket = () => {
    const ts = parseInt(new Date().getTime() / 1000);
    const wssUrl = `${config.hostUrl}?appid=${config.appid}&ts=${ts}&signa=${getSigna(ts)}`;

    try {
      if (!window.WebSocket) throw new Error('当前浏览器不支持WebSocket');

      wsRef.current = new WebSocket(wssUrl);
      rtasrResultRef.current = [];

      const wsTimeout = setTimeout(() => {
        if (wsRef.current?.readyState === WebSocket.CONNECTING) {
          console.error('WebSocket连接超时');
          wsRef.current.close();
          alert('连接语音识别服务器超时，请稍后重试');
          stopRecording();
        }
      }, 30000);

      wsRef.current.onopen = () => {
        clearTimeout(wsTimeout);
        setIsWebSocketConnected(true);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.action) {
            case 'error':
              break;
            case 'started':
              startAudioStream(); // 开始发送音频数据
              break;
            case 'result':
              handleRecognitionResult(data);
              break;
          }
        } catch (parseError) {
          // 静默处理解析错误
        }
      };

      wsRef.current.onclose = (event) => {
        clearTimeout(wsTimeout);
        setIsWebSocketConnected(false);
        if (isRecordingRef.current) stopRecording();
      };

      wsRef.current.onerror = (error) => {
        clearTimeout(wsTimeout);
        console.error('WebSocket错误:', error);
        setIsWebSocketConnected(false);
        if (isRecordingRef.current) stopRecording();
      };
    } catch (error) {
      console.error('初始化WebSocket失败:', error);
      alert(`连接失败: ${error.message}`);
      stopRecording();
    }
  };

  // 处理识别结果
  const handleRecognitionResult = (result) => {
  try {
    // 第一层解析
    let data = typeof result === 'string' ? JSON.parse(result) : result;

    // 如果有 data 字段，再解析一次
    if (data.data) {
      data = typeof data.data === 'string' ? JSON.parse(data.data) : data.data;
    }

    // 保存结果
    if (data.seg_id !== undefined) {
      rtasrResultRef.current[data.seg_id] = data;
    }

    // 提取文字
    let transcript = '';
    if (data.cn?.st?.rt) {
      data.cn.st.rt.forEach(rt => {
        rt.ws?.forEach(ws => {
          ws.cw?.forEach(cw => {
            transcript += cw.w || '';
          });
        });
      });
    }

    // 更新 UI
    setCurrentTranscript(transcript);

    // 判断是否最终结果
    const isFinal = data.cn?.st?.type === 0 || data.cn?.st?.type === '0';
    if (isFinal) {
      setRecognitionResult(transcript);
      setMessage(prev => {
        const newMessage = prev + transcript;
        // 延迟调整文本框高度，确保DOM已更新
        setTimeout(() => adjustTextareaHeight(), 0);
        return newMessage;
      });
    }
  } catch (error) {
    // 静默处理错误
  }
};

  // 精确重采样到16000Hz
  const resampleTo16k = (input, sourceRate) => {
    if (sourceRate === config.sampleRate) return input;
    
    const ratio = sourceRate / config.sampleRate;
    const outputLength = Math.floor(input.length / ratio);
    const output = new Float32Array(outputLength);
    
    for (let i = 0; i < outputLength; i++) {
      const inputIndex = i * ratio;
      const index = Math.floor(inputIndex);
      const fraction = inputIndex - index;
      
      if (index + 1 < input.length) {
        output[i] = input[index] * (1 - fraction) + input[index + 1] * fraction;
      } else {
        output[i] = input[index] || 0;
      }
    }
    
    return output;
  };

  // 处理音频数据，转换为官方要求的PCM格式
  const processAudioData = (float32Array, sourceRate) => {
    // 1. 重采样到16000Hz
    const resampled = resampleTo16k(float32Array, sourceRate);
    
    // 2. 转换为16位PCM
    const buffer = new ArrayBuffer(resampled.length * 2);
    const view = new DataView(buffer);
    
    for (let i = 0; i < resampled.length; i++) {
      // 确保在[-1, 1]范围内
      const sample = Math.max(-1, Math.min(1, resampled[i]));
      // 转换为16位有符号整数
      view.setInt16(i * 2, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
    }
    
    return buffer;
  };

  const startAudioStream = async () => {
    try {
      // 初始化音频上下文，不指定采样率，使用默认值
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const sourceRate = audioContextRef.current.sampleRate;

      // 创建脚本处理器，与官方highWaterMark保持一致
      const scriptProcessor = audioContextRef.current.createScriptProcessor(
        config.scriptBufferSize, // 缓冲区大小
        1, // 输入声道数
        1  // 输出声道数
      );

      // 获取麦克风输入
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: config.channels,
          latency: 0
        }
      });
      mediaStreamRef.current = stream;

      const microphone = audioContextRef.current.createMediaStreamSource(stream);
      microphone.connect(scriptProcessor);
      scriptProcessor.connect(audioContextRef.current.destination);

      // 处理音频数据
      scriptProcessor.onaudioprocess = (event) => {
        if (!isRecordingRef.current || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
          return;
        }
        
        // 获取输入音频数据
        const inputData = event.inputBuffer.getChannelData(0);
        
        // 检测音量但不输出日志
        const volume = Math.max(...inputData.map(v => Math.abs(v)));
        
        // 处理音频数据为PCM格式
        const pcmData = processAudioData(inputData, sourceRate);
        
        // 像官方示例一样直接发送PCM数据
        wsRef.current.send(pcmData);
      };

      audioContextRef.current.scriptProcessor = scriptProcessor;

    } catch (error) {
      console.error('启动音频流失败:', error);
      let errorMessage = '无法访问麦克风，请检查权限';
      if (error.name === 'NotAllowedError') errorMessage = '麦克风访问被拒绝';
      else if (error.name === 'NotFoundError') errorMessage = '未找到麦克风设备';
      else if (error.name === 'NotReadableError') errorMessage = '麦克风被占用';
      alert(errorMessage);
      stopRecording();
    }
  };

  // 调整文本框高度
  const adjustTextareaHeight = () => {
    if (!textareaRef.current) return;
    
    // 重置高度以准确计算内容高度
    textareaRef.current.style.height = 'auto';
    
    // 最大高度限制 (约5行)
    const maxHeight = 120;
    const scrollHeight = textareaRef.current.scrollHeight;
    
    // 设置新高度，但不超过最大高度
    textareaRef.current.style.height = Math.min(scrollHeight, maxHeight) + 'px';
    
    // 自动滚动到最底部，显示最新内容
    textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
  };

  const startRecording = () => {
    if (disabled || isRecordingRef.current) return;

    setRecognitionResult('');
    setCurrentTranscript('');
    rtasrResultRef.current = [];

    initWebSocket();

    isRecordingRef.current = true;
    setIsRecording(true);
  };

  const stopRecording = () => {
    // 首先设置状态，防止任何进一步的音频处理
    isRecordingRef.current = false;
    setIsRecording(false);
    setIsWebSocketConnected(false);

    // 停止媒体流，但不要在此处触发任何异常
    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      } catch (trackError) {
        // 静默处理错误，避免弹窗
      }
      mediaStreamRef.current = null;
    }

    // 清理音频上下文
    if (audioContextRef.current) {
      try {
        if (audioContextRef.current.scriptProcessor) {
          audioContextRef.current.scriptProcessor.disconnect();
          audioContextRef.current.scriptProcessor = null;
        }
        audioContextRef.current.close();
      } catch (audioContextError) {
        // 静默处理错误，避免弹窗
      }
      audioContextRef.current = null;
    }

    // 发送结束标志并关闭WebSocket连接
    if (wsRef.current) {
      try {
        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send('{"end": true}');
          setTimeout(() => {
            if (wsRef.current) {
              try {
                wsRef.current.close();
              } catch (closeError) {
                // 静默处理错误
              }
            }
          }, 500);
        } else if (wsRef.current.readyState === WebSocket.CONNECTING) {
          // 如果仍在连接中，直接关闭
          try {
            wsRef.current.close();
          } catch (connectingCloseError) {
            // 静默处理错误
          }
        }
      } catch (sendError) {
        // 静默处理错误，避免弹窗
      }
      // 不需要在此处设置wsRef.current = null，让它自然释放
    }
  };
  
  const handleVoiceInput = () => {
    if (isRecordingRef.current) {
      stopRecording();
    } else {
      startRecording();
    }
  };



  return (
    <>
      {isRecording && (
        <div className="recording-indicator" style={{
          position: 'relative',
          zIndex: 10,
          marginBottom: '-50px',
          padding: '6px 10px',
          backgroundColor: '#333333',
          borderRadius: '12px',
          border: '1px solid #555555',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          width: '120px',
        }}>
          <div className="recording-wave" style={{
            display: 'flex',
            gap: '3px',
            alignItems: 'center'
          }}>
            <span style={{animation: 'wave 1s infinite ease-in-out', height: '8px', width: '2px', backgroundColor: '#999999', display: 'inline-block', borderRadius: '1px'}}></span>
            <span style={{animation: 'wave 1s 0.1s infinite ease-in-out', height: '12px', width: '2px', backgroundColor: '#999999', display: 'inline-block', borderRadius: '1px'}}></span>
            <span style={{animation: 'wave 1s 0.2s infinite ease-in-out', height: '16px', width: '2px', backgroundColor: '#999999', display: 'inline-block', borderRadius: '1px'}}></span>
            <span style={{animation: 'wave 1s 0.3s infinite ease-in-out', height: '12px', width: '2px', backgroundColor: '#999999', display: 'inline-block', borderRadius: '1px'}}></span>
            <span style={{animation: 'wave 1s 0.4s infinite ease-in-out', height: '8px', width: '2px', backgroundColor: '#999999', display: 'inline-block', borderRadius: '1px'}}></span>
          </div>
          <span style={{fontSize: '13px', color: '#cccccc'}}>{isWebSocketConnected ? '正在录音' : '连接中...'}</span>
        </div>
      )}

      <div className="chat-input-area">
        <div className="chat-input-container">
          <textarea
            ref={textareaRef}
            id="chat-input"
            className="chat-input"
            placeholder={isRecording ? (isWebSocketConnected ? "正在录音，请说话..." : "正在连接服务器...") : "输入消息..."}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              adjustTextareaHeight();
            }}
            onKeyPress={handleKeyPress}
            disabled={disabled}
            style={{
              resize: 'none',
              overflowY: 'auto',
              minHeight: '40px',
              maxHeight: '120px',
              width: '100%',
              padding: '10px',
              border: 'none',
              background: 'none',
              fontSize: '16px',
              outline: 'none'
            }}
          />
          {isRecording && currentTranscript && (
            <div className="transcript-preview">{currentTranscript}</div>
          )}
          <div className="input-actions">
            <button
              id="voice-input-btn"
              title={isRecording ? "停止录音" : "语音输入"}
              onClick={handleVoiceInput}
              disabled={disabled}
              className={isRecording ? 'recording' : ''}
              style={{
                padding: '8px',
                marginRight: '8px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                color: '#546e7a',
                fontSize: '18px'
              }}
            >
              <i className={`fas ${isRecording ? 'fa-microphone-slash' : 'fa-microphone'}`}></i>
            </button>
          </div>
          <button
            id="send-btn"
            className="send-button"
            title="发送消息"
            onClick={handleSend}
            disabled={disabled || !message.trim() || isRecording}
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </>
  );
};

export default ChatInput;