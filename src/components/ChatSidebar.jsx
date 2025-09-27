import React from 'react';
import '../assets/css/chat-sidebar.css';
import { getRealAvatarUrl } from '../utils/utils.js';

const ChatSidebar = ({ character, onClearChat }) => {
  
  return (
    <div className="chat-sidebar">
      <div className="character-info">
        <img id="character-avatar" src={getRealAvatarUrl(character?.avatar) || 'https://placehold.co/300x300/e0f7fa/000000?text=角色'} alt={character?.name || '角色'} />
        <h2 id="character-name">{character?.name || '角色名称'}</h2>
        <p id="character-bio" className="character-bio">{character?.bio || '角色简介'}</p>
      </div>
      
      <div className="character-skills">
        <h3>角色技能</h3>
        <ul className="skill-list">
          {character?.skills?.map((skill, index) => {
            // 为不同的技能分配不同的通用图标
            const icons = ['fas fa-book', 'fas fa-brain', 'fas fa-bullseye', 'fas fa-fire'];
            const iconClass = icons[index % icons.length];
            return (
              <li key={index}>
                <i className={iconClass}></i> {skill}
              </li>
            );
          }) || (
            <li><i className="fas fa-book"></i> 暂无技能信息</li>
          )}
        </ul>
      </div>
      
      {/* 清除当前对话按钮 */}
      <div className="clear-chat-container">
        <button 
          className="clear-current-chat-button" 
          onClick={onClearChat}
        >
          <i className="fas fa-trash-alt"></i> 清除当前对话
        </button>
      </div>
    </div>
  );
};

export default ChatSidebar;