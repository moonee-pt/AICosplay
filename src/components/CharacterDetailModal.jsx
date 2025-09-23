import React from 'react';

const CharacterDetailModal = ({ character, isOpen, onClose }) => {
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
              src={character.avatar || 'https://placehold.co/300x300/e0f7fa/000000?text=角色'} 
              alt={character.name || '角色'}
              className="character-detail-avatar"
            />
            <div className="character-detail-info">
              <h2>{character.name || '角色名称'}</h2>
            </div>
          </div>
          
          <div className="character-detail-bio">
            <h3>角色简介</h3>
            <p>{character.bio || '暂无角色简介'}</p>
          </div>
          
          <div className="character-detail-skills">
            <h3>角色技能</h3>
            <ul className="skill-list">
              {character.skills?.map((skill, index) => (
                <li key={index}>
                  <i className="fas fa-magic"></i> {skill}
                </li>
              )) || (
                <li><i className="fas fa-magic"></i> 暂无技能信息</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterDetailModal;