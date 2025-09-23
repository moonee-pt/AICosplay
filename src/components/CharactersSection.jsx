import React from 'react';
import CharacterCard from './CharacterCard';

const CharactersSection = () => {
  // 示例角色数据
  const characters = [
    {
      id: 'harry-potter',
      name: '哈利波特',
      bio: '魔法世界的年轻巫师，勇敢正直，擅长黑魔法防御术。来自霍格沃茨魔法学校的格兰芬多学院。',
      avatar: 'https://placehold.co/300x300/e0f7fa/000000?text=哈利波特',
      skills: ['魔法知识专家', '黑魔法防御', '魁地奇球员', '快速思考者']
    },
    {
      id: 'sherlock-holmes',
      name: '夏洛克·福尔摩斯',
      bio: '世界上最著名的侦探，拥有非凡的观察力和推理能力，善于解决复杂的犯罪案件。',
      avatar: 'https://placehold.co/300x300/e0f7fa/000000?text=夏洛克',
      skills: ['逻辑推理', '观察力', '演绎法', '化学知识']
    },
    {
      id: 'albert-einstein',
      name: '阿尔伯特·爱因斯坦',
      bio: '20世纪最伟大的物理学家之一，相对论的创立者，对现代物理学的发展产生了深远影响。',
      avatar: 'https://placehold.co/300x300/e0f7fa/000000?text=爱因斯坦',
      skills: ['理论物理学', '创新思维', '数学', '哲学']
    },
    {
      id: 'marie-curie',
      name: '玛丽·居里',
      bio: '著名物理学家和化学家，首位获得两次诺贝尔奖的科学家，对放射性研究做出了开创性贡献。',
      avatar: 'https://placehold.co/300x300/e0f7fa/000000?text=居里夫人',
      skills: ['放射性研究', '化学', '物理学', '坚韧不拔']
    }
  ];

  return (
    <section className="characters-section">
      <div className="container">
        <h2>热门角色</h2>
        <p>与来自不同领域的知名角色进行深入交流，探索他们的世界</p>
        <div className="characters-grid">
          {characters.map(character => (
            <CharacterCard key={character.id} character={character} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CharactersSection;