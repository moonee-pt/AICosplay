import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import BackToTop from './components/BackToTop.jsx';
import Home from './pages/Home.jsx';
import Search from './pages/Search.jsx';
import Chat from './pages/Chat.jsx';
import About from './pages/About.jsx';

// 创建一个包装组件来处理条件渲染
const AppContent = () => {
  const location = useLocation();
  const isChatPage = location.pathname.startsWith('/chat/');
  const [isMobile, setIsMobile] = useState(false);

  // 监听屏幕宽度变化，判断是否为移动设备
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // 初始化
    checkIfMobile();
    // 添加窗口大小变化监听
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // 聊天页面在网页端（非移动端）显示导航栏，移动端不显示
  const showNavbar = !isChatPage || !isMobile;
  // 聊天页面不显示页脚
  const showFooter = !isChatPage;
  // 聊天页面不显示回到顶部按钮
  const showBackToTop = !isChatPage;

  return (
    <div className="app">
      {showNavbar && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/chat/:characterId" element={<Chat />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
      {showFooter && <Footer />}
      {showBackToTop && <BackToTop />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App
