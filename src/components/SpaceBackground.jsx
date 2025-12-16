import React, { useEffect, useRef } from 'react';

const SpaceBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        let width = window.innerWidth;
        let height = window.innerHeight;

        const setSize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        setSize();
        window.addEventListener('resize', setSize);

        // Star properties
        const numStars = 400;
        const stars = [];
        const speed = 0.5; // Subtle speed
        const depth = 1500; // Deep 3D space

        // Initialize stars
        for (let i = 0; i < numStars; i++) {
            stars.push({
                x: Math.random() * width - width / 2,
                y: Math.random() * height - height / 2,
                z: Math.random() * depth,
                o: Math.random() // opacity base
            });
        }

        let animationId;

        const animate = () => {
            // Dark subtle background
            // Use subtle alpha for trails if desired, but user wants clean space
            ctx.fillStyle = '#050505';
            ctx.fillRect(0, 0, width, height);

            // Draw Stars
            ctx.fillStyle = '#FFFFFF';

            const cx = width / 2;
            const cy = height / 2;

            stars.forEach(star => {
                // Move star towards screen
                star.z -= speed;

                // Reset moves to back
                if (star.z <= 0) {
                    star.z = depth;
                    star.x = Math.random() * width - width / 2;
                    star.y = Math.random() * height - height / 2;
                }

                // Project 3D -> 2D
                const k = 128.0 / star.z; // projection scaling factor
                const px = star.x * k + cx;
                const py = star.y * k + cy;

                if (px >= 0 && px <= width && py >= 0 && py <= height) {
                    // Size scales with proximity
                    const size = (1 - star.z / depth) * 2.5;
                    // Opacity scales with proximity
                    const opacity = (1 - star.z / depth) * star.o;

                    ctx.globalAlpha = opacity;
                    ctx.beginPath();
                    ctx.arc(px, py, size / 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            });

            animationId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', setSize);
            cancelAnimationFrame(animationId);
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
                // Ensure it acts as background but sits nicely
                pointerEvents: 'none'
            }}
        />
    );
};

export default SpaceBackground;
