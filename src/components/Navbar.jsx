import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUserInfo } from '../utils/storage';
import CharacterDetailModal from './CharacterDetailModal';
import { getRealAvatarUrl } from '../utils/utils.js';

const Navbar = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [userInfo, setUserInfo] = useState({});

  // 加载用户信息并监听更新
  useEffect(() => {
    const loadUserInfo = () => {
      const info = getUserInfo();
      setUserInfo(info);
    };

    // 初始加载
    loadUserInfo();

    // 监听用户信息更新事件
    const handleUserInfoUpdate = (event) => {
      console.log('Navbar组件接收到用户信息更新事件:', event);
      if (event.detail && event.detail.userInfo) {
        // 直接使用事件传递的最新用户信息
        console.log('Navbar从事件中获取的用户信息:', event.detail.userInfo);
        setUserInfo(event.detail.userInfo);
      }
    };

    document.addEventListener('userInfoUpdated', handleUserInfoUpdate);

    // 组件卸载时移除监听
    return () => {
      document.removeEventListener('userInfoUpdated', handleUserInfoUpdate);
    };
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
              <span className="logo-text">AI Chat</span>
            </Link>
            <div className="mobile-header-links">
              <Link to="/custom-ais" className="home-link">
                <i className="fas fa-user-cog"></i>
                <span>我的自定义AI</span>
              </Link>
              {/* 移动端：在首页旁边放用户头像 */}
              <Link 
                to="/profile" 
                className="user-avatar-btn mobile-avatar"
                title={userInfo.name}
              >
                <img 
                  src={getRealAvatarUrl(userInfo.avatar)} 
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
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
            />
            <button type="submit" onClick={handleSearch}>
              <i className="fas fa-search"></i>
            </button>
          </div>
          
          {/* 右侧链接 - 桌面端显示 */}
          <div className="nav-links desktop-nav">
              <Link to="/custom-ais" className="nav-link">
                <i className="fas fa-user-cog"></i>
                <span>我的自定义AI</span>
              </Link>
            <div className="user-profile">
              <Link 
                to="/profile" 
                className="user-avatar-btn"
                title={userInfo.name}
              >
                <img 
                  src={getRealAvatarUrl(userInfo.avatar)} 
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