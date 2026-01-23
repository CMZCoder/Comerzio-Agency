import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as THREE from 'three';

const AgencySections = () => {
    const { t } = useTranslation();

    const stats = useMemo(() => [
        { value: '50+', labelKey: 'stats_launches' },
        { value: '12', labelKey: 'stats_weeks' },
        { value: '98%', labelKey: 'stats_retention' },
        { value: '24/7', labelKey: 'stats_monitoring' }
    ], []);

    const services = useMemo(() => [
        { titleKey: 'service_strategy', descriptionKey: 'service_strategy_desc' },
        { titleKey: 'service_design', descriptionKey: 'service_design_desc' },
        { titleKey: 'service_engineering', descriptionKey: 'service_engineering_desc' },
        { titleKey: 'service_ecommerce', descriptionKey: 'service_ecommerce_desc' },
        { titleKey: 'service_growth', descriptionKey: 'service_growth_desc' },
        { titleKey: 'service_ai', descriptionKey: 'service_ai_desc' }
    ], []);
    const serviceLoop = useMemo(() => [...services, ...services], [services]);

    const aiCapabilities = useMemo(() => [
        { titleKey: 'capability_copilots', descriptionKey: 'capability_copilots_desc' },
        { titleKey: 'capability_automation', descriptionKey: 'capability_automation_desc' },
        { titleKey: 'capability_intelligence', descriptionKey: 'capability_intelligence_desc' },
        { titleKey: 'capability_search', descriptionKey: 'capability_search_desc' },
        { titleKey: 'capability_content', descriptionKey: 'capability_content_desc' },
        { titleKey: 'capability_quality', descriptionKey: 'capability_quality_desc' }
    ], []);

    const processSteps = useMemo(() => [
        { titleKey: 'process_discovery', descriptionKey: 'process_discovery_desc' },
        { titleKey: 'process_experience', descriptionKey: 'process_experience_desc' },
        { titleKey: 'process_build', descriptionKey: 'process_build_desc' },
        { titleKey: 'process_launch', descriptionKey: 'process_launch_desc' }
    ], []);

    const testimonials = useMemo(() => [
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
    ], []);

    const techStack = useMemo(() => [
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
    ], []);

    const engagementModels = useMemo(() => [
        { titleKey: 'engagement_sprint', descriptionKey: 'engagement_sprint_desc' },
        { titleKey: 'engagement_team', descriptionKey: 'engagement_team_desc' },
        { titleKey: 'engagement_retainer', descriptionKey: 'engagement_retainer_desc' }
    ], []);

    const sectionNav = useMemo(() => ([
        { id: 'about', labelKey: 'about_title' },
        { id: 'services', labelKey: 'services_title' },
        { id: 'capabilities', labelKey: 'capabilities_title' },
        { id: 'stack', labelKey: 'stack_title' },
        { id: 'process', labelKey: 'process_title' },
        { id: 'testimonials', labelKey: 'testimonials_title' },
        { id: 'engagement', labelKey: 'engagement_title' }
    ]), []);

    const sectionRefs = useRef({});
    const statsRef = useRef(null);
    const processRef = useRef(null);
    const constellationRef = useRef(null);
    const [activeSection, setActiveSection] = useState('about');
    const [statsAnimated, setStatsAnimated] = useState(false);
    const [statValues, setStatValues] = useState(stats.map((stat) => stat.value));
    const [processVisible, setProcessVisible] = useState(false);

    useEffect(() => {
        const sections = sectionNav
            .map((section) => sectionRefs.current[section.id])
            .filter(Boolean);

        if (!sections.length) {
            return undefined;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            { threshold: 0.5 }
        );

        sections.forEach((section) => observer.observe(section));

        return () => observer.disconnect();
    }, [sectionNav]);

    useEffect(() => {
        const headers = Array.from(document.querySelectorAll('.section-header'));
        if (!headers.length) {
            return undefined;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('scanline-active');
                    }
                });
            },
            { threshold: 0.5 }
        );

        headers.forEach((header) => observer.observe(header));

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const section = statsRef.current;
        if (!section) {
            return undefined;
        }

        let animationFrame;
        let cancelled = false;

        const parseStatValue = (value) => {
            const match = value.match(/^(\d+)(.*)$/);
            if (!match) {
                return { number: null, suffix: value };
            }
            return { number: Number(match[1]), suffix: match[2] || '' };
        };

        const targets = stats.map((stat) => parseStatValue(stat.value));

        const animateStats = () => {
            const duration = 1400;
            const start = performance.now();

            const step = (now) => {
                const progress = Math.min((now - start) / duration, 1);
                if (!cancelled) {
                    setStatValues(targets.map((target) => {
                        if (target.number === null) {
                            return target.suffix;
                        }
                        const current = Math.round(target.number * progress);
                        return `${current}${target.suffix}`;
                    }));
                }

                if (progress < 1 && !cancelled) {
                    animationFrame = requestAnimationFrame(step);
                }
            };

            animationFrame = requestAnimationFrame(step);
        };

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setStatsAnimated(true);
                        animateStats();
                        observer.disconnect();
                    }
                });
            },
            { threshold: 0.4 }
        );

        observer.observe(section);

        return () => {
            cancelled = true;
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
            observer.disconnect();
        };
    }, [stats]);

    useEffect(() => {
        const section = processRef.current;
        if (!section) {
            return undefined;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setProcessVisible(true);
                        observer.disconnect();
                    }
                });
            },
            { threshold: 0.35 }
        );

        observer.observe(section);

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const canvas = constellationRef.current;
        if (!canvas) {
            return undefined;
        }

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
        camera.position.z = 6;

        const coreGroup = new THREE.Group();
        scene.add(coreGroup);

        const nodeGeometry = new THREE.SphereGeometry(0.07, 16, 16);
        const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0x7ac7ff });
        for (let i = 0; i < 24; i += 1) {
            const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
            const angle = (i / 24) * Math.PI * 2;
            const radius = 2.1 + Math.sin(i) * 0.25;
            node.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, (i % 6) * 0.08);
            coreGroup.add(node);
        }

        const glowGeometry = new THREE.BufferGeometry();
        const glowPoints = [];
        for (let i = 0; i < 140; i += 1) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 2.6 + Math.random() * 0.7;
            glowPoints.push(Math.cos(angle) * radius, Math.sin(angle) * radius, (Math.random() - 0.5) * 1.6);
        }
        glowGeometry.setAttribute('position', new THREE.Float32BufferAttribute(glowPoints, 3));
        const glowMaterial = new THREE.PointsMaterial({
            color: 0x6be7ff,
            size: 0.03,
            transparent: true,
            opacity: 0.6
        });
        const glowCloud = new THREE.Points(glowGeometry, glowMaterial);
        scene.add(glowCloud);

        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x2b6cb0, transparent: true, opacity: 0.6 });
        const lineGeometry = new THREE.BufferGeometry();
        const ringPoints = [];
        for (let i = 0; i <= 64; i += 1) {
            const angle = (i / 64) * Math.PI * 2;
            ringPoints.push(Math.cos(angle) * 2.4, Math.sin(angle) * 2.4, 0);
        }
        lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(ringPoints, 3));
        const ring = new THREE.Line(lineGeometry, lineMaterial);
        scene.add(ring);

        const resize = () => {
            const { clientWidth, clientHeight } = canvas;
            renderer.setSize(clientWidth, clientHeight, false);
            camera.aspect = clientWidth / clientHeight;
            camera.updateProjectionMatrix();
        };

        resize();
        window.addEventListener('resize', resize);

        let frameId;
        const animate = () => {
            if (!prefersReducedMotion) {
                coreGroup.rotation.z += 0.002;
                glowCloud.rotation.z -= 0.0015;
                ring.rotation.z += 0.001;
            }
            renderer.render(scene, camera);
            frameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resize);
            if (frameId) {
                cancelAnimationFrame(frameId);
            }
            nodeGeometry.dispose();
            nodeMaterial.dispose();
            glowGeometry.dispose();
            glowMaterial.dispose();
            lineGeometry.dispose();
            lineMaterial.dispose();
            renderer.dispose();
        };
    }, []);

    const renderStatValue = (value) => {
        let digitIndex = -1;
        return value.split('').map((char, index) => {
            const isDigit = /\d/.test(char);
            if (isDigit) {
                digitIndex += 1;
            }
            return (
                <span
                    key={`${char}-${index}`}
                    className={isDigit ? 'stat-digit' : 'stat-suffix'}
                    style={isDigit ? { animationDelay: `${digitIndex * 0.08}s` } : undefined}
                >
                    {char}
                </span>
            );
        });
    };

    const handleRailClick = (id) => {
        const section = sectionRefs.current[id];
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className="agency-sections">
            <nav className="section-rail" aria-label="Agency sections">
                {sectionNav.map((section) => (
                    <button
                        key={section.id}
                        type="button"
                        className={`rail-item ${activeSection === section.id ? 'active' : ''}`}
                        onClick={() => handleRailClick(section.id)}
                    >
                        <span className="rail-dot" />
                        <span className="rail-label">{t(section.labelKey)}</span>
                    </button>
                ))}
            </nav>

            <section className="content-section" id="about" ref={(el) => { sectionRefs.current.about = el; }}>
                <div className="container">
                    <div className="section-header scanline-header">
                        <p className="section-kicker">{t('about_kicker')}</p>
                        <h2 className="section-title">
                            <span className="animated-gradient-title">{t('about_title')}</span>
                        </h2>
                        <p className="section-lead">{t('about_lead')}</p>
                    </div>
                    <div className={`stats-grid ${statsAnimated ? 'is-animated' : ''}`} ref={statsRef}>
                        {stats.map((stat, index) => (
                            <div key={stat.labelKey} className="stat-card">
                                <span className="stat-value">{renderStatValue(statValues[index] || stat.value)}</span>
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

            <section className="content-section" id="services" ref={(el) => { sectionRefs.current.services = el; }}>
                <div className="container">
                    <div className="section-header scanline-header">
                        <p className="section-kicker">{t('services_kicker')}</p>
                        <h2 className="section-title">
                            <span className="animated-gradient-title">{t('services_title')}</span>
                        </h2>
                        <p className="section-lead">{t('services_lead')}</p>
                    </div>
                    <div className="constellation-panel">
                        <div className="constellation-copy">
                            <span className="constellation-label">{t('services_kicker')}</span>
                            <h3>{t('capabilities_title')}</h3>
                            <p>{t('capabilities_lead')}</p>
                        </div>
                        <div className="constellation-canvas">
                            <canvas ref={constellationRef} />
                            <div className="constellation-glow" />
                        </div>
                    </div>
                    <div className="services-marquee" aria-label={t('services_title')}>
                        <div className="services-track">
                            {serviceLoop.map((service, index) => (
                                <div key={`${service.titleKey}-${index}`} className="service-slide">
                                    <h3>{t(service.titleKey)}</h3>
                                    <p>{t(service.descriptionKey)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="content-section" id="capabilities" ref={(el) => { sectionRefs.current.capabilities = el; }}>
                <div className="container">
                    <div className="section-header scanline-header">
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

            <section className="content-section" id="stack" ref={(el) => { sectionRefs.current.stack = el; }}>
                <div className="container">
                    <div className="section-header scanline-header">
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

            <section
                className={`content-section process-section ${processVisible ? 'is-visible' : ''}`}
                id="process"
                ref={(el) => {
                    sectionRefs.current.process = el;
                    processRef.current = el;
                }}
            >
                <div className="container">
                    <div className="section-header scanline-header">
                        <p className="section-kicker">{t('process_kicker')}</p>
                        <h2 className="section-title">
                            <span className="animated-gradient-title">{t('process_title')}</span>
                        </h2>
                        <p className="section-lead">{t('process_lead')}</p>
                    </div>
                    <div className="process-timeline">
                        <svg className="process-line" viewBox="0 0 1000 240" aria-hidden="true">
                            <path d="M20 120 C 260 40, 360 200, 520 120 S 820 200, 980 120" />
                        </svg>
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

            <section className="content-section" id="testimonials" ref={(el) => { sectionRefs.current.testimonials = el; }}>
                <div className="container">
                    <div className="section-header scanline-header">
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

            <section className="content-section" id="engagement" ref={(el) => { sectionRefs.current.engagement = el; }}>
                <div className="container">
                    <div className="section-header scanline-header">
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
