import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/character-card.css';
import { getRealAvatarUrl } from '../utils/utils.js';

const CharacterCard = ({ character }) => {
  // 直接构建聊天页面URL，不保留搜索参数
  const chatUrl = `/chat/${character.id}`;
  
  // 获取角色头像，处理sessionStorage中的头像引用
  const getCharacterImage = (id) => {
    const imageMap = {
      'harry-potter': 'https://p2.ssl.qhimgs1.com/sdr/400__/t049e1c7d2ba7f49792.jpg',
      'sherlock-holmes': 'https://p2.ssl.qhimgs1.com/sdr/400__/t015b2d215c009f83ec.gif',
      'albert-einstein': 'https://p2.ssl.qhimgs1.com/sdr/400__/t01f405ed7c4fac3ce2.jpg',
      'marie-curie': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    };
    
    const avatarSrc = imageMap[id] || character.avatar;
    
    // 使用统一的头像处理函数
    return getRealAvatarUrl(avatarSrc);
  };

  return (
    <div className="character-card">
      <div className="character-image">
        <img src={getCharacterImage(character.id)} alt={character.name} />
      </div>
      <h3>{character.name}</h3>
      <p>{character.bio.substring(0, 100)}...</p>
      <Link 
        to={chatUrl} 
        className="btn btn-primary character-btn"
      >
        <i className="fas fa-comment-dots"></i> 开始对话
      </Link>
    </div>
  );
};

export default CharacterCard;