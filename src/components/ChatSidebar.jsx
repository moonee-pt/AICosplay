import React from 'react';

const ChatSidebar = ({ character }) => {
  return (
    <div className="chat-sidebar">
      <div className="character-info">
        <img id="character-avatar" src={character?.avatar || 'https://placehold.co/300x300/e0f7fa/000000?text=角色'} alt={character?.name || '角色'} />
        <h2 id="character-name">{character?.name || '角色名称'}</h2>
        <p id="character-bio" className="character-bio">{character?.bio || '角色简介'}</p>
      </div>
      
      <div className="character-skills">
        <h3>角色技能</h3>
        <ul className="skill-list">
          {character?.skills?.map((skill, index) => (
            <li key={index}>
              <i className="fas fa-magic"></i> {skill}
            </li>
          )) || (
            <li><i className="fas fa-magic"></i> 暂无技能信息</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ChatSidebar;