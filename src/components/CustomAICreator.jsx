import React, { useState, useEffect } from 'react';
import '../assets/css/custom-ai.css';
import { previewVoice } from '../services/ttsService';

const CustomAICreator = ({ onAddCustomAI, onClose, initialData }) => {
  // 设置新的默认头像URL
  const defaultAvatar = 'https://p1.ssl.qhimgs1.com/sdr/400__/t0434d803873b80c6a1.png';
  
  // 声音选项列表
  const voiceOptions = [
    { value: 'male1', label: '男声1' },
    { value: 'female1', label: '女声1' },
    { value: 'female2', label: '女声2' },
  ];
  
  // 主要AI数据状态
  const [customAI, setCustomAI] = useState({
    name: '',
    instructions: '',
    voice: '',
    skills: [''],
    avatar: defaultAvatar,
    background: '' // 默认背景为空
  });
  
  // 使用默认头像作为初始预览
  const [avatarPreview, setAvatarPreview] = useState(defaultAvatar);
  const [avatarFile, setAvatarFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVoiceDropdownOpen, setIsVoiceDropdownOpen] = useState(false);

  // 当initialData存在时，加载编辑数据
  useEffect(() => {
    if (initialData) {
      // 检查是否需要从sessionStorage恢复头像
      let avatarToUse = initialData.avatar;
      if (avatarToUse && typeof avatarToUse === 'string' && avatarToUse.startsWith('session:')) {
        const avatarKey = avatarToUse.substring(8); // 移除'session:'前缀
        const realAvatar = sessionStorage.getItem(avatarKey);
        if (realAvatar) {
          console.log('从sessionStorage恢复头像数据');
          avatarToUse = realAvatar;
          // 更新initialData中的头像，确保后续处理使用真实头像
          const dataWithRealAvatar = {
            ...initialData,
            avatar: realAvatar,
            background: initialData.background || ''
          };
          setCustomAI(dataWithRealAvatar);
          setAvatarPreview(realAvatar);
          return;
        }
      }
      
      // 普通情况
      setCustomAI({
        ...initialData,
        background: initialData.background || ''
      });
      setAvatarPreview(avatarToUse || defaultAvatar);
    } else {
      // 重置表单
      setCustomAI({
        name: '',
        instructions: '',
        voice: '',
        skills: [''],
        avatar: defaultAvatar,
        background: ''
      });
      setAvatarPreview(defaultAvatar);
      setAvatarFile(null);
    }
  }, [initialData, defaultAvatar]);

  // 处理表单字段变化
  const handleChange = (field, value) => {
    setCustomAI(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 处理技能变化
  const handleSkillChange = (index, value) => {
    const newSkills = [...customAI.skills];
    newSkills[index] = value;
    setCustomAI(prev => ({
      ...prev,
      skills: newSkills
    }));
  };

  // 添加新技能
  const addSkill = () => {
    setCustomAI(prev => ({
      ...prev,
      skills: [...prev.skills, '']
    }));
  };

  // 移除技能
  const removeSkill = (index) => {
    if (customAI.skills.length <= 1) return;
    const newSkills = customAI.skills.filter((_, i) => i !== index);
    setCustomAI(prev => ({
      ...prev,
      skills: newSkills
    }));
  };

  // 处理头像上传
  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 检查文件类型
      if (!file.type.match('image.*')) {
        alert('请选择图片文件！');
        return;
      }
      
      setAvatarFile(file);
      // 创建预览
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target.result;
        console.log('上传的头像数据类型:', typeof imageData);
        console.log('上传的头像数据长度:', imageData?.length);
        
        // 对于大文件，添加额外的内存管理逻辑
        if (imageData.length > 1000000) { // 大于1MB的文件
          console.warn('上传的头像文件较大，可能会影响性能');
          // 可以在这里添加压缩图片的逻辑（可选）
        }
        
        setAvatarPreview(imageData);
        setCustomAI(prev => ({
          ...prev,
          avatar: imageData
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // 处理声音试听
  const handlePreviewVoice = async (voice) => {
    try {
      await previewVoice(voice);
    } catch (error) {
      console.error('试听声音失败:', error);
      alert('试听声音失败，请稍后再试');
    }
  };

  // 处理声音选择
  const handleSelectVoice = (voice) => {
    setCustomAI(prev => ({
      ...prev,
      voice
    }));
  };

  // 提交表单
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 验证表单
    if (!customAI.name.trim()) {
      alert('请输入AI名字！');
      return;
    }
    
    if (!customAI.instructions.trim()) {
      alert('请输入AI指令！');
      return;
    }
    
    // 过滤空技能（技能是可选的）
    const filteredSkills = customAI.skills.filter(skill => skill.trim());
    
    setIsSubmitting(true);
    
    // 构建完整的自定义AI对象
    const completeAI = {
      ...customAI,
      skills: filteredSkills,
      isCustom: true,
      // 添加唯一ID - 如果是新建模式(没有initialData)并且没有ID，则生成新ID
      id: initialData ? customAI.id : `custom-ai-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
    
    console.log('准备提交的自定义AI数据:', completeAI);
    console.log('头像数据类型:', typeof completeAI.avatar);
    console.log('头像数据长度:', completeAI.avatar?.length);
    
    // 调用父组件的回调函数添加或更新自定义AI
    onAddCustomAI(completeAI);
    
    // 仅在新建模式下重置表单，编辑模式下不重置以保留用户修改
    if (!initialData) {
      setCustomAI({
        name: '',
        instructions: '',
        voice: '',
        skills: [''],
        avatar: defaultAvatar,
        background: ''
      });
      setAvatarPreview(defaultAvatar);
      setAvatarFile(null);
    }
    
    setIsSubmitting(false);
    
    // 如果有提供关闭函数，则关闭表单
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="custom-ai-creator">
          <div className="custom-ai-header">
            <h2>{initialData ? '编辑自定义AI' : '创建你的自定义AI'}</h2>
            {onClose && (
              <button className="close-btn" onClick={onClose}>
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
          
          <form className="custom-ai-form" onSubmit={handleSubmit}>
            {/* 头像上传 */}
            <div className="form-group avatar-group">
              <label>头像</label>
              <div className="avatar-upload-wrapper">
                <div className="avatar-preview">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="头像预览" />
                  ) : (
                    <div className="avatar-placeholder">
                      <i className="fas fa-user-robot"></i>
                    </div>
                  )}
                  <div className="avatar-upload-overlay">
                    <label className="avatar-upload-label" htmlFor="avatar-upload">
                      <i className="fas fa-camera"></i>
                      <span>上传头像</span>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            {/* AI名字 */}
            <div className="form-group">
              <label htmlFor="ai-name">名称 *</label>
              <input
                id="ai-name"
                type="text"
                value={customAI.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="请输入名称"
                required
              />
            </div>
            
            {/* AI声音选择 */}
            <div className="form-group">
              <label>声音</label>
              <div className="voice-dropdown-container">
                {/* 显示已选声音或选择按钮 */}
                {customAI.voice ? (
                  <div className="selected-voice-display">
                    <span className="selected-voice-text">
                      {voiceOptions.find(option => option.value === customAI.voice)?.label || '未选择声音'}
                    </span>
                    <button 
                      type="button" 
                      className="change-voice-btn"
                      onClick={() => setIsVoiceDropdownOpen(!isVoiceDropdownOpen)}
                    >
                      <i className="fas fa-chevron-down"></i>
                    </button>
                  </div>
                ) : (
                  <button 
                    type="button" 
                    className="select-voice-dropdown-btn"
                    onClick={() => setIsVoiceDropdownOpen(!isVoiceDropdownOpen)}
                  >
                    <span>选择声音</span>
                    <i className="fas fa-chevron-down"></i>
                  </button>
                )}
                
                {/* 下拉选项 */}
                {isVoiceDropdownOpen && (
                  <div className="voice-dropdown">
                    {voiceOptions.map(option => (
                      <div key={option.value} className="voice-dropdown-item">
                        <div className="voice-preview-section">
                          <button 
                            type="button" 
                            className="preview-voice-dropdown-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePreviewVoice(option.value);
                            }}
                          >
                            <i className="fas fa-volume-up"></i>
                            <span>{option.label}</span>
                          </button>
                        </div>
                        <button 
                          type="button" 
                          className="select-voice-plus-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectVoice(option.value);
                            setIsVoiceDropdownOpen(false);
                          }}
                        >
                          <i className="fas fa-plus"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* AI背景 */}
            <div className="form-group">
              <label htmlFor="ai-background">人物背景</label>
              <input
                id="ai-background"
                type="text"
                value={customAI.background}
                onChange={(e) => handleChange('background', e.target.value)}
                placeholder="输入人物背景，例如：2000年的诺贝尔获奖者"
                style={{ width: '100%', height: '40px', border: '1px solid #ddd', borderRadius: '4px', padding: '8px' }}
              />
            </div>
            
            {/* AI指令 */}
            <div className="form-group">
              <label htmlFor="ai-instructions">设定描述 *</label>
              <textarea
                id="ai-instructions"
                value={customAI.instructions}
                onChange={(e) => handleChange('instructions', e.target.value)}
                placeholder="请输入核心指令，例如：你是一个专业的数学老师，需要耐心解答学生的问题..."
                rows="4"
                required
              ></textarea>
            </div>

            {/* AI技能 (可选) */}
            <div className="form-group">
              <label>技能 (可选)</label>
              <div className="skills-container">
                {customAI.skills.map((skill, index) => (
                  <div key={index} className="skill-input-group">
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) => handleSkillChange(index, e.target.value)}
                      placeholder={`技能 ${index + 1}`}
                    />
                    {index > 0 && (
                      <button
                        type="button"
                        className="remove-skill-btn"
                        onClick={() => removeSkill(index)}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className="add-skill-btn"
                  onClick={addSkill}
                >
                  <i className="fas fa-plus"></i> 添加技能
                </button>
              </div>
            </div>
            
            {/* 提交按钮 */}
            <div className="form-actions">
              {onClose && (
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  取消
                </button>
              )}
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span><i className="fas fa-spinner fa-spin"></i> {initialData ? '保存中...' : '创建中...'}</span>
                ) : (
                  <span><i className="fas fa-plus-circle"></i> {initialData ? '保存' : '创建人物'}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomAICreator;