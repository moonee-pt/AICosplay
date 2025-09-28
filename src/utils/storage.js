// 存储键名
export const STORAGE_KEYS = {
  FAVORITES: "favorites",
  CHAT_HISTORY: "chatHistory",
  USER_INFO: "userInfo",
  CUSTOM_AIS: "customAIs",
  CHAT_MESSAGES: "chatMessages",
};

// 导入工具函数
import { getRealAvatarUrl } from "./utils.js";

// 获取用户信息
export const getUserInfo = () => {
  try {
    // 首先尝试从localStorage获取
    const raw = localStorage.getItem(STORAGE_KEYS.USER_INFO);
    if (raw) {
      const userInfo = JSON.parse(raw);
      return userInfo;
    }

    // 如果localStorage中没有，尝试从sessionStorage获取
    const sessionKey = `session_${STORAGE_KEYS.USER_INFO}`;
    const sessionRaw = sessionStorage.getItem(sessionKey);
    if (sessionRaw) {
      const userInfo = JSON.parse(sessionRaw);
      // 将数据同步回localStorage
      localStorage.setItem(STORAGE_KEYS.USER_INFO, sessionRaw);
      return userInfo;
    }

    // 返回默认用户信息
    const defaultUserInfo = {
      id: "current-user",
      name: "用户",
      avatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    };
    // 保存默认用户信息
    saveUserInfo(defaultUserInfo);
    return defaultUserInfo;
  } catch (error) {
    console.error("获取用户信息失败:", error);
    // 尝试从sessionStorage获取备份
    try {
      const sessionKey = `session_${STORAGE_KEYS.USER_INFO}`;
      const sessionRaw = sessionStorage.getItem(sessionKey);
      if (sessionRaw) {
        const userInfo = JSON.parse(sessionRaw);
        return userInfo;
      }
    } catch (sessionError) {
      console.error("从sessionStorage获取备份也失败:", sessionError);
    }
    // 返回默认用户信息
    return {
      id: "current-user",
      name: "用户",
      avatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    };
  }
};

// 更新历史聊天记录中的用户头像
// 这个函数是解决头像修改后历史消息头像不更新问题的核心
// 当用户修改头像时，会自动调用此函数更新所有历史消息中的头像
export const updateUserAvatarInChatMessages = (newAvatar) => {
  try {
    console.log("开始更新历史聊天记录中的用户头像:", newAvatar);
    // 获取所有聊天记录
    const allMessages = getChatMessages("all") || {};
    let hasChanges = false;
    let updatedMessageCount = 0;

    // 遍历所有角色的聊天记录
    Object.keys(allMessages).forEach((characterId) => {
      const messages = allMessages[characterId];
      if (messages && Array.isArray(messages)) {
        // 更新每条消息中用户的头像

        messages.forEach((message) => {
          // 使用更健壮的头像比较逻辑，处理各种可能的格式差异
          const currentAvatar = getRealAvatarUrl(message.avatar || "");
          const targetAvatar = getRealAvatarUrl(newAvatar || "");

          // 检查用户消息的头像
          if (
            (message.sender === "user" || message.role === "user") &&
            currentAvatar !== targetAvatar
          ) {
            // 存储实际的头像URL
            message.avatar = newAvatar;
            hasChanges = true;
            updatedMessageCount++;
          }
        });
      } else {
        // 静默处理格式不正确的聊天记录
      }
    });

    // 如果有变更，保存更新后的聊天记录
    if (hasChanges) {
      // 尝试保存到localStorage
      try {
        localStorage.setItem(
          STORAGE_KEYS.CHAT_MESSAGES,
          JSON.stringify(allMessages)
        );
      } catch (localError) {
        console.error(
          "保存到localStorage失败，尝试sessionStorage:",
          localError
        );
      }

      // 同时保存到sessionStorage作为备份
      try {
        sessionStorage.setItem(
          `session_${STORAGE_KEYS.CHAT_MESSAGES}`,
          JSON.stringify(allMessages)
        );
        console.log("已更新所有历史聊天记录中的用户头像到sessionStorage");
      } catch (sessionError) {
        console.error("保存到sessionStorage也失败:", sessionError);
      }

      // 触发自定义事件，通知其他组件用户头像已更新
      try {
        const event = new CustomEvent("userAvatarUpdated", {
          detail: {
            newAvatar,
            updatedMessageCount,
            timestamp: Date.now(),
          },
        });
        document.dispatchEvent(event);
        console.log("已触发用户头像更新事件，包含详细信息");
      } catch (eventError) {
        console.error("触发用户头像更新事件失败:", eventError);
      }

      return true;
    }

    console.log("没有需要更新的用户头像（头像未变更或更新失败）");
    return false;
  } catch (error) {
    console.error("更新历史聊天记录中的用户头像失败:", error);

    // 尝试备选方案：直接清空并重建聊天记录索引
    try {
      console.log("尝试备选方案：重新索引聊天记录");
      const allMessages = getChatMessages("all") || {};
      localStorage.setItem(
        STORAGE_KEYS.CHAT_MESSAGES,
        JSON.stringify(allMessages)
      );
      sessionStorage.setItem(
        `session_${STORAGE_KEYS.CHAT_MESSAGES}`,
        JSON.stringify(allMessages)
      );
      console.log("已尝试重新索引聊天记录");
    } catch (retryError) {
      console.error("备选方案也失败:", retryError);
    }

    return false;
  }
};

