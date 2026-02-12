
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, CheckCircle2, ShieldCheck, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './ContactForm.css';

const ContactForm = ({ onClose }) => {
    const { t } = useTranslation();
    const MotionDiv = motion.div;
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [website, setWebsite] = useState('');

    // Close on Escape key
    React.useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const validate = () => {
        const newErrors = {};

        // Name: required, no numbers or symbols
        if (!formData.name.trim()) newErrors.name = t('name_required');
        else if (/[\d!@#$%^&*(),.?":{}|<>]/.test(formData.name)) newErrors.name = t('invalid_name');

        // Email: required, email format
        if (!formData.email.trim()) newErrors.email = t('email_required');
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = t('invalid_email');

        // Phone: optional, phone format
        if (formData.phone && !/^[\d+() -]{7,}$/.test(formData.phone)) {
            newErrors.phone = t('invalid_phone');
        }

        // Message: required, min 50 chars
        if (!formData.message.trim()) newErrors.message = t('message_required');
        else if (formData.message.length < 50) newErrors.message = t('message_min_length');

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        if (website) {
            setShowSuccess(true);
            setTimeout(() => {
                onClose();
            }, 1500);
            return;
        }

        setIsSubmitting(true);

        try {
            // POST to PHP handler (works on static hosting)
            const response = await fetch('/contact.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Submission failed');
            }

            await response.json();

            setShowSuccess(true);
            setTimeout(() => {
                onClose();
            }, 3000); // Close after 3 seconds of success message
        } catch (error) {
            console.error(error);
            setErrors(prev => ({ ...prev, submit: t('submit_error') }));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="contact-modal-overlay"
            onClick={onClose} // Click outside to close
        >
            <MotionDiv
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="contact-modal-content"
                onClick={(e) => e.stopPropagation()} // Prevent close on content click
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="modal-close-btn"
                >
                    <X size={24} />
                </button>

                <div className="modal-body">
                    <h2 className="modal-title">{t('contact_us')}</h2>
                    <p className="modal-subtitle">
                        {t('contact_subtitle')}
                    </p>
                    <div className="contact-assurance">
                        <div>
                            <ShieldCheck size={18} />
                            <span>{t('contact_assurance_private')}</span>
                        </div>
                        <div>
                            <Lock size={18} />
                            <span>{t('contact_assurance_encrypted')}</span>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {showSuccess ? (
                            <MotionDiv
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="success-view"
                            >
                                <div className="success-icon-wrapper">
                                    <CheckCircle2 className="success-icon" />
                                </div>
                                <h3 className="success-title">{t('message_sent')}</h3>
                                <p className="success-message">
                                    {t('thank_you_contact')}
                                </p>
                            </MotionDiv>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <label className="form-label visually-hidden" htmlFor="company-website">
                                    Website
                                </label>
                                <input
                                    id="company-website"
                                    type="text"
                                    name="website"
                                    value={website}
                                    onChange={(e) => setWebsite(e.target.value)}
                                    autoComplete="off"
                                    className="visually-hidden"
                                    tabIndex={-1}
                                />
                                {/* Name Input */}
                                <div className="form-group">
                                    <label className="form-label">
                                        {t('name')} <span className="required-star">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={`form-input ${errors.name ? 'form-input-error' : ''}`}
                                        placeholder={t('your_name')}
                                    />
                                    {errors.name && (
                                        <span className="error-message">{errors.name}</span>
                                    )}
                                </div>

                                {/* Email Input */}
                                <div className="form-group">
                                    <label className="form-label">
                                        {t('email')} <span className="required-star">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`form-input ${errors.email ? 'form-input-error' : ''}`}
                                        placeholder="john@example.com"
                                    />
                                    {errors.email && (
                                        <span className="error-message">{errors.email}</span>
                                    )}
                                </div>

                                {/* Phone Input */}
                                <div className="form-group">
                                    <label className="form-label">
                                        {t('phone')} <span className="optional-text">{t('optional')}</span>
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className={`form-input ${errors.phone ? 'form-input-error' : ''}`}
                                        placeholder="+41 79 123 45 67"
                                    />
                                    {errors.phone && (
                                        <span className="error-message">{errors.phone}</span>
                                    )}
                                </div>

                                {/* Message Input */}
                                <div className="form-group">
                                    <label className="form-label">
                                        {t('message')} <span className="required-star">*</span>
                                    </label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        rows={4}
                                        className={`form-textarea ${errors.message ? 'form-input-error' : ''}`}
                                        placeholder={t('how_help')}
                                    />
                                    <div className="char-counter">
                                        {errors.message ? (
                                            <span className="error-message" style={{ marginTop: 0 }}>{errors.message}</span>
                                        ) : (
                                            <span></span>
                                        )}
                                        {/* Removed "min" text as requested */}
                                        <span className={formData.message.length >= 50 ? 'valid' : ''}>
                                            {formData.message.length} / 50
                                        </span>
                                    </div>
                                    {/* Removed min_chars text below */}
                                </div>

                                {/* Submit Error */}
                                {errors.submit && (
                                    <div className="error-message" style={{ marginBottom: '1rem', textAlign: 'center' }}>
                                        {errors.submit}
                                    </div>
                                )}

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="btn-submit btn-liquid"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 size={20} className="loader-spin" />
                                            <span style={{ position: 'relative', zIndex: 1 }}>{t('sending')}</span>
                                        </>
                                    ) : (
                                        <>
                                            <span style={{ position: 'relative', zIndex: 1 }}>{t('send_message')}</span>
                                            <Send size={20} className="btn-icon" style={{ position: 'relative', zIndex: 1 }} />
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </AnimatePresence>
                </div>
            </MotionDiv>
        </MotionDiv >
    );
};

export default ContactForm;
