import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Keyboard, Navigation, Pagination } from 'swiper/modules';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

gsap.registerPlugin(ScrollTrigger);

const ServicesCarousel = ({ items, t, isVisible = true }) => {
    const trackRef = useRef(null);
    const containerRef = useRef(null);
    const offsetRef = useRef(0);
    const targetOffsetRef = useRef(0);
    const loopWidthRef = useRef(0);
    const rafRef = useRef(null);
    const isDraggingRef = useRef(false);
    const dragStartX = useRef(0);
    const dragStartOffset = useRef(0);

    const [isPaused, setIsPaused] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

    const loopItems = useMemo(() => [...items, ...items, ...items], [items]);

    useEffect(() => {
        const updateLoopWidth = () => {
            if (!trackRef.current) return;
            loopWidthRef.current = trackRef.current.scrollWidth / 3;
        };

        updateLoopWidth();
        window.addEventListener('resize', updateLoopWidth);

        return () => window.removeEventListener('resize', updateLoopWidth);
    }, []);

    useEffect(() => {
        const speed = 0.3;
        const smoothing = 0.08;
        let lastOffset = null;

        const animate = () => {
            if (!isVisible) return;
            const track = trackRef.current;
            if (!track) {
                rafRef.current = requestAnimationFrame(animate);
                return;
            }

            const loopWidth = loopWidthRef.current || track.scrollWidth / 3;
            const shouldMove = !isPaused && !isHovering && !isDraggingRef.current;

            // Auto-play movement
            if (shouldMove) {
                targetOffsetRef.current -= speed;
            }

            // Smooth interpolation toward target
            const diff = targetOffsetRef.current - offsetRef.current;
            if (Math.abs(diff) > 0.5) {
                offsetRef.current += diff * smoothing;
            } else {
                offsetRef.current = targetOffsetRef.current;
            }

            // Loop normalization
            if (offsetRef.current < -loopWidth * 2) {
                offsetRef.current += loopWidth;
                targetOffsetRef.current += loopWidth;
            } else if (offsetRef.current > 0) {
                offsetRef.current -= loopWidth;
                targetOffsetRef.current -= loopWidth;
            }

            // Only update DOM if value changed
            const roundedOffset = Math.round(offsetRef.current * 100) / 100;
            if (lastOffset !== roundedOffset) {
                track.style.transform = `translateX(${roundedOffset}px)`;
                lastOffset = roundedOffset;
            }

            rafRef.current = requestAnimationFrame(animate);
        };

        rafRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafRef.current);
    }, [isPaused, isHovering, isVisible]);

    const getStepSize = () => {
        const track = trackRef.current;
        if (!track) return 320;
        const card = track.querySelector('.service-slide');
        if (!card) return 320;
        const style = window.getComputedStyle(track);
        const gap = parseFloat(style.gap || style.columnGap || 0);
        return card.getBoundingClientRect().width + gap;
    };

    const nudge = (direction) => {
        const step = getStepSize();
        targetOffsetRef.current += direction * step;
    };

    const handlePointerDown = (event) => {
        isDraggingRef.current = true;
        dragStartX.current = event.clientX;
        dragStartOffset.current = offsetRef.current;
        targetOffsetRef.current = offsetRef.current;
        containerRef.current?.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event) => {
        if (!isDraggingRef.current) return;
        const delta = event.clientX - dragStartX.current;
        const newOffset = dragStartOffset.current + delta;
        offsetRef.current = newOffset;
        targetOffsetRef.current = newOffset;
        if (trackRef.current) {
            trackRef.current.style.transform = `translateX(${newOffset}px)`;
        }
    };

    const handlePointerUp = (event) => {
        if (!isDraggingRef.current) return;
        isDraggingRef.current = false;
        containerRef.current?.releasePointerCapture(event.pointerId);
    };

    return (
        <div className="services-carousel">
            <div className="services-controls">
                <button
                    type="button"
                    className="services-control-btn"
                    onClick={() => setIsPaused((prev) => !prev)}
                    aria-pressed={isPaused}
                    aria-label={isPaused ? t('services_play') : t('services_pause')}
                >
                    {isPaused ? <Play size={16} /> : <Pause size={16} />}
                    <span>{isPaused ? t('services_play') : t('services_pause')}</span>
                </button>
                <div className="services-arrows">
                    <button type="button" className="services-arrow" onClick={() => nudge(1)}>
                        <ChevronLeft size={18} />
                    </button>
                    <button type="button" className="services-arrow" onClick={() => nudge(-1)}>
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
            <div
                ref={containerRef}
                className={`services-marquee ${isPaused ? 'is-paused' : ''}`}
                aria-label={t('services_title')}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
            >
                <div className="services-track" ref={trackRef}>
                    {loopItems.map((service, index) => (
                        <div key={`${service.titleKey}-${index}`} className="service-slide">
                            <div className="service-glow" />
                            <h3>{t(service.titleKey)}</h3>
                            <p>{t(service.descriptionKey)}</p>
                        </div>
                    ))}
                </div>
            </div>
            <p className="services-hint">{t('services_hint')}</p>
        </div>
    );
};

const AICapabilitiesSlider = ({ items, t }) => {
    const prevRef = useRef(null);
    const nextRef = useRef(null);
    const paginationRef = useRef(null);
    const swiperRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        const swiper = swiperRef.current;
        if (!swiper || !swiper.autoplay) return;
        if (isPlaying && !isHovering) {
            swiper.autoplay.start();
        } else {
            swiper.autoplay.stop();
        }
    }, [isPlaying, isHovering]);

    const handleToggle = () => setIsPlaying((prev) => !prev);

    return (
        <div
            className="ai-emotions"
            aria-label={t('capabilities_title')}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            <div className="ai-emotions__controls">
                <button type="button" className="ai-emotions__control" onClick={handleToggle}>
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    <span>{isPlaying ? t('ai_pause') : t('ai_play')}</span>
                </button>
            </div>
            <div className="ai-slider-nav">
                <button ref={prevRef} className="ai-slider-nav__item ai-slider-nav__item_prev" type="button" aria-label={t('ai_prev')}>
                    <ChevronLeft size={18} />
                </button>
                <button ref={nextRef} className="ai-slider-nav__item ai-slider-nav__item_next" type="button" aria-label={t('ai_next')}>
                    <ChevronRight size={18} />
                </button>
            </div>
            <Swiper
                modules={[Navigation, Pagination, Keyboard, Autoplay]}
                slidesPerView="auto"
                centeredSlides
                initialSlide={1}
                grabCursor
                speed={650}
                loop
                autoplay={{ delay: 3200, disableOnInteraction: false }}
                keyboard={{ enabled: true, onlyInViewport: true }}
                navigation={{
                    prevEl: prevRef.current,
                    nextEl: nextRef.current,
                    disabledClass: 'is-disabled'
                }}
                pagination={{
                    el: paginationRef.current,
                    clickable: true,
                    bulletClass: 'ai-slider-bullet',
                    bulletActiveClass: 'is-active'
                }}
                onBeforeInit={(swiper) => {
                    swiper.params.navigation.prevEl = prevRef.current;
                    swiper.params.navigation.nextEl = nextRef.current;
                    swiper.params.pagination.el = paginationRef.current;
                }}
                onSwiper={(swiper) => {
                    swiperRef.current = swiper;
                }}
                breakpoints={{
                    0: { spaceBetween: 18 },
                    768: { spaceBetween: 36 }
                }}
                className="ai-emotions__slider"
            >
                {items.map((capability) => (
                    <SwiperSlide key={capability.titleKey} className="ai-emotions__slide">
                        <article
                            className="ai-emotions-card"
                            style={{
                                '--ai-gradient': capability.gradient,
                                '--ai-image': `url(${capability.imageUrl})`
                            }}
                        >
                            {capability.badgeKey && (
                                <div className="ai-emotions-card__badge">{t(capability.badgeKey)}</div>
                            )}
                            <div className="ai-emotions-card__image" aria-hidden="true" />
                            <div className="ai-emotions-card__content">
                                <div className="ai-emotions-card__meta">
                                    <span className="ai-emotions-card__price">{t(capability.priceKey)}</span>
                                    <span className="ai-emotions-card__author">{t(capability.authorKey)}</span>
                                </div>
                                <div className="ai-emotions-card__info">
                                    <h3>{t(capability.titleKey)}</h3>
                                    <p>{t(capability.descriptionKey)}</p>
                                </div>
                            </div>
                        </article>
                    </SwiperSlide>
                ))}
            </Swiper>
            <div ref={paginationRef} className="ai-slider-pagination" />
        </div>
    );
};

