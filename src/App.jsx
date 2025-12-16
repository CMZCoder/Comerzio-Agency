import React from 'react';
import LanguageSelector from './components/LanguageSelector';
import Hero from './components/Hero';
import ProjectGrid from './components/ProjectGrid';
import Footer from './components/Footer';

import SEO from './components/SEO';

function App() {
  React.useEffect(() => {
    const handleScroll = () => {
      const header = document.querySelector('.app-header');
      if (window.scrollY > 50) {
        header?.classList.add('scrolled');
      } else {
        header?.classList.remove('scrolled');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="app-root">
      <SEO />
      <header className="app-header">
        <div className="logo">
          C<span className="ring-of-fire">O</span>MMERZI<span className="ring-of-fire">O</span>
        </div>
        <LanguageSelector />
      </header>

      <main>
        <Hero />
        <div id="projects">
          <ProjectGrid />
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
