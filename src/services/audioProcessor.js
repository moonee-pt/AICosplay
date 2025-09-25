// AudioWorkletProcessor实现，用于处理音频数据
class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    // 监听消息，接收配置信息
    this.port.onmessage = (event) => {
      if (event.data.type === 'config') {
        this.sampleRate = event.data.sampleRate;
        this.channels = event.data.channels;
      }
    };
  }

  process(inputs, outputs, parameters) {
    // 获取输入音频数据
    const inputData = inputs[0];
    if (!inputData || inputData.length === 0) {
      return true;
    }

    // 获取单声道数据
    const channelData = inputData[0];
    
    // 转换为16位PCM格式
    const buffer = new ArrayBuffer(channelData.length * 2);
    const view = new DataView(buffer);
    
    for (let i = 0; i < channelData.length; i++) {
      const sample = channelData[i];
      const s = Math.max(-1, Math.min(1, sample));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }

    // 发送处理后的音频数据
    this.port.postMessage(buffer, [buffer]);
    
    return true;
  }
}

// 注册处理器
registerProcessor('audio-processor', AudioProcessor);