const TestimonialsCarousel = ({ items, t, isVisible = true }) => {
    const containerRef = useRef(null);
    const [progress, setProgress] = useState(0);
    const progressRef = useRef(0);
    const targetProgressRef = useRef(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isHovering, setIsHovering] = useState(false);
    const isDownRef = useRef(false);
    const startXRef = useRef(0);
    const startProgressRef = useRef(0);
    const rafRef = useRef(null);
    const isArrowNudgeRef = useRef(false);

    // Continuous progress that wraps smoothly (no jump)
    const normalizeProgress = useCallback((value) => {
        return ((value % 100) + 100) % 100;
    }, []);

    // Smooth animation loop
    useEffect(() => {
        const autoSpeed = 0.03;
        const arrowSmoothing = 0.08;
        let lastProgress = null;

        const animate = () => {
            if (!isVisible) return;
            const shouldAutoPlay = isPlaying && !isHovering && !isDownRef.current && !isArrowNudgeRef.current;
            
            // Auto-play movement
            if (shouldAutoPlay) {
                targetProgressRef.current += autoSpeed;
                progressRef.current = targetProgressRef.current;
            }

            // Smooth interpolation only for arrow nudges
            if (isArrowNudgeRef.current) {
                let diff = targetProgressRef.current - progressRef.current;
                
                // Handle wrap-around smoothly
                if (diff > 50) diff -= 100;
                if (diff < -50) diff += 100;
                
                if (Math.abs(diff) > 0.05) {
                    progressRef.current += diff * arrowSmoothing;
                } else {
                    progressRef.current = targetProgressRef.current;
                    isArrowNudgeRef.current = false;
                }
            }

            // Normalize to 0-100 range
            progressRef.current = normalizeProgress(progressRef.current);
            targetProgressRef.current = normalizeProgress(targetProgressRef.current);
            
            // Only update state if value changed significantly
            const roundedProgress = Math.round(progressRef.current * 100) / 100;
            if (lastProgress !== roundedProgress) {
                setProgress(roundedProgress);
                lastProgress = roundedProgress;
            }
            
            rafRef.current = requestAnimationFrame(animate);
        };

        rafRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafRef.current);
    }, [isPlaying, isHovering, normalizeProgress, isVisible]);

    const handleWheel = (event) => {
        const delta = event.deltaY * 0.02;
        progressRef.current += delta;
        targetProgressRef.current = progressRef.current;
    };

    const handlePointerDown = (event) => {
        isDownRef.current = true;
        isArrowNudgeRef.current = false;
        startXRef.current = event.clientX;
        startProgressRef.current = progressRef.current;
        event.currentTarget.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event) => {
        if (!isDownRef.current) return;
        // Instant drag - no smoothing
        const delta = (event.clientX - startXRef.current) * -0.08;
        progressRef.current = startProgressRef.current + delta;
        targetProgressRef.current = progressRef.current;
    };

    const handlePointerUp = (event) => {
        isDownRef.current = false;
        event.currentTarget.releasePointerCapture(event.pointerId);
    };

    const nudge = (direction) => {
        isArrowNudgeRef.current = true;
        targetProgressRef.current += direction * (100 / items.length);
    };

    // Calculate position for each testimonial with smooth wrap
    const getPosition = (index) => {
        const total = items.length;
        const rawOffset = ((index / total) * 100 - progress + 50 + 100) % 100 - 50;
        return rawOffset / 100;
    };

    return (
        <div
            className="testimonial-orbit"
            ref={containerRef}
            onWheel={handleWheel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            <div className="testimonial-orbit__controls" onPointerDown={(e) => e.stopPropagation()}>
                <button
                    type="button"
                    className="testimonial-orbit__control"
                    onClick={(e) => { e.stopPropagation(); setIsPlaying((prev) => !prev); }}
                    aria-label={isPlaying ? t('testimonial_pause', 'Pause') : t('testimonial_play', 'Play')}
                >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    <span>{isPlaying ? t('testimonial_pause', 'Pause') : t('testimonial_play', 'Play')}</span>
                </button>
                <div className="testimonial-orbit__arrows">
                    <button type="button" className="testimonial-orbit__arrow" onClick={(e) => { e.stopPropagation(); nudge(-1); }}>
                        <ChevronLeft size={18} />
                    </button>
                    <button type="button" className="testimonial-orbit__arrow" onClick={(e) => { e.stopPropagation(); nudge(1); }}>
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
            {items.map((testimonial, index) => {
                const offset = getPosition(index);
                const absOffset = Math.abs(offset);
                const zIndex = 10 - Math.round(absOffset * 10);
                return (
                    <figure
                        key={testimonial.quoteKey}
                        className="testimonial-orbit__item"
                        style={{
                            '--active': offset,
                            '--abs': absOffset,
                            '--zIndex': zIndex
                        }}
                    >
                        <div className="testimonial-orbit__card">
                            <blockquote>{t(testimonial.quoteKey)}</blockquote>
                            <figcaption>
                                <span className="testimonial-name">{t(testimonial.nameKey)}</span>
                                <span className="testimonial-role">{t(testimonial.roleKey)}</span>
                            </figcaption>
                        </div>
                    </figure>
                );
            })}
        </div>
    );
};

