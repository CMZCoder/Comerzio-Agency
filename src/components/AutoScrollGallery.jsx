import React, { useRef, useEffect, useState } from 'react';

const AutoScrollGallery = ({ images, title = 'Project Gallery' }) => {
    const scrollRef = useRef(null);
    const containerRef = useRef(null);
    const scrollPosRef = useRef(0);
    const [isHovered, setIsHovered] = useState(false);
    const speed = 0.8;
    const isVisibleRef = useRef(false);

    useEffect(() => {
        let animationFrameId;
        const container = containerRef.current;

        const observer = new IntersectionObserver(
            ([entry]) => { isVisibleRef.current = entry.isIntersecting; },
            { threshold: 0 }
        );
        if (container) observer.observe(container);

        const animate = () => {
            if (!isHovered && isVisibleRef.current && scrollRef.current) {
                const { scrollHeight, clientHeight } = scrollRef.current;

                if (scrollHeight > clientHeight) {
                    scrollPosRef.current += speed;

                    const halfway = scrollHeight / 2;
                    if (scrollPosRef.current >= halfway) {
                        scrollPosRef.current -= halfway;
                    }

                    if (scrollRef.current) {
                        scrollRef.current.scrollTop = scrollPosRef.current;
                    }
                }
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        animationFrameId = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animationFrameId);
            observer.disconnect();
        };
    }, [isHovered]);

    // Handle manual scroll to sync our ref
    const handleScroll = () => {
        if (isHovered && scrollRef.current) {
            scrollPosRef.current = scrollRef.current.scrollTop;
        }
    };

    const scrollUp = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ top: -200, behavior: 'smooth' });
        }
    };

    const scrollDown = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ top: 200, behavior: 'smooth' });
        }
    };

    return (
        <div
            className="auto-scroll-container"
            ref={containerRef}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                className="auto-scroll-content"
                ref={scrollRef}
                onScroll={handleScroll}
                style={{
                    overflowY: isHovered ? 'auto' : 'hidden',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                }}
            >
                {/* Render 3 sets to be absolutely safe about "halfway" logic visually if container is tall */}
                {images.map((img, i) => (
                    <img key={`orig-${i}`} src={img} alt={`${title} - Preview ${i + 1}`} className="scroll-image" />
                ))}
                {images.map((img, i) => (
                    <img key={`dup-1-${i}`} src={img} alt={`${title} - Duplicate ${i + 1}`} className="scroll-image" />
                ))}
                {images.map((img, i) => (
                    <img key={`dup-2-${i}`} src={img} alt={`${title} - Duplicate 2 ${i + 1}`} className="scroll-image" />
                ))}
            </div>

            {/* Custom scroll controls - only visible on hover */}
            {isHovered && (
                <>
                    <button className="gallery-scroll-btn scroll-up" onClick={scrollUp} aria-label="Scroll up">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="18 15 12 9 6 15"></polyline>
                        </svg>
                    </button>
                    <button className="gallery-scroll-btn scroll-down" onClick={scrollDown} aria-label="Scroll down">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </button>
                </>
            )}
        </div>
    );
};

export default AutoScrollGallery;
