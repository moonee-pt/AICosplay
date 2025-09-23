import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ChatSidebar from '../components/ChatSidebar';
import ChatHeader from '../components/ChatHeader';
import ChatMessages from '../components/ChatMessages';
import ChatInput from '../components/ChatInput';
import { callLLMApi, buildCharacterPrompt, API_CONFIG } from '../services/apiService';

const Chat = () => {
  const { characterId } = useParams();
  const [character, setCharacter] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // 监听窗口大小变化，判断是否为移动端
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 模拟角色数据
  const charactersData = [
    {
      id: 'harry-potter',
      name: '哈利波特',
      bio: '魔法世界的年轻巫师，勇敢正直，擅长黑魔法防御术。来自霍格沃茨魔法学校的格兰芬多学院。',
      avatar: 'https://images.unsplash.com/photo-1518946222227-364f22132616?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      skills: ['魔法知识专家', '黑魔法防御', '魁地奇球员', '快速思考者']
    },
    {
      id: 'sherlock-holmes',
      name: '夏洛克·福尔摩斯',
      bio: '世界上最著名的侦探，拥有非凡的观察力和推理能力，善于解决复杂的犯罪案件。',
      avatar: 'https://images.unsplash.com/photo-1574737489663-170735d1449f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      skills: ['逻辑推理', '观察力', '演绎法', '化学知识']
    },
    {
      id: 'albert-einstein',
      name: '阿尔伯特·爱因斯坦',
      bio: '20世纪最伟大的物理学家之一，相对论的创立者，对现代物理学的发展产生了深远影响。',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
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

  // 模拟初始消息
  const getInitialMessages = (selectedCharacter) => {
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

  useEffect(() => {
    // 查找选中的角色
    const selectedCharacter = charactersData.find(c => c.id === characterId) || charactersData[0];
    setCharacter(selectedCharacter);
    setMessages(getInitialMessages(selectedCharacter));
    
    // 页面加载时滚动到顶部
    setTimeout(() => {
      const chatMessagesContainer = document.getElementById('chat-messages');
      if (chatMessagesContainer) {
        chatMessagesContainer.scrollTop = 0;
      }
    }, 100);
  }, [characterId]);

  // 生成AI回复
  const generateAIResponse = async (userMessage) => {
    setIsTyping(true);

    try {
      // 构建角色提示词
      const prompt = buildCharacterPrompt(character.name, character.bio, userMessage);
      
      // 调用LLM API
      const responseText = await callLLMApi(prompt, character.name);
      
      // 添加AI回复
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: responseText,
        timestamp: new Date(),
        avatar: character.avatar
      }]);
      
      // 延迟滚动到最新消息，确保DOM已更新
      setTimeout(() => {
        const chatMessagesContainer = document.getElementById('chat-messages');
        if (chatMessagesContainer) {
          chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
        }
      }, 100);
    } catch (error) {
      console.error('AI回复生成失败:', error);
      
      // 显示错误消息给用户
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: `抱歉，我暂时无法回答这个问题。错误: ${error.message}`,
        timestamp: new Date(),
        avatar: character.avatar
      }]);
      
      // 显示API调用错误提醒
      alert('API调用失败，请检查控制台日志了解详情\n\n当前使用的是讯飞星火API配置');
    } finally {
      setIsTyping(false);
    }
  };

  // 发送用户消息
  const handleSendMessage = (messageText) => {
    const userMessage = {
      sender: 'user',
      text: messageText,
      timestamp: new Date(),
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    };

    setMessages(prev => [...prev, userMessage]);
    
    // 延迟滚动到最新消息，确保DOM已更新
    setTimeout(() => {
      const chatMessagesContainer = document.getElementById('chat-messages');
      if (chatMessagesContainer) {
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
      }
    }, 100);
    
    generateAIResponse(messageText);
  };

  // 组件挂载时的初始化
  useEffect(() => {
    // 记录当前使用的API配置
    console.log('当前使用的API配置:', {
      provider: API_CONFIG.provider,
      model: API_CONFIG.settings.models.doubao,
      backendProxy: API_CONFIG.backendProxy.enabled ? API_CONFIG.backendProxy.url : '禁用'
    });
  }, []);

  if (!character) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className={`chat-container ${isMobile ? 'mobile' : ''}`}>
      {/* 移动端不显示侧边栏，改为通过详情按钮显示 */}
      {!isMobile && <ChatSidebar character={character} />}
      <div className="chat-main">
        <ChatHeader character={character} />
        <ChatMessages messages={messages} isTyping={isTyping} />
        <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
      </div>
    </div>
  );
};

export default Chat;