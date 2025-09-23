import React from 'react';
import { Link } from 'react-router-dom';

const CharacterCard = ({ character }) => {
  // 使用适合的卡通风格图片
  const getCharacterImage = (id) => {
    const imageMap = {
      'harry-potter': 'https://images.unsplash.com/photo-1518946222227-364f22132616?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'sherlock-holmes': 'https://images.unsplash.com/photo-1574737489663-170735d1449f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'albert-einstein': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'marie-curie': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    };
    return imageMap[id] || character.avatar;
  };

  return (
    <div className="character-card">
      <div className="character-image">
        <img src={getCharacterImage(character.id)} alt={character.name} />
      </div>
      <h3>{character.name}</h3>
      <p>{character.bio.substring(0, 100)}...</p>
      <Link 
        to={`/chat/${character.id}`} 
        className="btn btn-primary character-btn"
      >
        <i className="fas fa-comment-dots"></i> 开始对话
      </Link>
    </div>
  );
};

export default CharacterCard;