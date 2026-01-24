import React from 'react';
import { useTranslation } from 'react-i18next';
import { Mail } from 'lucide-react';
import LanguageSelector from './components/LanguageSelector';
import Hero from './components/Hero';
import AgencySections from './components/AgencySections';
import ProjectGrid from './components/ProjectGrid';
import Footer from './components/Footer';
import CookieConsent from './components/CookieConsent';

import SEO from './components/SEO';

function App() {
  const { t } = useTranslation();
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

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (!section) return;
    const headerOffset = 120;
    const elementPosition = section.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
  };

  return (
    <div className="app-root">
      <SEO />
      <header className="app-header">
        <div className="header-shell">
          <div
            className="header-brand"
            role="button"
            tabIndex={0}
            onClick={() => scrollToSection('about')}
            onKeyDown={(event) => {
              if (event.key === 'Enter') scrollToSection('about');
            }}
          >
            <div className="logo">
              C<span className="ring-of-fire">O</span>MMERZI<span className="ring-of-fire">O</span>
            </div>
          </div>
          <nav className="header-nav" aria-label={t('nav_primary')}>
            <button className="nav-link" onClick={() => scrollToSection('about')}>{t('nav_about')}</button>
            <button className="nav-link" onClick={() => scrollToSection('services')}>{t('nav_services')}</button>
            <button className="nav-link" onClick={() => scrollToSection('capabilities')}>{t('nav_ai')}</button>
            <button className="nav-link" onClick={() => scrollToSection('stack')}>{t('nav_stack')}</button>
            <button className="nav-link" onClick={() => scrollToSection('process')}>{t('nav_process')}</button>
            <button className="nav-link" onClick={() => scrollToSection('testimonials')}>{t('nav_testimonials')}</button>
            <button className="nav-link" onClick={() => scrollToSection('projects')}>{t('nav_masterpieces')}</button>
          </nav>
          <div className="header-actions">
            <button 
              className="nav-link nav-link--contact" 
              onClick={() => {
                const footer = document.querySelector('.app-footer');
                if (footer) {
                  footer.scrollIntoView({ behavior: 'smooth' });
                  setTimeout(() => {
                    const contactBtn = footer.querySelector('.footer-contact-btn');
                    if (contactBtn) contactBtn.click();
                  }, 600);
                }
              }}
              aria-label={t('contact_us')}
            >
              <Mail size={18} />
            </button>
            <LanguageSelector />
          </div>
        </div>
      </header>

      <main>
        <Hero />
        <AgencySections />
        <div id="projects">
          <ProjectGrid />
        </div>
      </main>

      <Footer />
      <CookieConsent />
    </div>
  );
}

export default App;
