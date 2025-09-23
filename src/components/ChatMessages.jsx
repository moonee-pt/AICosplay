import React from 'react';

const ChatMessages = ({ messages, isTyping }) => {

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