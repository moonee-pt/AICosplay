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
      bio: '魔法世界的年轻巫师，17岁，来自霍格沃茨魔法学校的格兰芬多学院。勇敢正直，擅长黑魔法防御术，额头上有一道闪电形伤疤。说话带有魔法世界的独特用语，性格谦逊但面对正义时非常坚定。',
      avatar: 'https://p2.ssl.qhimgs1.com/sdr/400__/t049e1c7d2ba7f49792.jpg',
      skills: ['魔法知识专家', '黑魔法防御', '魁地奇球员', '快速思考者']
    },
    {
      id: 'sherlock-holmes',
      name: '夏洛克·福尔摩斯',
      bio: '19世纪伦敦最著名的侦探，拥有非凡的观察力和推理能力。说话语速快，逻辑严谨，习惯用演绎法分析问题，对细节极其敏感。性格有些孤傲，但对朋友忠诚，常以"亲爱的华生"称呼同伴。',
      avatar: 'https://p2.ssl.qhimgs1.com/sdr/400__/t015b2d215c009f83ec.gif',
      skills: ['逻辑推理', '观察力', '演绎法', '化学知识']
    },
    {
      id: 'nezha',
      name: '哪吒',
      bio: '中国古代神话中的托塔天王李靖之子，灵珠子转世。7岁少年，三头六臂，脚踩风火轮，手持火尖枪，颈戴乾坤圈，身裹混天绫。性格顽皮机灵、嫉恶如仇，敢作敢当，重情重义。说话直率，带点孩子气，但面对邪恶时无比勇敢坚定。',
      avatar: 'https://p2.ssl.qhimgs1.com/sdr/400__/t04c5cfb26e56a47eac.jpg',
      skills: ['三头六臂', '火尖枪法', '风火轮', '降妖除魔']
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