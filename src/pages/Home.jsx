import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import CharactersSection from '../components/CharactersSection';
import FeaturesSection from '../components/FeaturesSection';
import { getCustomAIs } from '../utils/storage';
import CharacterCard from '../components/CharacterCard';
import ParticlesBackground from '../components/ParticlesBackground';

const Home = () => {
  const [customAIs, setCustomAIs] = useState([]);
  
  useEffect(() => {
    // 加载用户自定义AI
    const loadCustomAIs = () => {
      const savedCustomAIs = getCustomAIs();
      setCustomAIs(savedCustomAIs);
    };
    
    loadCustomAIs();
  }, []);
  
  return (
    <div className="home-page">
      <HeroSection />
      <CharactersSection />
      
      {/* 用户自定义AI部分 */}
      {customAIs.length > 0 && (
        <section className="characters-section">
          <ParticlesBackground particleCount={40} colors={['#60a5fa', '#a78bfa']} />
          <div className="container">
            <h2>我的自定义AI</h2>
            <p>与您创建的专属AI进行交流</p>
            <div className="characters-grid">
              {customAIs.map(ai => (
                <CharacterCard key={ai.id} character={{
                  id: ai.id,
                  name: ai.name,
                  bio: ai.background || '这是一个自定义AI角色',
                  avatar: ai.avatar,
                  skills: ai.skills || []
                }} />
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* 女生群聊功能入口 */}
      <section className="characters-section girls-chat-section">
        <div className="container">
          <h2>群聊挑战</h2>
          <p>加入不同背景群聊，挑战通关吧(目前只有一个，敬请期待)</p>
          <div className="characters-grid">
            <div className="character-card girls-chat-card">
              <div className="character-image">
                <img 
                  src="https://placehold.co/300x300/pink/white?text=302" 
                  alt="302卧谈会"
                />
              </div>
              <h3>302卧谈会</h3>
              <p>闺蜜专属私密小群，一起劝恋爱脑闺蜜分手，体验真实的群聊互动...</p>
              <Link 
                to="/girls-group-chat" 
                className="btn btn-primary character-btn"
              >
                <i className="fas fa-users"></i> 加入群聊
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      <FeaturesSection />
      
      {/* 关于我们部分 - 直接集成到首页 */}
      <section id="about-section" className="about-section">
        <div className="container">
          <h1>关于我们</h1>
          <div className="about-content">
            <div className="about-text">
              <h2>AI角色扮演平台</h2>
              <p>
                我们致力于为用户提供一个沉浸式的AI角色扮演体验平台，让您能够与来自不同次元、不同领域的知名角色进行真实对话。
              </p>
              <p>
                通过先进的大语言模型技术，我们的AI能够以角色的身份和语气与您交流，回答您的问题，分享角色的知识和见解。
              </p>
            </div>
            <div className="about-image">
              <img src="https://images.unsplash.com/photo-1593642532400-2682810df593?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="AI角色扮演平台" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;