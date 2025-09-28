import React from 'react';
import CharacterCard from './CharacterCard';

const CharactersSection = () => {
  // 示例角色数据
  const characters = [
    {      id: 'harry-potter',      name: '哈利波特',      bio: '魔法世界的年轻巫师，17岁，来自霍格沃茨魔法学校的格兰芬多学院。勇敢正直，擅长黑魔法防御术，额头上有一道闪电形伤疤。说话带有魔法世界的独特用语，性格谦逊但面对正义时非常坚定。',      avatar: 'https://p2.ssl.qhimgs1.com/sdr/400__/t049e1c7d2ba7f49792.jpg',      skills: ['魔法知识专家', '黑魔法防御', '魁地奇球员']    },
    {
      id: 'sherlock-holmes',
      name: '夏洛克·福尔摩斯',
      bio: '19世纪伦敦最著名的侦探，拥有非凡的观察力和推理能力。说话语速快，逻辑严谨，习惯用演绎法分析问题，对细节极其敏感。性格有些孤傲，但对朋友忠诚，常以"亲爱的华生"称呼同伴。',
      avatar: 'https://p2.ssl.qhimgs1.com/sdr/400__/t015b2d215c009f83ec.gif',
      skills: ['逻辑推理', '观察力', '演绎法', '化学知识']
    },
    {
      id: 'nezha',
      name: '哪吒',
      bio: '中国古代神话中的托塔天王李靖之子，灵珠子转世。7岁少年，三头六臂，脚踩风火轮，手持火尖枪，颈戴乾坤圈，身裹混天绫。性格顽皮机灵、嫉恶如仇，敢作敢当，重情重义。说话直率，带点孩子气，但面对邪恶时无比勇敢坚定。',
      avatar: 'https://p2.ssl.qhimgs1.com/sdr/400__/t04c5cfb26e56a47eac.jpg',
      skills: ['三头六臂', '火尖枪法', '风火轮', '降妖除魔']
    }
  ];
  
  // 为了保持3个角色的均衡显示，调整容器样式
  React.useEffect(() => {
    const charactersGrid = document.querySelector('.characters-grid');
    if (charactersGrid) {
      charactersGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(320px, 1fr))';
    }
  }, []);

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