import React, { useState, useEffect } from 'react';
import '../assets/css/user-profile.css';

const UserProfileModal = ({ isOpen, onClose }) => {
  // 用户信息状态
  const [userInfo, setUserInfo] = useState({
    name: '',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    email: ''
  });
  
  // 收藏的角色
  const [favorites, setFavorites] = useState([]);
  
  // 历史对话
  const [chatHistory, setChatHistory] = useState([]);
  
  // 上传头像的状态
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  
  // 模态框动画状态
  const [isVisible, setIsVisible] = useState(false);

  // 当模态框打开/关闭时处理动画
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // 加载用户信息
      loadUserInfo();
      // 加载收藏的角色
      loadFavorites();
      // 加载历史对话
      loadChatHistory();
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  // 模拟加载用户信息
  const loadUserInfo = () => {
    const savedUserInfo = localStorage.getItem('userInfo');
    if (savedUserInfo) {
      setUserInfo(JSON.parse(savedUserInfo));
    } else {
      // 默认用户信息
      const defaultInfo = {
        name: '访客用户',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
        email: ''
      };
      setUserInfo(defaultInfo);
    }
  };

  // 模拟加载收藏的角色
  const loadFavorites = () => {
    const savedFavorites = localStorage.getItem('favoriteCharacters');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    } else {
      // 默认收藏的角色（模拟数据）
      setFavorites([
        {
          id: 'harry-potter',
          name: '哈利波特',
          avatar: 'https://p2.ssl.qhimgs1.com/sdr/400__/t049e1c7d2ba7f49792.jpg'
        },
        {
          id: 'sherlock-holmes',
          name: '夏洛克·福尔摩斯',
          avatar: 'https://p2.ssl.qhimgs1.com/sdr/400__/t015b2d215c009f83ec.gif'
        }
      ]);
    }
  };

  // 模拟加载历史对话
  const loadChatHistory = () => {
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
      setChatHistory(JSON.parse(savedHistory));
    } else {
      // 默认历史对话（模拟数据）
      setChatHistory([
        {
          id: '1',
          characterId: 'harry-potter',
          characterName: '哈利波特',
          characterAvatar: 'https://p2.ssl.qhimgs1.com/sdr/400__/t049e1c7d2ba7f49792.jpg',
          lastMessage: '欢迎来到魔法世界！',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: '2',
          characterId: 'sherlock-holmes',
          characterName: '夏洛克·福尔摩斯',
          characterAvatar: 'https://p2.ssl.qhimgs1.com/sdr/400__/t015b2d215c009f83ec.gif',
          lastMessage: '有什么谜题需要我帮你解决吗？',
          timestamp: new Date(Date.now() - 7200000).toISOString()
        }
      ]);
    }
  };

  // 保存用户信息
  const saveUserInfo = () => {
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
    // 如果有新头像文件，这里可以添加上传逻辑
    if (avatarFile) {
      // 模拟上传头像
      console.log('上传头像:', avatarFile);
      // 重置头像文件状态
      setAvatarFile(null);
      setAvatarPreview(null);
    }
    alert('用户信息已保存！');
  };

  // 处理用户信息变更
  const handleUserInfoChange = (field, value) => {
    setUserInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 处理头像上传
  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 检查文件类型
      if (!file.type.match('image.*')) {
        alert('请选择图片文件！');
        return;
      }
      
      setAvatarFile(file);
      // 创建预览
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarPreview(event.target.result);
        setUserInfo(prev => ({
          ...prev,
          avatar: event.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // 移除收藏
  const removeFavorite = (characterId) => {
    const updatedFavorites = favorites.filter(fav => fav.id !== characterId);
    setFavorites(updatedFavorites);
    localStorage.setItem('favoriteCharacters', JSON.stringify(updatedFavorites));
  };

  // 清除历史对话
  const clearHistory = () => {
    if (window.confirm('确定要清除所有历史对话吗？')) {
      setChatHistory([]);
      localStorage.removeItem('chatHistory');
    }
  };

  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    if (diffDays === 1) {
      return '昨天';
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else {
      return date.toLocaleDateString('zh-CN');
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`user-profile-modal-overlay ${isVisible ? 'visible' : ''}`} onClick={onClose}>
      <div className={`user-profile-modal ${isVisible ? 'visible' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>个人中心</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="modal-content">
          {/* 用户信息编辑区 */}
          <div className="profile-section">
            <h3>基本信息</h3>
            <div className="avatar-upload-section">
              <div className="avatar-preview">
                <img 
                  src={avatarPreview || userInfo.avatar} 
                  alt="用户头像"
                  className="user-avatar-large"
                />
                <div className="avatar-upload-overlay">
                  <input 
                    type="file" 
                    id="avatar-upload" 
                    accept="image/*" 
                    onChange={handleAvatarUpload}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="avatar-upload" className="avatar-upload-label">
                    <i className="fas fa-camera"></i>
                    <span>更换头像</span>
                  </label>
                </div>
              </div>
              
              <div className="user-info-form">
                <div className="form-group">
                  <label htmlFor="user-name">用户名</label>
                  <input 
                    type="text" 
                    id="user-name" 
                    value={userInfo.name} 
                    onChange={(e) => handleUserInfoChange('name', e.target.value)}
                    placeholder="请输入用户名"
                  />
                </div>
                <button className="save-btn" onClick={saveUserInfo}>
                  保存信息
                </button>
              </div>
            </div>
          </div>

          {/* 收藏的角色 */}
          <div className="profile-section">
            <div className="section-header">
              <h3>我的收藏</h3>
              <span className="section-count">{favorites.length}</span>
            </div>
            <div className="favorites-grid">
              {favorites.length > 0 ? (
                favorites.map(character => (
                  <div key={character.id} className="favorite-item">
                    <img src={character.avatar} alt={character.name} className="favorite-avatar" />
                    <span className="favorite-name">{character.name}</span>
                    <button 
                      className="remove-favorite-btn" 
                      onClick={() => removeFavorite(character.id)}
                      title="取消收藏"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <i className="fas fa-heart-broken"></i>
                  <p>还没有收藏任何角色</p>
                </div>
              )}
            </div>
          </div>

          {/* 历史对话 */}
          <div className="profile-section">
            <div className="section-header">
              <h3>历史对话</h3>
              {chatHistory.length > 0 && (
                <button className="clear-history-btn" onClick={clearHistory}>
                  清空历史
                </button>
              )}
            </div>
            <div className="chat-history-list">
              {chatHistory.length > 0 ? (
                chatHistory.map(chat => (
                  <div key={chat.id} className="chat-history-item">
                    <img src={chat.characterAvatar} alt={chat.characterName} className="chat-history-avatar" />
                    <div className="chat-history-info">
                      <h4>{chat.characterName}</h4>
                      <p className="last-message">{chat.lastMessage}</p>
                      <span className="chat-time">{formatDate(chat.timestamp)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <i className="fas fa-history"></i>
                  <p>还没有对话记录</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;