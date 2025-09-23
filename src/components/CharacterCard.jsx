import React from 'react';
import { Link } from 'react-router-dom';

const CharacterCard = ({ character }) => {
  return (
    <div className="character-card">
      <div className="character-image">
        <img src={character.avatar} alt={character.name} />
      </div>
      <h3>{character.name}</h3>
      <p>{character.bio.substring(0, 100)}...</p>
      <Link 
        to={`/chat/${character.id}`} 
        className="btn btn-primary character-btn"
      >
        开始对话
      </Link>
    </div>
  );
};

export default CharacterCard;