// 保存用户信息
export const saveUserInfo = (userInfo) => {
  try {
    // 获取当前用户信息
    const currentUserInfo = getUserInfo();
    const oldAvatar = getRealAvatarUrl(currentUserInfo.avatar || "");

    // 检查并压缩头像数据（如果过大）
    const processedUserInfo = processUserInfoBeforeSave(userInfo);

    // 计算处理后的头像的真实URL，用于准确比较
    const newAvatar = getRealAvatarUrl(processedUserInfo.avatar || "");

    // 保存到localStorage
    localStorage.setItem(
      STORAGE_KEYS.USER_INFO,
      JSON.stringify(processedUserInfo)
    );
    // 同时保存到sessionStorage作为备份
    sessionStorage.setItem(
      `session_${STORAGE_KEYS.USER_INFO}`,
      JSON.stringify(processedUserInfo)
    );

    // 使用真实头像URL进行比较，确保准确检测头像变化
    if (oldAvatar !== newAvatar && newAvatar) {
      // 静默更新历史消息中的头像
      const updateResult = updateUserAvatarInChatMessages(
        processedUserInfo.avatar
      );

      if (!updateResult) {
        // 如果更新失败，尝试使用真实头像URL再次更新
        updateUserAvatarInChatMessages(newAvatar);
      }
    }

    return true;
  } catch (error) {
    console.error("保存用户信息失败:", error);
    // 尝试使用sessionStorage作为备选存储
    try {
      // 获取当前用户信息
      const currentUserInfo = getUserInfo();
      const oldAvatar = getRealAvatarUrl(currentUserInfo.avatar || "");

      // 再次尝试压缩数据，因为localStorage可能配额更低
      const compressedUserInfo = processUserInfoBeforeSave(userInfo, true);
      sessionStorage.setItem(
        `session_${STORAGE_KEYS.USER_INFO}`,
        JSON.stringify(compressedUserInfo)
      );
      console.log("已使用sessionStorage作为备选存储用户信息");

      // 使用真实头像URL进行比较
      const newAvatar = getRealAvatarUrl(compressedUserInfo.avatar || "");
      if (oldAvatar !== newAvatar && newAvatar) {
        console.log("检测到头像变更，开始更新历史消息中的头像（备选存储）");
        const updateResult = updateUserAvatarInChatMessages(
          compressedUserInfo.avatar
        );

        if (!updateResult) {
          console.warn(
            "首次更新头像失败，尝试使用真实头像URL再次更新（备选存储）"
          );
          // 如果更新失败，尝试使用真实头像URL再次更新
          updateUserAvatarInChatMessages(newAvatar);
        }
      }

      return true;
    } catch (sessionError) {
      console.error("使用sessionStorage备份也失败:", sessionError);

      // 最后的备选方案：直接更新sessionStorage中的头像引用
      try {
        console.log("尝试最后的备选方案：直接更新头像引用");
        const finalAvatar = getRealAvatarUrl(userInfo.avatar || "");
        if (finalAvatar) {
          sessionStorage.setItem("temp_user_avatar", finalAvatar);
          console.log("已保存临时头像到sessionStorage");

          // 触发自定义事件
          const event = new CustomEvent("userAvatarEmergencyUpdated", {
            detail: { newAvatar: finalAvatar },
          });
          document.dispatchEvent(event);
        }
      } catch (emergencyError) {
        console.error("紧急方案也失败:", emergencyError);
      }

      return false;
    }
  }
};

