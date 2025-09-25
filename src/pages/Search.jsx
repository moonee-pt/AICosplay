import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import CharacterCard from '../components/CharacterCard';
import Navbar from '../components/Navbar';

const Search = () => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showAllCharacters, setShowAllCharacters] = useState(true);

  // 组件挂载时恢复滚动位置
  useEffect(() => {
    const savedScrollPosition = localStorage.getItem('scrollPosition');
    if (savedScrollPosition) {
      window.scrollTo(0, parseInt(savedScrollPosition));
      // 清除保存的滚动位置，避免下次加载时再次使用
      localStorage.removeItem('scrollPosition');
    } else {
      // 如果没有保存的位置，滚动到顶部
      window.scrollTo(0, 0);
    }
  }, []);

  // 模拟角色数据
  const allCharacters = [
    {
      id: 'harry-potter',
      name: '哈利波特',
      bio: '魔法世界的年轻巫师，勇敢正直，擅长黑魔法防御术。来自霍格沃茨魔法学校的格兰芬多学院。',
      avatar: 'https://p2.ssl.qhimgs1.com/sdr/400__/t049e1c7d2ba7f49792.jpg',
      skills: ['魔法知识专家', '黑魔法防御', '魁地奇球员', '快速思考者']
    },
    {
      id: 'sherlock-holmes',
      name: '夏洛克·福尔摩斯',
      bio: '世界上最著名的侦探，拥有非凡的观察力和推理能力，善于解决复杂的犯罪案件。',
      avatar: 'https://p2.ssl.qhimgs1.com/sdr/400__/t015b2d215c009f83ec.gif',
      skills: ['逻辑推理', '观察力', '演绎法', '化学知识']
    },
    {
      id: 'albert-einstein',
      name: '阿尔伯特·爱因斯坦',
      bio: '20世纪最伟大的物理学家之一，相对论的创立者，对现代物理学的发展产生了深远影响。',
      avatar: 'https://p2.ssl.qhimgs1.com/sdr/400__/t01f405ed7c4fac3ce2.jpg',
      skills: ['理论物理学', '创新思维', '数学', '哲学']
    },
    {
      id: 'marie-curie',
      name: '玛丽·居里',
      bio: '著名物理学家和化学家，首位获得两次诺贝尔奖的科学家，对放射性研究做出了开创性贡献。',
      avatar: 'https://p5.ssl.qhimgs1.com/sdr/400__/t04087d1a4601d76db5.png',
      skills: ['放射性研究', '化学', '物理学', '坚韧不拔']
    }
  ];

  // 从URL参数中获取搜索词
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q');
    if (query) {
      // 自动执行搜索但不填充搜索框
      handleSearch(query);
      // 清空搜索框
      setTimeout(() => setSearchTerm(''), 10); // 使用setTimeout确保清空操作在其他操作之后执行
    }
  }, [location.search]);

  const handleSearch = (term = searchTerm) => {
    if (term.trim()) {
      setIsSearching(true);
      setShowAllCharacters(false);
      
      // 清空搜索框
      setTimeout(() => setSearchTerm(''), 10); // 使用setTimeout确保清空操作在其他操作之后执行
      
      // 模拟搜索延迟
      setTimeout(() => {
        const results = allCharacters.filter(character => 
          character.name.toLowerCase().includes(term.toLowerCase()) ||
          character.bio.toLowerCase().includes(term.toLowerCase())
        );
        setSearchResults(results);
        setIsSearching(false);
        
        // 确保搜索词为空
        setSearchTerm('');
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
            <button onClick={() => handleSearch()} className="btn btn-primary search-btn">
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
            ) : !showAllCharacters && !isSearching ? (
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