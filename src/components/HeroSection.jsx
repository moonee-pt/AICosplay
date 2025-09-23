import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="hero">
      <div className="hero-bg"></div>
      <div className="hero-content">
        <h1>探索无限可能的AI角色扮演世界</h1>
        <p>与来自不同次元的角色进行真实对话，体验沉浸式的交流体验</p>
        <div className="cta-buttons">
          <Link to="/search" className="btn btn-primary">
            开始探索
          </Link>
          <Link to="/about" className="btn btn-secondary">
            了解更多
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;