const TechStackLoop = ({ items, t, isVisible = true }) => {
    const galleryRef = useRef(null);
    const trackRef = useRef(null);
    const offsetRef = useRef(0);
    const targetOffsetRef = useRef(0);
    const loopWidthRef = useRef(0);
    const rafRef = useRef(null);
    const isDraggingRef = useRef(false);
    const dragStartX = useRef(0);
    const dragStartOffset = useRef(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isHovering, setIsHovering] = useState(false);

    const loopItems = useMemo(() => [...items, ...items, ...items], [items]);

    useEffect(() => {
        const updateLoopWidth = () => {
            if (!trackRef.current) return;
            loopWidthRef.current = trackRef.current.scrollWidth / 3;
        };

        updateLoopWidth();
        window.addEventListener('resize', updateLoopWidth);

        return () => window.removeEventListener('resize', updateLoopWidth);
    }, []);

    // Normalize offset to stay within loop bounds
    const normalizeOffset = useCallback((value) => {
        const loopWidth = loopWidthRef.current;
        if (!loopWidth) return value;
        // Keep within one loop cycle
        while (value > 0) value -= loopWidth;
        while (value < -loopWidth * 2) value += loopWidth;
        return value;
    }, []);

    useEffect(() => {
        const speed = 0.5;
        const smoothing = 0.08;
        let lastOffset = null;

        const animate = () => {
            if (!isVisible) return;
            const track = trackRef.current;
            if (!track) {
                rafRef.current = requestAnimationFrame(animate);
                return;
            }

            const loopWidth = loopWidthRef.current || track.scrollWidth / 3;
            const shouldMove = isPlaying && !isHovering && !isDraggingRef.current;

            // Auto-play movement
            if (shouldMove) {
                targetOffsetRef.current -= speed;
            }

            // Smooth interpolation for arrow nudges
            const diff = targetOffsetRef.current - offsetRef.current;
            if (Math.abs(diff) > 0.5) {
                offsetRef.current += diff * smoothing;
            } else {
                offsetRef.current = targetOffsetRef.current;
            }

            // Normalize to loop seamlessly
            if (offsetRef.current < -loopWidth * 2) {
                offsetRef.current += loopWidth;
                targetOffsetRef.current += loopWidth;
            } else if (offsetRef.current > 0) {
                offsetRef.current -= loopWidth;
                targetOffsetRef.current -= loopWidth;
            }

            // Only update DOM if value changed
            const roundedOffset = Math.round(offsetRef.current * 100) / 100;
            if (lastOffset !== roundedOffset) {
                track.style.transform = `translateX(${roundedOffset}px)`;
                lastOffset = roundedOffset;
            }

            rafRef.current = requestAnimationFrame(animate);
        };

        rafRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafRef.current);
    }, [isPlaying, isHovering, isVisible]);

    const getStepSize = () => {
        const track = trackRef.current;
        if (!track) return 320;
        const card = track.querySelector('.stack-gallery__card');
        if (!card) return 320;
        const style = window.getComputedStyle(track);
        const gap = parseFloat(style.gap || style.columnGap || 0);
        return card.getBoundingClientRect().width + gap;
    };

    const nudge = (direction) => {
        const step = getStepSize();
        targetOffsetRef.current += direction * step;
    };

    const handlePointerDown = (event) => {
        isDraggingRef.current = true;
        dragStartX.current = event.clientX;
        dragStartOffset.current = offsetRef.current;
        targetOffsetRef.current = offsetRef.current;
        event.currentTarget.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event) => {
        if (!isDraggingRef.current) return;
        const delta = event.clientX - dragStartX.current;
        const newOffset = dragStartOffset.current + delta;
        offsetRef.current = newOffset;
        targetOffsetRef.current = newOffset;
        if (trackRef.current) {
            trackRef.current.style.transform = `translateX(${newOffset}px)`;
        }
    };

    const handlePointerUp = (event) => {
        if (!isDraggingRef.current) return;
        isDraggingRef.current = false;
        event.currentTarget.releasePointerCapture(event.pointerId);
        // Normalize after drag
        targetOffsetRef.current = normalizeOffset(offsetRef.current);
    };

    return (
        <div className="stack-gallery" ref={galleryRef}>
            <div className="stack-gallery__controls">
                <button type="button" className="stack-gallery__control" onClick={() => setIsPlaying((prev) => !prev)}>
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    <span>{isPlaying ? t('stack_pause') : t('stack_play')}</span>
                </button>
                <div className="stack-gallery__arrows">
                    <button type="button" className="stack-gallery__arrow" onClick={() => nudge(1)}>
                        <ChevronLeft size={18} />
                    </button>
                    <button type="button" className="stack-gallery__arrow" onClick={() => nudge(-1)}>
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
            <div
                className={`stack-gallery__track ${isPlaying ? '' : 'is-paused'}`}
                ref={trackRef}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                style={{ touchAction: 'pan-y' }}
            >
                {loopItems.map((stackGroup, index) => (
                    <article key={`${stackGroup.titleKey}-${index}`} className="stack-gallery__card">
                        <h3>{t(stackGroup.titleKey)}</h3>
                        <div className="stack-tags">
                            {stackGroup.items.map((item) => (
                                <span key={`${item}-${index}`} className="tech-tag">{item}</span>
                            ))}
                        </div>
                    </article>
                ))}
            </div>
            <p className="stack-gallery__hint">{t('stack_hint')}</p>
        </div>
    );
};

