import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../assets/css/user-profile.css';
import { 
  getFavorites, 
  saveFavorites, 
  getChatHistory, 
  clearChatHistory,
  getUserInfo,
  saveUserInfo
} from '../utils/storage';

const Profile = () => {
  const navigate = useNavigate();
  
  // 用户信息状态
  const [userInfo, setUserInfo] = useState({
    name: '访客用户',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    email: ''
  });
  
  // 收藏的角色 & 历史对话
  const [favorites, setFavorites] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  
  // 上传头像相关状态
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  
  // 加载本地存储数据（用户信息、收藏、历史）
  useEffect(() => {
    // 1. 加载用户信息
    const savedUserInfo = getUserInfo();
    setUserInfo(savedUserInfo);
    
    // 2. 加载收藏的角色（从工具函数获取，确保数据同步）
    const savedFavorites = getFavorites();
    setFavorites(savedFavorites);
    
    // 3. 加载历史对话（从工具函数获取，确保数据同步）
    const savedChatHistory = getChatHistory();
    setChatHistory(savedChatHistory);
  }, []);
  
  // 处理头像上传预览（选择图片后实时显示）
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) { // 只允许图片文件
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result); // 预览图赋值
      };
      reader.readAsDataURL(file); // 转为base64格式
    }
  };
  
  // 保存用户信息（含头像修改）
  const handleSaveUserInfo = () => {
    // 若有新头像预览图，用预览图更新头像；否则保留原头像
    const updatedUserInfo = avatarPreview 
      ? { ...userInfo, avatar: avatarPreview }
      : userInfo;
    
    // 使用统一的存储函数保存用户信息
    const saveSuccess = saveUserInfo(updatedUserInfo);
    
    if (saveSuccess) {
      // 更新状态
      setUserInfo(updatedUserInfo);
      
      // 重置头像上传状态（清空选择的文件和预览图）
      setAvatarFile(null);
      setAvatarPreview(null);
      
      // 触发用户信息更新事件，通知其他组件（如Chat组件）
      const event = new CustomEvent('userInfoUpdated', {
        detail: { userInfo: updatedUserInfo }
      });
      document.dispatchEvent(event);
      
      // 提示用户保存成功
      alert('个人信息保存成功！');
    } else {
      alert('保存失败，请稍后重试。');
    }
  };
  
  // 移除收藏（点击收藏项的"×"按钮触发）
  const removeFavorite = (characterId) => {
    // 1. 过滤掉要删除的收藏项
    const updatedFavorites = favorites.filter(fav => fav.id !== characterId);
    // 2. 更新状态 + 同步到本地存储
    setFavorites(updatedFavorites);
    saveFavorites(updatedFavorites);
  };
  
  // 清空历史对话（点击"清空历史"按钮触发）
  const handleClearHistory = () => {
    // 二次确认，防止误操作
    if (window.confirm('确定要清空所有对话历史吗？此操作不可恢复！')) {
      // 1. 清空状态 + 同步到本地存储
      setChatHistory([]);
      clearChatHistory();
    }
  };
  
  // 格式化时间（显示"刚刚"/"XX分钟前"/"XX小时前"/日期）
  const formatDate = (timestamp) => {
    if (!timestamp) return '未知时间';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000); // 时间差（秒）
    
    if (diffInSeconds < 60) {
      return '刚刚';
    } else if (diffInSeconds < 3600) { // 小于1小时
      return `${Math.floor(diffInSeconds / 60)}分钟前`;
    } else if (diffInSeconds < 86400) { // 小于1天
      return `${Math.floor(diffInSeconds / 3600)}小时前`;
    } else { // 大于等于1天，显示本地日期
      return date.toLocaleDateString();
    }
  };
  
  // 跳转到对应角色的聊天页（点击收藏项/历史项触发）
  const goToChat = (characterId) => {
    navigate(`/chat/${characterId}`); // 路由跳转，携带角色ID
  };
  
  return (
    <div className="profile-container">
      {/* 顶部返回按钮 + 标题 */}
      <div className="profile-header">
        <Link to="/" className="back-button">
          <i className="fas fa-arrow-left"></i>
          <span>返回首页</span>
        </Link>
        <h1>个人中心</h1>
        <div className="header-right"></div> {/* 占位，保持布局对称 */}
      </div>
      
      <div className="profile-content">
        {/* 1. 个人信息区域（头像 + 用户名 + 确认按钮） */}
        <div className="profile-section">
          <h3>个人信息</h3>
          
          <div className="avatar-upload-section">
            {/* 一行布局：头像、名字、确认按钮 */}
            <div className="user-info-row">
              {/* 头像预览区 */}
              <div className="avatar-preview">
                <img 
                  src={avatarPreview || userInfo.avatar} 
                  alt="用户头像" 
                  className="user-avatar-large"
                  loading="lazy" // 懒加载，优化性能
                />
                {/* 鼠标悬浮显示"更换头像"按钮 */}
                <div className="avatar-upload-overlay">
                  <label className="avatar-upload-label">
                    <i className="fas fa-camera"></i>
                    <span>更换头像</span>
                    {/* 隐藏的文件选择框，点击label触发 */}
                    <input 
                      type="file" 
                      accept="image/*" // 只允许图片类型
                      onChange={handleAvatarChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </div>
              
              {/* 用户名输入框 */}
              <div className="user-name-input">
                <input 
                      type="text" 
                      value={userInfo.name} 
                      onChange={(e) => setUserInfo({...userInfo, name: e.target.value})}
                      placeholder="请输入用户名"
                      className="form-input"
                    />
              </div>
              
              {/* 保存按钮 - 移到名字右边 */}
              <button 
                className="save-btn" 
                onClick={handleSaveUserInfo}
                disabled={!avatarPreview && userInfo.name === '访客用户'}
              >
                保存修改
              </button>
            </div>
          </div>
        </div>
        
        {/* 2. 收藏的角色区域 */}
        <div className="profile-section">
          <div className="section-header">
            <h3>收藏的角色</h3>
            <span className="section-count">{favorites.length}</span> {/* 显示收藏数量 */}
          </div>
          
          {/* 收藏列表（有数据则渲染网格，无数据则显示空状态） */}
          {favorites.length > 0 ? (
            <div className="favorites-grid">
              {favorites.map(fav => (
                <div key={fav.id} className="favorite-item" onClick={() => goToChat(fav.id)}>
                  {/* 取消收藏按钮（鼠标悬浮显示） */}
                  <button 
                    className="remove-favorite-btn"
                    onClick={(e) => {
                      e.stopPropagation(); // 阻止事件冒泡（避免触发跳转）
                      removeFavorite(fav.id);
                    }}
                    title="取消收藏"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                  {/* 角色头像 */}
                  <img 
                    src={fav.avatar} 
                    alt={fav.name} 
                    className="favorite-avatar"
                    loading="lazy"
                  />
                  {/* 角色名称 */}
                  <p className="favorite-name">{fav.name}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <i className="fas fa-heart-broken"></i>
              <p>暂无收藏的角色</p>
              <p className="empty-hint">在聊天页点击"⭐"可收藏角色</p>
            </div>
          )}
        </div>
        
        {/* 3. 历史对话区域 */}
        <div className="profile-section">
          <div className="section-header">
            <h3>历史对话</h3>
            {/* 清空历史按钮 */}
            <button 
              className="clear-history-btn" 
              onClick={handleClearHistory}
              disabled={chatHistory.length === 0} // 无历史时禁用
            >
              清空历史
            </button>
          </div>
          
          {/* 历史列表（有数据则渲染列表，无数据则显示空状态） */}
          {chatHistory.length > 0 ? (
            <div className="chat-history-list">
              {chatHistory.map(chat => (
                <div 
                  key={chat.id} 
                  className="chat-history-item"
                  onClick={() => goToChat(chat.characterId)}
                >
                  {/* 角色头像 */}
                  <img 
                    src={chat.characterAvatar} 
                    alt={chat.characterName} 
                    className="chat-history-avatar"
                    loading="lazy"
                  />
                  {/* 对话信息（角色名 + 最后一条消息 + 时间） */}
                  <div className="chat-history-info">
                    <h4 className="chat-character-name">{chat.characterName}</h4>
                    <p className="last-message">
                      {chat.lastMessage.length > 20 
                        ? `${chat.lastMessage.slice(0, 20)}...` // 消息过长时截断
                        : chat.lastMessage}
                    </p>
                    <span className="chat-time">{formatDate(chat.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <i className="fas fa-history"></i>
              <p>暂无对话历史</p>
              <p className="empty-hint">与角色聊天后将显示历史记录</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;