// 存储键名
export const STORAGE_KEYS = {
  FAVORITES: 'favorites',
  CHAT_HISTORY: 'chatHistory',
  USER_INFO: 'userInfo',
  CUSTOM_AIS: 'customAIs',
  CHAT_MESSAGES: 'chatMessages'
};

// 获取用户信息
export const getUserInfo = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_INFO);
    if (raw) {
      return JSON.parse(raw);
    }
    // 返回默认用户信息
    return {
      id: 'current-user',
      name: '用户',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    };
  } catch (error) {
    console.error('获取用户信息失败:', error);
    // 返回默认用户信息
    return {
      id: 'current-user',
      name: '用户',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    };
  }
};

// 保存用户信息
export const saveUserInfo = (userInfo) => {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo));
    return true;
  } catch (error) {
    console.error('保存用户信息失败:', error);
    return false;
  }
};

// 获取收藏列表
export const getFavorites = () => {
  const raw = localStorage.getItem(STORAGE_KEYS.FAVORITES);
  return raw ? JSON.parse(raw) : [];
};

// 保存收藏列表
export const saveFavorites = (favorites) => {
  localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
};

// 收藏/取消收藏角色
export const toggleFavoriteCharacter = (character) => {
  const favorites = getFavorites();
  const index = favorites.findIndex(f => f.id === character.id);
  
  if (index >= 0) {
    // 取消收藏
    favorites.splice(index, 1);
  } else {
    // 添加收藏
    favorites.push({
      id: character.id,
      name: character.name,
      avatar: character.avatar
    });
  }
  
  saveFavorites(favorites);
  return favorites;
};

// 获取聊天历史
export const getChatHistory = () => {
  const raw = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
  return raw ? JSON.parse(raw) : [];
};

// 保存聊天历史
export const saveChatHistory = (history) => {
  localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(history));
};

// 更新聊天历史记录
export const updateChatHistory = (character, lastMessage) => {
  const history = getChatHistory();
  const existingIndex = history.findIndex(h => h.characterId === character.id);
  
  const historyItem = {
    id: `${character.id}-${Date.now()}`, // 唯一ID
    characterId: character.id,
    characterName: character.name,
    characterAvatar: character.avatar,
    lastMessage: lastMessage,
    timestamp: new Date().toISOString()
  };
  
  // 移除旧记录
  if (existingIndex >= 0) {
    history.splice(existingIndex, 1);
  }
  
  // 添加新记录到开头
  history.unshift(historyItem);
  
  // 限制最大数量
  const MAX_HISTORY = 50;
  if (history.length > MAX_HISTORY) {
    history.splice(MAX_HISTORY);
  }
  
  saveChatHistory(history);
  return history;
};

// 清空聊天历史
export const clearChatHistory = () => {
  saveChatHistory([]);
};

// 获取自定义AI列表
export const getCustomAIs = () => {
  const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_AIS);
  return raw ? JSON.parse(raw) : [];
};

// 保存自定义AI列表
export const saveCustomAIs = (customAIs) => {
  localStorage.setItem(STORAGE_KEYS.CUSTOM_AIS, JSON.stringify(customAIs));
};

// 添加自定义AI
export const addCustomAI = (customAI) => {
  const customAIs = getCustomAIs();
  customAIs.push(customAI);
  saveCustomAIs(customAIs);
  return customAIs;
};

// 更新自定义AI
export const updateCustomAI = (customAI) => {
  const customAIs = getCustomAIs();
  const index = customAIs.findIndex(ai => ai.id === customAI.id);
  
  if (index >= 0) {
    customAIs[index] = customAI;
    saveCustomAIs(customAIs);
  }
  
  return customAIs;
};

// 删除自定义AI
export const deleteCustomAI = (aiId) => {
  const customAIs = getCustomAIs();
  const updatedAIs = customAIs.filter(ai => ai.id !== aiId);
  saveCustomAIs(updatedAIs);
  return updatedAIs;
};

// 获取特定角色的聊天消息
export const getChatMessages = (characterId) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
    const allMessages = raw ? JSON.parse(raw) : {};
    return allMessages[characterId] || [];
  } catch (error) {
    console.error('获取聊天消息失败:', error);
    return [];
  }
};

// 保存特定角色的聊天消息
export const saveChatMessages = (characterId, messages) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
    const allMessages = raw ? JSON.parse(raw) : {};
    
    // 保存消息，限制每条对话的最大消息数量为500条
    const MAX_MESSAGES_PER_CHAT = 500;
    const messagesToSave = messages.slice(-MAX_MESSAGES_PER_CHAT);
    
    allMessages[characterId] = messagesToSave;
    localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(allMessages));
    return messagesToSave;
  } catch (error) {
    console.error('保存聊天消息失败:', error);
    return messages;
  }
};

// 清空特定角色的聊天消息
export const clearChatMessages = (characterId) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
    const allMessages = raw ? JSON.parse(raw) : {};
    
    delete allMessages[characterId];
    localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(allMessages));
    
    // 同时从聊天历史中移除最后一条消息记录
    const history = getChatHistory();
    const filteredHistory = history.filter(item => item.characterId !== characterId);
    saveChatHistory(filteredHistory);
    
    return [];
  } catch (error) {
    console.error('清空聊天消息失败:', error);
    return [];
  }
};