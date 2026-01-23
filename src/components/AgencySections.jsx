import React from 'react';
import { useTranslation } from 'react-i18next';

const AgencySections = () => {
    const { t } = useTranslation();

    const stats = [
        { value: '50+', labelKey: 'stats_launches' },
        { value: '12', labelKey: 'stats_weeks' },
        { value: '98%', labelKey: 'stats_retention' },
        { value: '24/7', labelKey: 'stats_monitoring' }
    ];

    const services = [
        { titleKey: 'service_strategy', descriptionKey: 'service_strategy_desc' },
        { titleKey: 'service_design', descriptionKey: 'service_design_desc' },
        { titleKey: 'service_engineering', descriptionKey: 'service_engineering_desc' },
        { titleKey: 'service_ecommerce', descriptionKey: 'service_ecommerce_desc' },
        { titleKey: 'service_growth', descriptionKey: 'service_growth_desc' },
        { titleKey: 'service_ai', descriptionKey: 'service_ai_desc' }
    ];

    const aiCapabilities = [
        { titleKey: 'capability_copilots', descriptionKey: 'capability_copilots_desc' },
        { titleKey: 'capability_automation', descriptionKey: 'capability_automation_desc' },
        { titleKey: 'capability_intelligence', descriptionKey: 'capability_intelligence_desc' },
        { titleKey: 'capability_search', descriptionKey: 'capability_search_desc' },
        { titleKey: 'capability_content', descriptionKey: 'capability_content_desc' },
        { titleKey: 'capability_quality', descriptionKey: 'capability_quality_desc' }
    ];

    const processSteps = [
        { titleKey: 'process_discovery', descriptionKey: 'process_discovery_desc' },
        { titleKey: 'process_experience', descriptionKey: 'process_experience_desc' },
        { titleKey: 'process_build', descriptionKey: 'process_build_desc' },
        { titleKey: 'process_launch', descriptionKey: 'process_launch_desc' }
    ];

    const testimonials = [
        {
            quoteKey: 'testimonial_1_quote',
            nameKey: 'testimonial_1_name',
            roleKey: 'testimonial_1_role'
        },
        {
            quoteKey: 'testimonial_2_quote',
            nameKey: 'testimonial_2_name',
            roleKey: 'testimonial_2_role'
        },
        {
            quoteKey: 'testimonial_3_quote',
            nameKey: 'testimonial_3_name',
            roleKey: 'testimonial_3_role'
        }
    ];

    const techStack = [
        {
            titleKey: 'stack_frontend',
            items: ['React', 'Next.js', 'TypeScript', 'Vite', 'Framer Motion']
        },
        {
            titleKey: 'stack_backend',
            items: ['Node.js', 'Python', 'NestJS', 'GraphQL', 'tRPC']
        },
        {
            titleKey: 'stack_data',
            items: ['PostgreSQL', 'Supabase', 'Redis', 'Pinecone', 'Snowflake']
        },
        {
            titleKey: 'stack_ai',
            items: ['OpenAI', 'Anthropic', 'LangChain', 'RAG Pipelines', 'Vector Search']
        },
        {
            titleKey: 'stack_cloud',
            items: ['AWS', 'Vercel', 'Docker', 'Cloudflare', 'CI/CD']
        }
    ];

    const engagementModels = [
        { titleKey: 'engagement_sprint', descriptionKey: 'engagement_sprint_desc' },
        { titleKey: 'engagement_team', descriptionKey: 'engagement_team_desc' },
        { titleKey: 'engagement_retainer', descriptionKey: 'engagement_retainer_desc' }
    ];

    return (
        <div className="agency-sections">
            <section className="content-section" id="about">
                <div className="container">
                    <div className="section-header">
                        <p className="section-kicker">{t('about_kicker')}</p>
                        <h2 className="section-title">
                            <span className="animated-gradient-title">{t('about_title')}</span>
                        </h2>
                        <p className="section-lead">{t('about_lead')}</p>
                    </div>
                    <div className="stats-grid">
                        {stats.map((stat) => (
                            <div key={stat.labelKey} className="stat-card">
                                <span className="stat-value">{stat.value}</span>
                                <span className="stat-label">{t(stat.labelKey)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="dual-column">
                        <div className="glass-card">
                            <h3>{t('about_focus_title')}</h3>
                            <p>{t('about_focus_desc')}</p>
                        </div>
                        <div className="glass-card">
                            <h3>{t('about_difference_title')}</h3>
                            <p>{t('about_difference_desc')}</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="content-section" id="services">
                <div className="container">
                    <div className="section-header">
                        <p className="section-kicker">{t('services_kicker')}</p>
                        <h2 className="section-title">
                            <span className="animated-gradient-title">{t('services_title')}</span>
                        </h2>
                        <p className="section-lead">{t('services_lead')}</p>
                    </div>
                    <div className="card-grid">
                        {services.map((service) => (
                            <div key={service.titleKey} className="feature-card">
                                <h3>{t(service.titleKey)}</h3>
                                <p>{t(service.descriptionKey)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="content-section" id="capabilities">
                <div className="container">
                    <div className="section-header">
                        <p className="section-kicker">{t('capabilities_kicker')}</p>
                        <h2 className="section-title">
                            <span className="animated-gradient-title">{t('capabilities_title')}</span>
                        </h2>
                        <p className="section-lead">{t('capabilities_lead')}</p>
                    </div>
                    <div className="card-grid">
                        {aiCapabilities.map((capability) => (
                            <div key={capability.titleKey} className="feature-card">
                                <h3>{t(capability.titleKey)}</h3>
                                <p>{t(capability.descriptionKey)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="content-section" id="stack">
                <div className="container">
                    <div className="section-header">
                        <p className="section-kicker">{t('stack_kicker')}</p>
                        <h2 className="section-title">
                            <span className="animated-gradient-title">{t('stack_title')}</span>
                        </h2>
                        <p className="section-lead">{t('stack_lead')}</p>
                    </div>
                    <div className="stack-grid">
                        {techStack.map((stackGroup) => (
                            <div key={stackGroup.titleKey} className="stack-card">
                                <h3>{t(stackGroup.titleKey)}</h3>
                                <div className="stack-tags">
                                    {stackGroup.items.map((item) => (
                                        <span key={item} className="tech-tag">{item}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="content-section" id="process">
                <div className="container">
                    <div className="section-header">
                        <p className="section-kicker">{t('process_kicker')}</p>
                        <h2 className="section-title">
                            <span className="animated-gradient-title">{t('process_title')}</span>
                        </h2>
                        <p className="section-lead">{t('process_lead')}</p>
                    </div>
                    <div className="process-grid">
                        {processSteps.map((step, index) => (
                            <div key={step.titleKey} className="process-card">
                                <span className="process-step">{String(index + 1).padStart(2, '0')}</span>
                                <div>
                                    <h3>{t(step.titleKey)}</h3>
                                    <p>{t(step.descriptionKey)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="content-section" id="testimonials">
                <div className="container">
                    <div className="section-header">
                        <p className="section-kicker">{t('testimonials_kicker')}</p>
                        <h2 className="section-title">
                            <span className="animated-gradient-title">{t('testimonials_title')}</span>
                        </h2>
                        <p className="section-lead">{t('testimonials_lead')}</p>
                    </div>
                    <div className="testimonial-grid">
                        {testimonials.map((testimonial) => (
                            <figure key={testimonial.quoteKey} className="testimonial-card">
                                <blockquote>{t(testimonial.quoteKey)}</blockquote>
                                <figcaption>
                                    <span className="testimonial-name">{t(testimonial.nameKey)}</span>
                                    <span className="testimonial-role">{t(testimonial.roleKey)}</span>
                                </figcaption>
                            </figure>
                        ))}
                    </div>
                </div>
            </section>

            <section className="content-section" id="engagement">
                <div className="container">
                    <div className="section-header">
                        <p className="section-kicker">{t('engagement_kicker')}</p>
                        <h2 className="section-title">
                            <span className="animated-gradient-title">{t('engagement_title')}</span>
                        </h2>
                        <p className="section-lead">{t('engagement_lead')}</p>
                    </div>
                    <div className="card-grid">
                        {engagementModels.map((model) => (
                            <div key={model.titleKey} className="feature-card">
                                <h3>{t(model.titleKey)}</h3>
                                <p>{t(model.descriptionKey)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AgencySections;
