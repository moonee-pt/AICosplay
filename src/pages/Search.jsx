import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import CharacterCard from '../components/CharacterCard';

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // 模拟角色数据
  const allCharacters = [
    {
      id: 'harry-potter',
      name: '哈利波特',
      bio: '魔法世界的年轻巫师，勇敢正直，擅长黑魔法防御术。来自霍格沃茨魔法学校的格兰芬多学院。',
      avatar: 'https://placehold.co/300x300/e0f7fa/000000?text=哈利波特',
      skills: ['魔法知识专家', '黑魔法防御', '魁地奇球员', '快速思考者']
    },
    {
      id: 'sherlock-holmes',
      name: '夏洛克·福尔摩斯',
      bio: '世界上最著名的侦探，拥有非凡的观察力和推理能力，善于解决复杂的犯罪案件。',
      avatar: 'https://placehold.co/300x300/e0f7fa/000000?text=夏洛克',
      skills: ['逻辑推理', '观察力', '演绎法', '化学知识']
    },
    {
      id: 'albert-einstein',
      name: '阿尔伯特·爱因斯坦',
      bio: '20世纪最伟大的物理学家之一，相对论的创立者，对现代物理学的发展产生了深远影响。',
      avatar: 'https://placehold.co/300x300/e0f7fa/000000?text=爱因斯坦',
      skills: ['理论物理学', '创新思维', '数学', '哲学']
    },
    {
      id: 'marie-curie',
      name: '玛丽·居里',
      bio: '著名物理学家和化学家，首位获得两次诺贝尔奖的科学家，对放射性研究做出了开创性贡献。',
      avatar: 'https://placehold.co/300x300/e0f7fa/000000?text=居里夫人',
      skills: ['放射性研究', '化学', '物理学', '坚韧不拔']
    }
  ];

  const handleSearch = () => {
    if (searchTerm.trim()) {
      setIsSearching(true);
      
      // 模拟搜索延迟
      setTimeout(() => {
        const results = allCharacters.filter(character => 
          character.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          character.bio.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setSearchResults(results);
        setIsSearching(false);
      }, 500);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="search-page">
      <Navbar />
      <section className="search-section">
        <div className="container">
          <h1>角色搜索</h1>
          <div className="search-input-container">
            <input
              type="text"
              placeholder="输入角色名称或关键词..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="search-input-large"
            />
            <button onClick={handleSearch} className="btn btn-primary search-btn">
              <i className="fas fa-search"></i> 搜索
            </button>
          </div>
          
          {isSearching && (
            <div className="searching-indicator">搜索中...</div>
          )}
          
          <div className="search-results">
            {searchResults.length > 0 ? (
              <>
                <h2>搜索结果 ({searchResults.length})</h2>
                <div className="characters-grid">
                  {searchResults.map(character => (
                    <CharacterCard key={character.id} character={character} />
                  ))}
                </div>
              </>
            ) : searchTerm && !isSearching ? (
              <div className="no-results">
                <p>未找到匹配的角色</p>
                <p>请尝试其他关键词或浏览全部角色</p>
              </div>
            ) : (
              <div className="search-hints">
                <p>输入关键词开始搜索角色</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Search;