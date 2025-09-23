import React from 'react';
import { useNavigate } from 'react-router-dom';

const ChatHeader = ({ character }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  const handleSettings = () => {
    // 打开设置菜单
    alert('设置功能开发中...');
  };

  return (
    <div className="chat-header">
      <button className="back-button" onClick={handleBack}>
        <i className="fas fa-arrow-left"></i>
      </button>
      
      <div className="current-character">
        <img 
          id="current-character-avatar" 
          src={character?.avatar || 'https://placehold.co/300x300/e0f7fa/000000?text=角色'} 
          alt={character?.name || '角色'}
        />
        <span id="current-character-name">{character?.name || '角色名称'}</span>
      </div>
      
      <button className="chat-settings" onClick={handleSettings}>
        <i className="fas fa-cog"></i>
      </button>
    </div>
  );
};

export default ChatHeader;