import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  // 监听路由变化，当路由改变时清空搜索框
  useEffect(() => {
    if (location.pathname !== '/search') {
      setSearchQuery('');
    }
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // 保存当前滚动位置
      const scrollPosition = window.scrollY;
      localStorage.setItem('scrollPosition', scrollPosition.toString());
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="logo-container">
          <div className="logo">
            AI角色扮演
          </div>
          <Link to="/" className="home-link">
            <i className="fas fa-home"></i> 返回主页
          </Link>
        </div>
        
        {/* 搜索框 */}
        <div className="search-bar navbar-search-bar">
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="搜索角色或对话..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit">
              <i className="fas fa-search"></i>
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;