const AgencySections = () => {
    const { t } = useTranslation();

    const stats = useMemo(() => [
        { value: '50+', labelKey: 'stats_launches' },
        { value: '12h', labelKey: 'stats_weeks' },
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

    const aiCapabilities = useMemo(() => [
        {
            titleKey: 'capability_copilots',
            descriptionKey: 'capability_copilots_desc',
            priceKey: 'ai_price_1',
            authorKey: 'ai_author_1',
            badgeKey: 'ai_badge_popular',
            gradient: 'linear-gradient(135deg, rgba(66, 153, 225, 0.7), rgba(236, 201, 75, 0.2))',
            imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80'
        },
        {
            titleKey: 'capability_automation',
            descriptionKey: 'capability_automation_desc',
            priceKey: 'ai_price_2',
            authorKey: 'ai_author_2',
            gradient: 'linear-gradient(135deg, rgba(45, 212, 191, 0.6), rgba(17, 24, 39, 0.2))',
            imageUrl: 'https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?auto=format&fit=crop&w=900&q=80'
        },
        {
            titleKey: 'capability_intelligence',
            descriptionKey: 'capability_intelligence_desc',
            priceKey: 'ai_price_3',
            authorKey: 'ai_author_3',
            gradient: 'linear-gradient(135deg, rgba(129, 140, 248, 0.7), rgba(15, 23, 42, 0.2))',
            imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=900&q=80'
        },
        {
            titleKey: 'capability_search',
            descriptionKey: 'capability_search_desc',
            priceKey: 'ai_price_4',
            authorKey: 'ai_author_4',
            gradient: 'linear-gradient(135deg, rgba(251, 146, 60, 0.65), rgba(15, 23, 42, 0.2))',
            imageUrl: 'https://images.unsplash.com/photo-1526378722484-bd91ca387e72?auto=format&fit=crop&w=900&q=80'
        },
        {
            titleKey: 'capability_content',
            descriptionKey: 'capability_content_desc',
            priceKey: 'ai_price_5',
            authorKey: 'ai_author_5',
            badgeKey: 'ai_badge_new',
            gradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.6), rgba(17, 24, 39, 0.2))',
            imageUrl: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=900&q=80'
        },
        {
            titleKey: 'capability_quality',
            descriptionKey: 'capability_quality_desc',
            priceKey: 'ai_price_6',
            authorKey: 'ai_author_6',
            gradient: 'linear-gradient(135deg, rgba(148, 163, 184, 0.6), rgba(15, 23, 42, 0.2))',
            imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=80'
        }
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
        },
        {
            quoteKey: 'testimonial_4_quote',
            nameKey: 'testimonial_4_name',
            roleKey: 'testimonial_4_role'
        },
        {
            quoteKey: 'testimonial_5_quote',
            nameKey: 'testimonial_5_name',
            roleKey: 'testimonial_5_role'
        },
        {
            quoteKey: 'testimonial_6_quote',
            nameKey: 'testimonial_6_name',
            roleKey: 'testimonial_6_role'
        },
        {
            quoteKey: 'testimonial_7_quote',
            nameKey: 'testimonial_7_name',
            roleKey: 'testimonial_7_role'
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
    const [activeSection, setActiveSection] = useState(null);
    const [statsAnimated, setStatsAnimated] = useState(false);
    const [statValues, setStatValues] = useState(stats.map((stat) => stat.value));
    const [processVisible, setProcessVisible] = useState(false);
    const [railAwake, setRailAwake] = useState(false);
    const [visibleSections, setVisibleSections] = useState({});
    const railTimerRef = useRef(null);
    const wakeRail = useCallback(() => {
        setRailAwake(true);
        if (railTimerRef.current) {
            clearTimeout(railTimerRef.current);
        }
        railTimerRef.current = setTimeout(() => setRailAwake(false), 5000);
    }, []);

    useEffect(() => {
        const handleScroll = () => wakeRail();
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (railTimerRef.current) {
                clearTimeout(railTimerRef.current);
            }
        };
    }, [wakeRail]);

    useEffect(() => {
        const sections = sectionNav
            .map((section) => sectionRefs.current[section.id])
            .filter(Boolean);

        if (!sections.length) {
            return undefined;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                // Track visibility for pausing rAF loops
                setVisibleSections((prev) => {
                    const next = { ...prev };
                    entries.forEach((entry) => {
                        next[entry.target.id] = entry.isIntersecting;
                    });
                    return next;
                });

                const visible = entries.filter((entry) => entry.isIntersecting);
                if (!visible.length) {
                    setActiveSection(null);
                    return;
                }
                const mostVisible = visible.reduce((best, entry) =>
                    entry.intersectionRatio > best.intersectionRatio ? entry : best
                );
                setActiveSection(mostVisible.target.id);
            },
            { threshold: [0, 0.2, 0.35, 0.5, 0.65] }
        );

        sections.forEach((section) => observer.observe(section));

        return () => observer.disconnect();
    }, [sectionNav]);

    useEffect(() => {
        if (!activeSection) {
            setRailAwake(false);
            return;
        }
        wakeRail();
    }, [activeSection, wakeRail]);

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
        const isTouchDevice = 'ontouchstart' in window;
        const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isTouchDevice, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
        let constellationVisible = true;
        camera.position.z = 9;

        // Symbiosis/Morphing Effect: 
        // Particles transition between distinct shapes (Sphere, DNA, Rorschach)
        // with a fluid dispersion phase in between, creating a true symbiotic organism feel.
        const particleCount = 1600; // High density for better shape definition
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        // Initialize with random positions (Chaos state) and default blue color
        const baseColor = new THREE.Color(0x4f90ff);
        for (let i = 0; i < particleCount; i++) {
            const i3 = i*3;
            positions[i3] = (Math.random() * 2 - 1) * 4;
            positions[i3+1] = (Math.random() * 2 - 1) * 4;
            positions[i3+2] = (Math.random() * 2 - 1) * 4;
            colors[i3] = baseColor.r; colors[i3+1]=baseColor.g; colors[i3+2]=baseColor.b;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const material = new THREE.PointsMaterial({
            vertexColors: true,
            size: 0.06,
            transparent: true,
            opacity: 0.8,
            map: new THREE.TextureLoader().load('https://assets.codepen.io/127738/dotTexture.png'),
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        if (!material.map) material.map = null;

        const particleSystem = new THREE.Points(geometry, material);
        scene.add(particleSystem);

        // --- Shape Library ---
        // Default Blue Color
        const C_BLUE = {r:0.2, g:0.6, b:1.0};
        
        // Helper: parametric surface shapes
        const createShape = (getPoint) => {
            const pos = new Float32Array(particleCount * 3);
            const col = new Float32Array(particleCount * 3);
            for (let i = 0; i < particleCount; i++) {
                const i3 = i * 3;
                const u = Math.random() * Math.PI * 2;
                const v = Math.random() * Math.PI * 2;
                const p = getPoint(u, v, i);
                pos[i3] = p.x; pos[i3 + 1] = p.y; pos[i3 + 2] = p.z;
                col[i3] = p.r !== undefined ? p.r : C_BLUE.r;
                col[i3+1] = p.g !== undefined ? p.g : C_BLUE.g;
                col[i3+2] = p.b !== undefined ? p.b : C_BLUE.b;
            }
            return { positions: pos, colors: col };
        };
        // Helper: composite shapes from multiple geometric parts
        const compositeShape = (parts) => {
            const pos = new Float32Array(particleCount * 3);
            const col = new Float32Array(particleCount * 3);
            const totalW = parts.reduce((s, p) => s + p.w, 0);
            let idx = 0;
            for (const part of parts) {
                const count = Math.round((part.w / totalW) * particleCount);
                for (let j = 0; j < count && idx < particleCount; j++) {
                    const i3 = idx * 3;
                    const pt = part.fn(j, count);
                    pos[i3] = pt.x; pos[i3 + 1] = pt.y; pos[i3 + 2] = pt.z;
                    col[i3] = pt.r!==undefined ? pt.r : C_BLUE.r;
                    col[i3+1] = pt.g!==undefined ? pt.g : C_BLUE.g;
                    col[i3+2] = pt.b!==undefined ? pt.b : C_BLUE.b;
                    idx++;
                }
            }
            while (idx < particleCount) { 
                const i3 = idx * 3; 
                pos[i3]=0; pos[i3+1]=0; pos[i3+2]=0; 
                col[i3]=C_BLUE.r; col[i3+1]=C_BLUE.g; col[i3+2]=C_BLUE.b;
                idx++; 
            }
            return { positions: pos, colors: col };
        };
        // Helper: scatter particles along edges of a 2D polygon with slight Z depth
        const outlineShape = (verts, closed, scl, oX, oY) => {
            const pos = new Float32Array(particleCount * 3);
            const col = new Float32Array(particleCount * 3);
            const edges = [];
            let totalLen = 0;
            const len = closed ? verts.length : verts.length - 1;
            for (let i = 0; i < len; i++) {
                const a = verts[i], b = verts[(i + 1) % verts.length];
                const el = Math.sqrt((b[0]-a[0])**2 + (b[1]-a[1])**2);
                edges.push({ a, b, el });
                totalLen += el;
            }
            for (let i = 0; i < particleCount; i++) {
                const i3 = i * 3;
                let r = Math.random() * totalLen;
                let edge = edges[0];
                for (const e of edges) { r -= e.el; if (r <= 0) { edge = e; break; } }
                const t = Math.random();
                pos[i3] = (edge.a[0] + (edge.b[0]-edge.a[0])*t) * scl + oX;
                pos[i3+1] = (edge.a[1] + (edge.b[1]-edge.a[1])*t) * scl + oY;
                pos[i3+2] = (Math.random()-0.5) * 0.3;
                col[i3] = C_BLUE.r; col[i3+1] = C_BLUE.g; col[i3+2] = C_BLUE.b;
            }
            return { positions: pos, colors: col };
        };

        const shapes = [
            // 1. Sphere
            createShape((u, v) => {
                const r = 2.5;
                return { x: r*Math.sin(u)*Math.cos(v), y: r*Math.sin(u)*Math.sin(v), z: r*Math.cos(u) };
            }),
            // 2. Cube
            createShape((u, v, i) => {
                const face = Math.floor(Math.random() * 6);
                const a = Math.random()*4-2, b = Math.random()*4-2;
                if(face===0) return {x:2,y:a,z:b}; if(face===1) return {x:-2,y:a,z:b};
                if(face===2) return {x:a,y:2,z:b}; if(face===3) return {x:a,y:-2,z:b};
                if(face===4) return {x:a,y:b,z:2}; return {x:a,y:b,z:-2};
            }),
            // 3. Torus (Donut)
            createShape((u, v) => {
                const R=2.2, r=0.8;
                return { x: (R+r*Math.cos(v))*Math.cos(u), y: (R+r*Math.cos(v))*Math.sin(u), z: r*Math.sin(v) };
            }),
            // 4. DNA Helix
            createShape((u, v, i) => {
                const t = (i/particleCount)*Math.PI*8, r = 1.5;
                const off = (i%2===0)?0:Math.PI;
                return { x: Math.cos(t+off)*r, y: (i/particleCount)*6-3, z: Math.sin(t+off)*r };
            }),
            // 5. Galaxy Spiral
            createShape((u, v, i) => {
                const arms=3, arm=i%arms, r=Math.random()*3.5;
                const ang = (arm/arms)*Math.PI*2 + r*2.5;
                const n = (Math.random()-0.5)*0.5;
                return { x: Math.cos(ang)*r+n, y: Math.sin(ang)*r+n, z: (Math.random()-0.5)*0.5 };
            }),
            // 6. Torus Knot
            createShape((u) => {
                const p=2, q=3, r = 0.8 + 1.2*Math.cos(q*u);
                return { x: r*Math.cos(p*u), y: r*Math.sin(p*u), z: -Math.sin(q*u) };
            }),
            // 7. Cone
            createShape((u, v) => {
                const h=4, r=(1-v/(2*Math.PI))*2, y=(v/(2*Math.PI))*h - h/2;
                return { x: r*Math.cos(u), y, z: r*Math.sin(u) };
            }),

            // ♥ 8. Heart
            createShape((u) => {
                const t = u; // 0..2PI
                const hx = 16 * Math.pow(Math.sin(t), 3);
                const hy = 13*Math.cos(t) - 5*Math.cos(2*t) - 2*Math.cos(3*t) - Math.cos(4*t);
                return { x: hx*0.17, y: hy*0.17 + 0.5, z: (Math.random()-0.5)*0.5 };
            }),

            // 🪐 9. Saturn
            compositeShape([
                { w: 60, fn: () => { // Planet
                    const u=Math.random()*Math.PI*2, v=Math.random()*Math.PI*2, r=2.0;
                    return { x: r*Math.sin(u)*Math.cos(v), y: r*Math.cos(u), z: r*Math.sin(u)*Math.sin(v) };
                }},
                { w: 40, fn: () => { // Ring
                    const a=Math.random()*Math.PI*2, rr=2.8+Math.random()*1.5;
                    return { x: rr*Math.cos(a), y: (Math.random()-0.5)*0.1, z: rr*Math.sin(a)*0.4 };
                }}
            ]),

            // 🌳 10. Fruit Tree (Red Fruits)
            compositeShape([
                { w: 20, fn: () => { // Trunk (Brown)
                    const h = Math.random() * 2.5; 
                    const r = 0.4 * (1 - h/3.5); 
                    const a = Math.random() * Math.PI * 2;
                    return { x: r*Math.cos(a), y: h - 2.5, z: r*Math.sin(a), r:0.6, g:0.4, b:0.2 };
                }},
                { w: 65, fn: () => { // Foliage (Green)
                    const u = Math.random(), v = Math.random();
                    const theta = 2 * Math.PI * u;
                    const phi = Math.acos(2 * v - 1);
                    const r = 1.8 * Math.cbrt(Math.random());
                    return { 
                        x: r * Math.sin(phi) * Math.cos(theta), 
                        y: r * Math.sin(phi) * Math.sin(theta) + 0.8, 
                        z: r * Math.cos(phi),
                        r: 0.2, g: 0.8, b: 0.2
                    };
                }},
                { w: 15, fn: () => { // Fruits (Red)
                    const fruitCenters = [
                        {x:1.0, y:1.0, z:0.5}, {x:-0.8, y:1.5, z:0.8}, {x:0, y:2.2, z:-0.5},
                        {x:0.5, y:0.5, z:1.2}, {x:-1.2, y:0.8, z:-0.2}, {x:0.8, y:1.8, z:-0.8},
                        {x:-0.5, y:1.2, z:-1.0}, {x:1.2, y:0.2, z:0}, {x:-0.2, y:0, z:1.3},
                        {x:0.6, y:2.0, z:0.4}, {x:-0.9, y:1.9, z:0.1}, {x:0.2, y:0.6, z:-1.3}
                    ];
                    const center = fruitCenters[Math.floor(Math.random() * fruitCenters.length)];
                    const r = Math.random() * 0.25; 
                    const theta = Math.random() * Math.PI * 2;
                    const phi = Math.acos(2 * Math.random() - 1);
                    return {
                        x: center.x + r * Math.sin(phi) * Math.cos(theta),
                        y: center.y + r * Math.sin(phi) * Math.sin(theta),
                        z: center.z + r * Math.cos(phi),
                        r: 1.0, g: 0.2, b: 0.2 // Red
                    };
                }}
            ]),

            // ⭐ 11. Five-Pointed Star
            (() => {
                const pts = [];
                for (let i = 0; i < 10; i++) {
                    const a = (i/10)*Math.PI*2 - Math.PI/2;
                    const r = (i%2===0) ? 3.0 : 1.3;
                    pts.push([r*Math.cos(a), r*Math.sin(a)]);
                }
                return outlineShape(pts, true, 1, 0, 0);
            })(),

            // 💎 12. Diamond Gem
            compositeShape([
                { w: 55, fn: () => { // Bottom pavilion (pointed)
                    const h=Math.random()*2.8, r=(1-h/2.8)*2.2, a=Math.random()*Math.PI*2;
                    return { x: r*Math.cos(a), y: -h, z: r*Math.sin(a) };
                }},
                { w: 30, fn: () => { // Top crown (short)
                    const h=Math.random()*0.8, r=(1-h/0.8)*2.2, a=Math.random()*Math.PI*2;
                    return { x: r*Math.cos(a), y: h, z: r*Math.sin(a) };
                }},
                { w: 15, fn: () => { // Table (flat top)
                    const a=Math.random()*Math.PI*2, r=Math.random()*1.5;
                    return { x: r*Math.cos(a), y: 0.8, z: r*Math.sin(a) };
                }}
            ]),

            // 🔺 13. Egyptian Pyramid (proper 4-sided)
            compositeShape([
                { w: 25, fn: () => { // Base square
                    const s=2.5;
                    const edge=Math.floor(Math.random()*4), t=Math.random()*2-1;
                    if(edge===0) return {x:t*s, y:-1.5, z:s};
                    if(edge===1) return {x:t*s, y:-1.5, z:-s};
                    if(edge===2) return {x:s, y:-1.5, z:t*s};
                    return {x:-s, y:-1.5, z:t*s};
                }},
                { w: 75, fn: () => { // 4 triangular faces (edges to apex)
                    const face=Math.floor(Math.random()*4);
                    const t=Math.random(), side=Math.random()*2-1;
                    const baseR=(1-t)*2.5, y=-1.5+t*4.5;
                    if(face===0) return {x:side*baseR, y, z:baseR};
                    if(face===1) return {x:side*baseR, y, z:-baseR};
                    if(face===2) return {x:baseR, y, z:side*baseR};
                    return {x:-baseR, y, z:side*baseR};
                }}
            ]),

            // 🗼 14. Eiffel Tower
            compositeShape([
                { w: 35, fn: () => { // Two legs (wide base)
                    const leg = Math.random()>0.5 ? 1 : -1;
                    const h = Math.random()*1.5;
                    const spread = (1-h/1.5)*2.0+0.6;
                    return { x: leg*spread+(Math.random()-0.5)*0.2, y: h-2.5, z: (Math.random()-0.5)*0.4 };
                }},
                { w: 15, fn: () => { // First platform
                    const t=Math.random()*2-1;
                    return { x: t*1.2, y: -1.0, z: (Math.random()-0.5)*0.3 };
                }},
                { w: 25, fn: () => { // Middle taper
                    const h=Math.random()*1.5;
                    const w=0.8-h*0.35;
                    return { x: (Math.random()*2-1)*w, y: -1.0+h, z: (Math.random()-0.5)*0.3 };
                }},
                { w: 10, fn: () => { // Second platform
                    const t=Math.random()*2-1;
                    return { x: t*0.6, y: 0.5, z: (Math.random()-0.5)*0.3 };
                }},
                { w: 15, fn: () => { // Spire
                    const h=Math.random()*2.0;
                    return { x: (Math.random()-0.5)*0.15, y: 0.5+h, z: (Math.random()-0.5)*0.15 };
                }}
            ]),

            // 🦁 15. Lion Face (3D Sculpted)
            compositeShape([
                { w: 40, fn: (j, n) => { // Volumetric Mane (Golden, shaggy)
                    const u=Math.random()*Math.PI*2, v=Math.random()*Math.PI;
                    const r=2.8 + Math.random()*1.0; 
                    // Bias towards outer/back to frame face
                    return { 
                        x: r*Math.cos(u), y: r*Math.sin(u)*0.9+0.2, z: (Math.random()-0.6)*1.5, 
                        r:0.8+Math.random()*0.2, g:0.5+Math.random()*0.1, b:0.1 
                    };
                }},
                { w: 20, fn: (j, n) => { // Face Base (Tan)
                    const u=Math.random()*Math.PI*2, v=Math.random()*Math.PI;
                    const r=1.9;
                    return { 
                        x: r*Math.cos(u)*Math.sin(v)*0.9, y: r*Math.sin(u)*Math.sin(v)*0.9 + 0.2, z: r*Math.cos(v)*0.5 + 0.5,
                        r:0.75, g:0.65, b:0.4 
                    };
                }},
                { w: 15, fn: () => { // Snout / Muzzle (Protruding cylinder)
                    const t=Math.random(), a=Math.random()*Math.PI*2;
                    const r=0.85, l=1.0; 
                    return { 
                        x: r*Math.cos(a)*Math.sqrt(t), y: r*Math.sin(a)*Math.sqrt(t) - 0.4, z: 1.2+l*t,
                        r:0.8, g:0.7, b:0.5 
                    };
                }},
                { w: 5, fn: () => { // Nose Tip (Black Triangle)
                    const t=Math.random();
                    return { 
                        x: (Math.random()-0.5)*0.7, y: 0.1-t*0.5, z: 2.25,
                        r:0.1, g:0.1, b:0.1 
                    };
                }},
                { w: 5, fn: () => { // Eyes (Black, deep set)
                    const side = Math.random()>0.5 ? 1 : -1;
                    const t = Math.random();
                    return { 
                        x: side*(0.7+t*0.3), y: 0.6, z: 1.4+t*0.1,
                        r:0.05, g:0.05, b:0.05 
                    };
                }},
                { w: 5, fn: () => { // Ears (Rounded on top of mane)
                    const side = Math.random()>0.5 ? 1 : -1;
                    const t = Math.random();
                    return { 
                        x: side*(1.8+t*0.5), y: 2.1+t*0.5, z: 0.5,
                        r:0.7, g:0.5, b:0.3 
                    };
                }},
                { w: 5, fn: () => { // Whiskers (White lines)
                    const side = Math.random()>0.5 ? 1 : -1;
                    const t = Math.random();
                    return { 
                        x: side*(0.9+t*1.8), y: -0.5-t*0.3, z: 1.6-t*0.5,
                        r:0.9, g:0.9, b:0.9 
                    };
                }},
                { w: 5, fn: () => { // Brow Ridge (Heavy)
                     const t = Math.random()*2-1;
                     return { 
                         x: t*1.6, y: 1.0, z: 1.5, 
                         r:0.65, g:0.55, b:0.35 
                     };
                }}
            ]),

            // 👁️ 16. Eye (with iris and pupil)
            compositeShape([
                { w: 40, fn: (j, n) => { // Almond outline
                    const t = (j/n)*Math.PI*2;
                    const x = 3.0*Math.cos(t);
                    const y = 1.2*Math.sin(t) * (Math.cos(t) > 0 ? 1 : 1); // almond shape
                    // Taper the ends
                    const squeeze = Math.pow(Math.cos(t), 2);
                    return { x, y: y*(0.4+squeeze*0.6), z: (Math.random()-0.5)*0.2 };
                }},
                { w: 35, fn: () => { // Iris circle
                    const a=Math.random()*Math.PI*2, r=0.3+Math.random()*0.8;
                    return { x: r*Math.cos(a), y: r*Math.sin(a), z: (Math.random()-0.5)*0.15 };
                }},
                { w: 25, fn: () => { // Pupil (filled)
                    const a=Math.random()*Math.PI*2, r=Math.random()*0.4;
                    return { x: r*Math.cos(a), y: r*Math.sin(a), z: (Math.random()-0.5)*0.1 };
                }}
            ]),

            // ♾️ 17. Infinity / Lemniscate
            createShape((u) => {
                const t = u; // 0..2PI
                const scale = 2.5;
                const denom = 1 + Math.sin(t)*Math.sin(t);
                return {
                    x: scale * Math.cos(t) / denom,
                    y: scale * Math.sin(t) * Math.cos(t) / denom,
                    z: (Math.random()-0.5) * 0.4
                };
            }),

            // 🦋 18. Butterfly
            compositeShape([
                { w: 45, fn: (j, n) => { // Right wing
                    const t = (j/n)*Math.PI*2;
                    const r = Math.exp(Math.sin(t)) - 2*Math.cos(4*t) + Math.pow(Math.sin((2*t-Math.PI)/24), 5);
                    return { x: Math.abs(r*Math.cos(t))*0.8, y: r*Math.sin(t)*0.8, z: (Math.random()-0.5)*0.3 };
                }},
                { w: 45, fn: (j, n) => { // Left wing (mirror)
                    const t = (j/n)*Math.PI*2;
                    const r = Math.exp(Math.sin(t)) - 2*Math.cos(4*t) + Math.pow(Math.sin((2*t-Math.PI)/24), 5);
                    return { x: -Math.abs(r*Math.cos(t))*0.8, y: r*Math.sin(t)*0.8, z: (Math.random()-0.5)*0.3 };
                }},
                { w: 10, fn: (j, n) => { // Body
                    return { x: 0, y: (j/n)*4-2, z: (Math.random()-0.5)*0.15 };
                }}
            ]),

            // 👑 19. Crown
            compositeShape([
                { w: 30, fn: (j, n) => { // Base band (circle)
                    const a = (j/n)*Math.PI*2, r=2.5;
                    return { x: r*Math.cos(a), y: -1.0, z: r*Math.sin(a)*0.3 };
                }},
                { w: 50, fn: () => { // 5 peaks
                    const peak = Math.floor(Math.random()*5);
                    const a = (peak/5)*Math.PI*2;
                    const t = Math.random(); // 0=base, 1=tip
                    const baseX = 2.5*Math.cos(a), baseZ = 2.5*Math.sin(a)*0.3;
                    const tipY = 2.0;
                    return { x: baseX*(1-t*0.6), y: -1.0+t*tipY*1.5, z: baseZ*(1-t*0.6)+(Math.random()-0.5)*0.15 };
                }},
                { w: 20, fn: () => { // 5 valleys between peaks
                    const valley = Math.floor(Math.random()*5);
                    const a = ((valley+0.5)/5)*Math.PI*2;
                    const t = Math.random();
                    const baseX = 2.5*Math.cos(a), baseZ = 2.5*Math.sin(a)*0.3;
                    return { x: baseX*(1-t*0.3), y: -1.0+t*0.8, z: baseZ*(1-t*0.3) };
                }}
            ]),

            // ⚡ 20. Lightning Bolt
            (() => {
                const bolt = [
                    [0.5, 3], [1.5, 1.5], [0.3, 1.5], [1.8, -0.5], [0, -0.5],
                    [2.5, -3.5], [0.5, -0.8], [-0.5, -0.8], [1.0, 1.2], [-0.3, 1.2], [0.5, 3]
                ];
                return outlineShape(bolt, false, 1.0, -0.8, 0);
            })(),

            // 🧘 21. Buddha Face
            compositeShape([
                { w: 35, fn: (j, n) => { // Head circle (round face)
                    const a = (j/n)*Math.PI*2, r=2.8+(Math.random()-0.5)*0.08;
                    return { x: r*Math.cos(a)*0.85, y: r*Math.sin(a)+0.2, z: (Math.random()-0.5)*0.2 };
                }},
                { w: 10, fn: () => { // Ushnisha (top knob)
                    const a=Math.random()*Math.PI*2, r=Math.random()*0.9;
                    return { x: r*Math.cos(a)*0.7, y: 3.0+r*Math.sin(a)*0.6, z: (Math.random()-0.5)*0.15 };
                }},
                { w: 8, fn: (j, n) => { // Left closed eye (curved line)
                    const t = (j/n)*Math.PI;
                    return { x: -0.9+Math.cos(t)*0.55, y: 0.7+Math.sin(t)*0.15, z: (Math.random()-0.5)*0.1 };
                }},
                { w: 8, fn: (j, n) => { // Right closed eye (curved line)
                    const t = (j/n)*Math.PI;
                    return { x: 0.9+Math.cos(t)*0.55, y: 0.7+Math.sin(t)*0.15, z: (Math.random()-0.5)*0.1 };
                }},
                { w: 4, fn: () => { // Third eye dot (small circle)
                    const a=Math.random()*Math.PI*2, r=Math.random()*0.15;
                    return { x: r*Math.cos(a), y: 1.6+r*Math.sin(a), z: (Math.random()-0.5)*0.08 };
                }},
                { w: 5, fn: () => { // Nose (small vertical line)
                    const t=Math.random();
                    return { x: (Math.random()-0.5)*0.08, y: 0.1+t*0.5, z: (Math.random()-0.5)*0.08 };
                }},
                { w: 8, fn: (j, n) => { // Serene smile (gentle arc)
                    const t = (j/n)*Math.PI;
                    return { x: Math.cos(t)*0.7, y: -0.5-Math.sin(t)*0.15, z: (Math.random()-0.5)*0.1 };
                }},
                { w: 10, fn: () => { // Left elongated earlobe
                    const t=Math.random();
                    return { x: -2.4-(Math.random()-0.5)*0.15, y: -0.5+t*1.5-t*t*0.5, z: (Math.random()-0.5)*0.12 };
                }},
                { w: 10, fn: () => { // Right elongated earlobe
                    const t=Math.random();
                    return { x: 2.4+(Math.random()-0.5)*0.15, y: -0.5+t*1.5-t*t*0.5, z: (Math.random()-0.5)*0.12 };
                }},
                { w: 2, fn: (j, n) => { // Hairline curls hint
                    const a = (j/n)*Math.PI + Math.PI*0.15;
                    const r = 2.6+(Math.random()-0.5)*0.2;
                    return { x: r*Math.cos(a)*0.85, y: r*Math.sin(a)+0.5, z: (Math.random()-0.5)*0.15 };
                }}
            ]),

            // 🌀 22. Rorschach Organic Blob
            createShape(() => {
                const x=(Math.random()*2-1)*2, y=(Math.random()*2-1)*2, z=(Math.random()*2-1);
                const d=Math.sqrt(x*x+y*y+z*z);
                const s=(Math.sin(d*6)+1.5)*0.8;
                return {x:x*s, y:y*s, z:z*s};
            })
        ];

        // --- Animation State ---
        let currentShapeIndex = 0;
        let nextShapeIndex = 1;
        let morphProgress = 0;
        let state = 'morph'; // 'morph', 'hold', 'disperse'
        let stateTimer = 0;
        
        // Config
        const MORPH_DURATION = 3.0; // seconds
        const HOLD_DURATION = 2.0;
        const DISPERSE_DURATION = 1.0;

        let resizeTimer = null;
        const resize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                const { clientWidth, clientHeight } = canvas;
                renderer.setSize(clientWidth, clientHeight, false);
                camera.aspect = clientWidth / clientHeight;
                camera.updateProjectionMatrix();
            }, 150);
        };

        const { clientWidth, clientHeight } = canvas;
        renderer.setSize(clientWidth, clientHeight, false);
        camera.aspect = clientWidth / clientHeight;
        camera.updateProjectionMatrix();
        window.addEventListener('resize', resize);

        const constellationTarget = canvas.parentElement || canvas;
        const constellationObserver = new IntersectionObserver(
            ([entry]) => {
                const wasVisible = constellationVisible;
                constellationVisible = entry.isIntersecting;
                if (constellationVisible && !wasVisible) {
                    cancelAnimationFrame(frameId);
                    frameId = requestAnimationFrame(animate);
                }
            },
            { threshold: 0, rootMargin: '100px' }
        );

        let frameId;
        let lastTime = performance.now();

        const animate = () => {
            if (!constellationVisible) return;
            
            const now = performance.now();
            const dt = Math.min((now - lastTime) / 1000, 0.1); // cap dt
            lastTime = now;
            
            const positionAttribute = particleSystem.geometry.attributes.position;
            const currentPositions = positionAttribute.array;
            const colorAttribute = particleSystem.geometry.attributes.color;
            const currentColors = colorAttribute.array;
            
            if (!prefersReducedMotion) {
                // State Machine
                if (state === 'morph') {
                    morphProgress += dt / MORPH_DURATION;
                    if (morphProgress >= 1) {
                        morphProgress = 1;
                        state = 'hold';
                        stateTimer = 0;
                        currentShapeIndex = nextShapeIndex; // We arrived
                    }
                } else if (state === 'hold') {
                    stateTimer += dt;
                    if (stateTimer >= HOLD_DURATION) {
                        state = 'disperse';
                        stateTimer = 0;
                    }
                } else if (state === 'disperse') {
                    stateTimer += dt;
                    if (stateTimer >= DISPERSE_DURATION) {
                        state = 'morph';
                        morphProgress = 0;
                        // Pick next shape
                        nextShapeIndex = (currentShapeIndex + 1) % shapes.length;
                    }
                }

                // Interpolation Logic
                const startShape = shapes[currentShapeIndex].positions;
                const endShape = shapes[nextShapeIndex].positions;
                const startCol = shapes[currentShapeIndex].colors;
                const endCol = shapes[nextShapeIndex].colors;

                for (let i = 0; i < particleCount; i++) {
                    const i3 = i * 3;
                    
                    let tx, ty, tz; // Target X, Y, Z
                    let tr, tg, tb; // Target RGB

                    if (state === 'morph') {
                        // Lerp between shapes with easing
                        const t = morphProgress < 0.5 ? 2 * morphProgress * morphProgress : -1 + (4 - 2 * morphProgress) * morphProgress; // EaseInOutQuad
                        tx = startShape[i3] * (1 - t) + endShape[i3] * t;
                        ty = startShape[i3 + 1] * (1 - t) + endShape[i3 + 1] * t;
                        tz = startShape[i3 + 2] * (1 - t) + endShape[i3 + 2] * t;
                        
                        tr = startCol[i3] * (1 - t) + endCol[i3] * t;
                        tg = startCol[i3+1] * (1 - t) + endCol[i3+1] * t;
                        tb = startCol[i3+2] * (1 - t) + endCol[i3+2] * t;
                    } else if (state === 'hold') {
                        // Just hold the current shape (startShape is now the one we morphed TO)
                        tx = startShape[i3]; ty = startShape[i3 + 1]; tz = startShape[i3 + 2];
                        tr = startCol[i3]; tg = startCol[i3+1]; tb = startCol[i3+2];
                        
                        // Breathing effect
                        const breath = Math.sin(now * 0.002 + i * 0.1) * 0.05;
                        tx += breath; ty += breath; tz += breath;
                    } else if (state === 'disperse') {
                        // Move outwards / chaos
                        const sx = startShape[i3];
                        const sy = startShape[i3 + 1];
                        const sz = startShape[i3 + 2];
                        
                        // Explosion vector
                        const dist = Math.sqrt(sx*sx + sy*sy + sz*sz) + 0.1;
                        const force = (stateTimer / DISPERSE_DURATION) * 2.0; // Expand up to 2x distance
                        const noise = Math.sin(i * 12.3 + now * 0.005) * 0.5;
                        tx = sx + (sx / dist) * force + noise;
                        ty = sy + (sy / dist) * force + noise;
                        tz = sz + (sz / dist) * force + noise;
                        
                        // Fade to blue chaos
                        tr = startCol[i3] * (1 - force/2) + 0.2 * (force/2);
                        tg = startCol[i3+1] * (1 - force/2) + 0.6 * (force/2);
                        tb = startCol[i3+2] * (1 - force/2) + 1.0 * (force/2);
                    }

                    // Apply to current positions (with slight lag/smoothing for organic feel)
                    // Simple lerp smoothing
                    currentPositions[i3] += (tx - currentPositions[i3]) * 0.1;
                    currentPositions[i3 + 1] += (ty - currentPositions[i3 + 1]) * 0.1;
                    currentPositions[i3 + 2] += (tz - currentPositions[i3 + 2]) * 0.1;
                    
                    currentColors[i3] += (tr - currentColors[i3]) * 0.1;
                    currentColors[i3+1] += (tg - currentColors[i3+1]) * 0.1;
                    currentColors[i3+2] += (tb - currentColors[i3+2]) * 0.1;
                }
                
                positionAttribute.needsUpdate = true;
                colorAttribute.needsUpdate = true;
                
                // Rotate the whole system slowly
                particleSystem.rotation.y += 0.002;
                particleSystem.rotation.z = Math.sin(now * 0.0005) * 0.1;
            }

            renderer.render(scene, camera);
            frameId = requestAnimationFrame(animate);
        };

        constellationObserver.observe(constellationTarget);
        animate();

        return () => {
            constellationVisible = false;
            constellationObserver.disconnect();
            window.removeEventListener('resize', resize);
            clearTimeout(resizeTimer);
            if (frameId) {
                cancelAnimationFrame(frameId);
            }
            geometry.dispose();
            material.dispose();
            scene.remove(particleSystem);
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
        wakeRail();
    };

    return (
        <div className="agency-sections">
            <nav
                className={`section-rail ${railAwake ? 'is-awake' : 'is-idle'}`}
                aria-label="Agency sections"
                onMouseEnter={wakeRail}
                onClick={wakeRail}
            >
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
                    <ServicesCarousel items={services} t={t} isVisible={!!visibleSections.services} />
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
                    <AICapabilitiesSlider items={aiCapabilities} t={t} />
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
                    <TechStackLoop items={techStack} t={t} isVisible={!!visibleSections.stack} />
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
                    <TestimonialsCarousel items={testimonials} t={t} isVisible={!!visibleSections.testimonials} />
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
