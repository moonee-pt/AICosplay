import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import CustomAICreator from '../components/CustomAICreator';
import { getCustomAIs, deleteCustomAI, addCustomAI, updateCustomAI } from '../utils/storage';
import { getRealAvatarUrl } from '../utils/utils.js';
import '../assets/css/custom-ais.css';

const CustomAIsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [customAIs, setCustomAIs] = useState([]);
  const [showCreator, setShowCreator] = useState(false);
  const [editingAI, setEditingAI] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // 加载自定义AI列表和检查路由状态
  useEffect(() => {
    const loadCustomAIs = () => {
      const savedCustomAIs = getCustomAIs();
      setCustomAIs(savedCustomAIs);
    };

    loadCustomAIs();

    // 检查是否有通过路由状态传入的编辑数据
    if (location.state?.editAI) {
      setEditingAI(location.state.editAI);
      setShowCreator(true);
    }
  }, [location.state]);

  // 处理添加或更新自定义AI
  const handleAddCustomAI = (newAI) => {
    if (editingAI) {
      // 如果是编辑模式，更新现有AI
      updateCustomAI(newAI);
    } else {
      // 如果是创建模式，添加新AI
      addCustomAI(newAI);
    }
    const updatedAIs = getCustomAIs();
    setCustomAIs(updatedAIs);
    setShowCreator(false);
    setEditingAI(null);
  };

  // 处理删除自定义AI
  const handleDeleteAI = (aiId) => {
    if (window.confirm('确定要删除这个自定义AI吗？此操作不可恢复。')) {
      deleteCustomAI(aiId);
      const updatedAIs = getCustomAIs();
      setCustomAIs(updatedAIs);
    }
  };

  // 处理编辑自定义AI
  const handleEditAI = (ai) => {
    setEditingAI(ai);
    setShowCreator(true);
  };

  // 处理开始对话
  const handleStartChat = (ai) => {
    navigate(`/chat/${ai.id}`, {
      state: { customAI: ai }
    });
  };

  // 点击页面其他地方时关闭下拉菜单
  useEffect(() => {
    const handleGlobalClick = () => {
      setOpenDropdownId(null);
    };

    document.addEventListener('click', handleGlobalClick);
    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, []);

  return (
    <div className="custom-ais-page">
      <div className="container">
        {/* 页面头部 */}
        <div className="page-header">
          <div className="header-left">
            <Link to="/" className="back-button">
              <i className="fas fa-arrow-left"></i>
              <span>返回首页</span>
            </Link>
            <h1>我的自定义AI</h1>
          </div>
          <button
            className="btn btn-primary create-ai-btn"
            onClick={() => setShowCreator(true)}
          >
            <i className="fas fa-plus"></i>
            <span>创建新AI</span>
          </button>
        </div>

        {/* 自定义AI列表 */}
        {customAIs.length > 0 ? (
          <div className="custom-ais-grid">
            {customAIs.map((ai) => (
              <div key={ai.id} className="custom-ai-card">
                <div className="ai-avatar">
                  {getRealAvatarUrl(ai.avatar) ? (
                    <img src={getRealAvatarUrl(ai.avatar)} alt={ai.name} />
                  ) : (
                    <div className="avatar-placeholder">
                      <i className="fas fa-user-robot"></i>
                    </div>
                  )}
                </div>
                <div className="ai-info">
                  <h3>{ai.name}</h3>
                  <p className="ai-identity">{ai.identity}</p>
                  <p className="ai-bio">
                    {ai.background ? (
                      ai.background.length > 80 
                        ? `${ai.background.substring(0, 80)}...` 
                        : ai.background
                    ) : (
                      '暂无背景信息'
                    )}
                  </p>
                  
                  {/* 技能标签 */}
                  {ai.skills && ai.skills.length > 0 && (
                    <div className="ai-skills">
                      {ai.skills.slice(0, 3).map((skill, index) => (
                        <span key={index} className="skill-tag">
                          {skill}
                        </span>
                      ))}
                      {ai.skills.length > 3 && (
                        <span className="skill-more">+{ai.skills.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
                
                {/* 操作按钮 */}
                <div className="ai-actions">
                  <button
                    className="btn chat-btn"
                    onClick={() => handleStartChat(ai)}
                  >
                    <i className="fas fa-comment-dots"></i>
                    对话
                  </button>
                  <div className="action-dropdown">
                    <button 
                      className="action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdownId(openDropdownId === ai.id ? null : ai.id);
                      }}
                    >
                      <i className="fas fa-ellipsis-v"></i>
                    </button>
                    <div 
                      className="dropdown-menu"
                      style={{ 
                        minWidth: '100px', 
                        right: '-10px',
                        display: openDropdownId === ai.id ? 'block' : 'none'
                      }}
                    >
                      <button onClick={() => handleEditAI(ai)}>
                        <i className="fas fa-edit"></i>
                        编辑
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteAI(ai.id)}
                      >
                        <i className="fas fa-trash"></i>
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-custom-ais">
            <div className="empty-icon">
              <i className="fas fa-user-robot"></i>
            </div>
            <h2>还没有创建自定义AI</h2>
            <p>点击上方的"创建新AI"按钮，开始创建属于你的AI角色吧！</p>
            <button
              className="btn btn-primary"
              onClick={() => setShowCreator(true)}
            >
              <i className="fas fa-plus"></i>
              创建第一个AI
            </button>
          </div>
        )}
      </div>

      {/* 创建/编辑自定义AI弹窗 */}
      {showCreator && (
        <CustomAICreator
          initialData={editingAI}
          onAddCustomAI={handleAddCustomAI}
          onClose={() => {
            setShowCreator(false);
            setEditingAI(null);
          }}
        />
      )}
    </div>
  );
};

export default CustomAIsPage;