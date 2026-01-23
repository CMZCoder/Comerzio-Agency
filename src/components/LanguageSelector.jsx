import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const languages = [
    { code: 'en', label: 'English' },
    { code: 'de', label: 'Deutsch' },
    { code: 'it', label: 'Italiano' },
    { code: 'fr', label: 'Français' },
    { code: 'es', label: 'Español' },
    { code: 'ru', label: 'Русский' },
    { code: 'cn', label: '中文' }
];

const LanguageSelector = () => {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const MotionDiv = motion.div;

    const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

    const containerRef = React.useRef(null);

    // Close on click outside
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const changeLanguage = (code) => {
        i18n.changeLanguage(code);
        setIsOpen(false);
    };

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty('--x', `${e.clientX - rect.left}px`);
        e.currentTarget.style.setProperty('--y', `${e.clientY - rect.top}px`);
    };

    return (
        <div ref={containerRef} style={{ position: 'relative', zIndex: 50 }}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                onMouseMove={handleMouseMove}
                className="lang-trigger-btn"
            >
                <div className="lang-trigger-bg"></div>
                <Globe size={18} />
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{currentLang.label}</span>
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <MotionDiv
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="glass-panel"
                        style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            marginTop: '0.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            padding: '0.5rem',
                            minWidth: '160px',
                            maxHeight: '300px', // Prevent too long dropdown
                            overflowY: 'auto'
                        }}
                    >
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => changeLanguage(lang.code)}
                                onMouseMove={handleMouseMove}
                                className={`lang-btn ${i18n.language === lang.code ? 'active' : ''}`}
                            >
                                {lang.label}
                            </button>
                        ))}
                    </MotionDiv>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LanguageSelector;
