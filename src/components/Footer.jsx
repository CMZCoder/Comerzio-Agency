import React from 'react';
import { useTranslation } from 'react-i18next';
import { Linkedin, Mail, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import ContactForm from './ContactForm';

const Footer = () => {
    const { t } = useTranslation();
    const MotionDiv = motion.div;
    const [isContactOpen, setIsContactOpen] = React.useState(false);
    const [activeLegal, setActiveLegal] = React.useState(null);

    // Esc key handler for legal modal
    React.useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                if (activeLegal) setActiveLegal(null);
            }
        };
        if (activeLegal) {
            document.addEventListener('keydown', handleEsc);
        }
        return () => document.removeEventListener('keydown', handleEsc);
    }, [activeLegal]);

    const legalContent = React.useMemo(() => ({
        terms: {
            title: t('legal_terms_title'),
            sections: [
                {
                    heading: t('legal_terms_scope_title'),
                    content: t('legal_terms_scope_content')
                },
                {
                    heading: t('legal_terms_services_title'),
                    content: t('legal_terms_services_content')
                },
                {
                    heading: t('legal_terms_ip_title'),
                    content: t('legal_terms_ip_content')
                },
                {
                    heading: t('legal_terms_liability_title'),
                    content: t('legal_terms_liability_content')
                },
                {
                    heading: t('legal_terms_jurisdiction_title'),
                    content: t('legal_terms_jurisdiction_content')
                }
            ]
        },
        privacy: {
            title: t('legal_privacy_title'),
            sections: [
                {
                    heading: t('legal_privacy_controller_title'),
                    content: t('legal_privacy_controller_content')
                },
                {
                    heading: t('legal_privacy_data_title'),
                    content: t('legal_privacy_data_content')
                },
                {
                    heading: t('legal_privacy_purpose_title'),
                    content: t('legal_privacy_purpose_content')
                },
                {
                    heading: t('legal_privacy_rights_title'),
                    content: t('legal_privacy_rights_content')
                },
                {
                    heading: t('legal_privacy_retention_title'),
                    content: t('legal_privacy_retention_content')
                }
            ]
        },
        cookies: {
            title: t('legal_cookies_title'),
            sections: [
                {
                    heading: t('legal_cookies_what_title'),
                    content: t('legal_cookies_what_content')
                },
                {
                    heading: t('legal_cookies_types_title'),
                    content: t('legal_cookies_types_content')
                },
                {
                    heading: t('legal_cookies_manage_title'),
                    content: t('legal_cookies_manage_content')
                }
            ],
            action: () => {
                window.dispatchEvent(new Event('open-cookie-settings'));
                setActiveLegal(null);
            },
            actionLabel: t('legal_cookies_action')
        }
    }), [t]);

    React.useEffect(() => {
        const footerContent = document.querySelector('.footer-content');
        if (!footerContent) return;

        const animateElements = () => {
            const elements = footerContent.children;
            const animations = ['footer-fade-slide', 'footer-bounce', 'footer-scale-pulse', 'footer-rotate-subtle'];

            Array.from(elements).forEach((element) => {
                element.classList.remove(...animations);
                const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
                element.classList.add(randomAnimation);
            });
        };

        animateElements();
        const interval = setInterval(animateElements, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <footer className="app-footer">
            <div className="footer-content footer-grid">
                <div className="footer-brand">
                    <h4 className="logo" style={{ marginBottom: '0.5rem' }}>{t('agency_name')}</h4>
                    <p className="footer-tagline">{t('slogan')}</p>
                    <p className="footer-summary">{t('footer_summary')}</p>
                    <div className="social-links">
                        <a href="https://www.linkedin.com/in/chrislazar93/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                            <Linkedin size={22} />
                        </a>
                        <a href="mailto:sales@comerzio.ch" aria-label="Email">
                            <Mail size={22} />
                        </a>
                    </div>
                </div>

                <div className="footer-column">
                    <h5>{t('footer_contact_title')}</h5>
                    <p>{t('footer_contact_lead')}</p>
                    <button type="button" className="footer-contact-btn" onClick={() => setIsContactOpen(true)}>
                        {t('footer_contact_cta')}
                    </button>
                </div>

                <div className="footer-column">
                    <h5>{t('footer_legal_title')}</h5>
                    <div className="footer-legal-links">
                        <button type="button" className="footer-legal-btn" onClick={() => setActiveLegal('terms')}>
                            {t('footer_terms_title')}
                        </button>
                        <button type="button" className="footer-legal-btn" onClick={() => setActiveLegal('privacy')}>
                            {t('footer_privacy_title')}
                        </button>
                        <button type="button" className="footer-legal-btn" onClick={() => setActiveLegal('cookies')}>
                            {t('footer_cookies_title')}
                        </button>
                    </div>
                </div>

                <div className="footer-column footer-right">
                    <p className="footer-note">{t('product_by')}</p>
                    <p className="footer-rights">{t('footer_rights')}</p>
                </div>
            </div>
            <AnimatePresence>{isContactOpen && <ContactForm onClose={() => setIsContactOpen(false)} />}</AnimatePresence>
            <AnimatePresence>
                {activeLegal && (
                    <MotionDiv
                        className="legal-modal legal-modal--wide"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setActiveLegal(null)}
                    >
                        <MotionDiv
                            className="legal-modal__content legal-modal__content--wide"
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            transition={{ duration: 0.25 }}
                            onClick={(event) => event.stopPropagation()}
                        >
                            <div className="legal-modal__header">
                                <h3>{legalContent[activeLegal].title}</h3>
                                <button type="button" className="legal-modal__close" onClick={() => setActiveLegal(null)}>
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="legal-modal__body">
                                {legalContent[activeLegal].sections.map((section, index) => (
                                    <div key={index} className="legal-section">
                                        <h4>{section.heading}</h4>
                                        <p>{section.content}</p>
                                    </div>
                                ))}
                            </div>
                            {legalContent[activeLegal].action && (
                                <div className="legal-modal__footer">
                                    <button type="button" className="legal-modal__action" onClick={legalContent[activeLegal].action}>
                                        {legalContent[activeLegal].actionLabel}
                                    </button>
                                </div>
                            )}
                        </MotionDiv>
                    </MotionDiv>
                )}
            </AnimatePresence>
        </footer>
    );
};

export default Footer;
