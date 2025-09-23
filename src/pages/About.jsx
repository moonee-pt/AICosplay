import React from 'react';
import Navbar from '../components/Navbar';

const About = () => {
  return (
    <div className="about-page">
      <Navbar />
      <section className="about-section">
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
              <h2>我们的使命</h2>
              <p>
                我们希望通过AI技术，打破次元壁，让用户能够与自己喜爱的角色进行互动，拓展学习和娱乐的新方式。
              </p>
              <h2>技术特点</h2>
              <ul>
                <li><i className="fas fa-check-circle"></i> 基于先进的大语言模型</li>
                <li><i className="fas fa-check-circle"></i> 精准的角色定位和语气模拟</li>
                <li><i className="fas fa-check-circle"></i> 流畅自然的对话体验</li>
                <li><i className="fas fa-check-circle"></i> 丰富的角色库和持续更新</li>
                <li><i className="fas fa-check-circle"></i> 多平台兼容和响应式设计</li>
              </ul>
            </div>
            <div className="about-image">
              <img src="https://placehold.co/600x400/333/fff?text=AI+Role+Play+Platform" alt="AI角色扮演平台" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;