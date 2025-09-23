import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CharacterCard from '../components/CharacterCard';

const Search = () => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showAllCharacters, setShowAllCharacters] = useState(true);

  // 模拟角色数据 - 使用卡通风格图片
  const allCharacters = [
    {
      id: 'harry-potter',
      name: '哈利波特',
      bio: '魔法世界的年轻巫师，勇敢正直，擅长黑魔法防御术。来自霍格沃茨魔法学校的格兰芬多学院。',
      avatar: 'https://images.unsplash.com/photo-1518946222227-364f22132616?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      skills: ['魔法知识专家', '黑魔法防御', '魁地奇球员', '快速思考者']
    },
    {
      id: 'sherlock-holmes',
      name: '夏洛克·福尔摩斯',
      bio: '世界上最著名的侦探，拥有非凡的观察力和推理能力，善于解决复杂的犯罪案件。',
      avatar: 'https://images.unsplash.com/photo-1574737489663-170735d1449f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      skills: ['逻辑推理', '观察力', '演绎法', '化学知识']
    },
    {
      id: 'albert-einstein',
      name: '阿尔伯特·爱因斯坦',
      bio: '20世纪最伟大的物理学家之一，相对论的创立者，对现代物理学的发展产生了深远影响。',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      skills: ['理论物理学', '创新思维', '数学', '哲学']
    },
    {
      id: 'marie-curie',
      name: '玛丽·居里',
      bio: '著名物理学家和化学家，首位获得两次诺贝尔奖的科学家，对放射性研究做出了开创性贡献。',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      skills: ['放射性研究', '化学', '物理学', '坚韧不拔']
    }
  ];

  // 从URL参数中获取搜索词
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('query');
    if (query) {
      setSearchTerm(query);
      // 自动执行搜索
      handleSearch(query);
    }
  }, [location.search]);

  const handleSearch = (term = searchTerm) => {
    if (term.trim()) {
      setIsSearching(true);
      setShowAllCharacters(false);
      
      // 模拟搜索延迟
      setTimeout(() => {
        const results = allCharacters.filter(character => 
          character.name.toLowerCase().includes(term.toLowerCase()) ||
          character.bio.toLowerCase().includes(term.toLowerCase())
        );
        setSearchResults(results);
        setIsSearching(false);
      }, 500);
    } else {
      // 如果搜索词为空，显示所有角色
      setShowAllCharacters(true);
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
            <button onClick={(e) => handleSearch()} className="btn btn-primary search-btn">
              <i className="fas fa-search"></i> 搜索
            </button>
          </div>
          
          {isSearching && (
            <div className="searching-indicator">搜索中...</div>
          )}
          
          <div className="search-results">
            {/* 默认显示所有推荐角色 */}
            {showAllCharacters && !isSearching && (
              <>
                <h2>推荐角色</h2>
                <div className="characters-grid">
                  {allCharacters.map(character => (
                    <CharacterCard key={character.id} character={character} />
                  ))}
                </div>
              </>
            )}
            
            {/* 显示搜索结果 */}
            {!showAllCharacters && searchResults.length > 0 ? (
              <>
                <h2>搜索结果 ({searchResults.length})</h2>
                <div className="characters-grid">
                  {searchResults.map(character => (
                    <CharacterCard key={character.id} character={character} />
                  ))}
                </div>
              </>
            ) : !showAllCharacters && searchTerm && !isSearching ? (
              <div className="no-results">
                <p>未找到匹配的角色</p>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Search;