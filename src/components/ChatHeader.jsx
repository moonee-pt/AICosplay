import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CharacterDetailModal from './CharacterDetailModal';

const ChatHeader = ({ character }) => {
  const navigate = useNavigate();
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleBack = () => {
    navigate('/');
  };

  const toggleDetailModal = () => {
    setIsDetailModalOpen(!isDetailModalOpen);
  };

  return (
    <>
      <div className="chat-header">
        <button className="back-button" onClick={handleBack}>
          <i className="fas fa-arrow-left"></i>
        </button>
        
        <div className="character-display">
          <img 
            src={character?.avatar || 'https://placehold.co/300x300/e0f7fa/000000?text=角色'} 
            alt={character?.name || '角色'}
            className="character-avatar-small"
          />
          <span className="character-name-small">{character?.name || '角色名称'}</span>
        </div>
        
        <button className="detail-button" onClick={toggleDetailModal}>
          <i className="fas fa-ellipsis-v"></i>
        </button>
      </div>
      
      <CharacterDetailModal 
        character={character} 
        isOpen={isDetailModalOpen} 
        onClose={toggleDetailModal}
      />
    </>
  );
};

export default ChatHeader;