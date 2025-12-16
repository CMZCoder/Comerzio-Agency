import React from 'react';
import { useTranslation } from 'react-i18next';
import { Github, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
    const { t } = useTranslation();

    return (
        <footer className="app-footer">
            <div className="footer-content">
                <div style={{ textAlign: 'left' }}>
                    <h4 className="logo" style={{ marginBottom: '0.5rem' }}>{t('agency_name')}</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t('slogan')}</p>
                </div>

                <div className="social-links">
                    <a href="https://www.linkedin.com/in/chrislazar93/" target="_blank" rel="noopener noreferrer"><Linkedin size={24} /></a>
                    <a href="mailto:sales@commerzio.online"><Mail size={24} /></a>
                </div>

                <div style={{ textAlign: 'right' }}>
                    <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '4px' }}>{t('product_by')}</p>
                    <p style={{ color: '#444', fontSize: '0.75rem', fontWeight: 600 }}>{t('credits')}</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
