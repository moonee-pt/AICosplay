import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [userInfo, setUserInfo] = useState({
    name: '访客用户',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
  });

  // 加载用户信息
  useEffect(() => {
    const savedUserInfo = localStorage.getItem('userInfo');
    if (savedUserInfo) {
      setUserInfo(JSON.parse(savedUserInfo));
    }
  }, []);

  // 处理搜索
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="container">
          {/* 左侧Logo和首页链接 */}
          <div className="logo-container">
            <Link to="/" className="logo">
              <i className="fas fa-robot"></i>
              <span className="logo-text">AI Cos</span>
            </Link>
            <div className="mobile-header-links">
              <Link to="/custom-ais" className="home-link">
                <i className="fas fa-user-cog"></i>
                <span>自定义AI</span>
              </Link>
              {/* 移动端：在首页旁边放用户头像 */}
              <Link 
                to="/profile" 
                className="user-avatar-btn mobile-avatar"
                title={userInfo.name}
              >
                <img 
                  src={userInfo.avatar} 
                  alt={userInfo.name}
                  className="user-avatar-small" 
                />
              </Link>
            </div>
          </div>
          
          {/* 搜索栏 */}
          <div className="search-bar navbar-search-bar">
            <input
              type="text"
              placeholder="搜索AI角色..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" onClick={handleSearch}>
              <i className="fas fa-search"></i>
            </button>
          </div>
          
          {/* 右侧链接 - 桌面端显示 */}
          <div className="nav-links desktop-nav">
              <Link to="/custom-ais" className="nav-link">
                <i className="fas fa-user-cog"></i>
                <span>自定义AI</span>
              </Link>
            <div className="user-profile">
              <Link 
                to="/profile" 
                className="user-avatar-btn"
                title={userInfo.name}
              >
                <img 
                  src={userInfo.avatar} 
                  alt={userInfo.name}
                  className="user-avatar-small" 
                />
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;