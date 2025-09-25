import React, { useState, useEffect } from 'react';
import { textToSpeech, playAudio, stopAudio } from '../services/ttsService';

const ChatMessages = ({ messages, isTyping }) => {
  // 跟踪当前正在播放的消息索引
  const [playingMessage, setPlayingMessage] = useState(null);
  // 跟踪音频控制对象
  const [audioControl, setAudioControl] = useState(null);
  // 跟踪每条消息的播放状态
  const [playingStatus, setPlayingStatus] = useState(new Map());
  // 跟踪当前悬停的按钮索引
  const [hoveredButton, setHoveredButton] = useState(null);

  // 格式化时间（消息内时间）
  const formatTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours}:${minutes < 10 ? '0' : ''}${minutes}`;
  };

  // 格式化日期（中间显示的时间戳）
  const formatDate = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    
    // 检查是否是今天
    const isToday = messageDate.toDateString() === now.toDateString();
    
    if (isToday) {
      return formatTime(messageDate);
    } else {
      const month = messageDate.getMonth() + 1;
      const day = messageDate.getDate();
      return `${month}月${day}日 ${formatTime(messageDate)}`;
    }
  };

  // 检查是否需要显示时间间隔
  const shouldShowTimeGap = (currentIndex) => {
    if (currentIndex === 0) return true; // 第一条消息前显示时间
    
    const currentMessage = messages[currentIndex];
    const prevMessage = messages[currentIndex - 1];
    
    // 计算时间差（分钟）
    const timeDiff = (new Date(currentMessage.timestamp) - new Date(prevMessage.timestamp)) / (1000 * 60);
    
    // 如果时间差超过5分钟，显示时间间隔
    return timeDiff > 5;
  };

  // 处理播放音频 - 简化版本，确保能播放一遍
  const handlePlayAudio = async (text, messageIndex) => {
    try {
      // 检查是否正在播放当前消息
      const isCurrentlyPlaying = playingMessage === messageIndex && audioControl;
      
      // 如果当前正在播放同一消息，则停止播放
      if (isCurrentlyPlaying) {
        stopAudio(audioControl);
        setPlayingMessage(null);
        setAudioControl(null);
        setPlayingStatus(prev => new Map(prev).set(messageIndex, false));
        return;
      }

      // 停止其他正在播放的音频
      if (audioControl) {
        stopAudio(audioControl);
        // 立即重置播放状态
        setPlayingMessage(null);
        setAudioControl(null);
        if (playingMessage !== null) {
          setPlayingStatus(prev => new Map(prev).set(playingMessage, false));
        }
      }

      // 设置当前播放的消息状态
      setPlayingMessage(messageIndex);
      setPlayingStatus(prev => new Map(prev).set(messageIndex, true));

      // 获取音频数据
      const audioData = await textToSpeech(text);
      
      // 再次检查状态
      if (playingMessage !== messageIndex) {
        setPlayingStatus(prev => new Map(prev).set(messageIndex, false));
        return;
      }
      
      // 播放音频并设置结束回调
      const control = await playAudio(audioData, () => {
        // 播放结束后重置状态
        if (playingMessage === messageIndex) {
          setPlayingMessage(null);
          setAudioControl(null);
          setPlayingStatus(prev => new Map(prev).set(messageIndex, false));
        }
      });
      
      // 设置控制对象
      setAudioControl(control);
      
      // 超时处理，确保音频能播放完毕
      setTimeout(() => {
        if (playingMessage === messageIndex && audioControl) {
          stopAudio(audioControl);
          setPlayingMessage(null);
          setAudioControl(null);
          setPlayingStatus(prev => new Map(prev).set(messageIndex, false));
        }
      }, 60000); // 最大播放时间1分钟
      
    } catch (error) {
      console.error('语音播放失败:', error);
      // 只在当前消息仍然是我们尝试播放的消息时更新状态
      if (playingMessage === messageIndex) {
        setPlayingMessage(null);
        setAudioControl(null);
        setPlayingStatus(prev => new Map(prev).set(messageIndex, false));
      }
      alert('语音合成或播放失败，请稍后重试。\n错误:', error.message);
    }
  };

  // 组件卸载时清理音频
  useEffect(() => {
    return () => {
      if (audioControl) {
        stopAudio(audioControl);
      }
    };
  }, [audioControl]);

  return (
    <div className="chat-messages" id="chat-messages">
      {messages.map((message, index) => (
        <React.Fragment key={index}>
          {/* 显示时间间隔 */}
          {shouldShowTimeGap(index) && (
            <div className="time-gap">
              <span>{formatDate(message.timestamp)}</span>
            </div>
          )}
          
          <div className={`message ${message.sender}`}>
            <img 
              className="message-avatar" 
              src={message.avatar} 
              alt={message.sender === 'ai' ? 'AI' : '用户'}
            />
            <div className="message-content">
              <p>{message.text}</p>
              {/* 移除每条消息单独显示的时间 */}
              {/* 只有AI消息才显示播放按钮 */}
              {message.sender === 'ai' && (
                <button 
                  className={`play-audio-btn hollow-icon ${playingStatus.get(index) ? 'playing' : ''}`}
                  onClick={() => handlePlayAudio(message.text, index)}
                  onMouseEnter={() => setHoveredButton(index)}
                  onMouseLeave={() => setHoveredButton(null)}
                >
                  {playingStatus.get(index) ? 
                      <img src="/src/assets/img/voice_playing.png" alt="正在播放" width="18" height="18" />
                    : 
                      <img src="/src/assets/img/audio.png" alt="播放" width="18" height="18" />
                    }
                  {hoveredButton === index && (
                    <span className="hover-text">
                      {playingStatus.get(index) ? '点击暂停' : '点击播放'}
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>
        </React.Fragment>
      ))}
      
      {isTyping && (
        <div className="message ai typing">
          <img 
            className="message-avatar" 
            src={messages[0]?.avatar || 'https://placehold.co/300x300/e0f7fa/000000?text=角色'} 
            alt="AI"
          />
          <div className="message-content">
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatMessages;