import React from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, ArrowUp } from 'lucide-react';
import LanguageSelector from './components/LanguageSelector';
import Hero from './components/Hero';
import AgencySections from './components/AgencySections';
import ProjectGrid from './components/ProjectGrid';
import Footer from './components/Footer';
import CookieConsent from './components/CookieConsent';

import SEO from './components/SEO';

function App() {
  const { t } = useTranslation();
  const [showScrollTop, setShowScrollTop] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const header = document.querySelector('.app-header');
        if (window.scrollY > 50) {
          header?.classList.add('scrolled');
        } else {
          header?.classList.remove('scrolled');
        }
        setShowScrollTop(window.scrollY > 400);
        ticking = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on resize to desktop
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  React.useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  // Close mobile menu when clicking outside
  React.useEffect(() => {
    if (!mobileMenuOpen) return;
    
    const handleClickOutside = (event) => {
      const header = document.querySelector('.app-header');
      if (header && !header.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };
    
    // Use setTimeout to avoid immediate close on the same click that opened it
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 10);
    
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (!section) return;
    const headerOffset = 120;
    const elementPosition = section.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    setMobileMenuOpen(false); // Close menu after navigation
  };

  return (
    <div className="app-root">
      <SEO />
      <header className={`app-header ${mobileMenuOpen ? 'menu-open' : ''}`}>
        <div className="header-shell">
          <div
            className="header-brand"
            role="button"
            tabIndex={0}
            onClick={scrollToTop}
            onKeyDown={(event) => {
              if (event.key === 'Enter') scrollToTop();
            }}
          >
            <div className="logo">
              {'COMERZIO'.split('').map((char, i) => (
                <span key={i} className="logo-letter" style={{ '--i': i }}>{char}</span>
              ))}
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="header-nav header-nav--desktop" aria-label={t('nav_primary')}>
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
                setMobileMenuOpen(false);
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
            
            {/* Hamburger Menu Button - Mobile Only */}
            <button 
              className={`hamburger-btn ${mobileMenuOpen ? 'is-active' : ''}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              <span className="hamburger-bar" />
              <span className="hamburger-bar" />
              <span className="hamburger-bar" />
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation Drawer */}
        <nav className={`mobile-nav ${mobileMenuOpen ? 'open' : ''}`} aria-label={t('nav_primary')}>
          <div className="mobile-nav__content">
            <button className="mobile-nav__link" onClick={() => scrollToSection('about')}>{t('nav_about')}</button>
            <button className="mobile-nav__link" onClick={() => scrollToSection('services')}>{t('nav_services')}</button>
            <button className="mobile-nav__link" onClick={() => scrollToSection('capabilities')}>{t('nav_ai')}</button>
            <button className="mobile-nav__link" onClick={() => scrollToSection('stack')}>{t('nav_stack')}</button>
            <button className="mobile-nav__link" onClick={() => scrollToSection('process')}>{t('nav_process')}</button>
            <button className="mobile-nav__link" onClick={() => scrollToSection('testimonials')}>{t('nav_testimonials')}</button>
            <button className="mobile-nav__link" onClick={() => scrollToSection('projects')}>{t('nav_masterpieces')}</button>
          </div>
        </nav>
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
      
      {/* Scroll to Top Button */}
      <button 
        className={`scroll-to-top ${showScrollTop ? 'visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        <ArrowUp size={22} />
        <span className="scroll-to-top__ring" />
        <span className="scroll-to-top__pulse" />
      </button>
    </div>
  );
}

export default App;