// 处理用户信息，特别是压缩过大的头像数据
const processUserInfoBeforeSave = (userInfo, forceCompression = false) => {
  const MAX_SIZE_IN_KB = forceCompression ? 100 : 500; // 强制压缩时更小（100KB），默认500KB
  const processedInfo = { ...userInfo };

  // 检查头像是否是base64格式且过大
  if (processedInfo.avatar && processedInfo.avatar.startsWith("data:image/")) {
    const avatarSizeInKB = (processedInfo.avatar.length * 0.75) / 1024; // base64编码大约会增加33%的大小

    if (avatarSizeInKB > MAX_SIZE_IN_KB || forceCompression) {
      // 使用默认头像替代过大的头像
      processedInfo.avatar =
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80";
    }
  }

  return processedInfo;
};

// 获取收藏列表
export const getFavorites = () => {
  try {
    // 首先尝试从localStorage获取
    const raw = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    if (raw) {
      const favorites = JSON.parse(raw);
      return favorites;
    }

    // 如果localStorage中没有，尝试从sessionStorage获取
    const sessionKey = `session_${STORAGE_KEYS.FAVORITES}`;
    const sessionRaw = sessionStorage.getItem(sessionKey);
    if (sessionRaw) {
      const favorites = JSON.parse(sessionRaw);
      // 将数据同步回localStorage
      localStorage.setItem(STORAGE_KEYS.FAVORITES, sessionRaw);
      return favorites;
    }

    return [];
  } catch (error) {
    console.error("获取收藏列表失败:", error);
    // 尝试从sessionStorage获取备份
    try {
      const sessionKey = `session_${STORAGE_KEYS.FAVORITES}`;
      const sessionRaw = sessionStorage.getItem(sessionKey);
      if (sessionRaw) {
        const favorites = JSON.parse(sessionRaw);
        return favorites;
      }
    } catch (sessionError) {
      console.error("从sessionStorage获取备份也失败:", sessionError);
    }
    return [];
  }
};

// 保存收藏列表
export const saveFavorites = (favorites) => {
  try {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    // 同时保存到sessionStorage作为备份
    sessionStorage.setItem(
      `session_${STORAGE_KEYS.FAVORITES}`,
      JSON.stringify(favorites)
    );
  } catch (error) {
    console.error("保存收藏列表失败:", error);
    // 尝试使用sessionStorage作为备选存储
    try {
      sessionStorage.setItem(
        `session_${STORAGE_KEYS.FAVORITES}`,
        JSON.stringify(favorites)
      );
    } catch (sessionError) {
      console.error("使用sessionStorage备份也失败:", sessionError);
    }
  }
};

// 收藏/取消收藏角色
export const toggleFavoriteCharacter = (character) => {
  const favorites = getFavorites();
  const index = favorites.findIndex((f) => f.id === character.id);

  if (index >= 0) {
    // 取消收藏
    favorites.splice(index, 1);
  } else {
    // 添加收藏
    favorites.push({
      id: character.id,
      name: character.name,
      avatar: character.avatar,
    });
  }

  saveFavorites(favorites);
  return favorites;
};

// 获取聊天历史
export const getChatHistory = () => {
  try {
    // 首先尝试从localStorage获取
    const raw = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
    if (raw) {
      const history = JSON.parse(raw);
      return history;
    }

    // 如果localStorage中没有，尝试从sessionStorage获取
    const sessionKey = `session_${STORAGE_KEYS.CHAT_HISTORY}`;
    const sessionRaw = sessionStorage.getItem(sessionKey);
    if (sessionRaw) {
      const history = JSON.parse(sessionRaw);
      // 将数据同步回localStorage
      localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, sessionRaw);
      return history;
    }

    return [];
  } catch (error) {
    console.error("获取聊天历史失败:", error);
    // 尝试从sessionStorage获取备份
    try {
      const sessionKey = `session_${STORAGE_KEYS.CHAT_HISTORY}`;
      const sessionRaw = sessionStorage.getItem(sessionKey);
      if (sessionRaw) {
        const history = JSON.parse(sessionRaw);
        return history;
      }
    } catch (sessionError) {
      console.error("从sessionStorage获取备份也失败:", sessionError);
    }
    return [];
  }
};

