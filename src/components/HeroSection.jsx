import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="hero">
      <div className="hero-bg"></div>
      <div className="hero-content">
        <h1><i className="fas fa-magic"></i> 探索无限可能的AI角色扮演世界</h1>
        <p>与来自不同次元的角色进行真实对话，体验沉浸式的交流体验</p>
        <div className="cta-buttons">
          <Link to="/search" className="btn btn-primary">
            <i className="fas fa-compass"></i> 开始探索
          </Link>
          <a href="#about-section" className="btn btn-secondary">
            <i className="fas fa-info-circle"></i> 了解更多
          </a>
        </div>
        
        {/* 装饰性图标 */}
        <div className="hero-decorations">
          <i className="fas fa-robot"></i>
          <i className="fas fa-user-secret"></i>
          <i className="fas fa-chess"></i>
          <i className="fas fa-microchip"></i>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;