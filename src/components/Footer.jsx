import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-info">
                        <Link to="/" className="logo">
                            <i className="fas fa-robot"></i>
                            AI Role Play
                        </Link>
                        <p>
                            与AI角色扮演，探索无限可能。通过我们的平台，您可以与各种虚构角色进行沉浸式对话和互动。
                        </p>
                    </div>

                    <div className="footer-links">
                        <h4>快速链接</h4>
                        <ul>
                            <li><Link to="/">首页</Link></li>
                            <li><Link to="/search">搜索</Link></li>
                            <li><Link to="/about">关于我们</Link></li>
                        </ul>
                    </div>

                    <div className="footer-contact">
                        <h4>联系我们</h4>
                        <p><i className="fas fa-envelope"></i> ptyycc@qq.com</p>
                        <p><i className="fas fa-phone"></i> 18868774768 </p>
                        <p><i className="fas fa-map-marker-alt"></i> 浙江省杭州市</p>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; 2023 AI Role Play. 保留所有权利。</p>
                    <div className="social-links">
                        <a href="#"><i className="fab fa-weibo"></i></a>
                        <a href="#"><i className="fab fa-weixin"></i></a>
                        <a href="#"><i className="fab fa-twitter"></i></a>
                        <a href="#"><i className="fab fa-facebook-f"></i></a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;