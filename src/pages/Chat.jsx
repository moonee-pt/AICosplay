import React, { useState, useRef, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import ChatSidebar from '../components/ChatSidebar';
import ChatHeader from '../components/ChatHeader';
import ChatMessages from '../components/ChatMessages';
import ChatInput from '../components/ChatInput';
import CustomAICreator from '../components/CustomAICreator';
import { callLLMApi, buildCharacterPrompt, API_CONFIG } from '../services/apiService';

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
import { 
  getFavorites, 
  toggleFavoriteCharacter, 
  updateChatHistory,
  getCustomAIs,
  saveCustomAIs,
  getChatMessages,
  saveChatMessages,
  clearChatMessages,
  getUserInfo,
  saveUserInfo
} from '../utils/storage';

const Chat = () => {
  const { characterId } = useParams();
  const navigate = useNavigate();
  const [character, setCharacter] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const scrollTimeoutRef = useRef(null);
  const [userInfo, setUserInfo] = useState(null);

  // 角色数据
  const charactersData = [
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
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      skills: ['放射性研究', '化学', '物理学', '坚韧不拔']
    }
  ];

  // 监听窗口大小
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 获取用户信息并监听用户信息更新事件
  useEffect(() => {
    // 获取用户信息
    const info = getUserInfo();
    setUserInfo(info);

    // 监听用户信息更新事件
    const handleUserInfoUpdate = (event) => {
      if (event.detail && event.detail.userInfo) {
        setUserInfo(event.detail.userInfo);
        // 更新所有现有消息的用户头像
        setMessages(prev => prev.map(msg => 
          msg.sender === 'user' 
            ? { ...msg, avatar: event.detail.userInfo.avatar } 
            : msg
        ));
      }
    };

    // 监听打开用户信息模态框的事件
    const handleOpenUserProfile = () => {
      // 跳转到用户信息页面
      navigate('/profile');
    };

    // 添加事件监听器
    document.addEventListener('userInfoUpdated', handleUserInfoUpdate);
    document.addEventListener('openUserProfile', handleOpenUserProfile);

    return () => {
      // 移除事件监听器
      document.removeEventListener('userInfoUpdated', handleUserInfoUpdate);
      document.removeEventListener('openUserProfile', handleOpenUserProfile);
    };
  }, [navigate]);

  // 获取初始消息
  const getInitialMessages = (selectedCharacter) => {
    // 检查是否为自定义AI
    if (selectedCharacter?.isCustom) {
      return [
        {
          sender: 'ai',
          text: `你好！我是${selectedCharacter.name}。我可以为你提供帮助！`,
          timestamp: new Date(),
          avatar: selectedCharacter.avatar
        }
      ];
    }

    const welcomeMessages = {
      'harry-potter': '你好！我是哈利波特。欢迎来到魔法世界！有什么我可以帮助你的吗？',
      'sherlock-holmes': '晚上好，亲爱的朋友。我是夏洛克·福尔摩斯。有什么谜题需要我帮你解决吗？',
      'albert-einstein': '你好，很高兴见到你。我是阿尔伯特·爱因斯坦。关于宇宙的奥秘，你有什么问题吗？',
      'marie-curie': '你好，我是玛丽·居里。科学的世界充满了无限可能，你想了解些什么？'
    };

    return [
      {
        sender: 'ai',
        text: welcomeMessages[selectedCharacter?.id] || '你好！我是你的AI助手。',
        timestamp: new Date(),
        avatar: selectedCharacter?.avatar || 'https://images.unsplash.com/photo-1518946222227-364f22132616?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
      }
    ];
  };

  // 初始化角色和消息
  useEffect(() => {
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    
    // 首先检查是否为自定义AI
    let selectedCharacter = null;
    if (characterId && characterId.startsWith('custom-ai-')) {
      const customAIs = getCustomAIs();
      selectedCharacter = customAIs.find(ai => ai.id === characterId);
    }
    
    // 如果不是自定义AI或未找到，使用预定义角色
    if (!selectedCharacter) {
      selectedCharacter = charactersData.find(c => c.id === characterId) || charactersData[0];
    }
    
    setCharacter(selectedCharacter);
    
    // 尝试从本地存储中恢复对话记录
    const savedMessages = getChatMessages(selectedCharacter.id);
    if (savedMessages && savedMessages.length > 0) {
      setMessages(savedMessages);
    } else {
      // 如果没有保存的记录，使用初始消息
      setMessages(getInitialMessages(selectedCharacter));
    }
    
    // 检查收藏状态
    const favorites = getFavorites();
    setIsFavorited(!!favorites.find(f => f.id === selectedCharacter.id));
    
    // 滚动到顶部
    const scrollToTop = () => {
      const container = document.getElementById('chat-messages');
      if (container) container.scrollTop = 0;
    };
    
    scrollToTop();
    requestAnimationFrame(scrollToTop);
    scrollTimeoutRef.current = setTimeout(() => {
      scrollToTop();
      requestAnimationFrame(scrollToTop);
    }, 200);
    
    return () => clearTimeout(scrollTimeoutRef.current);
  }, [characterId]);

  // 编辑当前AI角色 - 在当前页面显示编辑模态框
  const handleEditCharacter = () => {
    if (character && character.isCustom) {
      // 打开编辑模态框，设置要编辑的AI数据
      setIsEditModalOpen(true);
    }
  };

  // 关闭编辑模态框
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  // 处理更新自定义AI
  const handleUpdateCustomAI = (updatedAI) => {
    try {
      // 获取所有自定义AI
      const allCustomAIs = getCustomAIs();
      // 找到并更新当前AI
      const updatedCustomAIs = allCustomAIs.map(ai => 
        ai.id === updatedAI.id ? updatedAI : ai
      );
      // 保存更新后的自定义AI列表
      saveCustomAIs(updatedCustomAIs);
      // 更新当前聊天中的角色数据
      setCharacter(updatedAI);
      // 关闭模态框
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('更新自定义AI失败:', error);
      alert('更新失败，请稍后再试');
    }
  };

  // 切换收藏
  const handleToggleFavorite = () => {
    if (!character) return;
    
    const updatedFavorites = toggleFavoriteCharacter(character);
    setIsFavorited(!!updatedFavorites.find(f => f.id === character.id));
  };

  // 保存聊天消息到本地存储
  const saveCurrentMessages = (currentMessages) => {
    if (character) {
      saveChatMessages(character.id, currentMessages);
    }
  };

  // 生成AI回复
  const generateAIResponse = async (userMessage, fileMessage = null) => {
    setIsTyping(true);
    try {
      let prompt;
      // 处理文件消息
      let fileInfo = '';
      if (fileMessage) {
        if (fileMessage.type.startsWith('image/')) {
          fileInfo = '\n注意：用户上传了一张图片：' + fileMessage.name + '，请提及已收到图片并根据图片内容进行回应。';
        } else {
          fileInfo = '\n注意：用户上传了一个文件：' + fileMessage.name + '（' + formatFileSize(fileMessage.size) + '），文件类型：' + fileMessage.type + '。';
        }
      }
      
      // 为自定义AI构建特殊的提示词
      if (character.isCustom) {
        prompt = buildCharacterPrompt(
          character.name, 
          character.instructions, 
          userMessage + fileInfo, 
          character.skills ? character.skills.join('、') : ''
        );
      } else {
        prompt = buildCharacterPrompt(character.name, character.bio, userMessage + fileInfo);
      }
      const responseText = await callLLMApi(prompt, character.name);
      
      setMessages(prev => {
        const newMessages = [...prev, {
          sender: 'ai',
          text: responseText,
          timestamp: new Date(),
          avatar: character.avatar
        }];
        saveCurrentMessages(newMessages);
        return newMessages;
      });
      
      setTimeout(() => {
        const container = document.getElementById('chat-messages');
        if (container) container.scrollTop = container.scrollHeight;
      }, 100);
    } catch (error) {
      console.error('AI回复生成失败:', error);
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: `抱歉，我暂时无法回答这个问题。错误: ${error.message}`,
        timestamp: new Date(),
        avatar: character.avatar
      }]);
      alert('API调用失败，请检查控制台日志了解详情\n\n当前使用的是讯飞星火API配置');
    } finally {
      setIsTyping(false);
    }
  };

  // 发送消息
  const handleSendMessage = (messageText, fileMessage = null) => {
    // 使用存储的用户头像，如果没有则使用默认头像
    const userAvatar = userInfo?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
    
    const userMessage = {
      sender: 'user',
      text: messageText,
      timestamp: new Date(),
      avatar: userAvatar,
      ...(fileMessage && { file: fileMessage })
    };

    setMessages(prev => {
      const newMessages = [...prev, userMessage];
      saveCurrentMessages(newMessages);
      return newMessages;
    });
    
    // 更新历史对话
    updateChatHistory(character, messageText);
    
    // 滚动到最新消息
    setTimeout(() => {
      const container = document.getElementById('chat-messages');
      if (container) container.scrollTop = container.scrollHeight;
    }, 100);
    
    generateAIResponse(messageText, fileMessage);
  };

  // 点击返回按钮
  const handleBack = () => {
    navigate('/');
  };

  // 清空当前对话
  const handleClearChat = () => {
    if (character && window.confirm('确定要清空当前对话吗？此操作不可恢复。')) {
      // 清空本地存储中的对话记录
      clearChatMessages(character.id);
      // 重置消息列表为初始消息
      setMessages(getInitialMessages(character));
      // 滚动到顶部
      const container = document.getElementById('chat-messages');
      if (container) container.scrollTop = 0;
    }
  };

  if (!character) {
    return <div className="loading">加载中...</div>;
  }

  // 设置聊天背景样式
  const getChatBackgroundStyle = () => {
    if (!character?.background) return {};
    
    // 检查是否为URL格式
    const isUrl = character.background.startsWith('http://') || 
                 character.background.startsWith('https://') ||
                 character.background.startsWith('url(');
    
    if (isUrl) {
      // 是URL，设置为背景图片
      const url = character.background.startsWith('url(') 
        ? character.background 
        : `url(${character.background})`;
      
      return {
        backgroundImage: url,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundColor: 'transparent'
      };
    } else {
      // 是颜色值，设置为背景色
      return {
        backgroundColor: character.background,
        backgroundImage: 'none'
      };
    }
  };

  return (
    <div className={`chat-container ${isMobile ? 'mobile' : ''}`}>
      {!isMobile && <ChatSidebar character={{
        ...character,
        bio: character?.isCustom && character?.background ? character.background : character?.bio
      }} onClearChat={handleClearChat} />}
      <div 
        className="chat-main"
        style={character?.isCustom ? getChatBackgroundStyle() : {}}
      >
        <ChatHeader 
          character={character} 
          isFavorited={isFavorited} 
          onToggleFavorite={handleToggleFavorite}
          onEdit={handleEditCharacter}
          onClearChat={handleClearChat}
          onBack={handleBack}
        />
        <ChatMessages messages={messages} isTyping={isTyping} />
        <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
      </div>
      
      {/* 编辑模态框 - 复用自定义AI创建器 */}
      {isEditModalOpen && character && character.isCustom && (
        <CustomAICreator 
          onAddCustomAI={handleUpdateCustomAI}
          onClose={handleCloseEditModal}
          initialData={character}
        />
      )}
    </div>
  );
};

export default Chat;