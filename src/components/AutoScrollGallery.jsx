import React, { useRef, useEffect, useState } from 'react';

const AutoScrollGallery = ({ images, title = 'Project Gallery' }) => {
    const scrollRef = useRef(null);
    const scrollPosRef = useRef(0); // Track position without re-renders
    const [isHovered, setIsHovered] = useState(false);
    const speed = 0.8; // Slightly slower for elegance

    useEffect(() => {
        let animationFrameId;

        const animate = () => {
            // Limit to ~60fps if needed, but RAF is generally good.
            // We check if we should scroll
            if (!isHovered && scrollRef.current) {
                const { scrollHeight, clientHeight } = scrollRef.current;

                // Only scroll if content is scrollable
                if (scrollHeight > clientHeight) {
                    scrollPosRef.current += speed;

                    // Loop logic: assuming we have 2 sets of images
                    // If we pass the halfway point (end of first set), wrap around
                    const halfway = scrollHeight / 2;
                    if (scrollPosRef.current >= halfway) {
                        scrollPosRef.current -= halfway; // Seamless wrap
                    }

                    if (scrollRef.current) {
                        scrollRef.current.scrollTop = scrollPosRef.current;
                    }
                }
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        animationFrameId = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrameId);
    }, [isHovered]);

    // Handle manual scroll to sync our ref
    const handleScroll = () => {
        if (isHovered && scrollRef.current) {
            scrollPosRef.current = scrollRef.current.scrollTop;
        }
    };

    return (
        <div
            className="auto-scroll-container"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                className="auto-scroll-content"
                ref={scrollRef}
                onScroll={handleScroll}
                style={{ overflowY: isHovered ? 'auto' : 'hidden' }}
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
        </div>
    );
};

export default AutoScrollGallery;