// 保存聊天历史
export const saveChatHistory = (history) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(history));
    console.log(`成功保存聊天历史，共${history.length}条记录`);
    // 同时保存到sessionStorage作为备份
    sessionStorage.setItem(
      `session_${STORAGE_KEYS.CHAT_HISTORY}`,
      JSON.stringify(history)
    );
  } catch (error) {
    console.error("保存聊天历史失败:", error);
    // 尝试使用sessionStorage作为备选存储
    try {
      sessionStorage.setItem(
        `session_${STORAGE_KEYS.CHAT_HISTORY}`,
        JSON.stringify(history)
      );
      console.log(`已使用sessionStorage作为备选存储聊天历史`);
    } catch (sessionError) {
      console.error("使用sessionStorage备份也失败:", sessionError);
    }
  }
};

// 更新聊天历史记录
export const updateChatHistory = (character, lastMessage) => {
  const history = getChatHistory();
  const existingIndex = history.findIndex(
    (h) => h.characterId === character.id
  );

  const historyItem = {
    id: `${character.id}-${Date.now()}`, // 唯一ID
    characterId: character.id,
    characterName: character.name,
    characterAvatar: character.avatar,
    lastMessage: lastMessage,
    timestamp: new Date().toISOString(),
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
  try {
    // 检查是否设置了使用sessionStorage作为主要存储的标志
    const useSessionStorage =
      localStorage.getItem(`${STORAGE_KEYS.CUSTOM_AIS}_use_session`) === "true";

    if (useSessionStorage) {
      // 优先从sessionStorage获取
      const sessionKey = `session_${STORAGE_KEYS.CUSTOM_AIS}`;
      const sessionRaw = sessionStorage.getItem(sessionKey);
      if (sessionRaw) {
        const customAIs = JSON.parse(sessionRaw);
        console.log(
          `从sessionStorage加载自定义AI列表（主要存储），共${customAIs.length}个AI`
        );
        return customAIs;
      }
    }

    // 首先尝试从localStorage获取
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_AIS);
    if (raw) {
      const customAIs = JSON.parse(raw);
      console.log(`从localStorage加载自定义AI列表，共${customAIs.length}个AI`);
      return customAIs;
    }

    // 如果localStorage中没有，尝试从sessionStorage获取
    const sessionKey = `session_${STORAGE_KEYS.CUSTOM_AIS}`;
    const sessionRaw = sessionStorage.getItem(sessionKey);
    if (sessionRaw) {
      const customAIs = JSON.parse(sessionRaw);
      // 不再自动同步回localStorage，避免循环失败
      return customAIs;
    }

    return [];
  } catch (error) {
    console.error("获取自定义AI列表失败:", error);
    // 尝试从sessionStorage获取备份
    try {
      const sessionKey = `session_${STORAGE_KEYS.CUSTOM_AIS}`;
      const sessionRaw = sessionStorage.getItem(sessionKey);
      if (sessionRaw) {
        const customAIs = JSON.parse(sessionRaw);
        return customAIs;
      }
    } catch (sessionError) {
      console.error("从sessionStorage获取备份也失败:", sessionError);
    }
    return [];
  }
};

