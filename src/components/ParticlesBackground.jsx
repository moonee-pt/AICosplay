import { useEffect, useRef } from 'react';

// 为粒子背景添加样式
const style = document.createElement('style');
style.textContent = `
  .particles-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    pointer-events: none;
  }
  
  .particle {
    position: absolute;
    border-radius: 50%;
    animation: float 8s infinite ease-in-out;
  }
  
  @keyframes float {
    0%, 100% {
      transform: translateY(0) translateX(0);
      opacity: 0.7;
    }
    50% {
      transform: translateY(-25px) translateX(15px);
      opacity: 1;
    }
  }
`;

if (!document.head.contains(style)) {
  document.head.appendChild(style);
}

const ParticlesBackground = ({ particleCount = 40, colors = ['#60a5fa', '#a78bfa'] }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 清空现有粒子
    containerRef.current.innerHTML = '';

    // 创建新粒子
    for (let i = 0; i < particleCount; i++) {
      createParticle();
    }

    function createParticle() {
      const particle = document.createElement('div');
      particle.className = 'particle';
      
      // 1. 随机粒子大小（扩大半径：15-30px）
      const size = Math.random() * 15 + 15;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;

      // 2. 随机粒子位置（容器内任意位置）
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      particle.style.left = `${x}%`;
      particle.style.top = `${y}%`;

      // 3. 随机动画延迟（0-6s，避免粒子同步移动）
      particle.style.animationDelay = `${Math.random() * 6}s`;

      // 4. 随机动画时长（增加移动速度：4-8s）
      const duration = Math.random() * 4 + 4;
      particle.style.animationDuration = `${duration}s`;

      // 5. 随机颜色和发光效果
      const color = colors[Math.floor(Math.random() * colors.length)];
      particle.style.background = `radial-gradient(circle, ${color}dd 0%, ${color}20 70%)`;
      
      containerRef.current.appendChild(particle);
    }

    // 定期清理和创建新粒子
    const intervalId = setInterval(() => {
      if (!containerRef.current) return;
      
      // 移除一些旧粒子
      const particles = containerRef.current.querySelectorAll('.particle');
      if (particles.length > particleCount) {
        const particlesToRemove = particles.length - particleCount;
        for (let i = 0; i < particlesToRemove; i++) {
          const randomIndex = Math.floor(Math.random() * particles.length);
          particles[randomIndex].remove();
        }
      }
      
      // 创建新粒子补充
      const currentParticles = containerRef.current.querySelectorAll('.particle');
      const neededParticles = particleCount - currentParticles.length;
      for (let i = 0; i < neededParticles; i++) {
        createParticle();
      }
    }, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, [particleCount, colors]);

  return <div className="particles-container" ref={containerRef}></div>;
};

export default ParticlesBackground;