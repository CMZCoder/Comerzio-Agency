import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import ContactShatterButton from './ContactShatterButton';
import SpaceBackground from './SpaceBackground';
import OpenClawCharacter from './OpenClawCharacter';

const Hero = () => {
    const { t } = useTranslation();
    const MotionDiv = motion.div;
    const MotionSpan = motion.span;

    return (
        <section className="hero-section">
            {/* Background Decor */}
            {/* Background Decor */}
            <SpaceBackground />

            <MotionDiv
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="hero-content"
            >
                <MotionDiv
                    className="hero-status"
                    animate={{
                        scale: [1, 1.02, 1],
                        opacity: [0.85, 1, 0.85]
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                    <span className="hero-status-pill">{t('hero_status_label')}</span>
                    <span className="hero-status-divider" />
                    <span className="hero-status-value">{t('hero_status_value')}</span>
                </MotionDiv>
                <div className="hero-identity">
                    <span className="hero-identity-primary">{t('hero_identity_primary')}</span>
                    <span className="hero-identity-secondary">{t('hero_identity_secondary')}</span>
                </div>

                <h1 className="hero-title">
                    <AnimatedText
                        text={t('hero_title').split(' ').slice(0, -1).join(' ')}
                        className="text-gradient"
                    />
                    <br />
                    <AnimatedText
                        text={t('hero_title').split(' ').slice(-1)[0]}
                        className=""
                        charClassName="hero-char hero-char-vibrate"
                        style={{ color: '#fff' }}
                        delayOffset={t('hero_title').split(' ').slice(0, -1).join(' ').length * 0.05}
                        showPeekingCharacter={true}
                    />
                </h1>

                {/* Helper Component for Animation */}
                {/* Putting it here inside the component file for simplicity, or could be separate */}
                {/* But since it's just for Hero, this is fine. */}
                {/* Note: In a larger app, extract to separate file. */}

                <p className="hero-subtitle">
                    <SparkleSubtitle text={t('hero_subtitle')} />
                </p>

                <MotionDiv
                    className="hero-actions"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                >
                    <button
                        onClick={() => {
                            const projectsSection = document.getElementById('projects');
                            if (projectsSection) {
                                const headerOffset = 100;
                                const elementPosition = projectsSection.getBoundingClientRect().top;
                                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                                window.scrollTo({
                                    top: offsetPosition,
                                    behavior: 'smooth'
                                });
                            }
                        }}
                        className="btn btn-primary btn-rotate-glow"
                    >
                        {t('view_projects')}
                    </button>

                    <ContactShatterButton />
                </MotionDiv>
            </MotionDiv>
        </section>
    );
};

const AnimatedText = ({ text, className = "", charClassName = "hero-char", style = {}, delayOffset = 0, showPeekingCharacter = false }) => {
    // Split text into array of characters
    const letters = Array.from(text);

    return (
        <span className={`${className}`} style={{ display: "inline-block", ...style }}>
            {letters.map((char, index) => {
                const isLastChar = index === letters.length - 1;
                return (
                    <span
                        key={index}
                        className={charClassName}
                        style={{
                            animationDelay: `${delayOffset + index * 0.05}s`,
                            position: 'relative', // Needed for absolute positioning of peeker
                            zIndex: 10, // Create stacking context so child z-index:-1 is behind text but above bg
                            display: 'inline-block', // Ensure transforms work
                            transform: 'translate3d(0,0,0)' // FORCE stacking context to fix visibility issues
                        }}
                    >
                        {char === " " ? "\u00A0" : char}
                        {showPeekingCharacter && isLastChar && (
                            <div style={{
                                position: 'absolute',
                                top: '-0.55em', // Responsive offset
                                right: '-0.15em', // Slight right to hug the curve
                                width: '0.6em', // Responsive width (~15% smaller than before relative to text)
                                height: '1.2em', // Responsive height (taller to avoid clip)
                                zIndex: -1, 
                                overflow: 'hidden', 
                                pointerEvents: 'none',
                                transform: 'rotate(20deg) translateZ(0)', // Sharper angle for curvature
                                transformOrigin: 'bottom center'
                            }}>
                                <OpenClawCharacter variant="peek" />
                            </div>
                        )}
                    </span>
                );
            })}
        </span>
    );
};

const SparkleSubtitle = ({ text }) => {
    // Generate constant random positions for sparkles so they don't jump on re-render
    // Using a fixed count of sparkles (e.g., 5)
    // We can't strictly use random inside render without useMemo/useState, 
    // but for this simple effect, constant positions working is key.
    const [sparkles] = React.useState(() => {
        return Array.from({ length: 5 }).map((_, i) => ({
            id: i,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            delay: Math.random() * 2,
            scale: 0.5 + Math.random() * 0.5
        }));
    }, []);

    return (
        <span className="hero-subtitle-container">
            <span className="subtitle-gradient">
                {text}
            </span>
            {sparkles.map((s) => (
                <motion.span
                    key={s.id}
                    style={{
                        position: 'absolute',
                        top: s.top,
                        left: s.left,
                        color: '#FFD700', // Gold
                        pointerEvents: 'none',
                        zIndex: 2,
                        width: '4px',
                        height: '4px',
                    }}
                    animate={{
                        opacity: [0, 1, 0],
                        scale: [0, s.scale, 0],
                        rotate: [0, 45, 0]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: s.delay,
                        ease: "easeInOut"
                    }}
                >
                    {/* SVG Star for specific shape */}
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10z" />
                    </svg>
                </motion.span>
            ))}
        </span>
    );
};

export default Hero;