// 通用函数：处理包含头像的对象，压缩过大的头像数据
const processObjectWithAvatar = (obj) => {
  console.log("开始处理包含头像的对象:", {
    id: obj.id,
    avatarType: typeof obj.avatar,
    hasAvatar: !!obj.avatar,
  });

  const processedObj = { ...obj };

  // 检查头像是否是base64格式
  if (processedObj.avatar && processedObj.avatar.startsWith("data:image/")) {
    const avatarSizeInKB = (processedObj.avatar.length * 0.75) / 1024; // base64编码大约会增加33%的大小
    console.log("头像大小:", avatarSizeInKB.toFixed(2), "KB");

    // 对于所有base64头像，我们先尝试保存原始数据，只有在确实遇到存储限制时才进行特殊处理
    try {
      // 先尝试直接保存，只有在实际遇到问题时才进行优化
      // 这样可以避免不必要的复杂性
      return processedObj;
    } catch (error) {
      console.error("直接保存头像失败，开始尝试优化处理:", error);

      // 如果头像过大，创建一个唯一的键名
      const avatarKey = `temp_avatar_${obj.id || Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // 尝试将头像数据保存到sessionStorage，并在对象中保存引用
      try {
        sessionStorage.setItem(avatarKey, processedObj.avatar);
        processedObj.avatar = `session:${avatarKey}`;
        console.log("已将头像数据保存到sessionStorage，使用引用:", avatarKey);
      } catch (sessionError) {
        console.warn(
          "无法保存头像到sessionStorage，尝试降级处理:",
          sessionError
        );

        // 如果sessionStorage也失败，尝试压缩头像
        try {
          // 对于大文件，我们使用简化的降级处理
          // 这里可以在未来集成compressImage函数进行实际压缩
          console.log("尝试使用默认头像替换过大的头像");
          processedObj.avatar =
            "https://p1.ssl.qhimgs1.com/sdr/400__/t0434d803873b80c6a1.png";
        } catch (fallbackError) {
          console.error(
            "所有头像处理方法都失败，保留原始头像数据:",
            fallbackError
          );
        }
      }
    }
  } else {
    console.log("头像不是base64格式，无需特殊处理");
  }

  console.log("完成头像处理");
  return processedObj;
};

// 保存自定义AI列表
export const saveCustomAIs = (customAIs) => {
  console.log(`开始保存自定义AI列表，共${customAIs.length}个AI`);

  try {
    // 首先对每个自定义AI进行处理，特别是处理头像数据
    const processedAIs = customAIs.map((ai) => {
      try {
        return processObjectWithAvatar(ai);
      } catch (error) {
        console.warn("处理AI失败，使用原始数据:", error);
        return ai;
      }
    });

    // 尝试保存到localStorage
    const dataToSave = JSON.stringify(processedAIs);
    const dataSizeInKB = dataToSave.length / 1024;
    console.log(`准备保存的数据大小: ${dataSizeInKB.toFixed(2)} KB`);

    try {
      // 先检查localStorage是否可用
      const testKey = `${STORAGE_KEYS.CUSTOM_AIS}_test`;
      const testData = JSON.stringify({ test: "data" });
      localStorage.setItem(testKey, testData);
      localStorage.removeItem(testKey); // 清理测试数据
      console.log("localStorage可用，尝试保存数据");

      localStorage.setItem(STORAGE_KEYS.CUSTOM_AIS, dataToSave);
      console.log("成功保存数据到localStorage");

      // 清除sessionStorage标志
      try {
        localStorage.removeItem(`${STORAGE_KEYS.CUSTOM_AIS}_use_session`);
      } catch (e) {
        console.warn("无法清除sessionStorage标志:", e);
      }

      // 同时保存到sessionStorage作为备份
      try {
        sessionStorage.setItem(
          `session_${STORAGE_KEYS.CUSTOM_AIS}`,
          dataToSave
        );
        console.log("成功保存备份数据到sessionStorage");
      } catch (backupError) {
        console.warn("保存备份数据到sessionStorage失败:", backupError);
        // 备份失败不影响主保存的成功状态
      }

      return true;
    } catch (localError) {
      console.error("保存到localStorage失败:", localError);

      // 检查是否是因为数据过大导致的失败
      if (dataSizeInKB > 5000) {
        // 5MB 是localStorage的常见限制
        console.warn("数据大小超过5MB，可能是导致localStorage保存失败的原因");
      }

      // 尝试使用sessionStorage作为主要存储
      try {
        console.log("尝试使用sessionStorage作为主要存储");
        sessionStorage.setItem(
          `session_${STORAGE_KEYS.CUSTOM_AIS}`,
          dataToSave
        );
        console.log("成功保存数据到sessionStorage");

        // 设置标志，指示下次加载时使用sessionStorage作为主要存储
        try {
          localStorage.setItem(
            `${STORAGE_KEYS.CUSTOM_AIS}_use_session`,
            "true"
          );
          console.log("已设置sessionStorage作为主要存储的标志");
        } catch (e) {
          console.warn("无法在localStorage中设置sessionStorage标志:", e);
        }

        return true;
      } catch (sessionError) {
        console.error("使用sessionStorage保存也失败:", sessionError);

        // 尝试压缩数据或提供其他解决方案
        try {
          // 作为最后手段，只保存最近一个AI（当前编辑的AI）
          if (customAIs.length > 0) {
            const lastAI = customAIs[customAIs.length - 1];
            // 对最后一个AI也进行头像处理
            const processedLastAI = processObjectWithAvatar(lastAI);
            const compressedData = JSON.stringify([processedLastAI]);
            sessionStorage.setItem(
              `${STORAGE_KEYS.CUSTOM_AIS}_last`,
              compressedData
            );
            console.log("已保存最近一个AI到sessionStorage的备用位置");
            return true;
          }
        } catch (lastError) {
          console.error("保存单个AI也失败:", lastError);
        }

        // 所有保存方法都失败
        console.error("所有保存方法都失败，无法保存自定义AI数据");
        return false;
      }
    }
  } catch (error) {
    console.error("保存自定义AI列表时发生未预期的错误:", error);
    return false;
  }
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
  const index = customAIs.findIndex((ai) => ai.id === customAI.id);

  if (index >= 0) {
    customAIs[index] = customAI;
    saveCustomAIs(customAIs);
  }

  return customAIs;
};

// 删除自定义AI
export const deleteCustomAI = (aiId) => {
  const customAIs = getCustomAIs();
  const aiToDelete = customAIs.find((ai) => ai.id === aiId);

  if (aiToDelete) {
    // 1. 从收藏列表中移除该AI
    const favorites = getFavorites();
    const updatedFavorites = favorites.filter((fav) => fav.id !== aiId);
    saveFavorites(updatedFavorites);

    // 2. 清空该AI的聊天消息和从聊天历史中移除记录
    clearChatMessages(aiId);
  }

  // 3. 从自定义AI列表中删除
  if (aiToDelete) {
    // 1. 从收藏列表中移除该AI
    const favorites = getFavorites();
    const updatedFavorites = favorites.filter((fav) => fav.id !== aiId);
    saveFavorites(updatedFavorites);

    // 2. 清空该AI的聊天消息和从聊天历史中移除记录
    clearChatMessages(aiId);
  }

  // 3. 从自定义AI列表中删除
  const updatedAIs = customAIs.filter((ai) => ai.id !== aiId);
  saveCustomAIs(updatedAIs);
  return updatedAIs;
};

// 获取特定角色的聊天消息或所有聊天消息
export const getChatMessages = (characterId) => {
  try {
    // 首先尝试从localStorage获取
    const raw = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
    if (raw) {
      const allMessages = JSON.parse(raw);

      // 如果characterId为'all'，返回所有消息
      if (characterId === "all") {
        return allMessages;
      }

      // 否则返回特定角色的消息
      const messages = allMessages[characterId] || [];
      return messages;
    }

    // 如果localStorage中没有，尝试从sessionStorage获取
    const sessionKey = `session_${STORAGE_KEYS.CHAT_MESSAGES}`;
    const sessionRaw = sessionStorage.getItem(sessionKey);
    if (sessionRaw) {
      const sessionAllMessages = JSON.parse(sessionRaw);

      // 如果characterId为'all'，返回所有消息
      if (characterId === "all") {
        return sessionAllMessages;
      }

      // 否则返回特定角色的消息
      const messages = sessionAllMessages[characterId] || [];

      // 如果不是'all'请求，将数据同步回localStorage
      if (characterId !== "all") {
        try {
          const localStorageRaw = localStorage.getItem(
            STORAGE_KEYS.CHAT_MESSAGES
          );
          const localStorageMessages = localStorageRaw
            ? JSON.parse(localStorageRaw)
            : {};
          localStorageMessages[characterId] = messages;
          localStorage.setItem(
            STORAGE_KEYS.CHAT_MESSAGES,
            JSON.stringify(localStorageMessages)
          );
        } catch (syncError) {
          console.error("同步聊天消息到localStorage失败:", syncError);
        }
      }

      return messages;
    }

    // 如果请求的是所有消息但没有数据，返回空对象
    if (characterId === "all") {
      return {};
    }

    return [];
  } catch (error) {
    console.error("获取聊天消息失败:", error);
    // 尝试从sessionStorage获取备份
    try {
      const sessionKey = `session_${STORAGE_KEYS.CHAT_MESSAGES}`;
      const sessionRaw = sessionStorage.getItem(sessionKey);
      if (sessionRaw) {
        const sessionAllMessages = JSON.parse(sessionRaw);

        // 如果characterId为'all'，返回所有消息
        if (characterId === "all") {
          return sessionAllMessages;
        }

        // 否则返回特定角色的消息
        const messages = sessionAllMessages[characterId] || [];
        return messages;
      }
    } catch (sessionError) {
      console.error("从sessionStorage获取备份也失败:", sessionError);
    }

    // 如果请求的是所有消息但获取失败，返回空对象
    if (characterId === "all") {
      return {};
    }

    return [];
  }
};

// 保存特定角色的聊天消息
export const saveChatMessages = (characterId, messages) => {
  try {
    // 进一步减少每条对话的最大消息数量，从500条降到200条
    const MAX_MESSAGES_PER_CHAT = 200;
    const messagesToSave = messages.slice(-MAX_MESSAGES_PER_CHAT);

    // 尝试保存到localStorage
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
      const allMessages = raw ? JSON.parse(raw) : {};

      // 添加消息
      allMessages[characterId] = messagesToSave;

      // 检查存储大小并自动清理
      const dataToSave = JSON.stringify(allMessages);

      // 如果数据大小超过5MB，进行清理
      if (new Blob([dataToSave]).size > 5 * 1024 * 1024) {
        // 获取聊天历史，按时间排序
        const chatHistory = getChatHistory();
        if (chatHistory && chatHistory.length > 5) {
          // 删除最早的2条聊天记录
          const chatsToRemove = chatHistory.slice(0, 2);
          chatsToRemove.forEach((chat) => {
            delete allMessages[chat.characterId];
          });
          // 更新保存数据
          const filteredHistory = chatHistory.slice(2);
          saveChatHistory(filteredHistory);
        }
      }

      localStorage.setItem(
        STORAGE_KEYS.CHAT_MESSAGES,
        JSON.stringify(allMessages)
      );
      return messagesToSave;
    } catch (localError) {
      // localStorage存储失败，尝试sessionStorage，但不存储完整数据
      try {
        const sessionKey = `session_${STORAGE_KEYS.CHAT_MESSAGES}`;
        // 只存储最近50条消息到sessionStorage，减少存储使用
        const limitedMessages = messagesToSave.slice(-50);

        localStorage.removeItem(STORAGE_KEYS.CHAT_MESSAGES);
        sessionStorage.removeItem(sessionKey);

        const sessionMessages = { [characterId]: limitedMessages };
        sessionStorage.setItem(sessionKey, JSON.stringify(sessionMessages));
        return limitedMessages;
      } catch (sessionError) {
        console.error("使用sessionStorage备份也失败:", sessionError);
        // 存储完全失败，返回原始消息，但不做存储
        return messages;
      }
    }
  } catch (error) {
    console.error("保存聊天消息时发生异常:", error);
    return messages;
  }
};

// 清空特定角色的聊天消息
export const clearChatMessages = (characterId) => {
  try {
    // 清空localStorage中的数据
    const raw = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
    const allMessages = raw ? JSON.parse(raw) : {};

    delete allMessages[characterId];
    localStorage.setItem(
      STORAGE_KEYS.CHAT_MESSAGES,
      JSON.stringify(allMessages)
    );

    // 同时清空sessionStorage中的数据
    const sessionKey = `session_${STORAGE_KEYS.CHAT_MESSAGES}`;
    const sessionRaw = sessionStorage.getItem(sessionKey);
    if (sessionRaw) {
      const sessionAllMessages = JSON.parse(sessionRaw);
      delete sessionAllMessages[characterId];
      sessionStorage.setItem(sessionKey, JSON.stringify(sessionAllMessages));
    }

    // 同时从聊天历史中移除最后一条消息记录
    const history = getChatHistory();
    const filteredHistory = history.filter(
      (item) => item.characterId !== characterId
    );
    saveChatHistory(filteredHistory);

    return [];
  } catch (error) {
    console.error("清空聊天消息失败:", error);
    // 尝试只清空sessionStorage中的数据
    try {
      const sessionKey = `session_${STORAGE_KEYS.CHAT_MESSAGES}`;
      const sessionRaw = sessionStorage.getItem(sessionKey);
      if (sessionRaw) {
        const sessionAllMessages = JSON.parse(sessionRaw);
        delete sessionAllMessages[characterId];
        sessionStorage.setItem(sessionKey, JSON.stringify(sessionAllMessages));
      }
    } catch (sessionError) {
      console.error("清空sessionStorage中的聊天消息也失败:", sessionError);
    }
    return [];
  }
};
