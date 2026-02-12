import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

const STORAGE_KEY = 'comerzio_cookie_prefs';
const ANALYTICS_KEY = 'comerzio_analytics_log';

const defaultPrefs = {
    necessary: true,
    analytics: false,
    marketing: false
};

const CookieConsent = () => {
    const { t } = useTranslation();
    const MotionDiv = motion.div;
    const [storageAvailable, setStorageAvailable] = React.useState(true);
    const [prefs, setPrefs] = React.useState(defaultPrefs);
    const [showBanner, setShowBanner] = React.useState(false);
    const [showManage, setShowManage] = React.useState(false);
    const [showData, setShowData] = React.useState(false);
    const [analyticsData, setAnalyticsData] = React.useState([]);

    React.useEffect(() => {
        try {
            const testKey = '__cookie_test__';
            window.localStorage.setItem(testKey, testKey);
            window.localStorage.removeItem(testKey);
            setStorageAvailable(true);
        } catch {
            setStorageAvailable(false);
        }
    }, []);

    React.useEffect(() => {
        if (!storageAvailable) return;
        try {
            const stored = window.localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                setPrefs({ ...defaultPrefs, ...parsed, necessary: true });
            } else {
                setShowBanner(true);
            }
        } catch {
            setPrefs(defaultPrefs);
            setShowBanner(true);
        }
    }, [storageAvailable]);

    React.useEffect(() => {
        const handleOpenSettings = () => {
            setShowManage(true);
        };
        window.addEventListener('open-cookie-settings', handleOpenSettings);
        return () => window.removeEventListener('open-cookie-settings', handleOpenSettings);
    }, []);

    React.useEffect(() => {
        if (!prefs.analytics || !storageAvailable) return;
        try {
            const entry = {
                path: window.location.pathname,
                timestamp: new Date().toISOString(),
                referrer: document.referrer || 'direct'
            };
            const existing = JSON.parse(window.localStorage.getItem(ANALYTICS_KEY) || '[]');
            const next = [entry, ...existing].slice(0, 10);
            window.localStorage.setItem(ANALYTICS_KEY, JSON.stringify(next));
        } catch {
            // Ignore analytics storage errors
        }
    }, [prefs.analytics, storageAvailable]);

    React.useEffect(() => {
        if (!showData || !storageAvailable) return;
        try {
            const stored = JSON.parse(window.localStorage.getItem(ANALYTICS_KEY) || '[]');
            setAnalyticsData(stored);
        } catch {
            setAnalyticsData([]);
        }
    }, [showData, storageAvailable]);

    const persistPrefs = (nextPrefs) => {
        const normalized = { ...nextPrefs, necessary: true };
        setPrefs(normalized);
        if (!storageAvailable) return;
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
        } catch {
            // Ignore storage errors (private mode, blocked storage)
        }
    };

    const handleAccept = () => {
        persistPrefs({ ...prefs, analytics: true, marketing: true });
        setShowBanner(false);
    };

    const handleReject = () => {
        persistPrefs({ ...prefs, analytics: false, marketing: false });
        setShowBanner(false);
    };

    const handleSave = () => {
        persistPrefs(prefs);
        setShowManage(false);
        setShowBanner(false);
    };

    if (!storageAvailable) {
        return null;
    }

    return (
        <>
            <AnimatePresence>
                {showBanner && (
                    <MotionDiv
                        className="cookie-banner"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 30 }}
                    >
                        <div className="cookie-banner__text">
                            <h4>{t('cookie_title')}</h4>
                            <p>{t('cookie_body')}</p>
                        </div>
                        <div className="cookie-banner__actions">
                            <button type="button" className="cookie-btn" onClick={() => setShowManage(true)}>
                                {t('cookie_manage')}
                            </button>
                            <button type="button" className="cookie-btn" onClick={handleReject}>
                                {t('cookie_reject')}
                            </button>
                            <button type="button" className="cookie-btn cookie-btn--primary" onClick={handleAccept}>
                                {t('cookie_accept')}
                            </button>
                        </div>
                    </MotionDiv>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showManage && (
                    <MotionDiv
                        className="cookie-modal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowManage(false)}
                    >
                        <MotionDiv
                            className="cookie-modal__content"
                            initial={{ opacity: 0, y: 16, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 16, scale: 0.96 }}
                            onClick={(event) => event.stopPropagation()}
                        >
                            <div className="cookie-modal__header">
                                <h3>{t('cookie_settings_title')}</h3>
                                <button type="button" className="cookie-modal__close" onClick={() => setShowManage(false)}>
                                    <X size={18} />
                                </button>
                            </div>
                            <p>{t('cookie_settings_body')}</p>
                            <div className="cookie-toggle">
                                <div>
                                    <strong>{t('cookie_necessary_title')}</strong>
                                    <span>{t('cookie_necessary_body')}</span>
                                </div>
                                <input type="checkbox" checked disabled aria-label={t('cookie_necessary_title')} />
                            </div>
                            <div className="cookie-toggle">
                                <div>
                                    <strong>{t('cookie_analytics_title')}</strong>
                                    <span>{t('cookie_analytics_body')}</span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={prefs.analytics}
                                    onChange={(event) => setPrefs((prev) => ({ ...prev, analytics: event.target.checked }))}
                                    aria-label={t('cookie_analytics_title')}
                                />
                            </div>
                            <div className="cookie-toggle">
                                <div>
                                    <strong>{t('cookie_marketing_title')}</strong>
                                    <span>{t('cookie_marketing_body')}</span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={prefs.marketing}
                                    onChange={(event) => setPrefs((prev) => ({ ...prev, marketing: event.target.checked }))}
                                    aria-label={t('cookie_marketing_title')}
                                />
                            </div>
                            <div className="cookie-banner__actions">
                                <button type="button" className="cookie-btn" onClick={() => setShowData(true)}>
                                    {t('cookie_view_data')}
                                </button>
                                <button type="button" className="cookie-btn cookie-btn--primary" onClick={handleSave}>
                                    {t('cookie_save')}
                                </button>
                            </div>
                        </MotionDiv>
                    </MotionDiv>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showData && (
                    <MotionDiv
                        className="cookie-modal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowData(false)}
                    >
                        <MotionDiv
                            className="cookie-modal__content"
                            initial={{ opacity: 0, y: 16, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 16, scale: 0.96 }}
                            onClick={(event) => event.stopPropagation()}
                        >
                            <div className="cookie-modal__header">
                                <h3>{t('cookie_data_title')}</h3>
                                <button type="button" className="cookie-modal__close" onClick={() => setShowData(false)}>
                                    <X size={18} />
                                </button>
                            </div>
                            <p>{t('cookie_data_body')}</p>
                            <div className="cookie-data">
                                {analyticsData.length === 0 ? (
                                    <div>{t('cookie_data_empty')}</div>
                                ) : (
                                    analyticsData.map((entry, index) => (
                                        <div key={`${entry.timestamp}-${index}`}>
                                            <strong>{entry.path}</strong> · {entry.referrer} · {new Date(entry.timestamp).toLocaleString()}
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="cookie-banner__actions">
                                <button type="button" className="cookie-btn cookie-btn--primary" onClick={() => setShowData(false)}>
                                    {t('cookie_close')}
                                </button>
                            </div>
                        </MotionDiv>
                    </MotionDiv>
                )}
            </AnimatePresence>
        </>
    );
};

export default CookieConsent;
