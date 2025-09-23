import React, { useState } from 'react';

const ChatInput = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !disabled) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceInput = () => {
    // 语音输入功能开发中
    alert('语音输入功能开发中...');
  };

  const handleEmoji = () => {
    // 表情选择功能开发中
    alert('表情选择功能开发中...');
  };

  const handleAttachment = () => {
    // 附件上传功能开发中
    alert('附件上传功能开发中...');
  };

  return (
    <div className="chat-input-area">
      <div className="chat-input-container">
        <input 
          type="text" 
          id="chat-input" 
          className="chat-input" 
          placeholder="输入消息..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={disabled}
        />
        <div className="input-actions">
          <button 
            id="voice-input-btn" 
            title="语音输入" 
            onClick={handleVoiceInput}
            disabled={disabled}
          >
            <i className="fas fa-microphone"></i>
          </button>
          <button 
            id="emoji-btn" 
            title="表情" 
            onClick={handleEmoji}
            disabled={disabled}
          >
            <i className="far fa-smile"></i>
          </button>
          <button 
            id="attachment-btn" 
            title="附件" 
            onClick={handleAttachment}
            disabled={disabled}
          >
            <i className="fas fa-paperclip"></i>
          </button>
        </div>
        <button 
          id="send-btn" 
          className="send-button" 
          title="发送消息" 
          onClick={handleSend}
          disabled={disabled || !message.trim()}
        >
          <i className="fas fa-paper-plane"></i>
        </button>
      </div>
    </div>
  );
};

export default ChatInput;