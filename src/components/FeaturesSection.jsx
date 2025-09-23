import React from 'react';

const FeaturesSection = () => {
  const features = [
    {
      icon: 'fa-search',
      title: '角色搜索',
      description: '快速查找您喜爱的角色，支持多维度筛选和关键词搜索'
    },
    {
      icon: 'fa-user-astronaut',
      title: '角色扮演',
      description: 'AI将以角色的身份和语气与您交流，提供沉浸式体验'
    },
    {
      icon: 'fa-microphone',
      title: '语音交互',
      description: '支持语音输入和朗读功能，让交流更加自然流畅'
    },
    {
      icon: 'fa-headset',
      title: '情感理解',
      description: 'AI能够理解并回应用户的情感表达，提供更贴心的对话体验'
    }
  ];

  return (
    <section className="features-section">
      <div className="container">
        <h2>我们的功能</h2>
        <p>提供多种强大功能，让您的AI角色扮演体验更加丰富</p>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-item">
              <div className="feature-icon">
                <i className={`fas ${feature.icon}`}></i>
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;