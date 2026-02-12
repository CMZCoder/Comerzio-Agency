import React, { useEffect, useRef } from 'react';

const SpaceBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        let width = window.innerWidth;
        let height = window.innerHeight;
        let isVisible = true;
        let animationId = null;
        let resizeTimer = null;

        const setSize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                width = window.innerWidth;
                height = window.innerHeight;
                canvas.width = width;
                canvas.height = height;
            }, 150);
        };

        // Initial size set (no debounce)
        canvas.width = width;
        canvas.height = height;
        window.addEventListener('resize', setSize);

        // Star properties - more subtle for darker aesthetic
        const numStars = 250;
        const stars = [];
        const speed = 0.2;
        const depth = 1800;

        for (let i = 0; i < numStars; i++) {
            stars.push({
                x: (Math.random() - 0.5) * width * 3,
                y: (Math.random() - 0.5) * height * 3,
                z: Math.random() * depth,
                o: Math.random() * 0.4 + 0.4
            });
        }

        const animate = () => {
            if (!isVisible) return;

            ctx.fillStyle = '#050505';
            ctx.fillRect(0, 0, width, height);

            ctx.fillStyle = '#FFFFFF';

            const cx = width / 2;
            const cy = height / 2;

            stars.forEach(star => {
                star.z -= speed;

                if (star.z <= 0) {
                    star.z = depth;
                    star.x = (Math.random() - 0.5) * width * 3;
                    star.y = (Math.random() - 0.5) * height * 3;
                }

                const k = 80.0 / star.z;
                const px = star.x * k + cx;
                const py = star.y * k + cy;

                if (px >= 0 && px <= width && py >= 0 && py <= height) {
                    const size = (1 - star.z / depth) * 2;
                    const opacity = (1 - star.z / depth) * star.o * 0.8;

                    ctx.globalAlpha = opacity;
                    ctx.beginPath();
                    ctx.arc(px, py, size / 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            });

            animationId = requestAnimationFrame(animate);
        };

        // Only animate when visible — observe the parent section instead of the
        // canvas itself, because the canvas has z-index:-1 which can cause
        // IntersectionObserver to report false negatives on some mobile browsers.
        const observeTarget = canvas.parentElement || canvas;
        const observer = new IntersectionObserver(
            ([entry]) => {
                const wasVisible = isVisible;
                isVisible = entry.isIntersecting;
                if (isVisible && !wasVisible) {
                    // Restart the loop — guard against duplicate rAF
                    cancelAnimationFrame(animationId);
                    animationId = requestAnimationFrame(animate);
                }
            },
            { threshold: 0, rootMargin: '100px' }
        );
        observer.observe(observeTarget);

        animationId = requestAnimationFrame(animate);

        return () => {
            isVisible = false;
            window.removeEventListener('resize', setSize);
            clearTimeout(resizeTimer);
            cancelAnimationFrame(animationId);
            observer.disconnect();
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: -1,
                pointerEvents: 'none'
            }}
        />
    );
};

export default SpaceBackground;
