import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CharacterDetailModal from './CharacterDetailModal';
import { getRealAvatarUrl } from '../utils/utils.js';

const ChatHeader = ({ character, isFavorited, onToggleFavorite, onEdit, onClearChat, title, subtitle, onBack }) => {
  const navigate = useNavigate();
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // 检测是否为移动设备
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // 初始化检测
    checkIsMobile();
    
    // 监听窗口大小变化
    window.addEventListener('resize', checkIsMobile);
    
    // 清理事件监听
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const toggleDetailModal = () => {
    setIsDetailModalOpen(!isDetailModalOpen);
  };

  return (
    <>
      <div className="chat-header">
        <button className="chat-back-button" onClick={handleBack}>
          <i className="fas fa-arrow-left"></i>
        </button>
        
        <div className="character-display">
          {title ? (
            <>
              <img 
                src="https://placehold.co/300x300/pink/white?text=302" 
                alt={title}
                className="character-avatar-small"
              />
              <div>
                <span className="character-name-small">302卧谈会</span>
              </div>
            </>
          ) : (
            <>
              <img 
                src={getRealAvatarUrl(character?.avatar) || 'https://placehold.co/300x300/e0f7fa/000000?text=角色'} 
                alt={character?.name || '角色'}
                className="character-avatar-small"
              />
              <span className="character-name-small">{character?.name || '角色名称'}</span>
            </>
          )}
        </div>
        
        <button 
          className={`favorite-button ${isFavorited ? 'favorited' : ''}`}
          onClick={onToggleFavorite}
          title={isFavorited ? '取消收藏' : '添加收藏'}
        >
          <i className={isFavorited ? 'fas fa-heart' : 'far fa-heart'}></i>
        </button>
        
        {/* 编辑按钮 - 仅当是自定义AI时显示 */}
        {character?.isCustom && (
          <button 
            className="edit-button"
            onClick={onEdit}
            title="编辑角色"
          >
            <i className="fas fa-edit"></i>
          </button>
        )}
        

        
        {/* 只有在移动端才显示detail button */}
        {isMobile && (
          <button className="detail-button" onClick={toggleDetailModal}>
            <i className="fas fa-ellipsis-v"></i>
          </button>
        )}
      </div>
      
      <CharacterDetailModal 
        character={character} 
        isOpen={isDetailModalOpen} 
        onClose={toggleDetailModal}
        onClearChat={onClearChat}
      />
    </>
  );
};

export default ChatHeader;