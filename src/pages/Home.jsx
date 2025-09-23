import React from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import CharactersSection from '../components/CharactersSection';
import FeaturesSection from '../components/FeaturesSection';

const Home = () => {
  return (
    <div className="home-page">
      <Navbar />
      <HeroSection />
      <CharactersSection />
      <FeaturesSection />
    </div>
  );
};

export default Home;