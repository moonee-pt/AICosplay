import React from 'react';
import { getRealAvatarUrl } from '../utils/utils';

const CharacterDetailModal = ({ character, isOpen, onClose, onClearChat }) => {
  if (!isOpen || !character) return null;

  return (
    <div className="character-detail-modal-overlay" onClick={onClose}>
      <div className="character-detail-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
        
        <div className="modal-content">
          <div className="character-detail-header">
            <img 
              src={getRealAvatarUrl(character.avatar || '')} 
              alt={character.name || '角色'}
              className="character-detail-avatar"
            />
            <div className="character-detail-info">
              <h2>{character.name || '角色名称'}</h2>
            </div>
          </div>
          
          <div className="character-detail-bio">
            <h3>角色简介</h3>
            <p id="character-bio" className="character-bio">
              {character.isCustom ? 
                (character.instructions || '暂无角色设定') : 
                (character.bio || '暂无角色简介')
              }
            </p>
          </div>
          
          <div className="character-detail-skills">
            <h3>角色技能</h3>
            <ul className="skill-list">
              {character.skills?.map((skill, index) => {
                // 为不同的技能分配不同的通用图标
                const icons = ['fas fa-book', 'fas fa-brain', 'fas fa-bullseye', 'fas fa-fire'];
                const iconClass = icons[index % icons.length];
                return (
                  <li key={index} className="skill-item">
                    <div className="skill-info">
                      <i className={iconClass}></i> {skill}
                    </div>
                  </li>
                );
              }) || (
                <li><i className="fas fa-book"></i> 暂无技能信息</li>
              )}
            </ul>
          </div>
          
          {/* 清除当前对话按钮 */}
          <div className="character-detail-clear-chat">
            <button 
              className="clear-current-chat-button"
              onClick={onClearChat}
            >
              <i className="fas fa-trash-alt"></i> 清除当前对话
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterDetailModal;