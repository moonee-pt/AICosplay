import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/css/girls-group-chat.css';
import ChatHeader from '../components/ChatHeader';
import { buildCharacterPrompt, callLLMApi } from '../services/apiService';
import { getUserInfo } from '../utils/storage';
import { getRealAvatarUrl } from '../utils/utils';

const GirlsGroupChat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [chatStatus, setChatStatus] = useState('ongoing'); // ongoing, hesitating,疏远, cold, ended
  const messagesEndRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // 获取用户信息
  const [userInfo, setUserInfo] = useState(null);

  // 更新用户信息
  useEffect(() => {
    const updateUserInfo = () => {
      const info = getUserInfo();
      setUserInfo(info);
    };

    // 初始获取用户信息
    updateUserInfo();

    // 监听localStorage变化，实现多标签页同步
    const handleStorageChange = (e) => {
      if (e.key === 'userInfo') {
        updateUserInfo();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // 角色信息 - 包含详细性格指令
  const characters = {
    user: {
      name: '我',
      avatar: userInfo?.avatar || 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      role: '闺蜜',
      description: '重情义的好姐妹，积极帮助闺蜜看清感情问题'
    },
    friendB: {
      name: '小柔',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      role: '闺蜜',
      personality: '恋爱脑，总是为男友找借口，但内心深处也有不安。容易被甜言蜜语打动，同时重视闺蜜的意见。说话语气软萌，偶尔带点撒娇，但在压力下会变得防御。',
      speechPatterns: ['哎呀...', '其实他有时候对我挺好的', '可是我还是有点舍不得', '他后来都道歉了', '你们根本就不理解我']
    },
    roommateC: {
      name: '雯雯',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      role: '室友',
      personality: '理性中立，观察力强，善于用事实说话。不会直接批评闺蜜B，但会指出问题所在。希望闺蜜B能看清现实，但尊重她的选择。语气平和，讲道理。',
      speechPatterns: ['我觉得...', '你记得上次吗？', '我们只是担心你', '我观察到一个细节', '其实你自己也有感觉吧']
    }
  };

  // 监听窗口大小变化，更新移动端状态
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // 初始化对话
  useEffect(() => {
    const initialMessages = [
      {
        id: 1,
        content: '嗨姐妹们！今天咱们302卧谈会的主题是...劝小柔（闺蜜B）和她那个男朋友阿杰分手！',
        sender: 'system',
        timestamp: new Date().toISOString()
      },
      {
        id: 2,
        content: '哎呀...你们又要说他的不好了。其实他有时候对我挺好的，上次还给我买了奶茶呢。',
        sender: 'friendB',
        timestamp: new Date().toISOString()
      },
      {
        id: 3,
        content: '可是上次约会他又放你鸽子了，说是临时要加班，结果我看到他朋友圈发了和朋友打游戏的照片！',
        sender: 'roommateC',
        timestamp: new Date().toISOString()
      }
    ];
    
    setMessages(initialMessages);
  }, []);
  
  // 自动滚动到最新消息
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // 改进的文本相似度检查函数 - 使用更准确的算法
  const similarityCheck = (str1, str2) => {
    // 简化版的Levenshtein距离算法
    const matrix = [];
    
    // 空字符串处理
    if (str1.length === 0) return str2.length;
    if (str2.length === 0) return str1.length;
    
    // 创建矩阵
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    // 填充矩阵
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i-1) === str1.charAt(j-1)) {
          matrix[i][j] = matrix[i-1][j-1];
        } else {
          matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, // 替换
                                  Math.min(matrix[i][j-1] + 1, // 插入
                                           matrix[i-1][j] + 1)); // 删除
        }
      }
    }
    
    // 计算相似度百分比
    const distance = matrix[str2.length][str1.length];
    const maxLength = Math.max(str1.length, str2.length);
    return 1 - (distance / maxLength);
  };
  
  // 分析用户消息，提取关键策略和情感
  const analyzeUserMessage = (message) => {
    const lowerMsg = message.toLowerCase();
    return {
      isEmpathetic: lowerMsg.includes('理解') || 
                    lowerMsg.includes('知道') ||
                    lowerMsg.includes('不容易') ||
                    lowerMsg.includes('我懂'),
      hasFacts: lowerMsg.includes('上次') ||
                lowerMsg.includes('记得') ||
                lowerMsg.includes('之前') ||
                lowerMsg.includes('每次'),
      hasBlame: lowerMsg.includes('傻') ||
                lowerMsg.includes('恋爱脑') ||
                lowerMsg.includes('笨') ||
                lowerMsg.includes('不应该'),
      isDirectAttack: lowerMsg.includes('pua') ||
                      lowerMsg.includes('渣男') ||
                      lowerMsg.includes('赶紧分'),
      isSupportive: lowerMsg.includes('永远支持你') ||
                    lowerMsg.includes('无论怎样') ||
                    lowerMsg.includes('尊重你的选择')
    };
  };

  // 根据角色性格生成回应 - 使用LLM API调用
  const generateResponseByPersonality = async (sender, context, userMessage, userAnalysis) => {
    const character = characters[sender];
    
    // 构建对话历史上下文
    const contextSummary = context.map(msg => {
      const senderName = msg.sender === 'user' ? '用户' : characters[msg.sender]?.name || msg.sender;
      return `${senderName}: ${msg.content}`;
    }).join('\n');
    
    // 检查最近的对话内容，避免重复
    const recentContents = messages.slice(-5).map(msg => msg.content);
    const recentContentsStr = recentContents.join('\n');
    
    // 构建角色专属的系统提示词
    let characterPrompt = '';
    if (sender === 'friendB') {
      characterPrompt = `你是${character.name}，一个正在为感情问题纠结的女孩。你的性格特点是：软萌、偶尔撒娇、容易动摇，对感情充满矛盾。\n\n` +
                        `你正和闺蜜（用户）和室友C在302寝室群聊，讨论你的男朋友问题。\n\n` +
                        `当前对话历史：\n${contextSummary}\n\n` +
                        `最近的对话内容（需要避免重复）：\n${recentContentsStr}\n\n` +
                        `请根据对话历史和用户最新消息，自然地回应，一次回答少于30字。保持口语化，符合软萌、纠结的性格特点。\n\n` +
                        `特别注意：\n` +
                        `1. 请确保你的回复与最近的对话内容不重复，不要使用相似的句子结构和表达方式\n` +
                        `2. 不要重复说"我们能不能找个时间，坐下来好好谈谈呢？"或"我们是不是应该先冷静下来，再好好谈一谈？"这种类似的表达\n` +
                        `3. 使用全新的角度和措辞来回应，展示不同的思考和情绪变化\n` +
                        `4. 不要开头说'雯雯'\n` +
                        `5. 不要开头有对用户指令的回答，如'明白了，我会尽量在回复中避免使用类似的句子结构和表达方式。'此类`;
    } else if (sender === 'roommateC') {
      characterPrompt = `你是${character.name}，一个理性、中立、善于观察的女孩。\n\n` +
                        `你正和闺蜜（用户）和朋友B在302寝室群聊，讨论朋友B的男朋友问题。\n\n` +
                        `当前对话历史：\n${contextSummary}\n\n` +
                        `最近的对话内容（需要避免重复）：\n${recentContentsStr}\n\n` +
                        `请根据对话历史和用户最新消息，自然地回应，直接输出回复内容，不要在开头添加角色名字前缀。回复要简短，控制在一句话，最多不超过30字。保持理性、客观，善于观察细节。\n\n` +
                        `特别注意：\n` +
                        `1. 请确保你的回复与最近的对话内容不重复，不要使用相似的句子结构和表达方式\n` +
                        `2. 不要开头说'雯雯'\n` +
                        `3. 使用全新的角度和措辞来回应，提供不同的见解\n` +
                        `4. 不要再开头加入对用户指令的回答，如'明白了，我会尽量在回复中避免使用类似的句子结构和表达方式。'此类`;

    }
    
    try {
      // 调用LLM API获取回复
      let responseText = await callLLMApi(characterPrompt, character.name);
      
      // 客户端重复检查 - 确保回复不重复
      let retryCount = 0;
      const maxRetries = 3;
      
      // 扩大检查范围，检查更多历史消息
      const extendedRecentContents = messages.slice(-10).map(msg => msg.content);
      
      while ((extendedRecentContents.some(content => 
        responseText.includes(content) || 
        similarityCheck(responseText, content) > 0.65 // 降低阈值以提高敏感度
      )) && retryCount < maxRetries) {
        // 使用更自然的重试提示，每次尝试不同的表述
        const retryPrompts = [
          `${characterPrompt}\n\n请从全新的角度和视角来回应，避免任何重复的表达方式。`,
          `${characterPrompt}\n\n尝试用不同的情感和思考方式来回应，不要重复之前说过的话。`,
          `${characterPrompt}\n\n请想象自己是第一次思考这个问题，用全新的语言来表达你的感受。`
        ];
        
        const retryPrompt = retryPrompts[retryCount % retryPrompts.length];
        responseText = await callLLMApi(retryPrompt, character.name);
        retryCount++;
      }
      
      // 如果多次重试后仍然重复，则直接使用备用回复
      if (extendedRecentContents.some(content => 
        responseText.includes(content) || 
        similarityCheck(responseText, content) > 0.65
      )) {
        if (sender === 'friendB') {
          const backups = [
            '我心里好乱...一方面觉得他不够好，可另一方面又放不下我们的回忆。',
            '你们说的那些问题我也知道，可有时候他对我真的很温柔，我该怎么办？',
            '也许我该试着疏远一点，看看自己能不能习惯没有他的日子...',
            '其实我也偷偷想过分手，但每次看到他发来的消息，心就软了下来。'
          ];
          responseText = backups[Math.floor(Math.random() * backups.length)];
        } else {
          const backups = [
            '感情里没有绝对的对错，最重要的是自己开心不开心。',
            '慢慢来，别急着做决定，想清楚自己真正想要的是什么。',
            '其实你心里已经有答案了，只是需要时间来接受而已。',
            '无论你做什么决定，我们都会站在你这边支持你的。'
          ];
          responseText = backups[Math.floor(Math.random() * backups.length)];
        }
      }
      
      // 过滤掉不应出现的系统指令相关文本
      const systemTextsToFilter = ['明白了，我会避免重复', '我会避免重复', '避免重复', '重新生成', '不同的回复'];
      for (const text of systemTextsToFilter) {
        if (responseText.includes(text)) {
          // 如果包含系统指令文本，使用备用回复
          if (sender === 'friendB') {
            const backups = [
              '我心里好乱...一方面觉得他不够好，可另一方面又放不下我们的回忆。',
              '你们说的那些问题我也知道，可有时候他对我真的很温柔，我该怎么办？',
              '也许我该试着疏远一点，看看自己能不能习惯没有他的日子...',
              '其实我也偷偷想过分手，但每次看到他发来的消息，心就软了下来。'
            ];
            responseText = backups[Math.floor(Math.random() * backups.length)];
          } else {
            const backups = [
              '感情里没有绝对的对错，最重要的是自己开心不开心。',
              '慢慢来，别急着做决定，想清楚自己真正想要的是什么。',
              '其实你心里已经有答案了，只是需要时间来接受而已。',
              '无论你做什么决定，我们都会站在你这边支持你的。'
            ];
            responseText = backups[Math.floor(Math.random() * backups.length)];
          }
          break;
        }
      }
      
      // 根据角色性格特点添加个性化修饰，增加对话的生动性
      if (sender === 'friendB' && Math.random() > 0.5) {
        // 闺蜜B的性格特点：软萌、偶尔撒娇、容易动摇
        const endings = ['你说呢？', '对不对？', '我该怎么办？', '好纠结啊...', '唉...', '不知道该怎么办才好'];
        responseText = `${responseText} ${endings[Math.floor(Math.random() * endings.length)]}`;
      }
      
      return responseText;
    } catch (error) {
      console.error('LLM API调用失败:', error);
      // 出错时返回备用回复 - 使用多种变体增加多样性
      if (sender === 'friendB') {
        const backups = [
          '我心里好乱...一方面觉得他不够好，可另一方面又放不下我们的回忆。',
          '你们说的那些问题我也知道，可有时候他对我真的很温柔，我该怎么办？',
          '也许我该试着疏远一点，看看自己能不能习惯没有他的日子...',
          '其实我也偷偷想过分手，但每次看到他发来的消息，心就软了下来。',
          '为什么感情的事这么复杂啊...我真的不知道该怎么选择才好。',
          '有时候我也会想，如果当初没和他在一起，现在会不会更快乐？',
          '他总是说会改，可每次都只是说说而已，我都不知道还能不能相信他了。',
          '我是不是太贪心了？既想要他的好，又接受不了他的不好。'
        ];
        return backups[Math.floor(Math.random() * backups.length)];
      } else {
        const backups = [
          '感情里没有绝对的对错，最重要的是自己开心不开心。',
          '慢慢来，别急着做决定，想清楚自己真正想要的是什么。',
          '其实你心里已经有答案了，只是需要时间来接受而已。',
          '无论你做什么决定，我们都会站在你这边支持你的。',
          '爱自己才是终身浪漫的开始，别因为别人而委屈了自己。',
          '好的感情应该让人感到温暖和安心，而不是焦虑和疲惫。',
          '你值得被好好对待，而不是在一段消耗你的关系里挣扎。',
          '有时候放手不是结束，而是给自己一个新的开始的机会。'
        ];
        return backups[Math.floor(Math.random() * backups.length)];
      }
    }
  };

  // 生成AI回应
  const generateAIResponse = async (userMessage) => {
    setIsThinking(true);
    
    // 分析用户消息
    const userAnalysis = analyzeUserMessage(userMessage);
    
    // 使用局部变量跟踪新的聊天状态
    let newChatStatus = chatStatus;
    
    // 更新聊天状态
    if (userAnalysis.hasBlame && messages.length > 10) {
      newChatStatus = '疏远';
      setChatStatus('疏远');
    } else if (userAnalysis.isDirectAttack && messages.length > 8) {
      newChatStatus = 'cold';
      setChatStatus('cold');
    } else if (userAnalysis.isEmpathetic && userAnalysis.hasFacts && messages.length > 15) {
      newChatStatus = 'ended';
      setChatStatus('ended');
    } else if (userAnalysis.isEmpathetic && messages.length > 12) {
      newChatStatus = 'hesitating';
      setChatStatus('hesitating');
    }
    
    // 准备回应
    let friendBResponse = '';
    let roommateCResponse = '';
    
    try {
      // 模拟思考时间
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
      
      // 特殊状态下的回应 - 对于所有结局状态，都不再发送额外的AI消息
      // 使用局部变量newChatStatus而不是chatStatus，确保立即生效
      if (['ended', 'hesitating', '疏远', 'cold'].includes(newChatStatus)) {
        // 对于结局状态，我们不需要在这里设置friendBResponse
        // 这些状态的响应将由useEffect统一处理或直接在弹窗中显示
        friendBResponse = ''; // 空响应，不添加额外消息
        roommateCResponse = ''; // 空响应，不添加额外消息
      } else {
        // 根据性格生成回应 - 使用await支持异步调用
        const recentMessages = messages.slice(-5); // 获取最近5条消息作为上下文
        friendBResponse = await generateResponseByPersonality('friendB', recentMessages, userMessage, userAnalysis);
        roommateCResponse = await generateResponseByPersonality('roommateC', recentMessages, userMessage, userAnalysis);
      }
      
      // 正常回复流程 - 实现角色回复先后随机顺序
      const responses = [];
      if (friendBResponse) {
        responses.push({
          id: Date.now() + Math.floor(Math.random() * 1000),
          content: friendBResponse,
          sender: 'friendB',
          timestamp: new Date().toISOString()
        });
      }
      if (roommateCResponse && Math.random() > 0.3) {
        responses.push({
          id: Date.now() + Math.floor(Math.random() * 1000) + 1,
          content: roommateCResponse,
          sender: 'roommateC',
          timestamp: new Date().toISOString()
        });
      }
      
      // 随机打乱回复顺序
      if (responses.length > 1) {
        if (Math.random() > 0.5) {
          [responses[0], responses[1]] = [responses[1], responses[0]];
        }
      }
      
      // 依次添加回复，模拟真实对话间隔
      let delay = 0;
      
      // 只要responses数组有内容就添加回复，确保API返回的回复一定会显示在界面上
      if (responses.length > 0) {
        responses.forEach((response, index) => {
          delay += 500 + Math.random() * 200; // 随机间隔500-700ms
          setTimeout(() => {
            setMessages(prev => [...prev, response]);
            if (index === responses.length - 1) {
              setIsThinking(false);
            }
          }, delay);
        });
      } else {
        // 如果没有回复（例如ended状态），直接设置为非思考状态
        setTimeout(() => {
          setIsThinking(false);
        }, 1000);
      }
    } catch (error) {
      console.error('生成AI回应时出错:', error);
      setIsThinking(false);
    }
  };
  
  // 处理发送消息
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!inputText.trim() || isThinking || chatStatus === 'ended') return;
    
    // 添加用户消息
    const userMessage = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      content: inputText.trim(),
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    
    // 生成AI回应
    generateAIResponse(inputText.trim());
  };
  
  // 判断是否需要显示时间（每5条消息或时间间隔超过5分钟显示一次）
  const shouldShowTime = (currentIndex, messages) => {
    if (currentIndex === 0) return true;
    
    const currentTime = new Date(messages[currentIndex].timestamp);
    const prevTime = new Date(messages[currentIndex - 1].timestamp);
    const timeDiff = currentTime - prevTime;
    
    // 每5条消息显示一次，或者时间间隔超过5分钟显示一次
    return timeDiff > 5 * 60 * 1000;
  };
  
  // 渲染消息 - 使用群聊专用类名
  const renderMessage = (message, index) => {
    if (message.sender === 'system') {
      return (
        <div key={message.id} className="system-message">
          <p>{message.content}</p>
        </div>
      );
    }
    
    let senderInfo = {};
    let messageClass = '';
    
    switch (message.sender) {
      case 'user':
        senderInfo = characters.user;
        messageClass = 'user-group-message';
        break;
      case 'friendB':
        senderInfo = characters.friendB;
        messageClass = 'friendb-group-message';
        break;
      case 'roommateC':
        senderInfo = characters.roommateC;
        messageClass = 'roommatec-group-message';
        break;
      default:
        senderInfo = { name: '未知', avatar: '', role: '未知' };
        messageClass = 'other-group-message';
    }
    
    // 格式化发送者名称，添加身份信息
      const formattedSenderName = 
      (senderInfo.name === '雯雯') || (!senderInfo.role || senderInfo.role === '闺蜜') 
        ? senderInfo.name 
        : `${senderInfo.name} (${senderInfo.role})`;
    // 渲染时间分隔符
    const renderTimeGap = () => {
      if (shouldShowTime(index, messages)) {
        const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return (
          <div className="time-gap">
            <span>{time}</span>
          </div>
        );
      }
      return null;
    };
    
    return (
      <React.Fragment key={message.id}>
        {renderTimeGap()}
          <div className={`group-chat-message ${messageClass}`}>
            <div className="group-message-avatar-container">
              <div className="group-message-sender">{formattedSenderName}</div>
              <img 
                src={message.sender === 'user' && userInfo?.avatar ? getRealAvatarUrl(userInfo.avatar) : senderInfo.avatar} 
                alt={senderInfo.name} 
                className="group-message-avatar"
              />
            </div>
            <div className="group-message-content">
              <div className="group-message-text">{message.content}</div>
            </div>
          </div>
      </React.Fragment>
    );
  };
  
  // 渲染群聊概况侧边栏
  const renderGroupChatSidebar = () => {
    if (isMobile) return null; // 移动端不显示侧边栏
    
    return (
      <div className="group-chat-sidebar">
        <div className="sidebar-header">
          <h3>群聊概况</h3>
        </div>
        
        <div className="sidebar-section">
          <h4>群成员 ({Object.keys(characters).length})</h4>
          <div className="member-list">
            {Object.entries(characters).map(([key, char]) => (
              <div key={key} className="member-item">
                <img 
                  src={key === 'user' && userInfo?.avatar ? getRealAvatarUrl(userInfo.avatar) : char.avatar} 
                  alt={char.name} 
                  className="member-avatar" 
                />
                <div className="member-info">
                  <div className="member-name">{char.name}</div>
                  <div className="member-role">{char.role}</div>
                  {char.description && (
                    <div className="member-description">{char.description}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="sidebar-section">
          <h4>聊天状态</h4>
          <div className={`status-indicator status-${chatStatus}`}>
            {chatStatus === 'ongoing' && '💬 聊天进行中'}
            {chatStatus === 'hesitating' && '🤔 闺蜜开始犹豫'}
            {chatStatus === '疏远' && '😔 关系开始疏远'}
            {chatStatus === 'cold' && '❄️ 气氛变得冷淡'}
            {chatStatus === 'ended' && '✅ 对话已结束'}
          </div>
        </div>
        
        <div className="sidebar-section">
          <h4>聊天提示</h4>
          <div className="chat-tips">
            <ul>
              <li>使用共情+事实的方式更有效</li>
              <li>避免直接批评闺蜜或男友</li>
              <li>耐心引导，尊重闺蜜的感受</li>
              <li>留意聊天过程中透露的PUA行为</li>
            </ul>
          </div>
        </div>
        
        <div className="sidebar-section">
          <button 
            className="clear-current-chat-button"
            onClick={() => {
              if (window.confirm('确定要重新开始对话吗？当前对话记录将会被清空。')) {
                resetChat();
              }
            }}
          >
            <i className="fas fa-redo"></i> 重新开始对话
          </button>
        </div>
      </div>
    );
  };
  
  // 控制结局弹窗显示的状态
  const [showEndingModal, setShowEndingModal] = useState(false);

  // 重置聊天函数
  const resetChat = () => {
    setHasAddedEndingMessage(false); // 重置结局消息标记
    const initialMessages = [
      {
        id: 1,
        content: '嗨姐妹们！今天咱们302卧谈会的主题是...劝小柔（闺蜜B）和她那个男朋友阿杰分手！',
        sender: 'system',
        timestamp: new Date().toISOString()
      },
      {
        id: 2,
        content: '哎呀...你们又要说他的不好了。其实他有时候对我挺好的，上次还给我买了奶茶呢。',
        sender: 'friendB',
        timestamp: new Date().toISOString()
      },
      {
        id: 3,
        content: '可是上次约会他又放你鸽子了，说是临时要加班，结果我看到他朋友圈发了和朋友打游戏的照片！',
        sender: 'roommateC',
        timestamp: new Date().toISOString()
      }
    ];
    
    setMessages(initialMessages);
    setChatStatus('normal');
    setInputText('');
    setIsThinking(false);
  };
  
  // 控制是否已经添加了结局消息的状态
  const [hasAddedEndingMessage, setHasAddedEndingMessage] = useState(false);

  // 添加结局消息处理的Effect
  useEffect(() => {
    // 当状态变为非normal状态且还没有添加结局消息时
    if (chatStatus !== 'normal' && !hasAddedEndingMessage) {
      // 定义所有结局状态的消息
      const getEndingMessage = () => {
        // 检查是否已经有对应状态的消息
        const hasStatusMessage = messages.some(msg => 
          msg.sender === 'friendB' && 
          ((chatStatus === 'ended' && 
            (msg.content.includes('应该和他分手了') || 
             msg.content.includes('分手对我们都好') || 
             msg.content.includes('决定...和平分手'))) ||
           (chatStatus === 'hesitating' && msg.content.includes('犹豫')) ||
           (chatStatus === '疏远' && msg.content.includes('不理解')) ||
           (chatStatus === 'cold' && msg.content.includes('换个话题')))
        );
        
        if (!hasStatusMessage) {
          let messageContent = '';
          
          // 根据不同状态选择对应的消息
          if (chatStatus === 'ended') {
            const endings = [
              '你们说得对...我仔细想想，他确实总是让我不开心。也许我真的应该和他分手了。谢谢你们一直陪着我。',
              '经过这次聊天，我终于想通了。一段好的感情不应该让人这么疲惫，也许分手对我们都好。',
              '谢谢你们一直这么耐心地开导我。我决定了，明天就和他好好谈谈，然后和平分手。'
            ];
            messageContent = endings[Math.floor(Math.random() * endings.length)];
          } else if (chatStatus === 'hesitating') {
            const hesitations = [
              '我...我有点犹豫了。也许他真的不像我想的那么好？但我还是有点舍不得...',
              '最近我也在反思，他好像确实有很多让我失望的地方。可毕竟在一起这么久了...',
              '你们的话让我有点清醒了，但要真的放下这段感情，对我来说还是太难了。'
            ];
            messageContent = hesitations[Math.floor(Math.random() * hesitations.length)];
          } else if (chatStatus === '疏远') {
            const defensive = [
              '你们根本就不理解我！他对我的好你们都看不到！我不想再聊这个话题了...',
              '为什么你们总是只看到他的缺点？难道他为我做的那些事情都不算什么吗？',
              '够了！我知道你们是为我好，但请尊重我的选择好吗？'
            ];
            messageContent = defensive[Math.floor(Math.random() * defensive.length)];
          } else if (chatStatus === 'cold') {
            const coldResponses = [
              '好了好了，别说了。他不是你们说的那样...我们换个话题吧。',
              '我现在不想讨论这个问题，让我自己静一静好吗？',
              '也许我们都需要冷静一下，过段时间再聊这个话题吧。'
            ];
            messageContent = coldResponses[Math.floor(Math.random() * coldResponses.length)];
          }
          
          if (messageContent) {
            // 使用时间戳+随机数生成唯一ID，避免重复
            return {
              id: Date.now() + Math.floor(Math.random() * 1000),
              content: messageContent,
              sender: 'friendB',
              timestamp: new Date().toISOString()
            };
          }
        }
        return null;
      };
      
      // 获取结局消息并添加
      const endingMessage = getEndingMessage();
      if (endingMessage) {
        setMessages(prev => [...prev, endingMessage]);
        setHasAddedEndingMessage(true); // 标记已经添加了结局消息
      }
      
      // 确保显示弹窗 - 无论是否添加了消息，都显示弹窗
      // 立即设置showEndingModal为true，然后在3秒后再次确认
      setShowEndingModal(true);
      
      const timer = setTimeout(() => {
        // 再次确认弹窗显示
        setShowEndingModal(true);
      }, 3000);
      
      // 清理定时器
      return () => clearTimeout(timer);
    } else if (chatStatus === 'normal') {
      // 非结局状态时隐藏弹窗并重置标记
      setShowEndingModal(false);
      setHasAddedEndingMessage(false);
    }
  }, [chatStatus, messages, hasAddedEndingMessage]);
  
  // 渲染结局提示
  const renderEndingHint = () => {
    // 只有当showEndingModal为true时才显示弹窗
    if (!showEndingModal) {
      return null;
    }
    
    if (chatStatus === 'ended') {
      return (
        <div className="ending-hint success animate__animated animate__fadeIn animate__bounceIn">
          <div className="ending-modal">
            <div className="ending-modal-content">
              <div className="ending-icon">
                <i className="fas fa-check-circle fa-3x"></i>
              </div>
              <h3>🎉 恭喜！对话圆满结束 🎉</h3>
              <p className="ending-message">闺蜜终于决定分手了！你的共情和事实让她看清了这段关系。</p>
              <div className="ending-stats">
                <p>✨ 你的沟通方式非常有效！</p>
                <p>💖 你成功帮助了闺蜜走出情感困境</p>
              </div>
              <button 
                className="ending-close-btn"
                onClick={() => setChatStatus('normal')}
                // onClick={() => resetChat()}
              >
                太棒了！重新开始
              </button>
            </div>
          </div>
        </div>
      );
    } else if (chatStatus === 'hesitating') {
      return (
        <div className="ending-hint warning animate__animated animate__fadeIn animate__bounceIn">
          <div className="ending-modal">
            <div className="ending-modal-content">
              <div className="ending-icon">
                <i className="fas fa-exclamation-circle fa-3x"></i>
              </div>
              <h3>🤔 闺蜜开始犹豫了 🤔</h3>
              <p className="ending-message">你的引导正在起作用！她开始重新思考这段关系了。</p>
              <div className="ending-stats">
                <p>💪 继续用共情和事实引导她</p>
                <p>💡 她需要时间来做出正确的决定</p>
              </div>
              <button 
                className="ending-close-btn"
                onClick={() => setChatStatus('normal')}
              >
                继续对话
              </button>
            </div>
          </div>
        </div>
      );
    } else if (chatStatus === '疏远') {
      return (
        <div className="ending-hint danger animate__animated animate__fadeIn animate__bounceIn">
          <div className="ending-modal">
            <div className="ending-modal-content">
              <div className="ending-icon">
                <i className="fas fa-times-circle fa-3x"></i>
              </div>
              <h3>😔 沟通遇到阻碍 😔</h3>
              <p className="ending-message">闺蜜觉得不被理解，开始疏远了...你们的沟通方式需要调整。</p>
              <div className="ending-stats">
                <p>❌ 避免评判性的语言</p>
                <p>💭 尝试从她的角度理解问题</p>
                <p>💬 用更温和、支持的方式表达</p>
              </div>
              <button 
                className="ending-close-btn"
                onClick={() => resetChat()}
              >
                重新尝试
              </button>
            </div>
          </div>
        </div>
      );
    } else if (chatStatus === 'cold') {
      return (
        <div className="ending-hint info animate__animated animate__fadeIn animate__bounceIn">
          <div className="ending-modal">
            <div className="ending-modal-content">
              <div className="ending-icon">
                <i className="fas fa-info-circle fa-3x"></i>
              </div>
              <h3>🌡️ 群聊气氛变冷清了 🌡️</h3>
              <p className="ending-message">闺蜜似乎不想继续这个话题，或许现在不是讨论的好时机。</p>
              <div className="ending-stats">
                <p>⏸️ 暂时转移话题</p>
                <p>❤️ 给她一些空间和时间</p>
                <p>🔄 稍后再以更轻松的方式提起</p>
              </div>
              <button 
                className="ending-close-btn"
                onClick={() => resetChat()}
              >
                重新开始
              </button>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="chat-container girls-group-chat">
      {/* 非移动端显示侧边栏 */}
      {renderGroupChatSidebar()}
      
      {/* 聊天主区域 */}
      <div className="chat-main">
        <ChatHeader 
          title="302"
          subtitle="闺蜜专属私密小群 - 无男友在场"
          onBack={() => navigate(-1)}
        />
        
        <div className="chat-messages">
          {messages.map((message, index) => renderMessage(message, index))}
          {isThinking && (
            <div className="thinking-indicator">
              <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {renderEndingHint()}
        
        <form className="chat-input" onSubmit={handleSendMessage}>
          <input
            type="text"
            placeholder="输入你的劝说..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isThinking || chatStatus === 'ended'}
            className="message-input"
          />
          <button 
            type="submit" 
            className="send-button"
            disabled={isThinking || chatStatus === 'ended' || !inputText.trim()}
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </form>
      </div>
    </div>
  );
};

export default GirlsGroupChat;