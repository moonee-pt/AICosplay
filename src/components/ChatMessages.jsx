import React, { useState, useEffect, useRef } from 'react';
import { textToSpeech, playAudio, stopAudio } from '../services/ttsService';
import { getRealAvatarUrl } from '../utils/utils';
// 导入getRealAvatarUrl函数用于处理头像URL，包括sessionStorage中的头像引用
// 在第191行和第257行中使用，确保历史消息和正在输入的消息都能显示正确的头像
// 头像处理逻辑使用说明：
// 1. 第3行导入了getRealAvatarUrl函数，用于统一处理头像URL
// 2. 第191行使用该函数处理历史消息中的头像
// 3. 第257行使用该函数处理正在输入状态的AI头像

const ChatMessages = ({ messages, isTyping, characterVoice }) => {
  // 跟踪当前正在播放的消息索引
  const [playingMessage, setPlayingMessage] = useState(null);
  // 跟踪音频控制对象
  const [audioControl, setAudioControl] = useState(null);
  // 跟踪每条消息的播放状态
  const [playingStatus, setPlayingStatus] = useState(new Map());
  // 跟踪当前悬停的按钮索引
  const [hoveredButton, setHoveredButton] = useState(null);
  // 跟踪每条AI消息的打字效果进度
  const [typingProgress, setTypingProgress] = useState(new Map());
  // 头像更新时间戳，用于触发头像重新渲染
  const [avatarUpdateTimestamp, setAvatarUpdateTimestamp] = useState(Date.now());
  const avatarUpdateRef = useRef(null);

  // 格式化时间（消息内时间）
  const formatTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours}:${minutes < 10 ? '0' : ''}${minutes}`;
  };

  // 格式化文件大小
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 实现打字效果
  useEffect(() => {
    // 找出最新的AI消息并开始打字效果
    const latestAIMessageIndex = messages.findLastIndex(msg => 
      msg.sender === 'ai' && !typingProgress.has(msg.timestamp)
    );

    if (latestAIMessageIndex !== -1) {
      const message = messages[latestAIMessageIndex];
      const totalChars = message.text.length;
      let currentChar = 0;
      
      // 初始化进度
      setTypingProgress(prev => new Map(prev).set(message.timestamp, 0));
      
      // 创建打字动画
      const typingInterval = setInterval(() => {
        currentChar++;
        setTypingProgress(prev => new Map(prev).set(message.timestamp, currentChar));
        
        if (currentChar >= totalChars) {
          clearInterval(typingInterval);
        }
      }, 50); // 每个字符延迟50毫秒
      
      return () => clearInterval(typingInterval);
    }
  }, [messages, typingProgress]);

  // 监听头像更新事件，确保头像变更后能重新渲染
  useEffect(() => {
    const handleAvatarUpdate = (event) => {
      console.log('ChatMessages组件接收到头像更新事件:', event.detail);
      // 更新时间戳以触发组件重新渲染
      setAvatarUpdateTimestamp(Date.now());
      
      // 强制重新加载所有头像图片
      const reloadAvatars = () => {
        // 检查是否已有正在进行的更新，避免频繁更新
        if (avatarUpdateRef.current) {
          clearTimeout(avatarUpdateRef.current);
        }
        
        // 延迟执行，确保DOM已更新
        avatarUpdateRef.current = setTimeout(() => {
          const avatarElements = document.querySelectorAll('.chat-message-avatar');
          avatarElements.forEach(avatar => {
            const src = avatar.src;
            // 添加随机参数以强制浏览器重新加载图片
            avatar.src = src.split('?')[0] + '?t=' + Date.now();
          });
        }, 100);
      };
      
      // 立即触发一次更新，然后在短暂延迟后再次触发
      reloadAvatars();
      setTimeout(reloadAvatars, 300);
    };

    // 监听常规头像更新事件
    document.addEventListener('userAvatarUpdated', handleAvatarUpdate);
    // 监听紧急头像更新事件（备选方案）
    document.addEventListener('userAvatarEmergencyUpdated', handleAvatarUpdate);
    
    console.log('ChatMessages组件已开始监听头像更新事件');

    return () => {
      document.removeEventListener('userAvatarUpdated', handleAvatarUpdate);
      document.removeEventListener('userAvatarEmergencyUpdated', handleAvatarUpdate);
      if (avatarUpdateRef.current) {
        clearTimeout(avatarUpdateRef.current);
      }
      console.log('ChatMessages组件已停止监听头像更新事件');
    };
  }, []);

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

      // 获取音频数据，为预定义角色设置默认声音为'aisjiuxu'
      // 从组件props中获取characterVoice，默认使用'male1'（对应aisjiuxu）
      const voice = characterVoice || 'male1';
      const audioData = await textToSpeech(text, voice);
      
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
            {/* 使用统一的头像处理函数 */}
          <img 
            key={`${message.avatar || message.sender}-${avatarUpdateTimestamp}`}
            className="message-avatar chat-message-avatar"
            src={getRealAvatarUrl(message.avatar)} 
            alt={message.sender === 'ai' ? 'AI' : '用户'}
            onClick={() => {
              if (message.sender === 'user') {
                // 创建自定义事件来打开用户信息模态框
                const event = new CustomEvent('openUserProfile');
                document.dispatchEvent(event);
              }
            }}
            style={message.sender === 'user' ? { cursor: 'pointer' } : {}}
          />
          <div className="message-content">
              {/* 对于AI消息，实现打字效果 */}
              {message.sender === 'ai' ? (
                <p className="typing-text">
                  {message.text.substring(0, typingProgress.get(message.timestamp) || message.text.length)}
                </p>
              ) : (
                <>
                  <p>{message.text}</p>
                  {/* 显示上传的文件 */}
                  {message.file && (
                    <div className="message-file">
                      {message.file.type.startsWith('image/') ? (
                        <a href={message.file.url} target="_blank" rel="noopener noreferrer" className="file-image">
                          <img 
                            src={message.file.url} 
                            alt={message.file.name} 
                            style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '4px' }}
                          />
                        </a>
                      ) : (
                        <a href={message.file.url} target="_blank" rel="noopener noreferrer" className="file-link">
                          <i className="fas fa-file"></i>
                          <span>{message.file.name}</span>
                          <span className="file-size">{formatFileSize(message.file.size)}</span>
                        </a>
                      )}
                    </div>
                  )}
                </>
              )}
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
          {/* 使用统一的头像处理函数 */}
          <img 
            key={`typing-avatar-${avatarUpdateTimestamp}`}
            className="message-avatar chat-message-avatar"
            src={getRealAvatarUrl(messages[0]?.avatar || 'https://placehold.co/300x300/e0f7fa/000000?text=角色')} 
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