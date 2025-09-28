import { useState, useRef, useEffect, memo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ChatSidebar from '../components/ChatSidebar';
import ChatHeader from '../components/ChatHeader';
import ChatMessages from '../components/ChatMessages';
import ChatInput from '../components/ChatInput';
import CustomAICreator from '../components/CustomAICreator';
import { callLLMApi, buildCharacterPrompt } from '../services/apiService';

// 格式化文件大小工具函数
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 导入本地存储工具函数
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
} from '../utils/storage';

// 优化1：用memo包裹父组件，减少不必要的重新渲染
const Chat = memo(() => {
  const { characterId } = useParams(); // 从路由获取角色ID
  const navigate = useNavigate(); // 路由导航工具
  const [character, setCharacter] = useState(null); // 当前选中的角色
  const [messages, setMessages] = useState([]); // 聊天消息列表
  const [isTyping, setIsTyping] = useState(false); // AI是否正在输入
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768); // 是否为移动端
  const [isFavorited, setIsFavorited] = useState(false); // 角色是否被收藏
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // 编辑自定义AI的模态框是否打开
  const scrollTimeoutRef = useRef(null); // 滚动定时器引用（避免频繁滚动）
  const [userInfo, setUserInfo] = useState(null); // 用户信息（头像、昵称等）

  // 预定义角色数据
  const charactersData = [
    {      id: 'harry-potter',      name: '哈利波特',      bio: '魔法世界的年轻巫师，勇敢正直，擅长黑魔法防御术。来自霍格沃茨魔法学校的格兰芬多学院。',      avatar: 'https://p2.ssl.qhimgs1.com/sdr/400__/t049e1c7d2ba7f49792.jpg',      skills: ['魔法知识专家', '黑魔法防御', '魁地奇球员']    },
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
      id: 'nezha',
      name: '哪吒',
      bio: '中国古代神话中的托塔天王李靖之子，灵珠子转世。7岁少年，三头六臂，脚踩风火轮，手持火尖枪，颈戴乾坤圈，身裹混天绫。性格顽皮机灵、嫉恶如仇，敢作敢当，重情重义。',
      avatar: 'https://p2.ssl.qhimgs1.com/sdr/400__/t04c5cfb26e56a47eac.jpg',
      skills: ['三头六臂', '火尖枪法', '风火轮', '降妖除魔']
    }
  ];

  // 监听窗口大小变化，更新移动端状态
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    // 组件卸载时移除监听
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 获取用户信息 + 监听用户信息更新事件
  useEffect(() => {
    // 初始化：从本地存储获取用户信息
    const loadUserInfo = () => {
      const info = getUserInfo();
      setUserInfo(info);
    };

    loadUserInfo();

    // 监听用户信息更新（如修改头像后触发）
  const handleUserInfoUpdate = (event) => {
    console.log('Chat组件接收到用户信息更新事件:', event);
    if (event.detail && event.detail.userInfo) {
      // 直接使用事件传递的最新用户信息
      console.log('从事件中获取的用户信息:', event.detail.userInfo);
      setUserInfo(event.detail.userInfo);
      
      // 当用户头像更新时，同步更新所有历史消息中的用户头像
      if (event.detail.userInfo?.avatar) {
        console.log('检测到头像更新，更新所有历史消息中的头像');
        
        // 1. 获取当前角色的消息并更新头像
        setMessages(prevMessages => {
          const updatedMessages = prevMessages.map(msg => {
            // 只更新用户消息的头像
            if (msg.sender === 'user') {
              console.log('更新消息头像:', msg.id || '匿名消息');
              return {
                ...msg,
                avatar: event.detail.userInfo.avatar
              };
            }
            return msg;
          });
          // 保存更新后的当前角色消息到本地存储
          if (character && character.id) {
            console.log('保存更新后的当前角色消息到本地存储，角色ID:', character.id);
            saveChatMessages(character.id, updatedMessages);
          }
          return updatedMessages;
        });
        
        // 2. 更新所有其他角色的历史消息头像（确保历史记录也更新）
        try {
          // 获取所有角色的聊天记录
          const allMessagesRaw = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
          if (allMessagesRaw) {
            const allMessages = JSON.parse(allMessagesRaw);
            let hasChanges = false;
            
            // 遍历所有角色的消息
            Object.keys(allMessages).forEach(charId => {
              // 跳过当前角色（已在上面处理）
              if (character && character.id === charId) return;
              
              // 更新该角色消息中的用户头像
              const updatedMessagesForChar = allMessages[charId].map(msg => {
                if (msg.sender === 'user' && msg.avatar !== event.detail.userInfo.avatar) {
                  hasChanges = true;
                  return {
                    ...msg,
                    avatar: event.detail.userInfo.avatar
                  };
                }
                return msg;
              });
              
              // 保存更新后的消息
              allMessages[charId] = updatedMessagesForChar;
            });
            
            // 如果有任何消息被更新，则保存回本地存储
            if (hasChanges) {
              console.log('更新了其他角色的聊天记录头像');
              localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(allMessages));
            }
          }
        } catch (error) {
          console.error('更新所有历史消息头像时出错:', error);
        }
      }
    }
  };

    // 监听“打开用户资料页”事件（从ChatMessages触发）
    const handleOpenUserProfile = () => {
      navigate('/profile'); // 跳转到用户资料路由
    };

    // 绑定事件监听
    document.addEventListener('userInfoUpdated', handleUserInfoUpdate);
    document.addEventListener('openUserProfile', handleOpenUserProfile);

    // 组件卸载时移除监听（避免内存泄漏）
    return () => {
      document.removeEventListener('userInfoUpdated', handleUserInfoUpdate);
      document.removeEventListener('openUserProfile', handleOpenUserProfile);
    };
  }, [navigate]);

  // 生成初始消息（根据角色类型返回不同欢迎语）
  const getInitialMessages = (selectedCharacter) => {
    // 自定义AI的初始消息
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

    // 预定义角色的初始消息
    const welcomeMessages = {
      'harry-potter': '你好！我是哈利波特。欢迎来到魔法世界！有什么我可以帮助你的吗？',
      'sherlock-holmes': '晚上好，亲爱的朋友。我是夏洛克·福尔摩斯。有什么谜题需要我帮你解决吗？',
      'albert-einstein': '你好，很高兴见到你。我是阿尔伯特·爱因斯坦。关于宇宙的奥秘，你有什么问题吗？',
      'nezha': '嘿！我是哪吒！三头六臂，脚踩风火轮，手持火尖枪！你想聊点什么？要不要一起降妖除魔？哈！'
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

  // 初始化角色和聊天消息（根据路由参数加载对应角色）
  useEffect(() => {
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    
    // 1. 优先加载自定义AI（如果角色ID是自定义类型）
    let selectedCharacter = null;
    if (characterId && characterId.startsWith('custom-ai-')) {
      const customAIs = getCustomAIs(); // 从本地存储获取所有自定义AI
      selectedCharacter = customAIs.find(ai => ai.id === characterId);
    }
    
    // 2. 若不是自定义AI，加载预定义角色
    if (!selectedCharacter) {
      selectedCharacter = charactersData.find(c => c.id === characterId) || charactersData[0];
    }
    
    // 3. 更新角色状态
    setCharacter(selectedCharacter);
    
    // 4. 加载聊天记录（优先从本地存储恢复，无记录则用初始消息）
    const savedMessages = getChatMessages(selectedCharacter.id);
    if (savedMessages && savedMessages.length > 0) {
      setMessages(savedMessages);
    } else {
      setMessages(getInitialMessages(selectedCharacter));
    }
    
    // 5. 检查角色是否被收藏
    const favorites = getFavorites();
    setIsFavorited(!!favorites.find(f => f.id === selectedCharacter.id));
    
    // 6. 滚动到聊天顶部（兼容异步DOM更新，用定时器和requestAnimationFrame确保生效）
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
    
    // 组件卸载时清除定时器
    return () => clearTimeout(scrollTimeoutRef.current);
  }, [characterId]); // 仅当角色ID变化时重新执行

  // 打开自定义AI编辑模态框（仅自定义AI可编辑）
  const handleEditCharacter = () => {
    if (character && character.isCustom) {
      setIsEditModalOpen(true);
    }
  };

  // 关闭自定义AI编辑模态框
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  // 处理自定义AI的更新（保存到本地存储并刷新角色状态）
  const handleUpdateCustomAI = async (updatedAI) => {
    try {
      console.log('开始更新自定义AI，ID:', updatedAI.id);
      
      // 头像数据预处理
      console.log('头像数据类型:', typeof updatedAI.avatar);
      console.log('头像数据长度:', updatedAI.avatar?.length);
      console.log('头像数据前50字符:', updatedAI.avatar?.substring(0, 50));
      
      // 确保头像数据不为空
      if (!updatedAI.avatar || typeof updatedAI.avatar !== 'string') {
        console.error('头像数据无效:', updatedAI.avatar);
        updatedAI.avatar = 'https://p1.ssl.qhimgs1.com/sdr/400__/t0434d803873b80c6a1.png'; // 设置默认头像
      }
      
      // 检查是否为DataURL格式的大型头像
      const isLargeDataUrl = updatedAI.avatar.startsWith('data:image/') && 
                            updatedAI.avatar.length > 100000; // 大于100KB
      
      if (isLargeDataUrl) {
        console.warn('检测到大型DataURL头像，准备特殊处理');
        // 为大头像创建临时会话存储键
        const tempAvatarKey = `temp_avatar_${updatedAI.id}`;
        
        try {
          // 尝试直接保存头像到sessionStorage
          sessionStorage.setItem(tempAvatarKey, updatedAI.avatar);
          console.log('已将头像单独保存到sessionStorage');
          
          // 在主数据中保存头像引用而非完整数据
          const aiWithAvatarRef = {
            ...updatedAI,
            avatar: `session:${tempAvatarKey}` // 使用特殊前缀标识这是sessionStorage中的头像
          };
          
          // 获取所有自定义AI并更新
          const allCustomAIs = getCustomAIs(); 
          const updatedCustomAIs = allCustomAIs.map(ai => 
            ai.id === aiWithAvatarRef.id ? aiWithAvatarRef : ai
          );
          
          // 特殊处理：如果是编辑模式但找不到匹配的AI，则添加为新AI
          if (allCustomAIs.findIndex(ai => ai.id === updatedAI.id) === -1) {
            console.warn('找不到匹配的AI ID，将作为新AI添加');
            updatedCustomAIs.push(aiWithAvatarRef);
          }
          
          // 保存更新后的列表
          const saveResult = saveCustomAIs(updatedCustomAIs);
          console.log('保存结果:', saveResult);
          
          // 立即重新加载以验证保存成功
          setTimeout(() => {
            const reloadedAIs = getCustomAIs();
            let reloadedAI = reloadedAIs.find(ai => ai.id === updatedAI.id);
            
            // 如果头像使用了引用，从sessionStorage中恢复
            if (reloadedAI && reloadedAI.avatar && reloadedAI.avatar.startsWith('session:')) {
              const avatarKey = reloadedAI.avatar.substring(8); // 移除'session:'前缀
              const realAvatar = sessionStorage.getItem(avatarKey);
              if (realAvatar) {
                reloadedAI = { ...reloadedAI, avatar: realAvatar };
                console.log('已成功从sessionStorage恢复头像数据');
              }
            }
            
            console.log('重新加载后的AI:', reloadedAI);
            console.log('重新加载的头像数据类型:', reloadedAI ? typeof reloadedAI.avatar : 'null');
            
            // 更新当前聊天的角色
            setCharacter(reloadedAI || updatedAI);
            
            // 强制组件重新渲染
            setTimeout(() => {
              window.location.reload();
            }, 300);
          }, 100);
          
        } catch (sessionError) {
          console.error('使用sessionStorage单独保存头像失败:', sessionError);
          // 回退到常规保存方式
          await handleRegularSave(updatedAI);
        }
      } else {
        // 常规大小的头像，使用标准保存方式
        await handleRegularSave(updatedAI);
      }
      
      setIsEditModalOpen(false); // 关闭模态框
    } catch (error) {
      console.error('更新自定义AI失败:', error);
      alert('更新失败，请稍后再试\n' + error.message);
    }
  };
  
  // 处理常规保存逻辑
  const handleRegularSave = async (updatedAI) => {
    try {
      // 获取所有自定义AI
      const allCustomAIs = getCustomAIs(); 
      
      // 查找并替换旧的AI数据
      const updatedCustomAIs = allCustomAIs.map(ai => 
        ai.id === updatedAI.id ? updatedAI : ai
      );
      
      // 特殊处理：如果是编辑模式但找不到匹配的AI，则添加为新AI
      if (allCustomAIs.findIndex(ai => ai.id === updatedAI.id) === -1) {
        console.warn('找不到匹配的AI ID，将作为新AI添加');
        updatedCustomAIs.push(updatedAI);
      }
      
      // 使用优化后的saveCustomAIs函数保存数据
      const saveResult = saveCustomAIs(updatedCustomAIs);
      console.log('常规保存结果:', saveResult);
      
      // 立即重新加载以验证保存成功
      setTimeout(() => {
        const reloadedAIs = getCustomAIs();
        const reloadedAI = reloadedAIs.find(ai => ai.id === updatedAI.id);
        console.log('常规保存后重新加载的AI:', reloadedAI);
        
        // 更新当前聊天的角色
        setCharacter(reloadedAI || updatedAI);
        
        // 强制组件重新渲染
        setTimeout(() => {
          window.location.reload();
        }, 300);
      }, 100);
      
    } catch (error) {
      console.error('常规保存失败:', error);
      throw error;
    }
  };

  // 切换角色收藏状态（添加/移除收藏）
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

  // 生成AI回复（调用LLM API + 处理文件消息）
  const generateAIResponse = async (userMessage, fileMessage = null) => {
    setIsTyping(true); // 开启“正在输入”状态
    try {
      let prompt;
      let fileInfo = ''; // 存储文件相关信息（用于拼接prompt）

      // 处理用户上传的文件（图片/普通文件）
      if (fileMessage) {
        if (fileMessage.type.startsWith('image/')) {
          fileInfo = `\n注意：用户上传了一张图片：${fileMessage.name}，请提及已收到图片并根据图片内容进行回应。`;
        } else {
          fileInfo = `\n注意：用户上传了一个文件：${fileMessage.name}（${formatFileSize(fileMessage.size)}），文件类型：${fileMessage.type}。`;
        }
      }

      // 构建AI提示词（区分自定义AI和预定义AI）
      if (character.isCustom) {
        prompt = buildCharacterPrompt(
          character.name,
          character.instructions, // 自定义AI的专属指令
          userMessage + fileInfo,
          character.skills ? character.skills.join('、') : ''
        );
      } else {
        prompt = buildCharacterPrompt(character.name, character.bio, userMessage + fileInfo);
      }

      // 调用LLM API获取回复
      const responseText = await callLLMApi(prompt, character.name);

      // 构造AI消息对象
      const newAIMessage = {
        sender: 'ai',
        text: responseText,
        timestamp: new Date(),
        avatar: character.avatar,
        isCallMode: false // 电话模式已移除，固定为false
      };

      // 更新消息列表并保存到本地存储
      setMessages(prev => {
        const newMessages = [...prev, newAIMessage];
        saveCurrentMessages(newMessages);
        return newMessages;
      });

      // 滚动到最新消息（兼容DOM异步更新）
      setTimeout(() => {
        const container = document.getElementById('chat-messages');
        if (container) container.scrollTop = container.scrollHeight;
      }, 100);

    } catch (error) {
      // 错误处理：添加错误提示消息
      console.error('AI回复生成失败:', error);
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: `抱歉，我暂时无法回答这个问题。错误: ${error.message}`,
        timestamp: new Date(),
        avatar: character.avatar
      }]);
      alert('API调用失败，请检查控制台日志了解详情\n\n当前使用的是讯飞星火API配置');
    } finally {
      setIsTyping(false); // 关闭“正在输入”状态
    }
  };

  // 处理用户发送消息（文本/文件）
  const handleSendMessage = (messageText, fileMessage = null) => {
    // 用用户头像（本地存储优先，无则用默认头像）
    const userAvatar = userInfo?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
    
    // 构造用户消息对象
    const userMessage = {
      sender: 'user',
      text: messageText,
      timestamp: new Date(),
      avatar: userAvatar,
      ...(fileMessage && { file: fileMessage }) // 若有文件，添加文件信息
    };

    // 更新消息列表并保存到本地存储
    setMessages(prev => {
      const newMessages = [...prev, userMessage];
      saveCurrentMessages(newMessages);
      return newMessages;
    });

    // 更新历史对话记录（用于侧边栏展示）
    updateChatHistory(character, messageText);

    // 滚动到最新消息
    setTimeout(() => {
      const container = document.getElementById('chat-messages');
      if (container) container.scrollTop = container.scrollHeight;
    }, 100);

    // 触发AI回复生成
    generateAIResponse(messageText, fileMessage);
  };

  // 点击“返回”按钮（回到角色选择页）
  const handleBack = () => {
    navigate('/');
  };

  // 清空当前聊天记录（弹窗确认 + 本地存储清理）
  const handleClearChat = () => {
    if (character && window.confirm('确定要清空当前对话吗？此操作不可恢复。')) {
      clearChatMessages(character.id); // 清空本地存储的聊天记录
      setMessages(getInitialMessages(character)); // 重置为初始消息
      // 滚动到顶部
      const container = document.getElementById('chat-messages');
      if (container) container.scrollTop = 0;
    }
  };

  // 角色未加载完成时显示“加载中”
  if (!character) {
    return <div className="loading">加载中...</div>;
  }

  // 自定义AI的聊天背景样式（支持图片/颜色）
  const getChatBackgroundStyle = () => {
    if (!character?.background) return {};
    
    // 判断背景是否为URL（图片）
    const isUrl = character.background.startsWith('http://') || 
                 character.background.startsWith('https://') ||
                 character.background.startsWith('url(');
    
    if (isUrl) {
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
      // 背景为颜色值（如#fff、rgb(255,255,255)）
      return {
        backgroundColor: character.background,
        backgroundImage: 'none'
      };
    }
  };

  // 组件最终渲染返回（完整DOM结构）
  return (
    <div className={`chat-container ${isMobile ? 'mobile' : ''}`}>
      {/* 非移动端显示侧边栏（角色信息、清空聊天等） */}
      {!isMobile && <ChatSidebar 
        character={{
          ...character,
          // 自定义AI的bio替换为背景描述（适配侧边栏显示）
          bio: character?.isCustom && character?.background ? character.background : character?.bio
        }} 
        onClearChat={handleClearChat} 
      />}
      
      {/* 聊天主区域（头部、消息列表、输入框） */}
      <div 
        className="chat-main"
        // 自定义AI应用背景样式，预定义角色无特殊背景
        style={character?.isCustom ? getChatBackgroundStyle() : {}}
      >
        {/* 聊天头部（角色名称、收藏、编辑、返回等） */}
        <ChatHeader 
          character={character} 
          isFavorited={isFavorited} 
          onToggleFavorite={handleToggleFavorite}
          onEdit={handleEditCharacter}
          onClearChat={handleClearChat}
          onBack={handleBack}
        />
        
        {/* 关键修复：ChatMessages添加稳定key，防止莫名卸载 */}
        <ChatMessages 
          key="chat-messages-static" 
          messages={messages} 
          isTyping={isTyping} 
          characterVoice={character?.voice} 
        />
        
        {/* 聊天输入框（文本输入） */}
        <ChatInput 
          onSendMessage={handleSendMessage} 
          disabled={isTyping} // AI输入时禁用输入框
        />
      </div>
      
      {/* 自定义AI编辑模态框（仅自定义AI且打开模态框时显示） */}
      {isEditModalOpen && character && character.isCustom && (
        <CustomAICreator 
          onAddCustomAI={handleUpdateCustomAI} // 提交更新后的AI数据
          onClose={handleCloseEditModal} // 关闭模态框
          initialData={character} // 传入当前AI数据（用于编辑回显）
        />
      )}
    </div>
  );
});

// 修复路由参数比较逻辑，确保自定义AI创建后能正确进入聊天界面
const chatAreEqual = (prevProps, nextProps) => {
  // 严格比较路由参数，确保任何变化都能触发重新渲染
  return JSON.stringify(prevProps) === JSON.stringify(nextProps);
};

// 导出优化后的父组件（memo包裹+自定义比较逻辑）
export default memo(Chat, chatAreEqual);