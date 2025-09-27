// 通用工具函数

/**
 * 获取实际的头像URL，处理sessionStorage中的头像引用
 * @param {string} avatarSrc - 头像源，可以是URL、base64或sessionStorage引用
 * @returns {string} - 实际的头像URL或数据
 */
export const getRealAvatarUrl = (avatarSrc) => {
  if (!avatarSrc) return null;
  
  // 检查是否是sessionStorage中的头像引用
  if (typeof avatarSrc === 'string' && avatarSrc.startsWith('session:')) {
    try {
      const avatarKey = avatarSrc.substring(8); // 移除'session:'前缀
      const realAvatar = sessionStorage.getItem(avatarKey);
      if (realAvatar) {
        return realAvatar;
      }
    } catch (error) {
      console.error('从sessionStorage获取头像失败:', error);
    }
  }
  
  return avatarSrc;
};

/**
 * 从sessionStorage获取头像数据
 * @param {string} avatarKey - 头像在sessionStorage中的键名
 * @returns {string|null} - 头像数据或null
 */
export const getAvatarData = (avatarKey) => {
  try {
    return sessionStorage.getItem(avatarKey);
  } catch (error) {
    console.error('获取头像数据失败:', error);
    return null;
  }
};

/**
 * 格式化时间戳为可读时间
 * @param {string|number} timestamp - 时间戳
 * @returns {string} - 格式化后的时间
 */
export const formatTime = (timestamp) => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  // 如果是今天，只显示时间
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  // 如果是昨天
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return '昨天 ' + date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  // 如果是今年，显示月日和时间
  if (date.getFullYear() === now.getFullYear()) {
    return `${date.getMonth() + 1}月${date.getDate()}日 ${date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })}`;
  }
  
  // 其他情况，显示完整日期和时间
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @returns {string} - 格式化后的文件大小
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * 触发用户信息更新事件
 * @param {object} userInfo - 更新后的用户信息
 */
export const triggerUserInfoUpdate = (userInfo) => {
  try {
    const event = new CustomEvent('userInfoUpdated', {
      detail: { userInfo }
    });
    document.dispatchEvent(event);
    console.log('用户信息更新事件已触发');
  } catch (error) {
    console.error('触发用户信息更新事件失败:', error);
  }
};

/**
 * 压缩图片
 * @param {string} dataUrl - 图片的base64数据
 * @param {number} maxWidth - 最大宽度
 * @param {number} maxHeight - 最大高度
 * @param {number} quality - 压缩质量 (0-1)
 * @returns {Promise<string>} - 压缩后的base64数据
 */
export const compressImage = (dataUrl, maxWidth = 800, maxHeight = 800, quality = 0.9) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // 计算压缩后的尺寸
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      
      // 设置canvas尺寸
      canvas.width = width;
      canvas.height = height;
      
      // 绘制图片
      ctx.drawImage(img, 0, 0, width, height);
      
      // 获取压缩后的base64数据
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.src = dataUrl;
  });
};